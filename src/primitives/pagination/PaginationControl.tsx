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

type PaginationControlNativeProps = NativeButtonProps<
  "children" | "disabled" | "onClick" | "type"
>;

export interface PaginationControlProps extends PaginationControlNativeProps {
  /** Visual content. */
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

export const PaginationPrevious = forwardRef<HTMLElement, PaginationControlProps>(
  function PaginationPrevious(
    {
      children,
      target,
      rel,
      render,
      asChild,
      "data-slot": dataSlot = "pagination-previous",
      "aria-label": ariaLabel,
      onClick,
      ...restProps
    },
    ref,
  ) {
    const {
      currentPage,
      disabled,
      getPageHref,
      isFirstPage,
      previousAriaLabel,
      setPage,
      totalPages,
    } = usePaginationContext();
    const isDisabled = disabled || isFirstPage;
    const isLink = getPageHref !== undefined;
    const destinationPage = Math.max(1, currentPage - 1);
    const href = getPageHref?.({
      page: destinationPage,
      currentPage,
      totalPages,
      isCurrent: destinationPage === currentPage,
    });

    const handleButtonClick: MouseEventHandler<HTMLElement> = useCallback(() => {
      setPage(currentPage - 1);
    }, [currentPage, setPage]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(isLink
        ? isDisabled
          ? {
              href: null,
              target: null,
              rel: null,
              role: "link",
              tabIndex: -1,
              "aria-disabled": true,
            }
          : { href, target, rel }
        : { type: "button", disabled: isDisabled || undefined }),
      "aria-label": ariaLabel ?? previousAriaLabel,
      "data-slot": dataSlot,
      "data-direction": "previous",
      ...(isDisabled ? { "data-disabled": "" } : {}),
      onClick: isLink
        ? composeEventHandlers(onClick, (event) => {
            if (isDisabled) event.preventDefault();
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
          children,
        })}
      </li>
    );
  },
);

export const PaginationNext = forwardRef<HTMLElement, PaginationControlProps>(
  function PaginationNext(
    {
      children,
      target,
      rel,
      render,
      asChild,
      "data-slot": dataSlot = "pagination-next",
      "aria-label": ariaLabel,
      onClick,
      ...restProps
    },
    ref,
  ) {
    const {
      currentPage,
      disabled,
      getPageHref,
      isLastPage,
      nextAriaLabel,
      setPage,
      totalPages,
    } = usePaginationContext();
    const isDisabled = disabled || isLastPage;
    const isLink = getPageHref !== undefined;
    const destinationPage = Math.min(totalPages, currentPage + 1);
    const href = getPageHref?.({
      page: destinationPage,
      currentPage,
      totalPages,
      isCurrent: destinationPage === currentPage,
    });

    const handleButtonClick: MouseEventHandler<HTMLElement> = useCallback(() => {
      setPage(currentPage + 1);
    }, [currentPage, setPage]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(isLink
        ? isDisabled
          ? {
              href: null,
              target: null,
              rel: null,
              role: "link",
              tabIndex: -1,
              "aria-disabled": true,
            }
          : { href, target, rel }
        : { type: "button", disabled: isDisabled || undefined }),
      "aria-label": ariaLabel ?? nextAriaLabel,
      "data-slot": dataSlot,
      "data-direction": "next",
      ...(isDisabled ? { "data-disabled": "" } : {}),
      onClick: isLink
        ? composeEventHandlers(onClick, (event) => {
            if (isDisabled) event.preventDefault();
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
          children,
        })}
      </li>
    );
  },
);
