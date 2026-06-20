"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { useSelectContext } from "./context.js";

type SelectValueNativeProps = NativeSpanProps<"children">;

export interface SelectValueProps extends SelectValueNativeProps {
  placeholder?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  function SelectValue({ placeholder, children, className, ...restProps }, ref) {
    const ctx = useSelectContext();
    const selectedLabel = ctx.value ? ctx.getLabel(ctx.value) ?? ctx.value : undefined;

    return (
      <span
        {...restProps}
        ref={ref}
        data-slot="select-value"
        data-placeholder={!selectedLabel ? "" : undefined}
        className={className}
      >
        {children ?? selectedLabel ?? placeholder}
      </span>
    );
  },
);
