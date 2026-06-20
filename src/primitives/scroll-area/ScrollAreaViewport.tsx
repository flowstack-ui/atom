"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useScrollAreaContext } from "./context.js";

type ScrollAreaViewportNativeProps = NativeDivProps<"children">;

export interface ScrollAreaViewportProps extends ScrollAreaViewportNativeProps {
  /** Opt the scrollable viewport into the Tab order. */
  focusable?: boolean;
  /** Override the rendered viewport element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the scrollable viewport. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ScrollAreaViewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  function ScrollAreaViewport(
    {
      focusable = false,
      render,
      asChild,
      children,
      role,
      tabIndex,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "data-slot": dataSlot = "scroll-area-viewport",
      ...restProps
    },
    ref,
  ) {
    const { orientation } = useScrollAreaContext();
    const hasAccessibleName = ariaLabel !== undefined || ariaLabelledBy !== undefined;
    const requestedRole = role ?? (hasAccessibleName ? "region" : undefined);
    const resolvedRole =
      requestedRole === "region" && !hasAccessibleName ? undefined : requestedRole;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: resolvedRole,
      tabIndex: tabIndex ?? (focusable ? 0 : undefined),
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "data-slot": dataSlot,
      "data-orientation": orientation,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "div", {
      ...behaviorProps,
      children,
    });
  },
);
