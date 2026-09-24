"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeOrderedListProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { PaginationListContext } from "./PaginationListItem.js";
import { usePaginationContext } from "./context.js";

type PaginationListNativeProps = NativeOrderedListProps<"children">;

export interface PaginationListProps extends PaginationListNativeProps {
  /** Pagination item children. */
  children: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const PaginationList = forwardRef<HTMLOListElement, PaginationListProps>(
  function PaginationList(
    { children, render, asChild, "data-slot": dataSlot = "pagination-list", ...restProps },
    ref,
  ) {
    const { ids } = usePaginationContext();
    const behaviorProps: Record<string, unknown> = {
      id: ids?.list,
      ...restProps,
      ref,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return <PaginationListContext.Provider value>{cloneAndMerge(children, behaviorProps)}</PaginationListContext.Provider>;
    }

    return <PaginationListContext.Provider value>{renderElement(render, "ol", {
      ...behaviorProps,
      children,
    })}</PaginationListContext.Provider>;
  },
);
