"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { useMultiSelectItemContext } from "./context.js";

type MultiSelectItemIndicatorNativeProps = NativeSpanProps<"children">;

export interface MultiSelectItemIndicatorProps extends MultiSelectItemIndicatorNativeProps {
  children?: ReactNode;
  forceMount?: boolean;
  className?: string;
  "data-slot"?: string;
}

export const MultiSelectItemIndicator = forwardRef<HTMLSpanElement, MultiSelectItemIndicatorProps>(
  function MultiSelectItemIndicator(
    {
      children,
      forceMount = false,
      className,
      "data-slot": dataSlot = "multi-select-item-indicator",
      ...restProps
    },
    ref,
  ) {
    const ctx = useMultiSelectItemContext();

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
