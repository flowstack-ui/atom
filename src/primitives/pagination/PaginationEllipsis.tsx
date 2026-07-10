"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type PaginationEllipsisNativeProps = NativeSpanProps<"children" | "aria-hidden">;

export interface PaginationEllipsisProps extends PaginationEllipsisNativeProps {
  /** Visual content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const PaginationEllipsis = forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  function PaginationEllipsis(
    {
      children = "…",
      render,
      asChild,
      "data-slot": dataSlot = "pagination-ellipsis",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-hidden": true,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return <li data-slot="pagination-list-item">{cloneAndMerge(children, behaviorProps)}</li>;
    }

    return (
      <li data-slot="pagination-list-item">
        {renderElement(render, "span", {
          ...behaviorProps,
          children,
        })}
      </li>
    );
  },
);
