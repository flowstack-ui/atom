"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useClipboardContext, type ClipboardStatusValue } from "./context.js";

type ClipboardIndicatorNativeProps = NativeSpanProps<"children">;

export interface ClipboardIndicatorProps extends ClipboardIndicatorNativeProps {
  when: ClipboardStatusValue;
  children: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ClipboardIndicator = forwardRef<HTMLSpanElement, ClipboardIndicatorProps>(
  function ClipboardIndicator(
    { when, children, render, asChild, "data-slot": dataSlot = "clipboard-indicator", ...restProps },
    ref,
  ) {
    const { status, disabled } = useClipboardContext();
    if (status !== when) return null;
    const props = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-state": status,
      ...(disabled && { "data-disabled": "" }),
    };
    return asChild
      ? cloneAndMerge(children, props)
      : renderElement(render, "span", { ...props, children });
  },
);
