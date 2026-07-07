import { forwardRef } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";

type SelectArrowNativeProps = NativeSpanProps<"children">;

export interface SelectArrowProps extends SelectArrowNativeProps {
  className?: string;
  "data-slot"?: string;
}

export const SelectArrow = forwardRef<HTMLSpanElement, SelectArrowProps>(
  function SelectArrow({ className, "data-slot": dataSlot = "select-arrow", ...restProps }, ref) {
    return (
      <span
        {...restProps}
        ref={ref}
        aria-hidden="true"
        data-slot={dataSlot}
        className={className}
      />
    );
  },
);
