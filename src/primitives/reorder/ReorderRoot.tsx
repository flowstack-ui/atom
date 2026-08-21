"use client";

import { forwardRef, useCallback, useMemo, type ReactNode } from "react";
import type { NativeOrderedListProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  DragDropRoot,
  type DragDropDetails,
  type DragDropMessages,
  type DragDropOrientation,
} from "../drag-drop/index.js";
import {
  ReorderContextProvider,
  type ReorderChangeDetails,
  type ReorderMove,
} from "./context.js";
import { reorderItems } from "./utils.js";

type NativeProps = NativeOrderedListProps<"children">;

export interface ReorderRootProps extends NativeProps {
  items: string[];
  onItemsChange: (items: string[], details: ReorderChangeDetails) => void;
  getItemLabel: (value: string) => string;
  orientation?: DragDropOrientation;
  disabled?: boolean;
  readOnly?: boolean;
  instructions?: string;
  messages?: DragDropMessages;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

const defaultInstructions = "Press Space or Enter to pick up an item. Use the arrow keys, Home, or End to choose a position. Press Space or Enter to drop, or Escape to cancel.";

export const ReorderRoot = forwardRef<HTMLOListElement, ReorderRootProps>(
  function ReorderRoot({
    items,
    onItemsChange,
    getItemLabel,
    orientation = "vertical",
    disabled = false,
    readOnly = false,
    instructions = defaultInstructions,
    messages,
    render,
    asChild,
    children,
    "data-slot": dataSlot = "reorder",
    ...restProps
  }, ref) {
    const apply = useCallback((details: DragDropDetails, input: ReorderChangeDetails["input"]) => {
      const result = reorderItems(items, details.activeValue, details.overValue, details.position);
      if (result.previousIndex === result.nextIndex || result.previousIndex < 0) return;
      onItemsChange(result.items, {
        ...details,
        input,
        previousIndex: result.previousIndex,
        nextIndex: result.nextIndex,
      });
    }, [items, onItemsChange]);

    const move = useCallback((value: string, moveKind: ReorderMove) => {
      if (disabled || readOnly) return;
      const index = items.indexOf(value);
      if (index < 0) return;
      let overValue = value;
      let position: "after" | "before" = "before";
      if (moveKind === "before" && index > 0) {
        overValue = items[index - 1] ?? value;
        position = "before";
      } else if (moveKind === "after" && index < items.length - 1) {
        overValue = items[index + 1] ?? value;
        position = "after";
      } else if (moveKind === "start" && index > 0) {
        overValue = items[0] ?? value;
        position = "before";
      } else if (moveKind === "end" && index < items.length - 1) {
        overValue = items[items.length - 1] ?? value;
        position = "after";
      } else {
        return;
      }
      apply({ activeValue: value, input: "keyboard", overValue, position }, "control");
    }, [apply, disabled, items, readOnly]);

    const contextValue = useMemo(() => ({
      items,
      disabled,
      readOnly,
      getItemLabel,
      move,
    }), [disabled, getItemLabel, items, move, readOnly]);

    const rootProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      ...(disabled && { "data-disabled": "" }),
      ...(readOnly && { "data-readonly": "" }),
      children,
    };
    const list = asChild
      ? cloneAndMerge(children, { ...rootProps, children: undefined })
      : renderElement(render, "ol", rootProps);

    return (
      <DragDropRoot
        disabled={disabled}
        instructions={instructions}
        messages={messages}
        onDragEnd={(details) => apply(details, details.input)}
        orientation={orientation}
        readOnly={readOnly}
      >
        <ReorderContextProvider value={contextValue}>{list}</ReorderContextProvider>
      </DragDropRoot>
    );
  },
);
