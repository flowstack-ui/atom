"use client";

import { useCallback, useRef, type SetStateAction } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { CheckboxCheckedState } from "../checkbox/context.js";

export interface UseCheckboxGroupProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  maxSelectedValues?: number;
}

/** Shared selection controller; form relationships remain owned by the rendered Root. */
export function useCheckboxGroup(props: UseCheckboxGroupProps = {}) {
  const { value: controlledValue, defaultValue = [], onValueChange, disabled = false, readOnly = false, maxSelectedValues } = props;
  if (maxSelectedValues !== undefined && (!Number.isInteger(maxSelectedValues) || maxSelectedValues < 0)) {
    throw new Error("CheckboxGroup maxSelectedValues must be a finite nonnegative integer.");
  }
  const [value, updateValue] = useControllableState({ value: controlledValue, defaultValue, onChange: onValueChange });
  const latestValue = useRef(value);
  latestValue.current = value;
  const setValue = useCallback((next: SetStateAction<string[]>) => {
    const resolved = typeof next === "function" ? next(latestValue.current) : next;
    if (controlledValue === undefined) latestValue.current = resolved;
    updateValue(resolved);
  }, [controlledValue, updateValue]);
  const isChecked = useCallback((item: string) => value.includes(item), [value]);
  const isDisabled = useCallback((item: string) => disabled || (!value.includes(item) && maxSelectedValues !== undefined && new Set(value).size >= maxSelectedValues), [disabled, value, maxSelectedValues]);
  const setChecked = useCallback((item: string, checked: boolean) => {
    if (disabled || readOnly) return;
    const current = latestValue.current;
    if (checked === current.includes(item)) return;
    if (checked && maxSelectedValues !== undefined && new Set(current).size >= maxSelectedValues) return;
    setValue(checked ? [...current, item] : current.filter((entry) => entry !== item));
  }, [disabled, readOnly, maxSelectedValues, setValue]);
  const toggleValue = useCallback((item: string) => setChecked(item, !latestValue.current.includes(item)), [setChecked]);
  const getItemProps = useCallback((item: string) => ({
    value: item,
    checked: isChecked(item),
    disabled: isDisabled(item),
    readOnly,
    onCheckedChange: (checked: CheckboxCheckedState) => setChecked(item, checked === true),
  }), [isChecked, isDisabled, readOnly, setChecked]);
  return { value, setValue, isChecked, isDisabled, setChecked, toggleValue, getItemProps, disabled, readOnly, maxSelectedValues };
}

export type CheckboxGroupController = ReturnType<typeof useCheckboxGroup>;
