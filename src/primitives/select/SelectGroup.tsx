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
}

export const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(
  function SelectGroup({ children, className, ...restProps }, ref) {
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
          data-slot="select-group"
          className={className}
        >
          {children}
        </div>
      </SelectGroupContextProvider>
    );
  },
);
