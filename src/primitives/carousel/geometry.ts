export interface CarouselItemMeasurement {
  value: string;
  start: number;
  size: number;
  align?: "start" | "center" | "end";
}
export interface CarouselSnapPage {
  value: string;
  offset: number;
  index: number;
}

export function positiveCarouselNumber(value: number, fallback = 1) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Snap positions are deduplicated after clamping; a terminal page is reachable once. */
export function getCarouselSnapPages(
  items: CarouselItemMeasurement[],
  viewport: number,
  extent: number,
  move: number,
  padding = 0,
  loop = false,
): CarouselSnapPage[] {
  const step = Math.max(1, Math.floor(positiveCarouselNumber(move)));
  const max = Math.max(0, extent - viewport);
  const pages: CarouselSnapPage[] = [];
  items.forEach((item, index) => {
    if (index % step !== 0 && (loop || index !== items.length - 1)) return;
    const adjustment =
      item.align === "center"
        ? (viewport - item.size) / 2
        : item.align === "end"
          ? viewport - padding - item.size
          : padding;
    const offset = loop
      ? item.start - adjustment
      : Math.min(max, Math.max(0, item.start - adjustment));
    if (!pages.some((page) => Math.abs(page.offset - offset) < 0.5))
      pages.push({ value: item.value, offset, index });
  });
  return pages;
}

export function closestCarouselPage(pages: CarouselSnapPage[], offset: number) {
  return pages.reduce(
    (best, page, index) =>
      Math.abs(page.offset - offset) <
      Math.abs((pages[best]?.offset ?? 0) - offset)
        ? index
        : best,
    0,
  );
}
