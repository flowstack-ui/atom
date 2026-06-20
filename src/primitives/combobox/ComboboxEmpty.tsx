"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { useComboboxContext } from "./context.js";

type ComboboxEmptyNativeProps = NativeDivProps<"children">;

export interface ComboboxEmptyProps extends ComboboxEmptyNativeProps {
  children?: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const ComboboxEmpty = forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  function ComboboxEmpty(
    { children, className, "data-slot": dataSlot = "combobox-empty", ...restProps },
    ref,
  ) {
    const ctx = useComboboxContext();
    if (ctx.loading || ctx.filteredOptions.length > 0) return null;

    return (
      <div {...restProps} ref={ref} data-slot={dataSlot} className={className}>
        {children ?? ctx.noOptionsText}
      </div>
    );
  },
);
