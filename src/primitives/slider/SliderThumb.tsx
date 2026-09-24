"use client";

import { forwardRef, useCallback, useMemo, type CSSProperties, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useSliderContext } from "./context.js";

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
      onFocus,
      onBlur,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
      "aria-valuetext": ariaValueText,
      "data-slot": dataSlot = "slider-thumb",
      ...restProps
    },
    ref,
  ) {
    const context = useSliderContext();
    const thumbState = context.getThumbState(index);
    const thumbProps = context.getThumbProps(index);
    const offsetStyle = context.getThumbOffsetStyle(index);
    const registerRef = useCallback(
      (node: HTMLSpanElement | null) => context.registerThumb(index, node),
      [context.registerThumb, index],
    );
    const composedRef = useMemo(() => composeRefs(registerRef, ref), [registerRef, ref]);
    const describedBy = [thumbProps["aria-describedby"], ariaDescribedby]
      .filter(Boolean)
      .flatMap((value) => value!.split(/\s+/u));

    // Native span props pass through before Atom behavior and value geometry.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ...thumbProps,
      ref: composedRef,
      "aria-label": ariaLabel ?? thumbProps["aria-label"],
      "aria-labelledby": ariaLabelledby ?? (ariaLabel ? undefined : thumbProps["aria-labelledby"]),
      "aria-describedby": [...new Set(describedBy)].join(" ") || undefined,
      "aria-valuetext": ariaValueText ?? thumbProps["aria-valuetext"],
      "data-slot": dataSlot,
      "data-value": thumbState.value,
      "data-percent": thumbState.percent,
      style: {
        ...(style as CSSProperties | undefined),
        ...offsetStyle,
      },
      className,
      onFocus: composeEventHandlers(onFocus, thumbProps.onFocus),
      onBlur: composeEventHandlers(onBlur, thumbProps.onBlur),
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
      onLostPointerCapture: composeEventHandlers(
        onLostPointerCapture,
        thumbProps.onLostPointerCapture,
      ),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "span", { ...behaviorProps, children });
  },
);
