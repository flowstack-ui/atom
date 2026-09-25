"use client";
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import { SplitterProvider, type SplitterInternalContext, type SplitterOrientation, type SplitterResizeDetails } from "./context.js";
import { solve, resizePair, type SplitterPanelConfig, type SplitterSizes, type SplitterMeasurement } from "./state.js";
import type { SplitterRegistry } from "./registry.js";
export interface SplitterRootProps extends NativeDivProps<"onResize" | "children" | "dir"> {
  registry?: SplitterRegistry;
  panels: readonly SplitterPanelConfig[];
  sizes?: SplitterSizes;
  defaultSizes?: SplitterSizes;
  orientation?: SplitterOrientation;
  dir?: DirectionValue;
  disabled?: boolean;
  keyboardStep?: number;
  onResize?: (details: SplitterResizeDetails) => void;
  onResizeStart?: (details: SplitterResizeDetails) => void;
  onResizeEnd?: (details: SplitterResizeDetails) => void;
  onCollapseChange?: (details: { panelId: string; collapsed: boolean }) => void;
  children?: ReactNode; asChild?: boolean; render?: RenderProp; "data-slot"?: string;
}
const storeKey: unique symbol = Symbol("SplitterStore");
// Preserve React's named native prop contract instead of expanding the build
// machine's React 19 event types into declarations consumed by React 18.
type SplitterRootAttributes = NativeDivProps & {
  ref: RefObject<HTMLDivElement | null>;
  [key: `data-${string}`]: string | undefined;
};
export function useSplitter({
  panels, sizes: controlled, defaultSizes = {}, orientation = "horizontal", dir: dirProp,
  disabled = false, keyboardStep = 10, registry, onResize, onResizeStart, onResizeEnd, onCollapseChange,
  children, asChild, render, style, "data-slot": slot = "splitter-root", ...props
}: SplitterRootProps) {
  if (!Number.isFinite(keyboardStep) || keyboardStep <= 0) throw new Error("Splitter keyboardStep must be positive.");
  const root = useRef<HTMLDivElement>(null);
  const [rootNode, setRootNode] = useState<HTMLDivElement | null>(null);
  const attachRoot = useCallback((node: HTMLDivElement | null) => {
    root.current = node;
    setRootNode(node);
  }, []);

  const prefix = useId();
  const inheritedDir = useDirection();
  const dir = dirProp ?? inheritedDir;
  const [extent, setExtent] = useState(0);
  const [measurement, setMeasurement] = useState<SplitterMeasurement>();
  const [dragging, updateDragging] = useState<string | null>(null);
  const draggingRef = useRef<string | null>(null);
  const setDragging = useCallback((id: string | null) => { draggingRef.current = id; updateDragging(id); }, []);
  const initial = useRef(defaultSizes);
  const [requested, setRequested] = useControllableState<SplitterSizes>({ value: controlled, defaultValue: defaultSizes });
  const model = solve(panels, requested, extent, measurement);
  const { sizes, bounds } = model;
  const current = useRef({ panels, sizes, bounds, extent });
  current.current = { panels, sizes, bounds, extent };
  const oldExtent = useRef(0);
  useEffect(() => {
    const node = rootNode;
    if (!node) return;
    oldExtent.current = 0;
    const measure = () => {
      const win = node.ownerDocument.defaultView;
      if (win) {
        const nextUnits = { em: Number.parseFloat(win.getComputedStyle(node).fontSize), rem: Number.parseFloat(win.getComputedStyle(node.ownerDocument.documentElement).fontSize), vw: win.innerWidth / 100, vh: win.innerHeight / 100 };
        setMeasurement(old => old && Object.keys(nextUnits).every(key => old[key as keyof SplitterMeasurement] === nextUnits[key as keyof SplitterMeasurement]) ? old : nextUnits);
      }
      const next = orientation === "horizontal" ? node.clientWidth : node.clientHeight;
      if (next <= 0) return;
      const old = oldExtent.current;
      oldExtent.current = next;
      if (old > 0 && next !== old && controlled === undefined) {
        const state = current.current;
        const preserved = state.panels.filter(p => p.resizeBehavior === "preserve-pixels");
        if (preserved.length) {
          const values = { ...state.sizes };
          let difference = 0;
          for (const p of preserved) { const value = values[p.id]! * old / next; difference += values[p.id]! - value; values[p.id] = value; }
          const flexible = state.panels.filter(p => p.resizeBehavior !== "preserve-pixels");
          for (const p of flexible) values[p.id] = Math.max(0, values[p.id]! + difference / flexible.length);
          setRequested(values);
        }
      }
      setExtent(next);
    };
    measure();
    const Observer = node.ownerDocument.defaultView?.ResizeObserver;
    if (!Observer) return;
    const observer = new Observer(measure); observer.observe(node); observer.observe(node.ownerDocument.documentElement);
    const win = node.ownerDocument.defaultView;
    win?.addEventListener("resize", measure);
    const mutation = win?.MutationObserver ? new win.MutationObserver(measure) : null;
    for (let ancestor: HTMLElement | null = node; ancestor; ancestor = ancestor.parentElement) mutation?.observe(ancestor, { attributes: true, attributeFilter: ["class", "style"] });
    node.ownerDocument.fonts?.addEventListener("loadingdone", measure);
    return () => { observer.disconnect(); mutation?.disconnect(); win?.removeEventListener("resize", measure); node.ownerDocument.fonts?.removeEventListener("loadingdone", measure); };
  }, [rootNode, orientation, controlled === undefined, setRequested]);
  const details = useCallback((values: Record<string, number>, source: SplitterResizeDetails["source"], cancelled = false): SplitterResizeDetails => ({
    layout: JSON.stringify(panels.map(panel => panel.id)),
    boundary: draggingRef.current && panels[panels.findIndex(panel => panel.id === draggingRef.current) + 1] ? { before: draggingRef.current, after: panels[panels.findIndex(panel => panel.id === draggingRef.current) + 1]!.id } : null,
    sizes: values, pixels: extent > 0 ? Object.fromEntries(Object.entries(values).map(([id, value]) => [id, value * extent / 100])) : null, source, cancelled,
  }), [extent, panels]);
  const change = useCallback((values: Record<string, number>, source: SplitterResizeDetails["source"], cancelled = false) => {
    if (disabled && !cancelled) return;
    setRequested(values); onResize?.(details(values, source, cancelled));
  }, [disabled, setRequested, onResize, details]);
  const notify = useCallback((phase: "start" | "end", values: Record<string, number>, source: SplitterResizeDetails["source"], cancelled = false) => {
    (phase === "start" ? onResizeStart : onResizeEnd)?.(details(values, source, cancelled));
  }, [details, onResizeStart, onResizeEnd]);
  const setSizes = useCallback((value: SplitterSizes) => {
    if (disabled) return;
    const next = solve(panels, value, extent, measurement).sizes;
    notify("start", current.current.sizes, "programmatic"); change(next, "programmatic"); notify("end", next, "programmatic");
  }, [disabled, panels, extent, measurement, change, notify]);
  const isPanelCollapsed = useCallback((id: string) => {
    const i = panels.findIndex(p => p.id === id);
    return i >= 0 && !!bounds[i]?.collapsible && Math.abs(sizes[id]! - bounds[i]!.collapsed) < 0.000001;
  }, [panels, bounds, sizes]);
  const restored = useRef<Record<string, number>>({});
  const previous = useRef<Record<string, boolean> | null>(null);
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const p of panels) {
      next[p.id] = isPanelCollapsed(p.id);
      if (!next[p.id]) restored.current[p.id] = sizes[p.id]!;
      if (previous.current?.[p.id] !== undefined && previous.current[p.id] !== next[p.id]) onCollapseChange?.({ panelId: p.id, collapsed: next[p.id]! });
    }
    previous.current = next;
  }, [panels, sizes, isPanelCollapsed, onCollapseChange]);
  const collapse = useCallback((id: string, expand: boolean) => {
    const state = current.current, i = state.panels.findIndex(p => p.id === id), b = state.bounds[i];
    if (!b?.collapsible || disabled || state.panels.length < 2) return;
    const j = i < state.panels.length - 1 ? i + 1 : i - 1;
    const before = state.panels[Math.min(i, j)]!.id, after = state.panels[Math.max(i, j)]!.id;
    const target = expand ? Math.max(b.min, restored.current[id] ?? b.min) : b.collapsed;
    const next = resizePair(state.sizes, state.panels, state.bounds, before, after, i < j ? target : state.sizes[before]! + state.sizes[after]! - target);
    setSizes(next);
  }, [disabled, setSizes]);
  const value = useMemo<SplitterInternalContext>(() => ({ panels, sizes, bounds, extent, orientation, dir, disabled, keyboardStep, prefix, registry,
    dragging, isDragging: dragging !== null, setDragging, setSizes, resetSizes: () => setSizes(initial.current), collapsePanel: id => collapse(id, false), expandPanel: id => collapse(id, true), isPanelCollapsed, change, notify,
    getPanels: () => panels,
    getPanelSize: id => { if (!Object.prototype.hasOwnProperty.call(sizes, id)) throw new Error("Unknown Splitter panel."); return sizes[id]!; },
    getLayout: () => JSON.stringify(panels.map(panel => panel.id)),
    getItems: () => panels.flatMap<{ type: "panel"; id: string } | { type: "handle"; before: string; after: string }>((panel, index) => {
      const next = panels[index + 1];
      return next ? [{ type: "panel", id: panel.id }, { type: "handle", before: panel.id, after: next.id }] : [{ type: "panel", id: panel.id }];
    }),
    isPanelExpanded: id => panels.some(panel => panel.id === id) && !isPanelCollapsed(id),
    resizePanel: (id, size) => {
      const index = panels.findIndex(panel => panel.id === id);
      if (index < 0 || !Number.isFinite(size) || size < 0) throw new Error("Invalid Splitter panel resize.");
      if (panels.length === 1) return;
      const first = index === panels.length - 1 ? index - 1 : index;
      const before = panels[first]!.id, after = panels[first + 1]!.id;
      setSizes(resizePair(sizes, panels, bounds, before, after, index === first ? size : sizes[before]! + sizes[after]! - size));
    },
  }), [panels, sizes, bounds, extent, orientation, dir, disabled, keyboardStep, prefix, registry, dragging, setSizes, collapse, isPanelCollapsed, change, notify]);
  const attributes: SplitterRootAttributes = { tabIndex: -1, ...props, ref: root, dir, "data-slot": slot, "data-splitter-root": "", "data-orientation": orientation,
    "data-disabled": disabled ? "" : undefined, "data-state": dragging ? "dragging" : "idle", "data-insufficient-space": model.insufficientSpace ? "" : undefined,
    style: { ...style, display: "flex", flexDirection: orientation === "horizontal" ? "row" as const : "column" as const, minWidth: 0, minHeight: 0 } };
  const { getPanels, getPanelSize, getLayout, getItems, resizePanel, isPanelExpanded, resetSizes, collapsePanel, expandPanel } = value;
  return { sizes, setSizes, resetSizes, collapsePanel, expandPanel, isPanelCollapsed, getPanels, getPanelSize, getLayout, getItems, resizePanel, isPanelExpanded, isDragging: dragging !== null, orientation, [storeKey]: { value, root: attachRoot, attributes } };
}
export type UseSplitterReturn = ReturnType<typeof useSplitter>;
export interface SplitterRootProviderProps extends NativeDivProps<"children" | "dir"> {
  value: UseSplitterReturn;
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
}
export const SplitterRootProvider = forwardRef<HTMLDivElement, SplitterRootProviderProps>(function SplitterRootProvider({ value: store, children, asChild, render, style, ...props }, ref) {
  const state = store[storeKey];
  const merged = useMemo(() => composeRefs(ref, state.root), [ref, state.root]);
  const attributes = { ...state.attributes, ...props, ref: merged, dir: state.value.dir, style: { ...state.attributes.style, ...style, display: "flex", flexDirection: state.value.orientation === "horizontal" ? "row" as const : "column" as const } };
  return <SplitterProvider.Provider value={state.value}>{asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children })}</SplitterProvider.Provider>;
});
export const SplitterRoot = forwardRef<HTMLDivElement, SplitterRootProps>(function SplitterRoot({ children, asChild, render, ...props }, ref) {
  const value = useSplitter(props);
  return <SplitterRootProvider value={value} ref={ref} asChild={asChild} render={render}>{children}</SplitterRootProvider>;
});
