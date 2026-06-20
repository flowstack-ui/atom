"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useProgressContext } from "./context.js";

type ProgressIndicatorNativeProps = NativeDivProps<"children">;

export interface ProgressIndicatorProps extends ProgressIndicatorNativeProps {
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Visual indicator content. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ProgressIndicator = forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  function ProgressIndicator(
    {
      render,
      asChild,
      children,
      "data-slot": dataSlot = "progress-indicator",
      ...restProps
    },
    ref,
  ) {
    const state = useProgressContext();

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-hidden": true,
      "data-state": state.dataState,
      "data-slot": dataSlot,
      "data-min": state.min,
      "data-max": state.max,
      ...(state.value !== null && { "data-value": state.value }),
      ...(state.percent !== null && { "data-percent": state.percent }),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
