"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type BadgeRootNativeProps = NativeSpanProps<"children">;

export interface BadgeRootProps extends BadgeRootNativeProps {
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the badge wrapper. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BadgeRoot = forwardRef<HTMLSpanElement, BadgeRootProps>(
  function BadgeRoot(
    {
      render,
      asChild,
      children,
      "data-slot": dataSlot = "badge",
      ...rest
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...rest,
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
  },
);
