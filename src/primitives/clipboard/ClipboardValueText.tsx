"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useClipboardContext } from "./context.js";

type ClipboardValueTextNativeProps = NativeSpanProps<"children">;

export interface ClipboardValueTextProps extends ClipboardValueTextNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ClipboardValueText = forwardRef<HTMLSpanElement, ClipboardValueTextProps>(
  function ClipboardValueText(
    { children, render, asChild, "data-slot": dataSlot = "clipboard-value-text", ...restProps },
    ref,
  ) {
    const { value, status, disabled } = useClipboardContext();
    const content = children ?? value;
    const props = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-state": status,
      ...(disabled && { "data-disabled": "" }),
    };
    return asChild
      ? cloneAndMerge(children, props)
      : renderElement(render, "span", { ...props, children: content });
  },
);
