import { forwardRef } from "react";
import type { NativeDivProps } from "../../utils/dom.js";

type MultiSelectSeparatorNativeProps = NativeDivProps<"children" | "role">;

export interface MultiSelectSeparatorProps extends MultiSelectSeparatorNativeProps {
  className?: string;
  "data-slot"?: string;
}

export const MultiSelectSeparator = forwardRef<HTMLDivElement, MultiSelectSeparatorProps>(
  function MultiSelectSeparator({ className, "data-slot": dataSlot = "multi-select-separator", ...restProps }, ref) {
    return (
      <div
        {...restProps}
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        data-slot={dataSlot}
        className={className}
      />
    );
  },
);
