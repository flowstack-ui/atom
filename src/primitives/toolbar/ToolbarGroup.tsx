"use client";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
export interface ToolbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
  asChild?: boolean;
  render?: RenderProp;
  children?: ReactNode;
  "data-slot"?: string;
}
export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(function ToolbarGroup(
  { ariaLabel, asChild, render, children, "data-slot": slot = "toolbar-group", ...props }, ref,
) {
  const attributes = { ...props, ref, role: "group", ...(ariaLabel !== undefined && { "aria-label": ariaLabel }), "data-slot": slot };
  return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children });
});
