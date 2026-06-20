import { forwardRef } from "react";
import type { NativeDivProps } from "../../utils/dom.js";

type SelectSeparatorNativeProps = NativeDivProps<"children" | "role">;

export interface SelectSeparatorProps extends SelectSeparatorNativeProps {
  className?: string;
}

export const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  function SelectSeparator({ className, ...restProps }, ref) {
    return (
      <div
        {...restProps}
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        data-slot="select-separator"
        className={className}
      />
    );
  },
);
