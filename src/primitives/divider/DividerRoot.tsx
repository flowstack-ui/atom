"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

export type DividerOrientation = "horizontal" | "vertical";

type DividerRootNativeProps = NativeDivProps<"children" | "role">;

export interface DividerRootProps extends DividerRootNativeProps {
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto the single child element. */
  asChild?: boolean;
  /** Line direction, used for aria-orientation. */
  orientation?: DividerOrientation;
  /** Whether the divider is purely decorative. */
  decorative?: boolean;
  /** Content rendered inside the divider. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

function resolveRole(decorative: boolean): "separator" | "none" {
  return decorative ? "none" : "separator";
}

export const DividerRoot = forwardRef<HTMLDivElement | HTMLHRElement, DividerRootProps>(
  function DividerRoot(
    {
      render,
      asChild,
      orientation = "horizontal",
      decorative = true,
      children,
      "data-slot": dataSlot = "divider",
      ...rest
    },
    ref,
  ) {
    const hasChildren = children !== undefined && children !== null;
    const role = resolveRole(decorative);
    const ariaOrientation =
      role === "separator" && orientation === "vertical" ? "vertical" : undefined;

    const behaviorProps: Record<string, unknown> = {
      ...rest,
      ref,
      role,
      "data-slot": dataSlot,
      ...(ariaOrientation !== undefined ? { "aria-orientation": ariaOrientation } : {}),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, hasChildren ? "div" : "hr", {
      ...behaviorProps,
      children,
    });
  },
);
