export interface SectionPosition { id: string; top: number; bottom: number; offset: number }

/** The last crossed section stays current through gaps; the final one is reachable. */
export function selectCurrentSection(
  positions: readonly SectionPosition[], height: number, atEnd: boolean, fallback = "",
): string {
  if (!positions.length) return "";
  if (atEnd) return positions[positions.length - 1]!.id;
  const crossed = positions.filter((item) => item.top <= item.offset + 1);
  if (crossed.length) return crossed[crossed.length - 1]!.id;
  const first = positions[0]!;
  return first.top < height && first.bottom > 0 ? first.id
    : positions.some((item) => item.id === fallback) ? fallback : "";
}

export function targetOffset(target: HTMLElement, scrollElement: HTMLElement | null, explicit?: number | (() => number)): number {
  const value = typeof explicit === "function" ? explicit() : explicit;
  if (value !== undefined) return Number.isFinite(value) ? value : 0;
  const view = target.ownerDocument.defaultView!;
  const paddingOwner = scrollElement ?? target.ownerDocument.documentElement;
  return (parseFloat(view.getComputedStyle(paddingOwner).scrollPaddingTop) || 0)
    + (parseFloat(view.getComputedStyle(target).scrollMarginTop) || 0);
}

export function focusScrollTarget(target: HTMLElement): () => void {
  const added = !target.hasAttribute("tabindex") && target.tabIndex < 0;
  if (added) target.setAttribute("tabindex", "-1");
  const restore = () => {
    if (added && target.getAttribute("tabindex") === "-1") target.removeAttribute("tabindex");
    target.removeEventListener("blur", restore);
  };
  target.addEventListener("blur", restore, { once: true });
  target.focus({ preventScroll: true });
  return restore;
}
