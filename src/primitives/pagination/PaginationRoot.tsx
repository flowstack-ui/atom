"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeNavProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { PaginationContextProvider, type PaginationContextValue } from "./context.js";
import { usePagination, type UsePaginationProps } from "./usePagination.js";

export interface PaginationRootProviderProps extends NativeNavProps<"children" | "defaultValue" | "onChange"> {
  children: ReactNode;
  value: PaginationContextValue;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}
export type PaginationRootProps = Omit<PaginationRootProviderProps, "value"> & UsePaginationProps;

export const PaginationRootProvider = forwardRef<HTMLElement, PaginationRootProviderProps>(
  function PaginationRootProvider({ value, children, render, asChild,
    "data-slot": dataSlot = "pagination-root", "aria-label": ariaLabel = "Pagination", ...props }, ref) {
    if (value.totalPages === 0) return null;
    const behaviorProps = { id: value.ids?.root, ...props, ref, "aria-label": ariaLabel,
      "data-slot": dataSlot, "data-disabled": value.disabled ? "" : undefined };
    return <PaginationContextProvider value={value}>
      {asChild ? cloneAndMerge(children, behaviorProps) : renderElement(render, "nav", { ...behaviorProps, children })}
    </PaginationContextProvider>;
  },
);

export const PaginationRoot = forwardRef<HTMLElement, PaginationRootProps>(
  function PaginationRoot({ count, totalPages, pageSize, defaultPageSize, onPageSizeChange,
    page, defaultPage, onPageChange, siblingCount, boundaryCount, disabled, ids,
    previousAriaLabel, nextAriaLabel, firstAriaLabel, lastAriaLabel,
    getItemAriaLabel, getPageHref, ...props }, ref) {
    const value = usePagination({
      ...(count === undefined ? { totalPages: totalPages! } : { count, pageSize, defaultPageSize, onPageSizeChange }),
      page, defaultPage, onPageChange, siblingCount, boundaryCount, disabled, ids,
      previousAriaLabel, nextAriaLabel, firstAriaLabel, lastAriaLabel, getItemAriaLabel, getPageHref,
    });
    if (count !== undefined && totalPages !== undefined) throw new Error("Pagination requires exactly one of count or totalPages.");
    return <PaginationRootProvider {...props} value={value} ref={ref} />;
  },
);
