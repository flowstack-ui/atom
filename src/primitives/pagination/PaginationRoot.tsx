"use client";

import { forwardRef, useCallback, useMemo, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeNavProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  PaginationContextProvider,
  type PaginationItemLabel,
  type PaginationContextValue,
} from "./context.js";
import { clampPaginationPage, getPaginationRange } from "./utils.js";

type PaginationRootNativeProps = NativeNavProps<
  "children" | "defaultValue" | "onChange"
>;

export interface PaginationRootProps extends PaginationRootNativeProps {
  /** Pagination subtree. */
  children: ReactNode;
  /** Total page count. */
  totalPages: number;
  /** Controlled active page, 1-based. */
  page?: number;
  /** Uncontrolled initial active page, 1-based. */
  defaultPage?: number;
  /** Called when the active page changes. */
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current page. */
  siblingCount?: number;
  /** Pages always shown at the start and end. */
  boundaryCount?: number;
  /** Disables all pagination controls. */
  disabled?: boolean;
  /** Accessible label used by Previous when it has no direct aria-label. */
  previousAriaLabel?: string;
  /** Accessible label used by Next when it has no direct aria-label. */
  nextAriaLabel?: string;
  /** Returns the accessible label for a page Item. */
  getItemAriaLabel?: PaginationItemLabel;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const PaginationRoot = forwardRef<HTMLElement, PaginationRootProps>(
  function PaginationRoot(
    {
      children,
      totalPages,
      page,
      defaultPage = 1,
      onPageChange,
      siblingCount = 1,
      boundaryCount = 1,
      disabled = false,
      previousAriaLabel = "Previous page",
      nextAriaLabel = "Next page",
      getItemAriaLabel = defaultGetItemAriaLabel,
      render,
      asChild,
      "data-slot": dataSlot = "pagination-root",
      "aria-label": ariaLabel = "Pagination",
      ...restProps
    },
    ref,
  ) {
    const normalizedTotalPages = Math.max(0, totalPages);
    const [currentPage, setCurrentPage] = useControllableState<number>({
      value: page,
      defaultValue: clampPaginationPage(defaultPage, normalizedTotalPages),
      onChange: onPageChange,
    });
    const resolvedCurrentPage = clampPaginationPage(currentPage, normalizedTotalPages);
    const items = useMemo(
      () =>
        getPaginationRange({
          totalPages: normalizedTotalPages,
          currentPage: resolvedCurrentPage,
          siblingCount,
          boundaryCount,
        }),
      [boundaryCount, normalizedTotalPages, resolvedCurrentPage, siblingCount],
    );

    const setPage = useCallback(
      (nextPage: number) => {
        if (disabled || normalizedTotalPages <= 0) return;

        const clampedPage = clampPaginationPage(nextPage, normalizedTotalPages);
        if (clampedPage === resolvedCurrentPage) return;

        setCurrentPage(clampedPage);
      },
      [disabled, normalizedTotalPages, resolvedCurrentPage, setCurrentPage],
    );

    const contextValue = useMemo<PaginationContextValue>(
      () => ({
        totalPages: normalizedTotalPages,
        currentPage: resolvedCurrentPage,
        items,
        disabled,
        isFirstPage: resolvedCurrentPage <= 1,
        isLastPage: resolvedCurrentPage >= normalizedTotalPages,
        previousAriaLabel,
        nextAriaLabel,
        getItemAriaLabel,
        setPage,
      }),
      [
        disabled,
        getItemAriaLabel,
        items,
        nextAriaLabel,
        normalizedTotalPages,
        previousAriaLabel,
        resolvedCurrentPage,
        setPage,
      ],
    );

    if (normalizedTotalPages <= 0) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-label": ariaLabel,
      "data-slot": dataSlot,
      ...(disabled ? { "data-disabled": "" } : {}),
    };

    const pagination = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "nav", {
        ...behaviorProps,
        children,
      });

    return (
      <PaginationContextProvider value={contextValue}>
        {pagination}
      </PaginationContextProvider>
    );
  },
);

const defaultGetItemAriaLabel: PaginationItemLabel = ({ page, isCurrent }) =>
  isCurrent ? `Page ${page}, current page` : `Go to page ${page}`;
