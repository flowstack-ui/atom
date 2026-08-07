"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useCarouselContext } from "./context.js";

type CarouselTrackNativeProps = NativeDivProps<"children">;

export interface CarouselTrackProps extends CarouselTrackNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CarouselTrack = forwardRef<HTMLDivElement, CarouselTrackProps>(
  function CarouselTrack(
    {
      children,
      render,
      asChild,
      className,
      "data-slot": dataSlot = "carousel-track",
      ...restProps
    },
    ref,
  ) {
    const context = useCarouselContext();
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-direction": context.dir,
      className,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);

