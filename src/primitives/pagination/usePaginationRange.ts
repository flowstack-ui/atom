"use client";

import { useMemo } from "react";
import { getPaginationRange, type PaginationRangeOptions } from "./utils.js";

export function usePaginationRange(options: PaginationRangeOptions) {
  const {
    totalPages,
    currentPage,
    siblingCount = 1,
    boundaryCount = 1,
  } = options;

  return useMemo(
    () =>
      getPaginationRange({
        totalPages,
        currentPage,
        siblingCount,
        boundaryCount,
      }),
    [boundaryCount, currentPage, siblingCount, totalPages],
  );
}
