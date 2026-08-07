"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useCarouselContext } from "./context.js";

type CarouselPickerNativeProps = NativeDivProps<"children" | "role">;

export interface CarouselPickerProps extends CarouselPickerNativeProps {
  children?: ReactNode;
  ariaLabel?: string;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CarouselPicker = forwardRef<HTMLDivElement, CarouselPickerProps>(
  function CarouselPicker(
    {
      children,
      ariaLabel = "Choose slide to display",
      render,
      asChild,
      className,
      "data-slot": dataSlot = "carousel-picker",
      ...restProps
    },
    ref,
  ) {
    const context = useCarouselContext();
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "group",
      "aria-label": ariaLabel,
      "data-slot": dataSlot,
      "data-state": context.isPlaying
        ? "playing"
        : context.autoPlay ? "paused" : "stopped",
      className,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
