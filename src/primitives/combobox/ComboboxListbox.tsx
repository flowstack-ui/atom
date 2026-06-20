"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { useComboboxContext } from "./context.js";

type ComboboxListboxNativeProps = NativeDivProps<"children" | "role">;

export interface ComboboxListboxProps extends ComboboxListboxNativeProps {
  children?: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const ComboboxListbox = forwardRef<HTMLDivElement, ComboboxListboxProps>(
  function ComboboxListbox(
    {
      children,
      className,
      "data-slot": dataSlot = "combobox-listbox",
      ...restProps
    },
    ref,
  ) {
    const ctx = useComboboxContext();

    return (
      <div
        {...restProps}
        ref={ref}
        id={ctx.listboxId}
        role="listbox"
        tabIndex={-1}
        data-slot={dataSlot}
        data-state={ctx.isOpen ? "open" : "closed"}
        className={className}
      >
        {children}
      </div>
    );
  },
);
