"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeMainProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useSidebarContext } from "./context.js";

type SidebarMainNativeProps = NativeMainProps<"children">;

export interface SidebarMainProps extends SidebarMainNativeProps {
  /** Main content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const SidebarMain = forwardRef<HTMLElement, SidebarMainProps>(
  function SidebarMain(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "sidebar-main",
      ...restProps
    },
    ref,
  ) {
    const { state, side, collapsedState, disabled } = useSidebarContext();

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-state": state,
      "data-side": side,
      "data-collapsed-state": collapsedState,
      ...(disabled ? { "data-disabled": "" } : {}),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "main", { ...behaviorProps, children });
  },
);
