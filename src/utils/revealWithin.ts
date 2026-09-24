/** Reveal an item without scrolling anything outside its owning popup. */
export function revealWithin(item: HTMLElement | null | undefined, menu: HTMLElement | null) {
  if (!item || !menu || !menu.contains(item)) return;
  const view = menu.ownerDocument.defaultView;
  if (!view) return;
  for (let parent = item.parentElement; parent; parent = parent.parentElement) {
    const style = view.getComputedStyle(parent);
    const bounds = parent.getBoundingClientRect();
    const target = item.getBoundingClientRect();
    const top = bounds.top + parent.clientTop;
    const left = bounds.left + parent.clientLeft;
    const nearest = (start: number, end: number, low: number, high: number) => {
      if (start < low && end > high) return 0;
      if (start < low) return start - low;
      if (end > high) return end - high;
      return 0;
    };
    if (/(auto|scroll|hidden)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) {
      parent.scrollTop += nearest(target.top, target.bottom, top, top + parent.clientHeight);
    }
    if (/(auto|scroll|hidden)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth) {
      parent.scrollLeft += nearest(target.left, target.right, left, left + parent.clientWidth);
    }
    if (parent === menu) break;
  }
}
