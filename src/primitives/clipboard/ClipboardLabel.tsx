"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeLabelProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useClipboardContext } from "./context.js";

type ClipboardLabelNativeProps = NativeLabelProps<"children">;

export interface ClipboardLabelProps extends ClipboardLabelNativeProps {
  children: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ClipboardLabel = forwardRef<HTMLLabelElement, ClipboardLabelProps>(
  function ClipboardLabel(
    { children, render, asChild, id, htmlFor, "data-slot": dataSlot = "clipboard-label", ...restProps },
    ref,
  ) {
    const { inputId, labelId, status, disabled } = useClipboardContext();
    const props = {
      ...restProps,
      ref,
      id: id ?? labelId,
      htmlFor: htmlFor ?? inputId,
      "data-slot": dataSlot,
      "data-state": status,
      ...(disabled && { "data-disabled": "" }),
    };
    return asChild
      ? cloneAndMerge(children, props)
      : renderElement(render, "label", { ...props, children });
  },
);
