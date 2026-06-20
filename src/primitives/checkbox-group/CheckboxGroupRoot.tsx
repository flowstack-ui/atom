"use client";

import { forwardRef, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  CheckboxGroupContextProvider,
  type CheckboxGroupContextValue,
} from "./context.js";

type CheckboxGroupRootNativeProps = NativeDivProps<
  "children" | "defaultValue" | "form" | "name" | "onChange" | "role"
>;

export interface CheckboxGroupRootProps extends CheckboxGroupRootNativeProps {
  /** Controlled selected values. */
  value?: string[];
  /** Uncontrolled initial selected values. */
  defaultValue?: string[];
  /** Fires when selection changes. */
  onValueChange?: (values: string[]) => void;
  /** Form field name shared across checkboxes. */
  name?: string;
  /** Associates item hidden inputs with a form by ID. */
  form?: string;
  /** Disables all checkbox items. */
  disabled?: boolean;
  /** Required for form submission. */
  required?: boolean;
  /** Read-only mode. */
  readOnly?: boolean;
  /** Invalid state. */
  invalid?: boolean;
  /** Layout orientation. */
  orientation?: "horizontal" | "vertical";
  /** Accessible label for the group. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Checkbox items. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const CheckboxGroupRoot = forwardRef<HTMLDivElement, CheckboxGroupRootProps>(
  function CheckboxGroupRoot(
    {
      value,
      defaultValue = [],
      onValueChange,
      name,
      form,
      disabled = false,
      required = false,
      readOnly = false,
      invalid = false,
      orientation = "vertical",
      ariaLabel,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "checkbox-group",
      ...restProps
    },
    ref,
  ) {
    const [activeValues, setActiveValues] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const itemValuesRef = useRef<Set<string>>(new Set());
    const [allItemValues, setAllItemValues] = useState<string[]>([]);

    const registerItem = useCallback((value: string) => {
      itemValuesRef.current.add(value);
      setAllItemValues(Array.from(itemValuesRef.current));
    }, []);

    const unregisterItem = useCallback((value: string) => {
      itemValuesRef.current.delete(value);
      setAllItemValues(Array.from(itemValuesRef.current));
    }, []);

    const toggleItem = useCallback(
      (value: string) => {
        if (disabled || readOnly) return;

        setActiveValues((currentValues) =>
          currentValues.includes(value)
            ? currentValues.filter((itemValue) => itemValue !== value)
            : [...currentValues, value],
        );
      },
      [disabled, readOnly, setActiveValues],
    );

    const toggleAll = useCallback(
      (checked: boolean) => {
        if (disabled || readOnly) return;

        setActiveValues(checked ? Array.from(itemValuesRef.current) : []);
      },
      [disabled, readOnly, setActiveValues],
    );

    const isItemChecked = useCallback(
      (value: string) => activeValues.includes(value),
      [activeValues],
    );

    const contextValue: CheckboxGroupContextValue = useMemo(
      () => ({
        groupValues: activeValues,
        allItemValues,
        toggleItem,
        toggleAll,
        isItemChecked,
        registerItem,
        unregisterItem,
        name,
        form,
        disabled,
        required,
        readOnly,
        invalid,
        orientation,
      }),
      [
        activeValues,
        allItemValues,
        disabled,
        form,
        invalid,
        isItemChecked,
        name,
        orientation,
        readOnly,
        registerItem,
        required,
        toggleAll,
        toggleItem,
        unregisterItem,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "group",
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      "aria-required": required || undefined,
      "aria-invalid": invalid || undefined,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      ...(disabled && { "data-disabled": "" }),
      ...(readOnly && { "aria-readonly": true, "data-readonly": "" }),
      ...(invalid && { "data-invalid": "" }),
      className,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <CheckboxGroupContextProvider value={contextValue}>
        {element}
      </CheckboxGroupContextProvider>
    );
  },
);
