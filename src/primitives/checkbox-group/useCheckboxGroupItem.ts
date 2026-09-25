"use client";

import { useEffect, useRef } from "react";
import { useCheckboxGroupContext } from "./context.js";
import type { CheckboxRootProps } from "../checkbox/CheckboxRoot.js";

export interface UseCheckboxGroupItemProps {
  value: string;
  disabled?: boolean;
  readOnly?: boolean;
}

/** Bind a normal Checkbox.Root to group state, retaining sibling Field labels. */
export function useCheckboxGroupItem({ value, disabled = false, readOnly = false }: UseCheckboxGroupItemProps) {
  const group = useCheckboxGroupContext();
  const ref = useRef<HTMLButtonElement>(null);
  const checked = group.isItemChecked(value);
  const limitDisabled = !checked && group.maxSelectedValues !== undefined && new Set(group.groupValues).size >= group.maxSelectedValues;
  const isDisabled = disabled || group.disabled || limitDisabled;
  const isReadOnly = readOnly || group.readOnly;
  useEffect(() => {
    if (!ref.current) return;
    group.registerItem(value, ref.current);
    return () => group.unregisterItem(value);
  }, [group.registerItem, group.unregisterItem, value, isDisabled, isReadOnly]);
  const props: Pick<CheckboxRootProps, "value" | "checked" | "disabled" | "readOnly" | "invalid" | "name" | "form" | "onCheckedChange"> & { ref: typeof ref; "data-limit-disabled"?: string } = {
    ref, value, checked, disabled: isDisabled, readOnly: isReadOnly,
    invalid: group.invalid, name: group.name, form: group.form,
    "data-limit-disabled": limitDisabled && !disabled && !group.disabled ? "" : undefined,
    onCheckedChange: (next) => {
      if (!isDisabled && !isReadOnly && (next === true) !== checked) group.toggleItem(value);
    },
  };
  return props;
}
