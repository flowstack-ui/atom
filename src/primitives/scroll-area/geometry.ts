export function clamp(value: number, maximum: number) {
  return Math.max(
    0,
    Math.min(Number.isFinite(value) ? value : 0, Math.max(0, maximum)),
  );
}

export function thumbGeometry(
  viewport: number,
  content: number,
  track: number,
  minimum: number,
  offset: number,
) {
  const extent = Math.max(0, content - viewport);
  const length =
    content > 0
      ? clamp(Math.max(minimum, (track * viewport) / content), track)
      : 0;
  const travel = Math.max(0, track - length);
  return {
    extent,
    length,
    travel,
    position: extent > 0 ? (clamp(offset, extent) / extent) * travel : 0,
  };
}

/** Supported engines use negative scrollLeft in RTL; clamp rubber-band overscroll. */
export function inlineOffset(element: HTMLElement, rtl: boolean) {
  return clamp(
    rtl ? -element.scrollLeft : element.scrollLeft,
    element.scrollWidth - element.clientWidth,
  );
}
