"use client";
import { forwardRef, type HTMLAttributes } from "react";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useAccordionItemContext, useAccordionContext } from "./context.js";
export interface AccordionIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, "aria-hidden"> {
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}
export const AccordionIndicator = forwardRef<HTMLSpanElement, AccordionIndicatorProps>(function AccordionIndicator({ children, asChild, render, "data-slot": slot = "accordion-indicator", ...props }, ref) {
  const item = useAccordionItemContext();
  const group = useAccordionContext();
  const attributes = { ...props, ref, "aria-hidden": true, "data-slot": slot, "data-state": item.isOpen ? "open" : "closed", "data-disabled": item.disabled ? "" : undefined, "data-orientation": group.orientation };
  return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "span", { ...attributes, children });
});
