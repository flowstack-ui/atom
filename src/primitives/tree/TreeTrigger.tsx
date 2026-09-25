"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { composeEventHandlers } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useTreeContext, useTreeItemContext } from "./context.js";

export interface TreeTriggerProps extends ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

/** Independent disclosure operation; not a second stop in the composite tab order. */
export const TreeTrigger = forwardRef<HTMLElement, TreeTriggerProps>(function TreeTrigger(
  { children, asChild, render, onClick, disabled, "data-slot": slot = "tree-trigger", ...props }, ref,
) {
  const tree = useTreeContext();
  const item = useTreeItemContext();
  const unavailable = disabled || item.disabled || tree.readOnly || !item.expandable;
  const behavior = {
    ...props, ref, type: "button", tabIndex: -1, disabled: unavailable,
    "aria-label": props["aria-label"] ?? (item.expanded ? "Collapse" : "Expand"),
    "aria-expanded": item.expanded,
    "data-state": item.expanded ? "open" : "closed",
    "data-slot": slot,
    onClick: composeEventHandlers(onClick, event => {
      event.stopPropagation();
      if (unavailable) return;
      tree.treeRef.current?.focus({ preventScroll: true });
      tree.setActiveValue(item.value);
      tree.toggleExpandedValue(item.value);
    }),
  };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "button", { ...behavior, children });
});
