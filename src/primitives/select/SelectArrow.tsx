import { forwardRef } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";

type SelectArrowNativeProps = NativeSpanProps<"children">;

export interface SelectArrowProps extends SelectArrowNativeProps {
  className?: string;
}

export const SelectArrow = forwardRef<HTMLSpanElement, SelectArrowProps>(
  function SelectArrow({ className, ...restProps }, ref) {
    return (
      <span
        {...restProps}
        ref={ref}
        aria-hidden="true"
        data-slot="select-arrow"
        className={className}
      />
    );
  },
);
