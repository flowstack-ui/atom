"use client";

import { forwardRef, useCallback, useMemo, type ReactNode } from "react";
import { useToolbarContext } from "./context.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  ToolbarToggleContextProvider,
  type ToolbarToggleContextValue,
} from "./toggleContext.js";

type ToolbarToggleGroupNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange" | "role">;

interface ToolbarToggleGroupBaseProps extends ToolbarToggleGroupNativeProps {
  /** Disables all toggle items. */
  disabled?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Toggle items. */
  children?: ReactNode;
  /** Accessible label for the group. */
  ariaLabel?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export type ToolbarToggleGroupProps = ToolbarToggleGroupBaseProps & (
  | { type?: "single"; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
  | { type: "multiple"; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
);

function normalizeValue(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export const ToolbarToggleGroup = forwardRef<HTMLDivElement, ToolbarToggleGroupProps>(function ToolbarToggleGroup({
  type = "single",
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled: ownDisabled = false,
  render,
  asChild,
  className,
  children,
  ariaLabel,
  "data-slot": dataSlot = "toolbar-toggle-group",
  ...restProps
}: ToolbarToggleGroupProps, ref) {
  const toolbar = useToolbarContext();
  const disabled = ownDisabled || toolbar.disabled;
  const [value, setValue] = useControllableState<string[]>({
    value: controlledValue === undefined ? undefined : normalizeValue(controlledValue),
    defaultValue: normalizeValue(defaultValue),
    onChange: (nextValue) => {
      if (type === "single") (onValueChange as ((value: string) => void) | undefined)?.(nextValue[0] ?? "");
      else (onValueChange as ((value: string[]) => void) | undefined)?.(nextValue);
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

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref,
    role: "group",
    ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
    "data-slot": dataSlot,
    ...(disabled ? { "data-disabled": "" } : {}),
    className,
  };

  const element = asChild
    ? cloneAndMerge(children, behaviorProps)
    : renderElement(render, "div", { ...behaviorProps, children });

  return (
    <ToolbarToggleContextProvider value={contextValue}>
      {element}
    </ToolbarToggleContextProvider>
  );
});
