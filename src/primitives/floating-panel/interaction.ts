"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { constrainRect, resizeRect, type FloatingPanelAxis, type PanelRect } from "./geometry.js";
import type { InternalPanel } from "./controller.js";

const interactive = "button,a,input,textarea,select,[contenteditable=true],[data-no-drag],[role=button]";
interface Session {
  pointer: number; x: number; y: number; start: PanelRect; target: HTMLElement;
  cleanup: () => void; frame: number | null; latest: { x: number; y: number; shift: boolean; alt: boolean };
}
export function usePanelInteraction(panel: InternalPanel, axis?: FloatingPanelAxis) {
  const latest = useRef(panel); latest.current = panel;
  const session = useRef<Session | null>(null);
  const disabled = panel.options.disabled || (axis ? panel.options.resizable === false || panel.stage !== "default" : panel.options.draggable === false || panel.stage === "maximized");
  function move() {
    const s = session.current, c = latest.current;
    if (!s) return;
    const scale = c.options.scale ?? 1, grid = c.options.gridSize ?? 1;
    const delta = { x: (s.latest.x - s.x) / scale, y: (s.latest.y - s.y) / scale };
    const constraints = { min: c.options.minSize, max: c.options.maxSize, boundary: c.boundary(), contain: axis ? true : c.options.allowOverflow === false };
    const rect = axis ? resizeRect(s.start, delta, axis, constraints, c.options.lockAspectRatio || s.latest.shift, s.latest.alt)
      : constrainRect({ ...s.start, x: s.start.x + Math.round(delta.x / grid) * grid, y: s.start.y + Math.round(delta.y / grid) * grid }, constraints);
    c.change(rect, "pointer");
  }
  function finish(cancelled: boolean) {
    const s = session.current, c = latest.current;
    if (!s) return;
    if (s.frame !== null) s.target.ownerDocument.defaultView?.cancelAnimationFrame(s.frame);
    if (!cancelled) move();
    session.current = null;
    s.cleanup();
    if (s.target.hasPointerCapture?.(s.pointer)) s.target.releasePointerCapture(s.pointer);
    c.cancel.current = null; c.setInteraction(null);
    if (cancelled) c.change(s.start, "cancel");
    c.end(cancelled ? "cancel" : "pointer", Boolean(axis));
  }
  const finishRef = useRef(finish); finishRef.current = finish;
  useEffect(() => () => finishRef.current(true), [disabled, axis, panel.options.scale, panel.options.strategy]);
  return {
    disabled,
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (disabled || session.current || latest.current.cancel.current || event.button !== 0 || !event.isPrimary) return;
      const target = event.target as HTMLElement;
      if (!axis && target !== event.currentTarget && target.closest(interactive)) return;
      event.preventDefault(); event.stopPropagation();
      event.currentTarget.focus({ preventScroll: true }); panel.bringToFront();
      const doc = event.currentTarget.ownerDocument, view = doc.defaultView;
      const blur = () => finishRef.current(true), prevent = (e: Event) => e.preventDefault();
      doc.addEventListener("selectstart", prevent); view?.addEventListener("blur", blur);
      session.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, start: { ...panel.rect }, target: event.currentTarget, frame: null,
        latest: { x: event.clientX, y: event.clientY, shift: event.shiftKey, alt: event.altKey },
        cleanup: () => { doc.removeEventListener("selectstart", prevent); view?.removeEventListener("blur", blur); } };
      panel.cancel.current = () => finishRef.current(true);
      panel.setInteraction(axis ? "resizing" : "dragging");
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const s = session.current;
      if (!s || s.pointer !== event.pointerId) return;
      s.latest = { x: event.clientX, y: event.clientY, shift: event.shiftKey, alt: event.altKey };
      const view = event.currentTarget.ownerDocument.defaultView;
      if (s.frame === null && view) s.frame = view.requestAnimationFrame(() => { s.frame = null; move(); });
    },
    onPointerUp(event: PointerEvent<HTMLElement>) { if (session.current?.pointer === event.pointerId) finish(false); },
    onPointerCancel(event: PointerEvent<HTMLElement>) { if (session.current?.pointer === event.pointerId) finish(true); },
    onLostPointerCapture(event: PointerEvent<HTMLElement>) { if (session.current?.pointer === event.pointerId) finish(true); },
    onKeyDown(event: KeyboardEvent<HTMLElement>) {
      if (event.currentTarget !== event.target || latest.current.options.disabled) return;
      const c = latest.current;
      if (event.key === "Escape" && session.current) { event.preventDefault(); finish(true); return; }
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      const resize = Boolean(axis || event.ctrlKey || event.metaKey);
      if (resize && (c.options.resizable === false || c.stage !== "default")) return;
      if (!resize && (c.options.draggable === false || c.stage === "maximized")) return;
      event.preventDefault(); event.stopPropagation();
      const step = (c.options.gridSize ?? 1) * (event.shiftKey ? 10 : 1);
      const delta = { x: event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0,
        y: event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0 };
      const constraints = { min: c.options.minSize, max: c.options.maxSize, boundary: c.boundary(), contain: resize || c.options.allowOverflow === false };
      const rect = resize ? resizeRect(c.rect, delta, axis ?? "se", constraints, c.options.lockAspectRatio, event.altKey)
        : constrainRect({ ...c.rect, x: c.position.x + delta.x, y: c.position.y + delta.y }, constraints);
      c.change(rect, "keyboard"); c.end("keyboard", resize);
    },
  };
}
