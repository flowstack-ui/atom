"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeListItemProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type BreadcrumbItemNativeProps = NativeListItemProps<"children">;

export interface BreadcrumbItemProps extends BreadcrumbItemNativeProps {
  /** Breadcrumb item content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "breadcrumb-item",
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

    return renderElement(render, "li", {
      ...behaviorProps,
      children,
    });
  },
);
