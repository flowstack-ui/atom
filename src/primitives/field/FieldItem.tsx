"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { FieldContextProvider, useRequiredFieldContext } from "./context.js";

export interface FieldItemProps extends NativeDivProps<"children"> {
  value: string;
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

/** A separately identified control within one compound field. */
export const FieldItem = forwardRef<HTMLDivElement, FieldItemProps>(function FieldItem(
  { value, children, asChild, render, "data-slot": slot = "field-item", ...props }, ref,
) {
  const context = useRequiredFieldContext();
  const itemContext = useMemo(() => ({
    ...context,
    controlId: `${context.controlId}-item-${encodeURIComponent(value)}`,
    targetId: `${context.controlId}-item-${encodeURIComponent(value)}`,
  }), [context, value]);
  const elementProps = { ...props, ref, "data-slot": slot, "data-value": value };
  return <FieldContextProvider value={itemContext}>{asChild
    ? cloneAndMerge(children, elementProps)
    : renderElement(render, "div", { ...elementProps, children })}</FieldContextProvider>;
});
