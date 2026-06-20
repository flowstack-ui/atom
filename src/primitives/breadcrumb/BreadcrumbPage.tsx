"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type BreadcrumbPageNativeProps = NativeSpanProps<"children" | "aria-current">;

export interface BreadcrumbPageProps extends BreadcrumbPageNativeProps {
  /** Current page label. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  function BreadcrumbPage(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "breadcrumb-page",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-current": "page",
      "data-slot": dataSlot,
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
