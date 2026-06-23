"use client";

import { useCallback, useId, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { MenuRadioGroupContextProvider } from "./context.js";

type MenuRadioGroupNativeProps = NativeDivProps<"children" | "role">;

export interface MenuRadioGroupProps extends MenuRadioGroupNativeProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}

export function MenuRadioGroup({
  value,
  onValueChange,
  className,
  children,
  ...restProps
}: MenuRadioGroupProps) {
  const groupId = useId();
  const handleValueChange = useCallback(
    (newValue: string) => onValueChange?.(newValue),
    [onValueChange],
  );

  return (
    <MenuRadioGroupContextProvider
      value={{ groupId, value, onValueChange: handleValueChange }}
    >
      <div
        {...restProps}
        role="group"
        data-slot="menu-radio-group"
        className={className}
      >
        {children}
      </div>
    </MenuRadioGroupContextProvider>
  );
}
