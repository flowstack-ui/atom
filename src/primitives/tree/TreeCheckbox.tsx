"use client";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { composeEventHandlers } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useTreeContext, useTreeItemContext } from "./context.js";

export interface TreeCheckboxProps extends ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}
export const TreeCheckbox = forwardRef<HTMLElement, TreeCheckboxProps>(function TreeCheckbox(
  { children, asChild, render, onClick, disabled, "data-slot": slot = "tree-checkbox", ...props }, ref,
) {
  const tree = useTreeContext();
  const item = useTreeItemContext();
  const state = tree.getCheckedState(item.value);
  const unavailable = disabled || item.disabled || tree.readOnly || !tree.checkable;
  const behavior = {
    ...props, ref, type: "button", role: "checkbox", tabIndex: -1, disabled: unavailable,
    "aria-checked": state,
    "aria-label": props["aria-label"] ?? `Check ${tree.getItem(item.value)?.data.textValue ?? item.value}`,
    "data-state": state === "mixed" ? "indeterminate" : state ? "checked" : "unchecked",
    "data-slot": slot,
    onClick: composeEventHandlers(onClick, event => {
      event.stopPropagation();
      if (unavailable) return;
      tree.treeRef.current?.focus({ preventScroll: true });
      tree.setActiveValue(item.value);
      tree.toggleChecked(item.value);
    }),
  };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "button", { ...behavior, children });
});
