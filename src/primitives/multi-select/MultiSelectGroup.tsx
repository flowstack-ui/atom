"use client";

import {
  forwardRef,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  MultiSelectGroupContextProvider,
  type MultiSelectGroupContextValue,
} from "./context.js";

type MultiSelectGroupNativeProps = NativeDivProps<"children" | "role">;

export interface MultiSelectGroupProps extends MultiSelectGroupNativeProps {
  children: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const MultiSelectGroup = forwardRef<HTMLDivElement, MultiSelectGroupProps>(
  function MultiSelectGroup({ children, className, "data-slot": dataSlot = "multi-select-group", ...restProps }, ref) {
    const [labelId, setLabelId] = useState<string | undefined>(undefined);
    const groupContext = useMemo<MultiSelectGroupContextValue>(
      () => ({
        labelId,
        setLabelId,
      }),
      [labelId],
    );

    return (
      <MultiSelectGroupContextProvider value={groupContext}>
        <div
          {...restProps}
          ref={ref}
          role="group"
          aria-labelledby={labelId}
          data-slot={dataSlot}
          className={className}
        >
          {children}
        </div>
      </MultiSelectGroupContextProvider>
    );
  },
);
