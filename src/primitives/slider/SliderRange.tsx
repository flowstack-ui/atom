"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { getSliderRangeOffsetStyle, useSliderContext } from "./context.js";

type SliderRangeNativeProps = NativeSpanProps<"children">;

export interface SliderRangeProps extends SliderRangeNativeProps {
  /** Override the rendered range element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the range. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const SliderRange = forwardRef<HTMLSpanElement, SliderRangeProps>(
  function SliderRange(
    {
      render,
      asChild,
      children,
      className,
      style,
      "data-slot": dataSlot = "slider-range",
      ...restProps
    },
    ref,
  ) {
    const context = useSliderContext();
    const rangeState = context.getRangeState();
    const offsetStyle = getSliderRangeOffsetStyle(
      context.orientation,
      rangeState,
    );

    // The offsets are behavior-derived geometry; visual styling stays external.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-hidden": true,
      "data-slot": dataSlot,
      "data-orientation": context.orientation,
      "data-start": rangeState.startPercent,
      "data-end": rangeState.endPercent,
      ...(context.disabled && { "data-disabled": "" }),
      style: {
        ...(style as CSSProperties | undefined),
        ...offsetStyle,
      },
      className,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "span", { ...behaviorProps, children });
  },
);
