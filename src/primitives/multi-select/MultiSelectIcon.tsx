import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";

type MultiSelectIconNativeProps = NativeSpanProps<"children">;

export interface MultiSelectIconProps extends MultiSelectIconNativeProps {
  children?: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const MultiSelectIcon = forwardRef<HTMLSpanElement, MultiSelectIconProps>(
  function MultiSelectIcon({ children, className, "data-slot": dataSlot = "multi-select-icon", ...restProps }, ref) {
    return (
      <span
        {...restProps}
        ref={ref}
        aria-hidden="true"
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </span>
    );
  },
);
