"use client";

import {
  forwardRef,
  useCallback,
  type AnchorHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { usePaginationContext } from "./context.js";

type PaginationItemNativeProps = NativeButtonProps<
  "children" | "disabled" | "onClick" | "type" | "value"
>;

export interface PaginationItemProps extends PaginationItemNativeProps {
  /** Page number represented by this item. */
  page: number;
  /** Visual content. Defaults to the page number. */
  children?: ReactNode;
  /** Handles activation for either the default button or link mode. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Native target used when Root provides getPageHref. */
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  /** Native relationship used when Root provides getPageHref. */
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const PaginationItem = forwardRef<HTMLElement, PaginationItemProps>(
  function PaginationItem(
    {
      page,
      children,
      target,
      rel,
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
    const defaultAriaLabel = ctx.getItemAriaLabel({
      page,
      currentPage: ctx.currentPage,
      totalPages: ctx.totalPages,
      isCurrent: isActive,
    });
    const href = ctx.getPageHref?.({
      page,
      currentPage: ctx.currentPage,
      totalPages: ctx.totalPages,
      isCurrent: isActive,
    });
    const isLink = ctx.getPageHref !== undefined;

    const handleButtonClick: MouseEventHandler<HTMLElement> = useCallback(
      () => {
        ctx.setPage(page);
      },
      [ctx, page],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(isLink
        ? ctx.disabled
          ? {
              href: null,
              target: null,
              rel: null,
              role: "link",
              tabIndex: -1,
              "aria-disabled": true,
            }
          : { href, target, rel }
        : { type: "button", disabled: ctx.disabled || undefined }),
      "aria-current": isActive ? "page" : undefined,
      "aria-label": ariaLabel ?? defaultAriaLabel,
      "data-state": isActive ? "active" : "inactive",
      "data-slot": dataSlot,
      "data-page": page,
      ...(ctx.disabled ? { "data-disabled": "" } : {}),
      onClick: isLink
        ? composeEventHandlers(onClick, (event) => {
            if (ctx.disabled) event.preventDefault();
          })
        : composeEventHandlers(onClick, handleButtonClick),
    };

    if (asChild) {
      return <li data-slot="pagination-list-item">{cloneAndMerge(children, behaviorProps)}</li>;
    }

    return (
      <li data-slot="pagination-list-item">
        {renderElement(render, isLink ? "a" : "button", {
          ...behaviorProps,
          children: children ?? page,
        })}
      </li>
    );
  },
);
