"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useSwitchContext } from "./context.js";

type SwitchIndicatorNativeProps = NativeSpanProps<"children">;

export interface SwitchIndicatorProps extends SwitchIndicatorNativeProps {
  fallback?: ReactNode;
  forceMount?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export const SwitchIndicator = forwardRef<HTMLSpanElement, SwitchIndicatorProps>(
  function SwitchIndicator(
    {
      fallback,
      forceMount = false,
      render,
      asChild,
      children,
      "data-slot": dataSlot = "switch-indicator",
      ...restProps
    },
    ref,
  ) {
    const context = useSwitchContext();
    const content = context.checked ? children : fallback;
    if (!forceMount && content == null) return null;
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-hidden": true,
      "data-state": context.checked ? "checked" : "unchecked",
      "data-slot": dataSlot,
      ...(context.disabled && { "data-disabled": "" }),
      ...(context.readOnly && { "data-readonly": "" }),
    };
    if (asChild) return cloneAndMerge(content, behaviorProps);
    return renderElement(render, "span", { ...behaviorProps, children: content });
  },
);
