"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useTextareaContext } from "./context.js";

type TextareaCountNativeProps = NativeSpanProps<"children">;

export interface TextareaCountProps extends TextareaCountNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TextareaCount = forwardRef<HTMLSpanElement, TextareaCountProps>(
  function TextareaCount(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "textarea-count",
      ...restProps
    },
    ref,
  ) {
    const ctx = useTextareaContext();
    const count = ctx.value.length;
    const maxLength = ctx.maxLength;
    const isOverLimit = maxLength !== undefined && count > maxLength;
    const defaultContent = maxLength === undefined ? `${count}` : `${count}/${maxLength}`;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-live": restProps["aria-live"] ?? "polite",
      "data-slot": dataSlot,
      "data-count": count,
      ...(maxLength !== undefined && { "data-max": maxLength }),
      ...(isOverLimit && { "data-over-limit": "" }),
    };

    if (asChild) {
      return cloneAndMerge(children, {
        ...behaviorProps,
        children: defaultContent,
      });
    }

    return renderElement(render, "span", {
      ...behaviorProps,
      children: children ?? defaultContent,
    });
  },
);
