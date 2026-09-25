"use client";

import { cloneElement, forwardRef, type ReactElement, type ReactNode } from "react";
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
  /** Accessible label for the breadcrumb navigation landmark. */
  ariaLabel?: string;
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
      ariaLabel,
      "aria-label": nativeLabel,
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-label": nativeLabel ?? ariaLabel,
      "data-slot": dataSlot,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "nav", { ...behaviorProps, children });
    const labels = element.props as Record<string, unknown>;
    // Apply the fallback after composition so a child-owned label survives.
    return labels["aria-label"] !== undefined || labels["aria-labelledby"] !== undefined
      ? element
      : cloneElement(element as ReactElement<Record<string, unknown>>, { "aria-label": "Breadcrumb" });
  },
);
