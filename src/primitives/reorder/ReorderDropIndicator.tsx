"use client";

import { forwardRef } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { renderElement, type RenderProp } from "../../utils/slot.js";
import { useDragDropContext } from "../drag-drop/index.js";
import { useReorderItemContext } from "./context.js";

export interface ReorderDropIndicatorProps extends NativeSpanProps<never> {
  render?: RenderProp;
  "data-slot"?: string;
}

export const ReorderDropIndicator = forwardRef<HTMLSpanElement, ReorderDropIndicatorProps>(
  function ReorderDropIndicator({
    render,
    "data-slot": dataSlot = "reorder-drop-indicator",
    ...restProps
  }, ref) {
    const { state } = useDragDropContext();
    const item = useReorderItemContext();
    const active = state.activeValue !== null && state.overValue === item.value && state.position !== "on";
    return renderElement(render, "span", {
      ...restProps,
      ref,
      "aria-hidden": true,
      "data-slot": dataSlot,
      "data-state": active ? "active" : "inactive",
      ...(active && { "data-position": state.position }),
    });
  },
);
