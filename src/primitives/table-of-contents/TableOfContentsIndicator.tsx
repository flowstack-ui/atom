import { forwardRef, type HTMLAttributes } from "react";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
export interface TableOfContentsIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean; render?: RenderProp; "data-slot"?: string;
}
export const TableOfContentsIndicator = forwardRef<HTMLSpanElement, TableOfContentsIndicatorProps>(function TableOfContentsIndicator({
  asChild, render, children, "data-slot": slot = "table-of-contents-indicator", ...rest
}, ref) {
  const props = { ...rest, ref, "data-slot": slot, "data-toc-indicator": "", "aria-hidden": true };
  return asChild ? cloneAndMerge(children, props) : renderElement(render, "span", { ...props, children });
});
