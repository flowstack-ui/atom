"use client";

import { forwardRef, useEffect, useId, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { useSelectGroupContext } from "./context.js";

type SelectLabelNativeProps = NativeDivProps<"children">;

export interface SelectLabelProps extends SelectLabelNativeProps {
  children: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(
  function SelectLabel({ children, className, id, "data-slot": dataSlot = "select-label", ...restProps }, ref) {
    const generatedId = useId();
    const labelId = id ?? generatedId;
    const groupCtx = useSelectGroupContext();

    useEffect(() => {
      groupCtx?.setLabelId(labelId);
      return () => groupCtx?.setLabelId(undefined);
    }, [groupCtx, labelId]);

    return (
      <div
        {...restProps}
        ref={ref}
        id={labelId}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </div>
    );
  },
);
