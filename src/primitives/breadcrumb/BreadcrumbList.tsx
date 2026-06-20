"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeOrderedListProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type BreadcrumbListNativeProps = NativeOrderedListProps<"children">;

export interface BreadcrumbListProps extends BreadcrumbListNativeProps {
  /** Breadcrumb item and separator content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  function BreadcrumbList(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "breadcrumb-list",
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

    return renderElement(render, "ol", {
      ...behaviorProps,
      children,
    });
  },
);
