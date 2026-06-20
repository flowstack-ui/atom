"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useCheckboxContext } from "./context.js";

type CheckboxIndicatorNativeProps = NativeSpanProps<"children">;

export interface CheckboxIndicatorProps extends CheckboxIndicatorNativeProps {
  /** Force the indicator to stay mounted even when unchecked. */
  forceMount?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Visual indicator content supplied by the styled layer or consumer. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const CheckboxIndicator = forwardRef<HTMLSpanElement, CheckboxIndicatorProps>(
  function CheckboxIndicator(
    {
      forceMount = false,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "checkbox-indicator",
      ...restProps
    },
    ref,
  ) {
    const { state, disabled } = useCheckboxContext();

    if (!forceMount && state === "unchecked") {
      return null;
    }

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-hidden": true,
      "data-state": state,
      "data-slot": dataSlot,
      ...(disabled && { "data-disabled": "" }),
      className,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "span", { ...behaviorProps, children });
  },
);
