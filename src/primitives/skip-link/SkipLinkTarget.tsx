"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeMainProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type SkipLinkTargetNativeProps = NativeMainProps<"children">;

export interface SkipLinkTargetProps extends SkipLinkTargetNativeProps {
  /** Override the rendered target element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Target content. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const SkipLinkTarget = forwardRef<HTMLElement, SkipLinkTargetProps>(
  function SkipLinkTarget(
    {
      render,
      asChild,
      children,
      id = "main-content",
      tabIndex,
      "data-slot": dataSlot = "skip-link-target",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id,
      // The target must be programmatically focusable when the link is used,
      // but it should not add another Tab stop to the page.
      tabIndex: tabIndex ?? -1,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "main", {
      ...behaviorProps,
      children,
    });
  },
);
