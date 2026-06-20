"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeAsideProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useSidebarContext } from "./context.js";

type SidebarPanelNativeProps = NativeAsideProps<
  "children" | "aria-hidden" | "inert"
>;

export interface SidebarPanelProps extends SidebarPanelNativeProps {
  /**
   * Accessible name for the default aside landmark. Recommended when a page has
   * multiple complementary landmarks.
   */
  "aria-label"?: string;
  /** ID reference for an element that names the default aside landmark. */
  "aria-labelledby"?: string;
  /** Panel content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const SidebarPanel = forwardRef<HTMLElement, SidebarPanelProps>(
  function SidebarPanel(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "sidebar-panel",
      ...restProps
    },
    ref,
  ) {
    const { state, side, collapsedState, disabled, panelId } = useSidebarContext();
    const isOffcanvas = state === "offcanvas";

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: panelId,
      "data-slot": dataSlot,
      "data-state": state,
      "data-side": side,
      "data-collapsed-state": collapsedState,
      ...(disabled ? { "data-disabled": "" } : {}),
      "aria-hidden": isOffcanvas ? true : undefined,
      inert: isOffcanvas ? true : undefined,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "aside", { ...behaviorProps, children });
  },
);
