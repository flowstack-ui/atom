"use client";

import { useCallback } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";

export interface UseSwitchProps {
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /** Fires with the next boolean checked state. */
  onCheckedChange?: (checked: boolean) => void;
  /** Prevents focus, activation, and native submission. */
  disabled?: boolean;
  /** Keeps the switch focusable while preventing activation. */
  readOnly?: boolean;
}

/** Shared state controller used by standalone and compound Switch anatomy. */
export function useSwitch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  readOnly = false,
}: UseSwitchProps = {}) {
  const controlled = controlledChecked !== undefined;
  const [checked, setChecked] = useControllableState({
    value: controlledChecked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const toggle = useCallback(() => {
    if (!disabled && !readOnly) {
      setChecked((currentChecked) => !currentChecked);
    }
  }, [disabled, readOnly, setChecked]);
  const reset = useCallback(() => {
    if (!controlled) setChecked(defaultChecked);
  }, [controlled, defaultChecked, setChecked]);

  return {
    checked,
    setChecked,
    toggle,
    reset,
    controlled,
    disabled,
    readOnly,
  };
}

export type SwitchController = ReturnType<typeof useSwitch>;
