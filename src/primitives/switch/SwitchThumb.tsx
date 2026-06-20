"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useSwitchContext } from "./context.js";

type SwitchThumbNativeProps = NativeSpanProps<"children">;

export interface SwitchThumbProps extends SwitchThumbNativeProps {
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the thumb. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const SwitchThumb = forwardRef<HTMLSpanElement, SwitchThumbProps>(
  function SwitchThumb(
    {
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "switch-thumb",
      ...restProps
    },
    ref,
  ) {
    const { checked, disabled, invalid, readOnly, required } = useSwitchContext();

    // Native span props pass through before Atom state attributes are applied.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-hidden": true,
      "data-state": checked ? "checked" : "unchecked",
      "data-slot": dataSlot,
      ...(disabled && { "data-disabled": "" }),
      ...(invalid && { "data-invalid": "" }),
      ...(readOnly && { "data-readonly": "" }),
      ...(required && { "data-required": "" }),
      className,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "span", { ...behaviorProps, children });
  },
);
