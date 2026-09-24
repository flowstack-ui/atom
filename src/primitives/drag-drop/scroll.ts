/** Scroll one eligible ancestor per axis, innermost first. Coordinates are
 * viewport-relative so clipping by an outer scroller cannot create hot zones
 * outside the visible viewport. No scroll occurs outside the ancestor. */
export function scrollDragAncestors(source: HTMLElement, point: { x: number; y: number }, elapsed: number) {
  const win = source.ownerDocument.defaultView;
  if (!win) return false;
  let movedX = false;
  let movedY = false;
  const delta = (position: number, start: number, end: number) => {
    if (position < start || position > end) return 0;
    const edge = Math.min(40, (end - start) / 3);
    if (edge <= 0) return 0;
    const direction = position < start + edge ? -(1 - (position - start) / edge)
      : position > end - edge ? 1 - (end - position) / edge : 0;
    return direction * 600 * Math.min(elapsed, 32) / 1000;
  };
  for (let node = source.parentElement; node; node = node.parentElement) {
    const root = node === source.ownerDocument.scrollingElement;
    const style = win.getComputedStyle(node);
    const rect = root ? { left: 0, top: 0, right: win.innerWidth, bottom: win.innerHeight }
      : node.getBoundingClientRect();
    if (point.x < rect.left || point.x > rect.right || point.y < rect.top || point.y > rect.bottom) continue;
    const x = !movedX && (root || /auto|scroll/.test(style.overflowX))
      ? delta(point.x, Math.max(0, rect.left), Math.min(win.innerWidth, rect.right)) : 0;
    const y = !movedY && (root || /auto|scroll/.test(style.overflowY))
      ? delta(point.y, Math.max(0, rect.top), Math.min(win.innerHeight, rect.bottom)) : 0;
    const beforeX = node.scrollLeft;
    const beforeY = node.scrollTop;
    if (x || y) node.scrollBy({ left: x, top: y, behavior: "instant" });
    movedX ||= node.scrollLeft !== beforeX;
    movedY ||= node.scrollTop !== beforeY;
    if (movedX && movedY) break;
  }
  return movedX || movedY;
}
