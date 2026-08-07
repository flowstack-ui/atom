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

type CarouselNextNativeProps = NativeButtonProps<"children" | "type">;

export interface CarouselNextProps extends CarouselNextNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CarouselNext = forwardRef<HTMLButtonElement, CarouselNextProps>(
  function CarouselNext(
    {
      children,
      render,
      asChild,
      className,
      disabled,
      "aria-label": ariaLabel,
      "data-slot": dataSlot = "carousel-next",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const context = useCarouselContext();
    const isDisabled = disabled || !context.canGoNext;
    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      if (!isDisabled) context.goNext();
    };
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      disabled: isDisabled || undefined,
      "aria-label": ariaLabel ?? context.nextAriaLabel,
      "data-slot": dataSlot,
      "data-direction": "next",
      ...(isDisabled ? { "data-disabled": "" } : {}),
      className,
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "button", {
      ...behaviorProps,
      children: children ?? context.nextAriaLabel,
    });
  },
);

