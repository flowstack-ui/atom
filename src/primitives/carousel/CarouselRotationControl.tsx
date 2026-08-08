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

type CarouselRotationControlNativeProps = NativeButtonProps<"children" | "type">;

export interface CarouselRotationControlProps extends CarouselRotationControlNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CarouselRotationControl = forwardRef<
  HTMLButtonElement,
  CarouselRotationControlProps
>(function CarouselRotationControl(
  {
    children,
    render,
    asChild,
    className,
    "aria-label": ariaLabel,
    "data-slot": dataSlot = "carousel-rotation-control",
    onClick,
    ...restProps
  },
  ref,
) {
  const context = useCarouselContext();
  const actionLabel = context.autoPlay
    ? context.stopAriaLabel
    : context.startAriaLabel;
  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    context.toggleAutoPlay();
  };
  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref,
    type: "button",
    "aria-label": ariaLabel ?? actionLabel,
    "data-atom-carousel-rotation-control": "",
    "data-slot": dataSlot,
    "data-state": context.autoPlay ? "playing" : "stopped",
    className,
    onClick: composeEventHandlers(onClick, handleClick),
  };

  if (asChild) return cloneAndMerge(children, behaviorProps);
  return renderElement(render, "button", {
    ...behaviorProps,
    children: children ?? actionLabel,
  });
});
