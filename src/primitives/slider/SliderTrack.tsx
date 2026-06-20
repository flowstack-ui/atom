"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useSliderContext } from "./context.js";

type SliderTrackNativeProps = NativeDivProps<"children">;

export interface SliderTrackProps extends SliderTrackNativeProps {
  /** Override the rendered track element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the track. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const SliderTrack = forwardRef<HTMLDivElement, SliderTrackProps>(
  function SliderTrack(
    {
      render,
      asChild,
      children,
      className,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      "data-slot": dataSlot = "slider-track",
      ...restProps
    },
    ref,
  ) {
    const context = useSliderContext();
    const composedRef = useMemo(
      () => composeRefs(context.trackRef, ref),
      [context.trackRef, ref],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      "data-slot": dataSlot,
      "data-orientation": context.orientation,
      ...(context.disabled && { "data-disabled": "" }),
      className,
      onPointerDown: composeEventHandlers(
        onPointerDown,
        context.handleTrackPointerDown,
      ),
      onPointerMove: composeEventHandlers(
        onPointerMove,
        context.handlePointerMove,
      ),
      onPointerUp: composeEventHandlers(onPointerUp, context.handlePointerUp),
      onPointerCancel: composeEventHandlers(
        onPointerCancel,
        context.handlePointerUp,
      ),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
