"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type BreadcrumbEllipsisNativeProps = NativeSpanProps<"children">;

export interface BreadcrumbEllipsisProps extends BreadcrumbEllipsisNativeProps {
  /** Ellipsis content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BreadcrumbEllipsis = forwardRef<
  HTMLSpanElement,
  BreadcrumbEllipsisProps
>(function BreadcrumbEllipsis(
  {
    children = "\u2026",
    render,
    asChild,
    "data-slot": dataSlot = "breadcrumb-ellipsis",
    ...restProps
  },
  ref,
) {
  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref,
    "data-slot": dataSlot,
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "span", {
    ...behaviorProps,
    children,
  });
});
