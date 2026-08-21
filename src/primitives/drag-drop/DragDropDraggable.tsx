"use client";

import {
  forwardRef,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { DragDropItemContextProvider } from "./item-context.js";
import { useDragDropContext } from "./context.js";

type NativeProps = NativeDivProps<"children">;

export interface DragDropDraggableProps extends NativeProps {
  value: string;
  label: string;
  disabled?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export const DragDropDraggable = forwardRef<HTMLElement, DragDropDraggableProps>(
  function DragDropDraggable({
    value,
    label,
    disabled = false,
    render,
    asChild,
    children,
    style,
    "data-slot": dataSlot = "drag-drop-draggable",
    ...restProps
  }, ref) {
    const { registerSource, state } = useDragDropContext();
    const [element, setElement] = useState<HTMLElement | null>(null);
    const active = state.activeValue === value;

    useEffect(() => {
      if (!element) return;
      return registerSource({ value, label, disabled, element });
    }, [disabled, element, label, registerSource, value]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composeRefs(setElement, ref),
      style: {
        ...style,
        "--atom-drag-drop-x": `${active ? state.deltaX : 0}px`,
        "--atom-drag-drop-y": `${active ? state.deltaY : 0}px`,
      } as CSSProperties,
      "data-slot": dataSlot,
      "data-value": value,
      ...(active && { "data-dragging": "" }),
      ...(disabled && { "data-disabled": "" }),
    };

    const elementNode = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <DragDropItemContextProvider value={{ value, label, disabled }}>
        {elementNode}
      </DragDropItemContextProvider>
    );
  },
);
