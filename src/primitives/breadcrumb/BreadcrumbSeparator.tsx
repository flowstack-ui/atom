"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeListItemProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type BreadcrumbSeparatorNativeProps = NativeListItemProps<
  "children" | "role" | "aria-hidden"
>;

export interface BreadcrumbSeparatorProps extends BreadcrumbSeparatorNativeProps {
  /** Separator content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BreadcrumbSeparator = forwardRef<
  HTMLLIElement,
  BreadcrumbSeparatorProps
>(function BreadcrumbSeparator(
  {
    children = "/",
    render,
    asChild,
    "data-slot": dataSlot = "breadcrumb-separator",
    ...restProps
  },
  ref,
) {
  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref,
    role: "presentation",
    "aria-hidden": true,
    "data-slot": dataSlot,
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "li", {
    ...behaviorProps,
    children,
  });
});
