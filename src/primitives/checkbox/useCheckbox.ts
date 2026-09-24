"use client";

import { useCallback } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { CheckboxCheckedState } from "./context.js";

export interface UseCheckboxProps {
  checked?: CheckboxCheckedState;
  defaultChecked?: CheckboxCheckedState;
  onCheckedChange?: (checked: CheckboxCheckedState) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

/** State controller shared with Checkbox.Root; the rendered host owns form integration. */
export function useCheckbox({ checked: controlledChecked, defaultChecked = false, onCheckedChange, disabled = false, readOnly = false }: UseCheckboxProps = {}) {
  const [checked, setChecked] = useControllableState({ value: controlledChecked, defaultValue: defaultChecked, onChange: onCheckedChange });
  const toggle = useCallback(() => {
    if (!disabled && !readOnly) setChecked((current) => current === "indeterminate" ? true : !current);
  }, [disabled, readOnly, setChecked]);
  return { checked, setChecked, toggle, disabled, readOnly };
}

export type CheckboxController = ReturnType<typeof useCheckbox>;
