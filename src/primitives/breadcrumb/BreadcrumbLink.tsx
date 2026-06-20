"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeAnchorProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type BreadcrumbLinkNativeProps = NativeAnchorProps<"children">;

export interface BreadcrumbLinkProps extends BreadcrumbLinkNativeProps {
  /** Link label. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "breadcrumb-link",
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

    return renderElement(render, "a", {
      ...behaviorProps,
      children,
    });
  },
);
