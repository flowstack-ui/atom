"use client";
import { createContext, useContext, type ReactNode } from "react";

export const PaginationListContext = createContext(false);
PaginationListContext.displayName = "PaginationListContext";

/** List semantics are owned by List, not imposed on direct control compositions. */
export function PaginationListItem({ children }: { children: ReactNode }) {
  return useContext(PaginationListContext)
    ? <li data-slot="pagination-list-item">{children}</li>
    : children;
}
