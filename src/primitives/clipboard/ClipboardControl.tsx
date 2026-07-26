"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useClipboardContext } from "./context.js";

type ClipboardControlNativeProps = NativeDivProps<"children">;

export interface ClipboardControlProps extends ClipboardControlNativeProps {
  children: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ClipboardControl = forwardRef<HTMLDivElement, ClipboardControlProps>(
  function ClipboardControl(
    { children, render, asChild, "data-slot": dataSlot = "clipboard-control", ...restProps },
    ref,
  ) {
    const { status, disabled } = useClipboardContext();
    const props = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-state": status,
      ...(disabled && { "data-disabled": "" }),
    };
    return asChild
      ? cloneAndMerge(children, props)
      : renderElement(render, "div", { ...props, children });
  },
);
