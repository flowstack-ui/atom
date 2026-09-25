import type { Rect } from "@floating-ui/react";

/** Browser DOMRect fields are prototype accessors, not enumerable properties. */
export function normalizePopoverAnchorRect(rect: Rect) {
  const { x, y, width, height } = rect;
  return { x, y, width, height, top: y, left: x, right: x + width, bottom: y + height };
}
