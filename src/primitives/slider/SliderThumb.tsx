"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { getSliderThumbOffsetStyle, useSliderContext } from "./context.js";

type SliderThumbNativeProps = NativeSpanProps<"children">;

export interface SliderThumbProps extends SliderThumbNativeProps {
  /** Thumb index in the current slider value array. */
  index?: number;
  /** Override the rendered thumb element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the thumb. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const SliderThumb = forwardRef<HTMLSpanElement, SliderThumbProps>(
  function SliderThumb(
    {
      index = 0,
      render,
      asChild,
      children,
      className,
      style,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      "data-slot": dataSlot = "slider-thumb",
      ...restProps
    },
    ref,
  ) {
    const context = useSliderContext();
    const thumbState = context.getThumbState(index);
    const thumbProps = context.getThumbProps(index);
    const offsetStyle = getSliderThumbOffsetStyle(
      context.orientation,
      thumbState.percent,
    );

    // Native span props pass through before Atom behavior and value geometry.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ...thumbProps,
      ref,
      "data-slot": dataSlot,
      "data-value": thumbState.value,
      "data-percent": thumbState.percent,
      style: {
        ...(style as CSSProperties | undefined),
        ...offsetStyle,
      },
      className,
      onKeyDown: composeEventHandlers(onKeyDown, thumbProps.onKeyDown),
      onPointerDown: composeEventHandlers(
        onPointerDown,
        thumbProps.onPointerDown,
      ),
      onPointerMove: composeEventHandlers(
        onPointerMove,
        thumbProps.onPointerMove,
      ),
      onPointerUp: composeEventHandlers(onPointerUp, thumbProps.onPointerUp),
      onPointerCancel: composeEventHandlers(
        onPointerCancel,
        thumbProps.onPointerCancel,
      ),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "span", { ...behaviorProps, children });
  },
);
