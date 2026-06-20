"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useTabsContext } from "./context.js";

type TabsContentNativeProps = NativeDivProps<"children" | "role">;

export interface TabsContentProps extends TabsContentNativeProps {
  /** Panel content. */
  children?: ReactNode;
  /** Tab value to match. */
  value: string;
  /** Keep mounted in DOM when inactive. */
  keepMounted?: boolean;
  /** Make the tab panel itself reachable with Tab. Useful for text-only panels. */
  focusable?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent(
    {
      children,
      value,
      keepMounted = false,
      focusable = false,
      render,
      asChild,
      className,
      "data-slot": dataSlot = "tabs-content",
      tabIndex,
      ...restProps
    },
    ref,
  ) {
    const { activeValue, idPrefix, orientation } = useTabsContext();
    const isActive = activeValue === value;

    if (!keepMounted && !isActive) {
      return null;
    }

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "tabpanel",
      id: `${idPrefix}-panel-${value}`,
      "aria-labelledby": `${idPrefix}-trigger-${value}`,
      tabIndex: tabIndex ?? (focusable ? 0 : undefined),
      "data-slot": dataSlot,
      "data-state": isActive ? "active" : "inactive",
      "data-orientation": orientation,
      hidden: !isActive || undefined,
      className,
    };

    const content = isActive || keepMounted ? children : null;

    if (asChild) {
      return cloneAndMerge(content, behaviorProps);
    }

    return renderElement(render, "div", { ...behaviorProps, children: content });
  },
);
