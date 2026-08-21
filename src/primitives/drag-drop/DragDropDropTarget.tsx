"use client";

import { forwardRef, useEffect, useState, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useDragDropContext } from "./context.js";

type NativeProps = NativeDivProps<"children">;

export interface DragDropDropTargetProps extends NativeProps {
  value: string;
  label: string;
  mode?: "before-after" | "on";
  disabled?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export const DragDropDropTarget = forwardRef<HTMLElement, DragDropDropTargetProps>(
  function DragDropDropTarget({
    value,
    label,
    mode = "on",
    disabled = false,
    render,
    asChild,
    children,
    "data-slot": dataSlot = "drag-drop-drop-target",
    ...restProps
  }, ref) {
    const { registerTarget, state } = useDragDropContext();
    const [element, setElement] = useState<HTMLElement | null>(null);
    const targeted = state.activeValue !== null && state.overValue === value;

    useEffect(() => {
      if (!element) return;
      return registerTarget({ value, label, mode, disabled, element });
    }, [disabled, element, label, mode, registerTarget, value]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composeRefs(setElement, ref),
      "data-slot": dataSlot,
      "data-value": value,
      ...(targeted && { "data-drop-target": "", "data-drop-position": state.position }),
      ...(disabled && { "data-disabled": "" }),
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
