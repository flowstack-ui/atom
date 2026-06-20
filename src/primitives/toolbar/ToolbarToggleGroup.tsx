"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  ToolbarToggleContextProvider,
  type ToolbarToggleContextValue,
  type ToolbarToggleType,
} from "./toggleContext.js";

type ToolbarToggleGroupNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange" | "role">;

export interface ToolbarToggleGroupProps extends ToolbarToggleGroupNativeProps {
  /** Selection mode. */
  type?: ToolbarToggleType;
  /** Controlled selected values. */
  value?: string | string[];
  /** Uncontrolled initial selected values. */
  defaultValue?: string | string[];
  /** Fires when selection changes. */
  onValueChange?: (value: string | string[]) => void;
  /** Disables all toggle items. */
  disabled?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Toggle items. */
  children?: ReactNode;
  /** Accessible label for the group. */
  ariaLabel?: string;
}

function normalizeValue(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function ToolbarToggleGroup({
  type = "single",
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  children,
  ariaLabel,
  ...restProps
}: ToolbarToggleGroupProps) {
  const [value, setValue] = useControllableState<string[]>({
    value: controlledValue === undefined ? undefined : normalizeValue(controlledValue),
    defaultValue: normalizeValue(defaultValue),
    onChange: (nextValue) => {
      onValueChange?.(type === "single" ? nextValue[0] ?? "" : nextValue);
    },
  });

  const onItemPress = useCallback(
    (itemValue: string) => {
      if (type === "single") {
        setValue(value[0] === itemValue ? [] : [itemValue]);
      } else {
        setValue(
          value.includes(itemValue)
            ? value.filter((currentValue) => currentValue !== itemValue)
            : [...value, itemValue],
        );
      }
    },
    [setValue, type, value],
  );

  const contextValue: ToolbarToggleContextValue = useMemo(
    () => ({
      type,
      value,
      onItemPress,
      disabled,
    }),
    [disabled, onItemPress, type, value],
  );

  return (
    <ToolbarToggleContextProvider value={contextValue}>
      <div
        {...restProps}
        role="group"
        aria-label={ariaLabel}
        data-slot="toolbar-toggle-group"
        {...(disabled ? { "data-disabled": "" } : {})}
        className={className}
      >
        {children}
      </div>
    </ToolbarToggleContextProvider>
  );
}
