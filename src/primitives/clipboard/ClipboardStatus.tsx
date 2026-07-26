"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useClipboardContext } from "./context.js";

type ClipboardStatusNativeProps = NativeSpanProps<"children" | "role">;

export interface ClipboardStatusProps extends ClipboardStatusNativeProps {
  children: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ClipboardStatus = forwardRef<HTMLSpanElement, ClipboardStatusProps>(
  function ClipboardStatus(
    { children, render, asChild, "data-slot": dataSlot = "clipboard-status", ...restProps },
    ref,
  ) {
    const { status, disabled } = useClipboardContext();
    const props = {
      ...restProps,
      ref,
      role: "status",
      "aria-live": "polite" as const,
      "aria-atomic": true,
      "data-slot": dataSlot,
      "data-state": status,
      ...(disabled && { "data-disabled": "" }),
    };
    return asChild
      ? cloneAndMerge(children, props)
      : renderElement(render, "span", { ...props, children });
  },
);
