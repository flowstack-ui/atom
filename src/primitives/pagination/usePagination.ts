"use client";

import { useCallback, useMemo } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { PaginationContextValue, PaginationIds, PaginationItemLabel, PaginationPageHref } from "./context.js";
import { clampPaginationPage, getPaginationRange } from "./utils.js";

export type PaginationCountOptions =
  | { totalPages: number; count?: never; pageSize?: never; defaultPageSize?: never; onPageSizeChange?: never }
  | { totalPages?: never; count: number; pageSize?: number; defaultPageSize?: number; onPageSizeChange?: (pageSize: number) => void };

export interface PaginationStateOptions {
  ids?: PaginationIds;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
  previousAriaLabel?: string;
  nextAriaLabel?: string;
  firstAriaLabel?: string;
  lastAriaLabel?: string;
  getItemAriaLabel?: PaginationItemLabel;
  getPageHref?: PaginationPageHref;
}
export type UsePaginationProps = PaginationCountOptions & PaginationStateOptions;
export type UsePaginationReturn = PaginationContextValue;

function integer(value: number, minimum: number, name: string) {
  if (!Number.isSafeInteger(value) || value < minimum) throw new RangeError(`Pagination ${name} must be a safe integer >= ${minimum}.`);
  return value;
}
const defaultItemLabel: PaginationItemLabel = ({ page, isCurrent }) =>
  isCurrent ? `Page ${page}, current page` : `Go to page ${page}`;

/** State only: fetching, routing and result-replacement focus stay application-owned. */
export function usePagination(options: UsePaginationProps): UsePaginationReturn {
  if ((options.count === undefined) === (options.totalPages === undefined)) throw new Error("Pagination requires exactly one of count or totalPages.");
  const count = options.count === undefined ? undefined : integer(options.count, 0, "count");
  const [rawSize, updateSize] = useControllableState({ value: options.pageSize,
    defaultValue: options.defaultPageSize ?? 10, onChange: options.onPageSizeChange });
  const pageSize = integer(rawSize, 1, "pageSize");
  const totalPages = count === undefined ? integer(options.totalPages!, 0, "totalPages") : Math.ceil(count / pageSize);
  const [rawPage, updatePage] = useControllableState({ value: options.page,
    defaultValue: options.defaultPage ?? 1, onChange: options.onPageChange });
  const page = clampPaginationPage(rawPage, totalPages);
  const disabled = options.disabled ?? false;
  const items = useMemo(() => getPaginationRange({ totalPages, currentPage: page,
    siblingCount: options.siblingCount, boundaryCount: options.boundaryCount }),
    [totalPages, page, options.siblingCount, options.boundaryCount]);
  const setPage = useCallback((next: number) => {
    if (disabled || totalPages === 0) return;
    const resolved = clampPaginationPage(next, totalPages);
    if (resolved !== page) updatePage(resolved);
  }, [disabled, totalPages, page, updatePage]);
  const setPageSize = useCallback((next: number) => {
    if (disabled) return;
    if (count === undefined) throw new Error("Pagination setPageSize requires count mode.");
    const size = integer(next, 1, "pageSize");
    if (size === pageSize) return;
    const nextPage = clampPaginationPage(Math.floor(((page - 1) * pageSize) / size) + 1, Math.ceil(count / size));
    updateSize(size);
    if (nextPage !== page) updatePage(nextPage);
  }, [disabled, count, pageSize, page, updateSize, updatePage]);
  const start = count === undefined || count === 0 ? 0 : (page - 1) * pageSize;
  const end = count === undefined ? 0 : Math.min(start + pageSize, count);
  const slice = useCallback(<T,>(data: readonly T[]): T[] => {
    if (count === undefined) throw new Error("Pagination slice requires count mode.");
    return data.slice(start, end);
  }, [count, start, end]);
  return useMemo(() => ({ ids: options.ids, page, currentPage: page, totalPages, items, count,
    pageSize: count === undefined ? undefined : pageSize,
    pageRange: count === undefined ? undefined : { start, end },
    disabled, isFirstPage: page <= 1, isLastPage: page >= totalPages,
    previousPage: page > 1 ? page - 1 : null, nextPage: page < totalPages ? page + 1 : null,
    previousAriaLabel: options.previousAriaLabel ?? "Previous page",
    nextAriaLabel: options.nextAriaLabel ?? "Next page",
    firstAriaLabel: options.firstAriaLabel ?? "First page",
    lastAriaLabel: options.lastAriaLabel ?? "Last page",
    getItemAriaLabel: options.getItemAriaLabel ?? defaultItemLabel, getPageHref: options.getPageHref,
    setPage, setPageSize, slice,
    goToFirstPage: () => setPage(1), goToLastPage: () => setPage(totalPages),
    goToPreviousPage: () => setPage(page - 1), goToNextPage: () => setPage(page + 1),
  }), [options.ids, page, totalPages, items, count, pageSize, start, end, disabled,
    options.previousAriaLabel, options.nextAriaLabel, options.firstAriaLabel,
    options.lastAriaLabel, options.getItemAriaLabel, options.getPageHref, setPage, setPageSize, slice]);
}
