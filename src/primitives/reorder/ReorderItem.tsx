"use client";

import { forwardRef, useMemo, useRef, type ReactNode } from "react";
import type { NativeListItemProps } from "../../utils/dom.js";
import { composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { DragDropDraggable, DragDropDropTarget } from "../drag-drop/index.js";
import { ReorderItemContextProvider, useReorderContext } from "./context.js";
import { useReorderGeometry } from "./useReorderGeometry.js";

type NativeProps = NativeListItemProps<"children">;

export interface ReorderItemProps extends NativeProps {
  value: string;
  disabled?: boolean;
  render?: RenderProp;
  children?: ReactNode;
  "data-slot"?: string;
}

export const ReorderItem = forwardRef<HTMLLIElement, ReorderItemProps>(
  function ReorderItem({
    value,
    disabled = false,
    render,
    children,
    "data-slot": dataSlot = "reorder-item",
    ...restProps
  }, ref) {
    const { getItemLabel } = useReorderContext();
    const elementRef = useRef<HTMLLIElement | null>(null);
    const mergedRef = useMemo(() => composeRefs(elementRef, ref), [ref]);
    useReorderGeometry(value, elementRef);
    const element = renderElement(render, "li", {
      ...restProps,
      ref: mergedRef,
      "data-slot": dataSlot,
      "data-value": value,
      ...(disabled && { "data-disabled": "" }),
      children,
    });
    return (
      <ReorderItemContextProvider value={{ value, disabled }}>
        <DragDropDropTarget
          asChild
          data-slot={dataSlot}
          label={getItemLabel(value)}
          mode="before-after"
          value={value}
        >
          <DragDropDraggable
            asChild
            data-slot={dataSlot}
            disabled={disabled}
            label={getItemLabel(value)}
            value={value}
          >
            {element}
          </DragDropDraggable>
        </DragDropDropTarget>
      </ReorderItemContextProvider>
    );
  },
);
