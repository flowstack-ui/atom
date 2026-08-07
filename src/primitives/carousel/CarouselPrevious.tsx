"use client";

import { forwardRef, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useCarouselContext } from "./context.js";

type CarouselPreviousNativeProps = NativeButtonProps<"children" | "type">;

export interface CarouselPreviousProps extends CarouselPreviousNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CarouselPrevious = forwardRef<HTMLButtonElement, CarouselPreviousProps>(
  function CarouselPrevious(
    {
      children,
      render,
      asChild,
      className,
      disabled,
      "aria-label": ariaLabel,
      "data-slot": dataSlot = "carousel-previous",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const context = useCarouselContext();
    const isDisabled = disabled || !context.canGoPrevious;
    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      if (!isDisabled) context.goPrevious();
    };
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      disabled: isDisabled || undefined,
      "aria-label": ariaLabel ?? context.previousAriaLabel,
      "data-slot": dataSlot,
      "data-direction": "previous",
      ...(isDisabled ? { "data-disabled": "" } : {}),
      className,
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "button", {
      ...behaviorProps,
      children: children ?? context.previousAriaLabel,
    });
  },
);

