"use client";

import { forwardRef, useCallback, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  CheckboxGroupContextProvider,
  type CheckboxGroupContextValue,
} from "./context.js";
import { useFieldsetContext } from "../fieldset/context.js";

const validationInputStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

type CheckboxGroupRootNativeProps = NativeDivProps<
  "aria-required" | "children" | "defaultValue" | "form" | "name" | "onChange" | "role"
>;

export interface CheckboxGroupRootProps extends CheckboxGroupRootNativeProps {
  /** Controlled selected values. */
  value?: string[];
  /** Uncontrolled initial selected values. */
  defaultValue?: string[];
  /** Fires when selection changes. */
  onValueChange?: (values: string[]) => void;
  /** Complete selectable value set used by deterministic aggregate controls. */
  allValues?: string[];
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
      allValues,
      name,
      form,
      disabled,
      required,
      readOnly,
      invalid,
      orientation = "vertical",
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "checkbox-group",
      ...restProps
    },
    ref,
  ) {
    const fieldset = useFieldsetContext();
    const isDisabled = disabled ?? fieldset?.disabled ?? false;
    const isRequired = required ?? fieldset?.required ?? false;
    const isInvalid = invalid ?? fieldset?.invalid ?? false;
    const isReadOnly = readOnly ?? false;
    const rootRef = useRef<HTMLDivElement>(null);
    const [activeValues, setActiveValues] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const reset = useCallback(() => setActiveValues(defaultValue), [defaultValue, setActiveValues]);
    useFormReset(rootRef, form, value !== undefined, reset);
    const itemValuesRef = useRef<Set<string>>(new Set());
    const [allItemValues, setAllItemValues] = useState<string[]>([]);
    const normalizedAllValues = useMemo(
      () => allValues === undefined ? undefined : Array.from(new Set(allValues)),
      [allValues],
    );

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
        if (isDisabled || isReadOnly) return;

        setActiveValues((currentValues) =>
          currentValues.includes(value)
            ? currentValues.filter((itemValue) => itemValue !== value)
            : [...currentValues, value],
        );
      },
      [isDisabled, isReadOnly, setActiveValues],
    );

    const toggleAll = useCallback(
      (checked: boolean) => {
        if (isDisabled || isReadOnly) return;

        const targetValues = normalizedAllValues ?? Array.from(itemValuesRef.current);
        const targetSet = new Set(targetValues);
        setActiveValues((currentValues) =>
          checked
            ? [
                ...currentValues,
                ...targetValues.filter((itemValue) => !currentValues.includes(itemValue)),
              ]
            : currentValues.filter((itemValue) => !targetSet.has(itemValue)),
        );
      },
      [isDisabled, isReadOnly, normalizedAllValues, setActiveValues],
    );

    const isItemChecked = useCallback(
      (value: string) => activeValues.includes(value),
      [activeValues],
    );

    const contextValue: CheckboxGroupContextValue = useMemo(
      () => ({
        groupValues: activeValues,
        allItemValues,
        allValues: normalizedAllValues,
        toggleItem,
        toggleAll,
        isItemChecked,
        registerItem,
        unregisterItem,
        name,
        form,
        disabled: isDisabled,
        required: isRequired,
        readOnly: isReadOnly,
        invalid: isInvalid,
        orientation,
      }),
      [
        activeValues,
        allItemValues,
        normalizedAllValues,
        isDisabled,
        form,
        isInvalid,
        isItemChecked,
        name,
        orientation,
        isReadOnly,
        registerItem,
        isRequired,
        toggleAll,
        toggleItem,
        unregisterItem,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composeRefs(rootRef, ref),
      role: "group",
      "aria-labelledby": restProps["aria-labelledby"] ??
        (restProps["aria-label"] === undefined && fieldset?.hasLegend
          ? fieldset.legendId
          : undefined),
      "aria-describedby": Object.prototype.hasOwnProperty.call(restProps, "aria-describedby")
        ? restProps["aria-describedby"]
        : fieldset?.describedBy,
      "aria-invalid": restProps["aria-invalid"] ?? (isInvalid || undefined),
      "data-slot": dataSlot,
      "data-orientation": orientation,
      ...(isDisabled && { "data-disabled": "" }),
      ...(isReadOnly && { "aria-readonly": true, "data-readonly": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      ...(isRequired && { "data-required": "" }),
      className,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <CheckboxGroupContextProvider value={contextValue}>
        {element}
        {isRequired ? (
          <input
            type="checkbox"
            aria-hidden="true"
            tabIndex={-1}
            form={form}
            checked={activeValues.length > 0}
            required
            disabled={isDisabled}
            onChange={() => undefined}
            style={validationInputStyle}
          />
        ) : null}
      </CheckboxGroupContextProvider>
    );
  },
);
