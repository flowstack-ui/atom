"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { composeEventHandlers } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useTreeGridContext, useTreeGridRowContext } from "./context.js";

export interface TreeGridTriggerProps extends ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

/** Disclosure only: selecting a row and activating a cell remain separate operations. */
export const TreeGridTrigger = forwardRef<HTMLElement, TreeGridTriggerProps>(function TreeGridTrigger(
  { children, asChild, render, onClick, disabled, "data-slot": slot = "tree-grid-trigger", ...props }, ref,
) {
  const grid = useTreeGridContext();
  const row = useTreeGridRowContext();
  const unavailable = Boolean(disabled || grid.disabled || grid.readOnly || row?.disabled || !row?.expandable);
  const behavior = {
    ...props, ref, type: "button", tabIndex: -1, disabled: unavailable,
    "aria-label": props["aria-label"] ?? (row?.expanded ? "Collapse" : "Expand"),
    "aria-expanded": row?.expanded,
    "data-state": row?.expanded ? "open" : "closed", "data-slot": slot,
    onClick: composeEventHandlers(onClick, event => {
      event.stopPropagation();
      if (unavailable || !row) return;
      const cell = event.currentTarget.closest("[aria-colindex]");
      const columnIndex = Number(cell?.getAttribute("aria-colindex"));
      if (row.rowIndex && columnIndex > 0) grid.focusCell(row.rowIndex, columnIndex);
      else grid.treeGridRef.current?.focus({ preventScroll: true });
      grid.toggleExpandedRow(row.value);
    }),
  };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "button", { ...behavior, children });
});
