"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { useSelectItemContext } from "./context.js";

type SelectItemIndicatorNativeProps = NativeSpanProps<"children">;

export interface SelectItemIndicatorProps extends SelectItemIndicatorNativeProps {
  children?: ReactNode;
  forceMount?: boolean;
  className?: string;
}

export const SelectItemIndicator = forwardRef<HTMLSpanElement, SelectItemIndicatorProps>(
  function SelectItemIndicator(
    {
      children,
      forceMount = false,
      className,
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
        data-slot="select-item-indicator"
        data-state={ctx.selected ? "checked" : "unchecked"}
        className={className}
      >
        {children}
      </span>
    );
  },
);
