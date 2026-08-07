import type { DirectionValue } from "../direction/index.js";

export const minimumCarouselInterval = 1000;

export function normalizeCarouselInterval(interval: number): number {
  if (!Number.isFinite(interval)) return 7000;
  return Math.max(minimumCarouselInterval, interval);
}

export function getCarouselAdjacentValue(
  values: string[],
  activeValue: string,
  direction: "next" | "previous",
  loop: boolean,
): string | null {
  if (values.length === 0) return null;

  const activeIndex = values.indexOf(activeValue);
  const startIndex = activeIndex === -1
    ? direction === "next" ? -1 : values.length
    : activeIndex;
  const nextIndex = startIndex + (direction === "next" ? 1 : -1);

  if (loop) {
    return values[((nextIndex % values.length) + values.length) % values.length] ?? null;
  }

  return values[nextIndex] ?? null;
}

export function getClosestCarouselValue(
  viewport: Pick<HTMLElement, "getBoundingClientRect">,
  slides: Array<{ value: string; element: Pick<HTMLElement, "getBoundingClientRect"> }>,
  dir: DirectionValue,
): string | null {
  if (slides.length === 0) return null;

  const viewportRect = viewport.getBoundingClientRect();
  const viewportEdge = dir === "rtl" ? viewportRect.right : viewportRect.left;
  let closestValue = slides[0]?.value ?? null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const slide of slides) {
    const slideRect = slide.element.getBoundingClientRect();
    const slideEdge = dir === "rtl" ? slideRect.right : slideRect.left;
    const distance = Math.abs(slideEdge - viewportEdge);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestValue = slide.value;
    }
  }

  return closestValue;
}

export function getCarouselSlideId(idPrefix: string, value: string): string {
  return `${idPrefix}-slide-${encodeURIComponent(value)}`;
}

