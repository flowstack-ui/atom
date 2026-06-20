"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useNavListContext, useNavListSectionContext } from "./context.js";

type NavListSectionContentNativeProps = NativeDivProps<"children" | "hidden">;

export interface NavListSectionContentProps extends NavListSectionContentNativeProps {
  /** Section content. */
  children?: ReactNode;
  /** Keep content mounted while the section is closed. */
  forceMount?: boolean;
  /** Override the rendered content element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const NavListSectionContent = forwardRef<HTMLDivElement, NavListSectionContentProps>(
  function NavListSectionContent(
    {
      children,
      forceMount = false,
      render,
      asChild,
      "data-slot": dataSlot = "nav-list-section-content",
      ...restProps
    },
    ref,
  ) {
    const { orientation } = useNavListContext();
    const { isOpen, collapsible, contentId, hasLabel, labelId, triggerId } =
      useNavListSectionContext();

    if (!isOpen && !forceMount) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: contentId,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      "data-state": isOpen ? "open" : "closed",
      ...(collapsible ? { "data-collapsible": "" } : {}),
      "aria-labelledby": hasLabel ? labelId : collapsible ? triggerId : undefined,
      hidden: !isOpen && forceMount ? true : undefined,
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
