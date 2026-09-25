"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PaginationRangeItem } from "./utils.js";

export interface PaginationItemLabelDetails {
  page: number;
  currentPage: number;
  totalPages: number;
  isCurrent: boolean;
}

export type PaginationItemLabel = (details: PaginationItemLabelDetails) => string;
export type PaginationPageHrefDetails = PaginationItemLabelDetails;
export type PaginationPageHref = (details: PaginationPageHrefDetails) => string;

export interface PaginationIds {
  root?: string;
  list?: string;
  previous?: string;
  next?: string;
  first?: string;
  last?: string;
  item?: (page: number) => string;
  ellipsis?: (rangeIndex: number) => string;
}

export interface PaginationContextValue {
  ids?: PaginationIds;
  page: number;
  count?: number;
  pageSize?: number;
  /** Zero-based start, exclusive end. Undefined in totalPages mode. */
  pageRange?: { start: number; end: number };
  previousPage: number | null;
  nextPage: number | null;
  totalPages: number;
  currentPage: number;
  items: PaginationRangeItem[];
  disabled: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  previousAriaLabel: string;
  nextAriaLabel: string;
  firstAriaLabel: string;
  lastAriaLabel: string;
  getItemAriaLabel: PaginationItemLabel;
  getPageHref?: PaginationPageHref;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  slice: <T>(data: readonly T[]) => T[];
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

const PaginationContext = createContext<PaginationContextValue | null>(null);
PaginationContext.displayName = "PaginationContext";

export const PaginationContextProvider = PaginationContext.Provider;

export function PaginationContextConsumer({ children }: { children: (value: PaginationContextValue) => ReactNode }) {
  return children(usePaginationContext());
}

export function usePaginationContext(): PaginationContextValue {
  const ctx = useContext(PaginationContext);
  if (!ctx) {
    throw new Error("Pagination compound components must be used within <Pagination.Root>");
  }

  return ctx;
}
