"use client";

import { forwardRef, useId, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { ComboboxGroupContextProvider } from "./context.js";

type ComboboxGroupNativeProps = NativeDivProps<"children" | "role">;

export interface ComboboxGroupProps extends ComboboxGroupNativeProps {
  children?: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const ComboboxGroup = forwardRef<HTMLDivElement, ComboboxGroupProps>(
  function ComboboxGroup(
    {
      children,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "data-slot": dataSlot = "combobox-group",
      ...restProps
    },
    ref,
  ) {
    const generatedId = useId();
    const labelId = `${generatedId}-label`;
    const contextValue = useMemo(() => ({ labelId }), [labelId]);

    return (
      <ComboboxGroupContextProvider value={contextValue}>
        <div
          {...restProps}
          ref={ref}
          role="group"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : labelId)}
          data-slot={dataSlot}
          className={className}
        >
          {children}
        </div>
      </ComboboxGroupContextProvider>
    );
  },
);
