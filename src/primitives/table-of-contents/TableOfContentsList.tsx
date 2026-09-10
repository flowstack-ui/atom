import { forwardRef, type HTMLAttributes } from "react";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
export interface TableOfContentsListProps extends HTMLAttributes<HTMLUListElement> {
  asChild?: boolean; render?: RenderProp; "data-slot"?: string;
}
export const TableOfContentsList = forwardRef<HTMLUListElement, TableOfContentsListProps>(function TableOfContentsList({
  asChild, render, children, "data-slot": slot = "table-of-contents-list", ...rest
}, ref) {
  const props = { ...rest, ref, "data-slot": slot };
  return asChild ? cloneAndMerge(children, props) : renderElement(render, "ul", { ...props, children });
});
