"use client";

import { forwardRef, useEffect, useId, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { useMultiSelectGroupContext } from "./context.js";

type MultiSelectLabelNativeProps = NativeDivProps<"children">;

export interface MultiSelectLabelProps extends MultiSelectLabelNativeProps {
  children: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const MultiSelectLabel = forwardRef<HTMLDivElement, MultiSelectLabelProps>(
  function MultiSelectLabel({ children, className, id, "data-slot": dataSlot = "multi-select-label", ...restProps }, ref) {
    const generatedId = useId();
    const labelId = id ?? generatedId;
    const groupCtx = useMultiSelectGroupContext();

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
