"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { useSelectItemContext } from "./context.js";

type SelectItemIndicatorNativeProps = NativeSpanProps<"children">;

export interface SelectItemIndicatorProps extends SelectItemIndicatorNativeProps {
  children?: ReactNode;
  forceMount?: boolean;
  className?: string;
  "data-slot"?: string;
}

export const SelectItemIndicator = forwardRef<HTMLSpanElement, SelectItemIndicatorProps>(
  function SelectItemIndicator(
    {
      children,
      forceMount = false,
      className,
      "data-slot": dataSlot = "select-item-indicator",
      ...restProps
    },
    ref,
  ) {
    const ctx = useSelectItemContext();

    if (!forceMount && !ctx.selected) return null;

    return (
      <span
        {...restProps}
        ref={ref}
        aria-hidden="true"
        data-slot={dataSlot}
        data-state={ctx.selected ? "checked" : "unchecked"}
        className={className}
      >
        {children}
      </span>
    );
  },
);
