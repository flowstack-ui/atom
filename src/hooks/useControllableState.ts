"use client";

import { useCallback, useRef, useState, type SetStateAction } from "react";

export interface UseControllableStateParams<T> {
  /** Controlled value. When defined, this value wins over internal state. */
  value?: T;
  /** Initial value used when uncontrolled. */
  defaultValue: T;
  /** Called whenever the requested value changes. */
  onChange?: (value: T) => void;
}

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (nextValue: SetStateAction<T>) => void] {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? value : internalValue;
  const resolvedValueRef = useRef(resolvedValue);
  resolvedValueRef.current = resolvedValue;

  const setValue = useCallback(
    (nextValue: SetStateAction<T>) => {
      const resolvedNextValue =
        typeof nextValue === "function"
          ? (nextValue as (previousValue: T) => T)(resolvedValueRef.current as T)
          : nextValue;

      if (!isControlled) {
        setInternalValue(resolvedNextValue);
      }

      onChange?.(resolvedNextValue);
    },
    [isControlled, onChange],
  );

  return [resolvedValue as T, setValue];
}
