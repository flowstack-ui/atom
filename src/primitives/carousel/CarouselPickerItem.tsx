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
import { getCarouselSlideId } from "./utils.js";

type CarouselPickerItemNativeProps = NativeButtonProps<"children" | "type" | "value">;

export interface CarouselPickerItemProps extends CarouselPickerItemNativeProps {
  value: string;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CarouselPickerItem = forwardRef<HTMLButtonElement, CarouselPickerItemProps>(
  function CarouselPickerItem(
    {
      value,
      children,
      render,
      asChild,
      className,
      disabled,
      "aria-label": ariaLabel,
      "data-slot": dataSlot = "carousel-picker-item",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const context = useCarouselContext();
    const isActive = context.activeValue === value;
    const slideData = context.getSlideData(value);
    const isUnavailable = !context.getSlideElement(value);
    const isDisabled = disabled || isUnavailable;
    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      if (!isDisabled && !isActive) context.selectValue(value, "picker");
    };
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      disabled: isDisabled || undefined,
      "aria-label": ariaLabel ?? slideData?.label ?? `Show ${value}`,
      "aria-controls": getCarouselSlideId(context.idPrefix, value),
      "aria-disabled": isActive ? true : undefined,
      "data-slot": dataSlot,
      "data-state": isActive ? "active" : "inactive",
      "data-value": value,
      ...(isDisabled ? { "data-disabled": "" } : {}),
      className,
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "button", { ...behaviorProps, children });
  },
);

