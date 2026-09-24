"use client";

import { forwardRef, useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import type { NativeDivProps, NativeLabelProps, NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { useNumberInputContext, type NumberInputContextValue } from "./context.js";

type Composition = { asChild?: boolean; render?: RenderProp; "data-slot"?: string };
export type NumberInputLabelProps = NativeLabelProps & Composition;
export const NumberInputLabel = forwardRef<HTMLLabelElement, NumberInputLabelProps>(function NumberInputLabel({ children, asChild, render, ...props }, ref) {
  const context = useNumberInputContext();
  const host = { id: context.ids.label, htmlFor: context.inputId, "data-slot": "number-input-label", ...props, ref };
  return asChild ? cloneAndMerge(children, host) : renderElement(render, "label", { ...host, children });
});

export type NumberInputValueTextProps = NativeSpanProps & Composition;
export const NumberInputValueText = forwardRef<HTMLSpanElement, NumberInputValueTextProps>(function NumberInputValueText({ children, asChild, render, ...props }, ref) {
  const context = useNumberInputContext();
  const host = { "data-slot": "number-input-value-text", ...props, ref };
  return asChild ? cloneAndMerge(children, host) : renderElement(render, "span", { ...host, children: children ?? context.displayValue });
});

export interface NumberInputContextProps { children: (context: NumberInputContextValue) => ReactNode }
export function NumberInputContext({ children }: NumberInputContextProps) {
  return children(useNumberInputContext());
}

export type NumberInputScrubberProps = NativeDivProps & Composition;
export const NumberInputScrubber = forwardRef<HTMLDivElement, NumberInputScrubberProps>(function NumberInputScrubber({ children, asChild, render, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, ...props }, ref) {
  const context = useNumberInputContext();
  const drag = useRef<{ pointerId: number; x: number; element: HTMLDivElement; cleanup: () => void } | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const clearSession = useCallback(() => {
    const active = drag.current;
    if (!active) return;
    drag.current = null;
    active.cleanup();
    if (active.element.hasPointerCapture(active.pointerId)) active.element.releasePointerCapture(active.pointerId);
  }, []);
  const stop = useCallback(() => { clearSession(); setScrubbing(false); }, [clearSession]);
  useEffect(() => clearSession, [clearSession]);
  useEffect(() => { if (context.disabled || context.readOnly) stop(); }, [context.disabled, context.readOnly, stop]);
  const stopPointer = (event: { pointerId: number }) => {
    if (drag.current?.pointerId === event.pointerId) stop();
  };
  const host = {
    id: context.ids.scrubber, "data-slot": "number-input-scrubber", ...props, ref,
    "data-disabled": context.disabled ? "" : undefined,
    "data-readonly": context.readOnly ? "" : undefined,
    "data-scrubbing": scrubbing ? "" : undefined,
    onPointerDown: composeEventHandlers(onPointerDown, event => {
      if (event.button !== 0 || drag.current || context.disabled || context.readOnly) return;
      event.preventDefault();
      const element = event.currentTarget;
      const doc = element.ownerDocument;
      const view = doc.defaultView;
      const end = (event: PointerEvent) => { if (drag.current?.pointerId === event.pointerId) stop(); };
      const key = (event: KeyboardEvent) => { if (event.key === "Escape") stop(); };
      const visibility = () => { if (doc.hidden) stop(); };
      element.setPointerCapture(event.pointerId);
      drag.current = { pointerId: event.pointerId, x: event.clientX, element, cleanup: () => {
        view?.removeEventListener("pointerup", end, true);
        view?.removeEventListener("pointercancel", end, true);
        view?.removeEventListener("blur", stop);
        doc.removeEventListener("keydown", key, true);
        doc.removeEventListener("visibilitychange", visibility);
      } };
      // Terminal cleanup survives consumer preventDefault and leaving the host.
      view?.addEventListener("pointerup", end, true);
      view?.addEventListener("pointercancel", end, true);
      view?.addEventListener("blur", stop);
      doc.addEventListener("keydown", key, true);
      doc.addEventListener("visibilitychange", visibility);
      setScrubbing(true);
      context.focus();
    }),
    onPointerMove: composeEventHandlers(onPointerMove, event => {
      if (context.disabled || context.readOnly) { stop(); return; }
      const active = drag.current;
      if (!active || active.pointerId !== event.pointerId) return;
      if ((event.buttons & 1) === 0) { stop(); return; }
      const delta = Math.trunc((event.clientX - active.x) / 8);
      if (!delta) return;
      active.x += delta * 8;
      const direction = delta * (context.dir === "rtl" ? -1 : 1) > 0 ? 1 : -1;
      context.handleStep(direction, Math.abs(delta) * context.step);
    }),
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => { onPointerUp?.(event); stopPointer(event); },
    onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => { onPointerCancel?.(event); stopPointer(event); },
    onLostPointerCapture: (event: ReactPointerEvent<HTMLDivElement>) => { onLostPointerCapture?.(event); stopPointer(event); },
  };
  return asChild ? cloneAndMerge(children, host) : renderElement(render, "div", { ...host, children });
});
