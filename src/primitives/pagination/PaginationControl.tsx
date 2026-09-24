"use client";

import { forwardRef, type AnchorHTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { usePaginationContext } from "./context.js";
import { PaginationListItem } from "./PaginationListItem.js";

export interface PaginationControlProps extends NativeButtonProps<"children" | "disabled" | "onClick" | "type"> {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function createControl(direction: "previous" | "next" | "first" | "last") {
  const Control = forwardRef<HTMLElement, PaginationControlProps>(function PaginationControl({
    children, target, rel, render, asChild, "data-slot": slot = `pagination-${direction}`,
    "aria-label": label, onClick, ...props
  }, ref) {
    const ctx = usePaginationContext();
    const backward = direction === "previous" || direction === "first";
    const disabled = ctx.disabled || (backward ? ctx.isFirstPage : ctx.isLastPage);
    const destination = direction === "first" ? 1 : direction === "last" ? ctx.totalPages
      : backward ? Math.max(1, ctx.currentPage - 1) : Math.min(ctx.totalPages, ctx.currentPage + 1);
    const isLink = ctx.getPageHref !== undefined;
    const href = ctx.getPageHref?.({ page: destination, currentPage: ctx.currentPage,
      totalPages: ctx.totalPages, isCurrent: destination === ctx.currentPage });
    const behaviorProps = {
      id: ctx.ids?.[direction], ...props, ref,
      ...(isLink ? disabled ? { href: null, target: null, rel: null, role: "link", tabIndex: -1, "aria-disabled": true }
        : { href, target, rel } : { type: "button", disabled: disabled || undefined }),
      "aria-label": label ?? ctx[`${direction}AriaLabel`],
      "data-slot": slot, "data-direction": direction, "data-disabled": disabled ? "" : undefined,
      onClick: composeEventHandlers(onClick, (event) => {
        if (disabled) { event.preventDefault(); return; }
        if (!isLink) ctx.setPage(destination);
      }),
    };
    return <PaginationListItem>{asChild ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, isLink ? "a" : "button", { ...behaviorProps, children })}</PaginationListItem>;
  });
  Control.displayName = `Pagination.${direction}`;
  return Control;
}

export const PaginationPrevious = createControl("previous");
export const PaginationNext = createControl("next");
export const PaginationFirst = createControl("first");
export const PaginationLast = createControl("last");
