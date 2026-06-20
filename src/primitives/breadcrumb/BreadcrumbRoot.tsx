"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeNavProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type BreadcrumbRootNativeProps = NativeNavProps<"children">;

export interface BreadcrumbRootProps extends BreadcrumbRootNativeProps {
  /** Breadcrumb list content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbRootProps>(
  function BreadcrumbRoot(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "breadcrumb",
      "aria-label": ariaLabel = "Breadcrumb",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-label": ariaLabel,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "nav", {
      ...behaviorProps,
      children,
    });
  },
);
