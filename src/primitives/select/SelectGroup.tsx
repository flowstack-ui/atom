"use client";

import {
  forwardRef,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  SelectGroupContextProvider,
  type SelectGroupContextValue,
} from "./context.js";

type SelectGroupNativeProps = NativeDivProps<"children" | "role">;

export interface SelectGroupProps extends SelectGroupNativeProps {
  children: ReactNode;
  className?: string;
  "data-slot"?: string;
}

export const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(
  function SelectGroup({ children, className, "data-slot": dataSlot = "select-group", ...restProps }, ref) {
    const [labelId, setLabelId] = useState<string | undefined>(undefined);
    const groupContext = useMemo<SelectGroupContextValue>(
      () => ({
        labelId,
        setLabelId,
      }),
      [labelId],
    );

    return (
      <SelectGroupContextProvider value={groupContext}>
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
      </SelectGroupContextProvider>
    );
  },
);
