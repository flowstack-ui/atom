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

type CarouselPickerItemNativeProps = NativeButtonProps<
  "children" | "type" | "value"
>;

export type CarouselPickerItemProps = CarouselPickerItemNativeProps &
  ({ value: string; page?: never } | { page: number; value?: never }) & {
    children?: ReactNode;
    render?: RenderProp;
    asChild?: boolean;
    "data-slot"?: string;
  };

export const CarouselPickerItem = forwardRef<
  HTMLButtonElement,
  CarouselPickerItemProps
>(function CarouselPickerItem(
  {
    value,
    page,
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
  const targetValue =
    page !== undefined
      ? (context.pageSnapPoints[page]?.value ?? "")
      : (value ?? "");
  const isActive =
    page !== undefined
      ? context.page === page
      : context.activeValue === targetValue;
  const slideData = context.getSlideData(targetValue);
  const isUnavailable = !context.getSlideElement(targetValue);
  const isDisabled = disabled || isUnavailable;
  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (!isDisabled && !isActive) {
      if (page !== undefined) context.selectPage(page, "picker");
      else context.selectValue(targetValue, "picker");
    }
  };
  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref,
    type: "button",
    disabled: isDisabled || undefined,
    "aria-label":
      ariaLabel ??
      (page !== undefined
        ? (context.translations?.indicator?.(page) ?? `Go to page ${page + 1}`)
        : (slideData?.label ?? `Show ${targetValue}`)),
    "aria-controls":
      context.getSlideElement(targetValue)?.id ??
      context.ids?.item?.(targetValue) ??
      getCarouselSlideId(context.idPrefix, targetValue),
    "aria-current": isActive ? "true" : undefined,
    "aria-disabled": isActive ? true : undefined,
    "data-slot": dataSlot,
    "data-state": isActive ? "active" : "inactive",
    "data-value": targetValue,
    ...(isDisabled ? { "data-disabled": "" } : {}),
    className,
    onClick: composeEventHandlers(onClick, handleClick),
  };

  if (asChild) return cloneAndMerge(children, behaviorProps);
  return renderElement(render, "button", { ...behaviorProps, children });
});
