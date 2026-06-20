"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeParagraphProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useToastRootContext } from "./context.js";

type ToastTitleNativeProps = NativeParagraphProps<"children">;

export interface ToastTitleProps extends ToastTitleNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ToastTitle = forwardRef<HTMLParagraphElement, ToastTitleProps>(
  function ToastTitle(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "toast-title",
      ...restProps
    },
    ref,
  ) {
    const context = useToastRootContext();
    const content = children ?? context.toast?.title;

    if (content == null) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "p", { ...behaviorProps, children: content });
  },
);
