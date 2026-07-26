"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { useMultiSelectContext } from "./context.js";

type MultiSelectValueNativeProps = NativeSpanProps<"children">;

export interface MultiSelectValueProps extends MultiSelectValueNativeProps {
  placeholder?: ReactNode;
  children?: ReactNode;
  renderValue?: (value: string[], labels: string[]) => ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const MultiSelectValue = forwardRef<HTMLSpanElement, MultiSelectValueProps>(
  function MultiSelectValue({ placeholder, children, renderValue, className, "data-slot": dataSlot = "multi-select-value", ...restProps }, ref) {
    const ctx = useMultiSelectContext();
    const labels = ctx.value.map((value) => ctx.getLabel(value) ?? value);
    const selectedLabel = labels.length === 0
      ? undefined
      : labels.length === 1
        ? labels[0]
        : `${labels[0]} (+${labels.length - 1} more)`;

    return (
      <span
        {...restProps}
        ref={ref}
        data-slot={dataSlot}
        data-placeholder={!selectedLabel ? "" : undefined}
        className={className}
      >
        {children ?? renderValue?.(ctx.value, labels) ?? selectedLabel ?? placeholder}
      </span>
    );
  },
);
