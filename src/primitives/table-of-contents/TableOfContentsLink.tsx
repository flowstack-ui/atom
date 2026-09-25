"use client";
import { forwardRef, type AnchorHTMLAttributes, type MouseEventHandler } from "react";
import { cloneAndMerge, renderElement, composeEventHandlers, type RenderProp } from "../../utils/slot.js";
import { useController, useItem } from "./context.js";
export interface TableOfContentsLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "aria-current"> {
  asChild?: boolean; render?: RenderProp; "data-slot"?: string;
}
export const TableOfContentsLink = forwardRef<HTMLAnchorElement, TableOfContentsLinkProps>(function TableOfContentsLink({
  asChild, render, children, onClick, "data-slot": slot = "table-of-contents-link", ...rest
}, ref) {
  const controller = useController();
  const id = useItem();
  const state = controller.getItemState(id);
  const activate: MouseEventHandler<HTMLAnchorElement> = (event) => {
    const link = event.currentTarget;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey
      || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const result = controller.activateLink(id);
    if (result.available && result.managed) event.preventDefault();
  };
  const props = { ...rest, ref, href: `#${encodeURIComponent(id)}`, "data-slot": slot, "data-toc-link": id,
    "aria-current": state.current ? "location" : undefined, "data-current": state.current ? "" : undefined,
    "data-pending": state.pending ? "" : undefined, onClick: composeEventHandlers(onClick, activate) };
  return asChild ? cloneAndMerge(children, props) : renderElement(render, "a", { ...props, children });
});
