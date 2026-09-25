"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeRefs, cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useComboboxContext } from "./context.js";

export interface ComboboxControlProps extends NativeDivProps<"children"> {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const ComboboxControl = forwardRef<HTMLDivElement, ComboboxControlProps>(
  function ComboboxControl(
    { children, asChild, render, "data-slot": dataSlot = "combobox-control", ...props },
    ref,
  ) {
    const ctx = useComboboxContext();
    const composedRef = useMemo(
      () => composeRefs(ctx.controlRef, ref),
      [ctx.controlRef, ref],
    );

    const native = {
      ...props, ref: composedRef, "data-slot": dataSlot,
      "data-state": ctx.isOpen ? "open" : "closed",
      "data-disabled": ctx.disabled ? "" : undefined,
      "data-readonly": ctx.readOnly ? "" : undefined,
      "data-required": ctx.required ? "" : undefined,
      "data-invalid": ctx.invalid ? "" : undefined,
    };
    return asChild ? cloneAndMerge(children, native) : renderElement(render, "div", { ...native, children });
  },
);
