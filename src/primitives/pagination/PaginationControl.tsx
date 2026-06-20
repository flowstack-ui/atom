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

type PaginationControlNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

export interface PaginationControlProps extends PaginationControlNativeProps {
  /** Visual content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const PaginationPrevious = forwardRef<HTMLButtonElement, PaginationControlProps>(
  function PaginationPrevious(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "pagination-previous",
      "aria-label": ariaLabel = "Previous page",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const { currentPage, disabled, isFirstPage, setPage } = usePaginationContext();
    const isDisabled = disabled || isFirstPage;

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
      () => {
        setPage(currentPage - 1);
      },
      [currentPage, setPage],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      disabled: isDisabled || undefined,
      "aria-label": ariaLabel,
      "data-slot": dataSlot,
      "data-direction": "previous",
      ...(isDisabled ? { "data-disabled": "" } : {}),
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", {
      ...behaviorProps,
      children,
    });
  },
);

export const PaginationNext = forwardRef<HTMLButtonElement, PaginationControlProps>(
  function PaginationNext(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "pagination-next",
      "aria-label": ariaLabel = "Next page",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const { currentPage, disabled, isLastPage, setPage } = usePaginationContext();
    const isDisabled = disabled || isLastPage;

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
      () => {
        setPage(currentPage + 1);
      },
      [currentPage, setPage],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      disabled: isDisabled || undefined,
      "aria-label": ariaLabel,
      "data-slot": dataSlot,
      "data-direction": "next",
      ...(isDisabled ? { "data-disabled": "" } : {}),
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", {
      ...behaviorProps,
      children,
    });
  },
);
