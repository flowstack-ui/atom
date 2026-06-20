"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type OTPFieldSeparatorNativeProps = NativeSpanProps<"children">;

export interface OTPFieldSeparatorProps extends OTPFieldSeparatorNativeProps {
  children?: ReactNode;
  index?: number;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const OTPFieldSeparator = forwardRef<
  HTMLSpanElement,
  OTPFieldSeparatorProps
>(
  function OTPFieldSeparator(
    {
      children,
      index,
      render,
      asChild,
      "data-slot": dataSlot = "otp-field-separator",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-hidden": true,
      "data-slot": dataSlot,
      ...(index !== undefined && { "data-index": index }),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "span", {
      ...behaviorProps,
      children,
    });
  },
);
