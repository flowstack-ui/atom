import { forwardRef, type ReactNode } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";

type SelectIconNativeProps = NativeSpanProps<"children">;

export interface SelectIconProps extends SelectIconNativeProps {
  children?: ReactNode;
  className?: string;
}

export const SelectIcon = forwardRef<HTMLSpanElement, SelectIconProps>(
  function SelectIcon({ children, className, ...restProps }, ref) {
    return (
      <span
        {...restProps}
        ref={ref}
        aria-hidden="true"
        data-slot="select-icon"
        className={className}
      >
        {children}
      </span>
    );
  },
);
