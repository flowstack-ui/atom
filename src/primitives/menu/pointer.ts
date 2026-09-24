import type { PointerEvent } from "react";
import type { MenuContextValue } from "./context.js";

/** Ordinary rows do not retain pointer highlight after the pointer leaves. */
export function leaveMenuItem(event: PointerEvent<HTMLElement>, context: MenuContextValue, value: string) {
  if (event.pointerType !== "mouse" || context.highlightedValue !== value) return;
  context.onHighlight(null);
  if (!context.controlledHighlight && event.currentTarget.ownerDocument.activeElement === event.currentTarget) {
    context.contentRef.current?.focus({ preventScroll: true });
  }
}
