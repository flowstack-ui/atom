"use client";
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import { SplitterProvider, type SplitterInternalContext, type SplitterOrientation, type SplitterResizeDetails } from "./context.js";
import { solve, resizePair, type SplitterPanelConfig, type SplitterSizes } from "./state.js";
export interface SplitterRootProps extends NativeDivProps<"onResize" | "children" | "dir"> {
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
export const SplitterRoot = forwardRef<HTMLDivElement, SplitterRootProps>(function SplitterRoot({
  panels, sizes: controlled, defaultSizes = {}, orientation = "horizontal", dir: dirProp,
  disabled = false, keyboardStep = 10, onResize, onResizeStart, onResizeEnd, onCollapseChange,
  children, asChild, render, style, "data-slot": slot = "splitter-root", ...props
}, ref) {
  if (!Number.isFinite(keyboardStep) || keyboardStep <= 0) throw new Error("Splitter keyboardStep must be positive.");
  const root = useRef<HTMLDivElement>(null);
  const merged = useMemo(() => composeRefs(ref, root), [ref]);
  const prefix = useId();
  const inheritedDir = useDirection();
  const dir = dirProp ?? inheritedDir;
  const [extent, setExtent] = useState(0);
  const [dragging, setDragging] = useState<string | null>(null);
  const initial = useRef(defaultSizes);
  const [requested, setRequested] = useControllableState<SplitterSizes>({ value: controlled, defaultValue: defaultSizes });
  const model = solve(panels, requested, extent);
  const { sizes, bounds } = model;
  const current = useRef({ panels, sizes, bounds, extent });
  current.current = { panels, sizes, bounds, extent };
  const oldExtent = useRef(0);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    oldExtent.current = 0;
    const measure = () => {
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
    const observer = new Observer(measure); observer.observe(node);
    return () => observer.disconnect();
  }, [orientation, controlled === undefined, setRequested]);
  const details = useCallback((values: Record<string, number>, source: SplitterResizeDetails["source"], cancelled = false): SplitterResizeDetails => ({
    sizes: values, pixels: extent > 0 ? Object.fromEntries(Object.entries(values).map(([id, value]) => [id, value * extent / 100])) : null, source, cancelled,
  }), [extent]);
  const change = useCallback((values: Record<string, number>, source: SplitterResizeDetails["source"], cancelled = false) => {
    if (disabled && !cancelled) return;
    setRequested(values); onResize?.(details(values, source, cancelled));
  }, [disabled, setRequested, onResize, details]);
  const notify = useCallback((phase: "start" | "end", values: Record<string, number>, source: SplitterResizeDetails["source"], cancelled = false) => {
    (phase === "start" ? onResizeStart : onResizeEnd)?.(details(values, source, cancelled));
  }, [details, onResizeStart, onResizeEnd]);
  const setSizes = useCallback((value: SplitterSizes) => {
    if (disabled) return;
    const next = solve(panels, value, extent).sizes;
    notify("start", current.current.sizes, "programmatic"); change(next, "programmatic"); notify("end", next, "programmatic");
  }, [disabled, panels, extent, change, notify]);
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
    if (!b?.collapsible || disabled) return;
    const j = i < state.panels.length - 1 ? i + 1 : i - 1;
    const before = state.panels[Math.min(i, j)]!.id, after = state.panels[Math.max(i, j)]!.id;
    const target = expand ? Math.max(b.min, restored.current[id] ?? b.min) : b.collapsed;
    const next = resizePair(state.sizes, state.panels, state.bounds, before, after, i < j ? target : state.sizes[before]! + state.sizes[after]! - target);
    setSizes(next);
  }, [disabled, setSizes]);
  const value = useMemo<SplitterInternalContext>(() => ({ panels, sizes, bounds, extent, orientation, dir, disabled, keyboardStep, prefix,
    dragging, setDragging, setSizes, resetSizes: () => setSizes(initial.current), collapsePanel: id => collapse(id, false), expandPanel: id => collapse(id, true), isPanelCollapsed, change, notify,
  }), [panels, sizes, bounds, extent, orientation, dir, disabled, keyboardStep, prefix, dragging, setSizes, collapse, isPanelCollapsed, change, notify]);
  const attributes = { ...props, ref: merged, dir, "data-slot": slot, "data-orientation": orientation,
    "data-disabled": disabled ? "" : undefined, "data-state": dragging ? "dragging" : "idle", "data-insufficient-space": model.insufficientSpace ? "" : undefined,
    style: { ...style, display: "flex", flexDirection: orientation === "horizontal" ? "row" as const : "column" as const, minWidth: 0, minHeight: 0 } };
  return <SplitterProvider.Provider value={value}>{asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children })}</SplitterProvider.Provider>;
});
