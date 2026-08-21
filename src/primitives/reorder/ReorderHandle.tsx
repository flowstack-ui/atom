"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { DragDropHandle } from "../drag-drop/index.js";
import { useReorderItemContext } from "./context.js";
import type { RenderProp } from "../../utils/slot.js";

type NativeProps = NativeButtonProps<"children">;

export interface ReorderHandleProps extends NativeProps {
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export const ReorderHandle = forwardRef<HTMLElement, ReorderHandleProps>(
  function ReorderHandle({ "data-slot": dataSlot = "reorder-handle", ...props }, ref) {
    useReorderItemContext();
    return <DragDropHandle {...props} data-slot={dataSlot} ref={ref} />;
  },
);
