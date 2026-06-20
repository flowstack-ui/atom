"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { useComboboxContext } from "./context.js";

type ComboboxLoadingNativeProps = NativeDivProps<"children">;

export interface ComboboxLoadingProps extends ComboboxLoadingNativeProps {
  children?: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const ComboboxLoading = forwardRef<HTMLDivElement, ComboboxLoadingProps>(
  function ComboboxLoading(
    { children, className, "data-slot": dataSlot = "combobox-loading", ...restProps },
    ref,
  ) {
    const ctx = useComboboxContext();
    if (!ctx.loading) return null;

    return (
      <div {...restProps} ref={ref} data-slot={dataSlot} className={className}>
        {children ?? ctx.loadingText}
      </div>
    );
  },
);
