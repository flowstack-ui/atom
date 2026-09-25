import { autoUpdate, type Middleware, offset } from "@floating-ui/react";
import type { RefObject } from "react";

/** Measure layout pixels, not animated/transformed popup bounding rectangles. */
export function getArrowDepth(element: Element | null): number {
  if (!element) return 0;
  const win = element.ownerDocument.defaultView;
  if (!win) return 0;
  const style = win.getComputedStyle(element);
  const horizontal = /^(left|right)$/.test(element.getAttribute("data-side") ?? "");
  const extent = Number.parseFloat(horizontal ? style.width : style.height) || 0;
  if (element.tagName.toLowerCase() === "svg") return extent;
  // Span-hosted arrows can contain rotated artwork. Account for that rotation
  // without assuming that an unstyled headless span is a diamond.
  const artwork = element.firstElementChild;
  if (!artwork) return extent / 2;
  const paint = win.getComputedStyle(artwork);
  const matrix = paint.transform.match(/^matrix\(([^)]+)\)$/)?.[1].split(",").map(Number);
  if (!matrix) return extent / 2;
  const width = Number.parseFloat(paint.width) || 0;
  const height = Number.parseFloat(paint.height) || 0;
  return (horizontal
    ? Math.abs(matrix[0]) * width + Math.abs(matrix[2]) * height
    : Math.abs(matrix[1]) * width + Math.abs(matrix[3]) * height) / 2;
}

export function arrowOffset(
  arrow: RefObject<Element | null>, gutter: number, crossAxis = 0,
): Middleware {
  return offset(() => ({ mainAxis: gutter + getArrowDepth(arrow.current), crossAxis }));
}

/** autoUpdate also needs to observe arrows, which do not affect popup size. */
export const autoUpdateWithArrow = (arrow: RefObject<Element | null>): typeof autoUpdate => (reference, floating, update, options) => {
  if (!floating) return () => {};
  const cleanup = autoUpdate(reference, floating, update, options);
  const win = floating.ownerDocument.defaultView;
  let observed: Element | null = null;
  const resize = win?.ResizeObserver ? new win.ResizeObserver(update) : undefined;
  const observe = () => {
    // A nested popup can mount its own arrow in this subtree. Observe only
    // the arrow belonging to this positioning owner.
    const next = arrow.current;
    if (next === observed) return;
    resize?.disconnect();
    observed = next;
    if (next) resize?.observe(next);
    update();
  };
  const mutation = win?.MutationObserver ? new win.MutationObserver(observe) : undefined;
  mutation?.observe(floating, { childList: true, subtree: true });
  observe();
  return () => { cleanup(); resize?.disconnect(); mutation?.disconnect(); };
};
