"use client";

import { createContext, useContext } from "react";
import type { PaginationRangeItem } from "./utils.js";

export interface PaginationContextValue {
  totalPages: number;
  currentPage: number;
  items: PaginationRangeItem[];
  disabled: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  setPage: (page: number) => void;
}

const PaginationContext = createContext<PaginationContextValue | null>(null);
PaginationContext.displayName = "PaginationContext";

export const PaginationContextProvider = PaginationContext.Provider;

export function usePaginationContext(): PaginationContextValue {
  const ctx = useContext(PaginationContext);
  if (!ctx) {
    throw new Error("Pagination compound components must be used within <Pagination.Root>");
  }

  return ctx;
}
