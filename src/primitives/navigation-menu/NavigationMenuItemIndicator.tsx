"use client";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useNavigationMenuContext, useNavigationMenuItemContext } from "./context.js";
export interface NavigationMenuItemIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}
export const NavigationMenuItemIndicator = forwardRef<HTMLSpanElement, NavigationMenuItemIndicatorProps>(
  function NavigationMenuItemIndicator({ children, asChild, render, "data-slot": slot = "navigation-menu-item-indicator", ...props }, ref) {
    const root = useNavigationMenuContext();
    const item = useNavigationMenuItemContext();
    const attributes = { ...props, ref, "aria-hidden": true as const, "data-slot": slot,
      "data-state": root.value === item.value ? "open" : "closed", "data-value": item.value,
      "data-orientation": root.orientation };
    return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "span", { ...attributes, children });
  },
);
