"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useMultiSelectContext } from "./context.js";

type MultiSelectViewportNativeProps = NativeDivProps<"children">;

export interface MultiSelectViewportProps extends MultiSelectViewportNativeProps {
  children: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const MultiSelectViewport = forwardRef<HTMLDivElement, MultiSelectViewportProps>(
  function MultiSelectViewport({ children, className, "data-slot": dataSlot = "multi-select-viewport", ...restProps }, ref) {
    const ctx = useMultiSelectContext();
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
