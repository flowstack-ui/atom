"use client";
import { forwardRef, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useSplitter, type SplitterContextValue } from "./context.js";
import { pairRange, resizePair } from "./state.js";
interface PartProps extends NativeDivProps<"children"> { children?: ReactNode; asChild?: boolean; render?: RenderProp; "data-slot"?: string }
export interface SplitterPanelProps extends PartProps { panelId: string }
export const SplitterPanel = forwardRef<HTMLDivElement, SplitterPanelProps>(function SplitterPanel({ panelId, children, asChild, render, style, "data-slot": slot = "splitter-panel", ...props }, ref) {
  const ctx = useSplitter();
  if (!ctx.panels.some(p => p.id === panelId)) throw new Error("Splitter.Panel panelId must be declared by Root.");
  const collapsed = ctx.isPanelCollapsed(panelId), zero = collapsed && ctx.sizes[panelId] === 0;
  const node = useRef<HTMLDivElement>(null);
  const merged = useMemo(() => composeRefs(ref, node), [ref]);
  useEffect(() => {
    if (zero && node.current?.contains(node.current.ownerDocument.activeElement)) {
      const root = node.current.parentElement;
      const trigger = Array.from(root?.querySelectorAll<HTMLElement>('[role="separator"]') ?? []).find(el => el.getAttribute("aria-controls") === node.current?.id && el.getAttribute("aria-disabled") !== "true");
      trigger?.focus();
    }
  }, [zero]);
  const attributes = { ...props, ref: merged, id: `${ctx.prefix}-panel-${encodeURIComponent(panelId)}`,
    "data-slot": slot, "data-panel-id": panelId, "data-state": collapsed ? "collapsed" : "expanded", "aria-hidden": zero ? true : undefined,
    inert: zero ? true : undefined,
    style: { ...style, flex: `0 0 ${ctx.sizes[panelId]}%`, minWidth: 0, minHeight: 0, ...(zero ? { overflow: "hidden" } : {}) } };
  return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children });
});
export interface SplitterResizeTriggerProps extends PartProps {
  before: string; after: string; disabled?: boolean;
  valueText?: (percent: number, pixels: number | null) => string;
}
interface Session { pointer: number; origin: number; extent: number; values: Record<string, number>; latest: Record<string, number>; cleanup: () => void; frame: number | null; coordinate: number }
export const SplitterResizeTrigger = forwardRef<HTMLDivElement, SplitterResizeTriggerProps>(function SplitterResizeTrigger({
  before, after, disabled: disabledProp = false, valueText, children, asChild, render, style,
  onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, onKeyDown,
  "data-slot": slot = "splitter-resize-trigger", ...props
}, ref) {
  const ctx = useSplitter();
  const latest = useRef(ctx); latest.current = ctx;
  const range = pairRange(ctx.sizes, ctx.panels, ctx.bounds, before, after);
  const disabled = ctx.disabled || disabledProp || range.min === range.max;
  const node = useRef<HTMLDivElement>(null);
  const merged = useMemo(() => composeRefs(ref, node), [ref]);
  const session = useRef<Session | null>(null);
  function move(coordinate: number) {
    const s = session.current, c = latest.current;
    if (!s) return;
    const direction = c.orientation === "horizontal" && c.dir === "rtl" ? -1 : 1;
    const next = resizePair(s.values, c.panels, c.bounds, before, after, s.values[before]! + (coordinate - s.origin) * direction / s.extent * 100);
    s.latest = next; c.change(next, "pointer");
  }
  function finish(cancelled: boolean) {
    const s = session.current;
    if (!s) return;
    if (s.frame !== null) { node.current?.ownerDocument.defaultView?.cancelAnimationFrame(s.frame); if (!cancelled) move(s.coordinate); }
    session.current = null;
    s.cleanup();
    if (node.current?.hasPointerCapture?.(s.pointer)) node.current.releasePointerCapture(s.pointer);
    latest.current.setDragging(null);
    if (cancelled) latest.current.change(s.values, "pointer", true);
    latest.current.notify("end", cancelled ? s.values : s.latest, "pointer", cancelled);
  }
  const finishRef = useRef(finish); finishRef.current = finish;
  const configKey = JSON.stringify([ctx.panels, ctx.orientation, ctx.dir, disabled]);
  useEffect(() => () => finishRef.current(true), [configKey]);
  const attributes = { ...props, ref: merged, role: "separator", tabIndex: disabled ? -1 : (props.tabIndex ?? 0),
    "aria-controls": `${ctx.prefix}-panel-${encodeURIComponent(before)}`, "aria-orientation": ctx.orientation === "horizontal" ? "vertical" as const : "horizontal" as const,
    "aria-valuemin": range.min, "aria-valuemax": range.max, "aria-valuenow": ctx.sizes[before],
    "aria-valuetext": valueText?.(ctx.sizes[before]!, ctx.extent ? ctx.sizes[before]! * ctx.extent / 100 : null),
    "aria-disabled": disabled || undefined, "data-disabled": disabled ? "" : undefined, "data-slot": slot,
    "data-orientation": ctx.orientation, "data-state": ctx.dragging === before ? "dragging" : "idle",
    style: { ...style, flex: "0 0 0px", position: "relative" as const, touchAction: "none" },
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || disabled || session.current || event.button !== 0 || !event.isPrimary || ctx.extent <= 0) return;
      event.preventDefault(); event.stopPropagation(); event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      const doc = event.currentTarget.ownerDocument, win = doc.defaultView;
      const preventSelection = (e: Event) => e.preventDefault();
      const blur = () => finishRef.current(true);
      doc.addEventListener("selectstart", preventSelection); win?.addEventListener("blur", blur);
      const coordinate = ctx.orientation === "horizontal" ? event.clientX : event.clientY;
      session.current = { pointer: event.pointerId, origin: coordinate, coordinate, extent: ctx.extent, values: { ...ctx.sizes }, latest: { ...ctx.sizes }, frame: null,
        cleanup: () => { doc.removeEventListener("selectstart", preventSelection); win?.removeEventListener("blur", blur); } };
      ctx.setDragging(before); ctx.notify("start", ctx.sizes, "pointer");
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event); const s = session.current;
      if (event.defaultPrevented || !s || s.pointer !== event.pointerId) return;
      s.coordinate = ctx.orientation === "horizontal" ? event.clientX : event.clientY;
      const win = event.currentTarget.ownerDocument.defaultView;
      if (s.frame === null && win) s.frame = win.requestAnimationFrame(() => { s.frame = null; move(s.coordinate); });
    },
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => { onPointerUp?.(event); if (session.current?.pointer === event.pointerId) finish(false); },
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => { onPointerCancel?.(event); if (session.current?.pointer === event.pointerId) finish(true); },
    onLostPointerCapture: (event: React.PointerEvent<HTMLDivElement>) => { onLostPointerCapture?.(event); if (session.current?.pointer === event.pointerId) finish(true); },
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event); if (event.defaultPrevented || disabled) return;
      if (event.key === "Escape" && session.current) { event.preventDefault(); finish(true); return; }
      if (event.key === "Enter" && ctx.panels.find(p => p.id === before)?.collapsible) {
        event.preventDefault(); ctx.isPanelCollapsed(before) ? ctx.expandPanel(before) : ctx.collapsePanel(before); return;
      }
      const negative = ctx.orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
      const positive = ctx.orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
      if (![negative, positive, "Home", "End"].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      const step = ctx.extent > 0 ? ctx.keyboardStep / ctx.extent * 100 : 1;
      const sign = (event.key === negative ? -1 : 1) * (ctx.orientation === "horizontal" && ctx.dir === "rtl" ? -1 : 1);
      const target = event.key === "Home" ? range.min : event.key === "End" ? range.max : ctx.sizes[before]! + sign * step * (event.shiftKey ? 5 : 1);
      const next = resizePair(ctx.sizes, ctx.panels, ctx.bounds, before, after, target);
      ctx.notify("start", ctx.sizes, "keyboard"); ctx.change(next, "keyboard"); ctx.notify("end", next, "keyboard");
    },
  };
  return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children });
});
export interface SplitterContextProps { children: (value: SplitterContextValue) => ReactNode }
export function SplitterContext({ children }: SplitterContextProps) {
  const { sizes, setSizes, resetSizes, collapsePanel, expandPanel, isPanelCollapsed } = useSplitter();
  return children({ sizes, setSizes, resetSizes, collapsePanel, expandPanel, isPanelCollapsed });
}
