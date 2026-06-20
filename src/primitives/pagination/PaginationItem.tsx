"use client";

import { forwardRef, useCallback, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { usePaginationContext } from "./context.js";

type PaginationItemNativeProps = NativeButtonProps<
  "children" | "disabled" | "type" | "value"
>;

export interface PaginationItemProps extends PaginationItemNativeProps {
  /** Page number represented by this item. */
  page: number;
  /** Visual content. Defaults to the page number. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const PaginationItem = forwardRef<HTMLButtonElement, PaginationItemProps>(
  function PaginationItem(
    {
      page,
      children,
      render,
      asChild,
      "data-slot": dataSlot = "pagination-item",
      "aria-label": ariaLabel,
      onClick,
      ...restProps
    },
    ref,
  ) {
    const ctx = usePaginationContext();
    const isActive = ctx.currentPage === page;
    const defaultAriaLabel = isActive ? `Page ${page}, current page` : `Go to page ${page}`;

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
      () => {
        ctx.setPage(page);
      },
      [ctx, page],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      disabled: ctx.disabled || undefined,
      "aria-current": isActive ? "page" : undefined,
      "aria-label": ariaLabel ?? defaultAriaLabel,
      "data-state": isActive ? "active" : "inactive",
      "data-slot": dataSlot,
      "data-page": page,
      ...(ctx.disabled ? { "data-disabled": "" } : {}),
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", {
      ...behaviorProps,
      children: children ?? page,
    });
  },
);
