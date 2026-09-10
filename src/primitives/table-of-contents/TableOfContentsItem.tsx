"use client";
import { forwardRef, type HTMLAttributes, type CSSProperties } from "react";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { ItemContext, useController } from "./context.js";
export interface TableOfContentsItemProps extends HTMLAttributes<HTMLLIElement> {
  value: string; asChild?: boolean; render?: RenderProp; "data-slot"?: string;
}
export const TableOfContentsItem = forwardRef<HTMLLIElement, TableOfContentsItemProps>(function TableOfContentsItem({
  value, asChild, render, children, style, "data-slot": slot = "table-of-contents-item", ...rest
}, ref) {
  const state = useController().getItemState(value);
  const props = { ...rest, ref, "data-slot": slot, "data-depth": state.depth, "data-level": state.level,
    "data-current": state.current ? "" : undefined, "data-visible": state.visible ? "" : undefined,
    "data-pending": state.pending ? "" : undefined,
    style: { "--atom-table-of-contents-level": state.level, ...style } as CSSProperties };
  return <ItemContext.Provider value={value}>
    {asChild ? cloneAndMerge(children, props) : renderElement(render, "li", { ...props, children })}
  </ItemContext.Provider>;
});
