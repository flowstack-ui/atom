"use client";

import { createElement, useCallback, useEffect, useMemo, useRef } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { ComboboxRoot, type ComboboxRootProps } from "./ComboboxRoot.js";
import { getComboboxOptionLabel } from "./utils.js";

export type UseComboboxProps = Omit<ComboboxRootProps, "children">;

/** Own state outside the compound tree without introducing a second selection engine. */
export function useCombobox(props: UseComboboxProps) {
  const [value, setValue] = useControllableState<string | null>({ value: props.value, defaultValue: props.defaultValue ?? null, onChange: props.onValueChange });
  const [values, setValues] = useControllableState<string[]>({ value: props.values, defaultValue: props.defaultValues ?? [], onChange: props.onValuesChange });
  const [open, setOpen] = useControllableState<boolean>({ value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange });
  const [inputValue, setInputValue] = useControllableState<string>({ value: props.inputValue, defaultValue: props.defaultInputValue ?? (props.multiple ? "" : props.options.find(option => option.value === (props.value ?? props.defaultValue))?.label ?? ""), onChange: props.onInputValueChange });
  const [highlightedValue, setHighlightedValue] = useControllableState<string | null>({ value: props.highlightedValue, defaultValue: props.defaultHighlightedValue ?? null, onChange: props.onHighlightChange });
  const selectedOption = props.options.find(option => option.value === value);
  const label = selectedOption ? getComboboxOptionLabel(selectedOption) : undefined;
  const previous = useRef({ value, label });
  useEffect(() => {
    if (!props.multiple && props.inputValue === undefined && (props.selectionBehavior ?? (props.clearOnSelect ? "clear" : "replace")) === "replace" &&
      (previous.current.value !== value || (previous.current.label === undefined && label !== undefined))) setInputValue(label ?? "");
    previous.current = { value, label };
  }, [value, label, props.multiple, props.inputValue, props.clearOnSelect, props.selectionBehavior, setInputValue]);
  const reset = useCallback(() => {
    if (props.value === undefined) setValue(props.defaultValue ?? null);
    if (props.values === undefined) setValues(props.defaultValues ?? []);
    if (props.open === undefined) setOpen(props.defaultOpen ?? false);
    if (props.inputValue === undefined) setInputValue(props.defaultInputValue ?? (props.multiple ? "" : props.options.find(option => option.value === props.defaultValue)?.label ?? ""));
    if (props.highlightedValue === undefined) setHighlightedValue(null);
    props.onFormReset?.();
  }, [props, setValue, setValues, setOpen, setInputValue, setHighlightedValue]);
  return useMemo(() => ({ ...props, value, values, open, inputValue, highlightedValue, onFormReset: reset, reset, onValueChange: setValue, onValuesChange: setValues, onOpenChange: setOpen, onInputValueChange: setInputValue, onHighlightChange: setHighlightedValue, setValue, setValues, setOpen, setInputValue, setHighlightedValue }), [props, reset, value, values, open, inputValue, highlightedValue, setValue, setValues, setOpen, setInputValue, setHighlightedValue]);
}

export type ComboboxController = ReturnType<typeof useCombobox>;
export interface ComboboxRootProviderProps { value: ComboboxController; children: ComboboxRootProps["children"] }
export function ComboboxRootProvider({ value, children }: ComboboxRootProviderProps) {
  return createElement(ComboboxRoot, { ...value, children });
}
