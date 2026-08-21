"use client";

import { forwardRef, type MouseEvent, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useReorderContext, useReorderItemContext, type ReorderMove } from "./context.js";

type NativeProps = NativeButtonProps<"children" | "disabled" | "onClick">;

export interface ReorderMoveProps extends NativeProps {
  move: ReorderMove;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export const ReorderMoveControl = forwardRef<HTMLElement, ReorderMoveProps>(
  function ReorderMoveControl({
    move,
    render,
    asChild,
    children,
    disabled: consumerDisabled = false,
    onClick,
    "data-slot": dataSlot = `reorder-move-${move}`,
    ...restProps
  }, ref) {
    const root = useReorderContext();
    const item = useReorderItemContext();
    const index = root.items.indexOf(item.value);
    const boundary = move === "before" || move === "start" ? index <= 0 : index >= root.items.length - 1;
    const unavailable = consumerDisabled || root.disabled || root.readOnly || item.disabled || boundary;
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      disabled: unavailable || undefined,
      "data-slot": dataSlot,
      "data-move": move,
      onClick: (event: MouseEvent<HTMLElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented && !unavailable) root.move(item.value, move);
      },
    };
    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "button", { ...behaviorProps, children });
  },
);

export type ReorderNamedMoveProps = Omit<ReorderMoveProps, "move">;

export const ReorderMoveBefore = forwardRef<HTMLElement, ReorderNamedMoveProps>(
  (props, ref) => <ReorderMoveControl {...props} move="before" ref={ref} />,
);
ReorderMoveBefore.displayName = "ReorderMoveBefore";

export const ReorderMoveAfter = forwardRef<HTMLElement, ReorderNamedMoveProps>(
  (props, ref) => <ReorderMoveControl {...props} move="after" ref={ref} />,
);
ReorderMoveAfter.displayName = "ReorderMoveAfter";

export const ReorderMoveToStart = forwardRef<HTMLElement, ReorderNamedMoveProps>(
  (props, ref) => <ReorderMoveControl {...props} move="start" ref={ref} />,
);
ReorderMoveToStart.displayName = "ReorderMoveToStart";

export const ReorderMoveToEnd = forwardRef<HTMLElement, ReorderNamedMoveProps>(
  (props, ref) => <ReorderMoveControl {...props} move="end" ref={ref} />,
);
ReorderMoveToEnd.displayName = "ReorderMoveToEnd";
