"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useSelectContext } from "./context.js";

type SelectViewportNativeProps = NativeDivProps<"children">;

export interface SelectViewportProps extends SelectViewportNativeProps {
  children: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const SelectViewport = forwardRef<HTMLDivElement, SelectViewportProps>(
  function SelectViewport({ children, className, "data-slot": dataSlot = "select-viewport", ...restProps }, ref) {
    const ctx = useSelectContext();
    const composedRef = useMemo(() => composeRefs(ctx.viewportRef, ref), [ctx.viewportRef, ref]);

    return (
      <div
        {...restProps}
        ref={composedRef}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </div>
    );
  },
);
