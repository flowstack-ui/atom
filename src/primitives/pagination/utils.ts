export type PaginationRangeItem = number | "ellipsis";

export interface PaginationRangeOptions {
  totalPages: number;
  currentPage: number;
  siblingCount?: number;
  boundaryCount?: number;
}

export function clampPaginationPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.max(1, Math.min(page, totalPages));
}

export function getPaginationRange({
  totalPages,
  currentPage,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationRangeOptions): PaginationRangeItem[] {
  if (totalPages <= 0) return [];

  const normalizedSiblingCount = Math.max(0, siblingCount);
  const normalizedBoundaryCount = Math.max(0, boundaryCount);
  const targetCount = Math.min(
    totalPages,
    normalizedBoundaryCount * 2 + normalizedSiblingCount * 2 + 3,
  );

  if (totalPages <= targetCount) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const current = clampPaginationPage(currentPage, totalPages);
  const minWindowStart = normalizedBoundaryCount + 1;
  const maxWindowEnd = totalPages - normalizedBoundaryCount;
  // Keep the page-range count stable for the chosen density. Near an edge, the
  // freed ellipsis slot becomes one more visible page instead of a layout jump.
  const centeredWindowSize = targetCount - normalizedBoundaryCount * 2 - 2;
  const edgeWindowSize = targetCount - normalizedBoundaryCount * 2 - 1;
  let windowSize = centeredWindowSize;
  let windowStart = current - Math.floor(windowSize / 2);
  let windowEnd = windowStart + windowSize - 1;

  if (windowStart <= normalizedBoundaryCount + 2) {
    windowSize = edgeWindowSize;
    windowStart = minWindowStart;
    windowEnd = windowStart + windowSize - 1;
  }

  if (windowEnd >= maxWindowEnd - 1) {
    windowSize = edgeWindowSize;
    windowEnd = maxWindowEnd;
    windowStart = windowEnd - windowSize + 1;
  }

  windowStart = Math.max(windowStart, minWindowStart);
  windowEnd = Math.min(windowEnd, maxWindowEnd);

  const items: PaginationRangeItem[] = [];

  for (let page = 1; page <= normalizedBoundaryCount; page += 1) {
    items.push(page);
  }

  if (windowStart > normalizedBoundaryCount + 2) {
    items.push("ellipsis");
  } else if (windowStart === normalizedBoundaryCount + 2) {
    items.push(normalizedBoundaryCount + 1);
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    items.push(page);
  }

  const rightBoundaryStart = totalPages - normalizedBoundaryCount + 1;
  if (windowEnd < rightBoundaryStart - 2) {
    items.push("ellipsis");
  } else if (windowEnd === rightBoundaryStart - 2) {
    items.push(rightBoundaryStart - 1);
  }

  for (let page = rightBoundaryStart; page <= totalPages; page += 1) {
    items.push(page);
  }

  return items;
}
