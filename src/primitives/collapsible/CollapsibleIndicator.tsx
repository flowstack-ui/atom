"use client";
import { forwardRef, type HTMLAttributes } from "react";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useCollapsibleContext } from "./context.js";
export interface CollapsibleIndicatorProps
  extends HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}
export const CollapsibleIndicator = forwardRef<
  HTMLSpanElement,
  CollapsibleIndicatorProps
>(function CollapsibleIndicator(
  {
    children,
    asChild,
    render,
    "data-slot": slot = "collapsible-indicator",
    ...props
  },
  ref,
) {
  const { open, disabled, orientation } = useCollapsibleContext();
  const attributes = {
    ...props,
    ref,
    "aria-hidden": true,
    "data-slot": slot,
    "data-state": open ? "open" : "closed",
    "data-disabled": disabled ? "" : undefined,
    "data-orientation": orientation,
  };
  return asChild
    ? cloneAndMerge(children, attributes)
    : renderElement(render, "span", { ...attributes, children });
});
