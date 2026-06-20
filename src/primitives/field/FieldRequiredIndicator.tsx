"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldContext } from "./context.js";

type FieldRequiredIndicatorNativeProps = NativeSpanProps<"children">;

export interface FieldRequiredIndicatorProps extends FieldRequiredIndicatorNativeProps {
  children?: ReactNode;
  fallback?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FieldRequiredIndicator = forwardRef<
  HTMLSpanElement,
  FieldRequiredIndicatorProps
>(
  function FieldRequiredIndicator(
    {
      children = " *",
      fallback,
      render,
      asChild,
      "data-slot": dataSlot,
      ...restProps
    },
    ref,
  ) {
    const ctx = useFieldContext();
    const isRequired = ctx?.required ?? false;
    const content = isRequired ? children : fallback;

    if (!content) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-hidden": isRequired ? true : undefined,
      "data-slot": dataSlot ??
        (isRequired ? "field-required-indicator" : "field-optional-indicator"),
    };

    if (asChild) {
      return cloneAndMerge(content, behaviorProps);
    }

    return renderElement(render, "span", {
      ...behaviorProps,
      children: content,
    });
  },
);
