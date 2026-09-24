"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { formControlProxyStyle, useFormControlProxy } from "../../hooks/useFormControlProxy.js";
import { useFieldContext } from "../field/context.js";
import type { ValidationBehavior } from "../form/validation.js";
import {
  ComboboxContextProvider,
  type ComboboxContextValue,
  type ComboboxItemData,
  type ComboboxItemEntry,
} from "./context.js";
import {
  filterComboboxOptions,
  getComboboxOptionLabel,
  groupComboboxOptions,
  type ComboboxFilter,
  type ComboboxOption,
} from "./utils.js";

export interface ComboboxRootProps {
  children: ReactNode;
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  filterOptions?: ComboboxFilter;
  groupBy?: (option: ComboboxOption) => string;
  freeSolo?: boolean;
  clearOnSelect?: boolean;
  openOnFocus?: boolean;
  loading?: boolean;
  noOptionsText?: string;
  loadingText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  name?: string;
  form?: string;
  validationBehavior?: ValidationBehavior;
  /** Multiple mode uses values/onValuesChange without changing the scalar API. */
  multiple?: boolean;
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
  closeOnSelect?: boolean;
  openOnClick?: boolean;
  openOnChange?: boolean | ((details: { inputValue: string }) => boolean);
  loopFocus?: boolean;
  highlightedValue?: string | null;
  onHighlightChange?: (value: string | null) => void;
  scrollToIndexFn?: (details: { index: number; value: string }) => void;
  onFormReset?: () => void;
  inputBehavior?: "none" | "autohighlight" | "autocomplete";
  selectionBehavior?: "replace" | "clear" | "preserve";
  openOnKeyPress?: boolean;
  defaultHighlightedValue?: string | null;
  onSelect?: (option: ComboboxOption) => void;
}

export function ComboboxRoot({
  children,
  options,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  inputValue: controlledInputValue,
  defaultInputValue,
  onInputValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  filterOptions = filterComboboxOptions,
  groupBy,
  freeSolo = false,
  clearOnSelect = false,
  openOnFocus = true,
  loading = false,
  noOptionsText = "No options",
  loadingText = "Loading",
  disabled,
  readOnly,
  required,
  invalid,
  name,
  form,
  validationBehavior,
  multiple = false,
  values: controlledValues,
  defaultValues = [],
  onValuesChange,
  closeOnSelect = !multiple,
  openOnClick = false,
  openOnChange = true,
  loopFocus = true,
  highlightedValue: controlledHighlight,
  onHighlightChange,
  scrollToIndexFn,
  onFormReset,
  inputBehavior = "none",
  selectionBehavior = clearOnSelect ? "clear" : "replace",
  openOnKeyPress = true,
  defaultHighlightedValue = null,
  onSelect,
}: ComboboxRootProps) {
  const field = useFieldContext();
  const isDisabled = disabled ?? field?.disabled ?? false;
  const isReadOnly = readOnly ?? field?.readOnly ?? false;
  const isRequired = required ?? field?.required ?? false;
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [value, setValue] = useControllableState<string | null>({
    value: controlledValue,
    defaultValue,
    onChange: onValueChange,
  });
  const [values, setValues] = useControllableState<string[]>({ value: controlledValues, defaultValue: defaultValues, onChange: onValuesChange });
  const initialInputValue = defaultInputValue ?? (multiple ? "" : getComboboxOptionLabel(options.find(option => option.value === (controlledValue ?? defaultValue)) ?? { value: "", label: "" }));
  const [inputValue, setInputValueState] = useControllableState<string>({
    value: controlledInputValue,
    defaultValue: initialInputValue,
    onChange: onInputValueChange,
  });
  const [completionQuery, setCompletionQuery] = useState(initialInputValue);

  const [highlightedValue, setHighlightedValue] = useControllableState<string | null>({ value: controlledHighlight, defaultValue: defaultHighlightedValue, onChange: onHighlightChange });
  const [emptyMounted, setEmptyMounted] = useState(false);
  const lastSelection = useRef({ value, label: options.find(option => option.value === value)?.label });
  useEffect(() => {
    const option = options.find(option => option.value === value);
    const label = option ? getComboboxOptionLabel(option) : undefined;
    const previous = lastSelection.current;
    if (!multiple && controlledInputValue === undefined && selectionBehavior === "replace" &&
      (previous.value !== value || (previous.label === undefined && label !== undefined))) {
      setInputValueState(label ?? "");
    }
    lastSelection.current = { value, label };
  }, [value, options, multiple, controlledInputValue, selectionBehavior, setInputValueState]);

  const idPrefix = useId();
  const comboboxId = `combobox-${idPrefix}`;
  const inputId = field?.controlId ?? `combobox-input-${idPrefix}`;
  const listboxId = `combobox-listbox-${idPrefix}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const validationInputRef = useRef<HTMLInputElement>(null);
  useFormControlProxy(validationInputRef, inputRef);
  const validation = useFormValidation({
    validityRef: validationInputRef,
    ownerRef: inputRef,
    invalid,
    inheritedInvalid: field?.invalid,
    validationBehavior,
    inheritedValidationBehavior: field?.validationBehavior,
    form,
    reportValidity: field?.reportControlValidity,
  });
  const isInvalid = validation.invalid;
  const contentRef = useRef<HTMLDivElement>(null);
  const suppressInputFocusOpenRef = useRef(false);
  const reset = useCallback(() => {
    onFormReset?.();
    if (controlledValue === undefined) setValue(defaultValue);
    if (controlledValues === undefined) setValues(defaultValues);
    if (controlledInputValue === undefined) setInputValueState(initialInputValue);
    setCompletionQuery(initialInputValue);
    if (controlledOpen === undefined) setOpen(defaultOpen);
    setHighlightedValue(null);
  }, [
    controlledInputValue,
    onFormReset,
    controlledOpen,
    controlledValue,
    controlledValues,
    defaultValues,
    setValues,
    initialInputValue,
    defaultOpen,
    defaultValue,
    setInputValueState,
    setOpen,
    setValue,
  ]);
  useFormReset(inputRef, form, false, reset);
  const {
    version: registryVersion,
    registerItem: registerCollectionItem,
    unregisterItem: unregisterCollectionItem,
    getItem: getCollectionItem,
  } = useCollection<string, HTMLElement, ComboboxItemData>();

  const filteredOptions = useMemo(
    () => filterOptions(options, inputBehavior === "autocomplete" ? completionQuery : inputValue),
    [filterOptions, inputValue, options, inputBehavior, completionQuery],
  );
  const groupedOptions = useMemo(
    () => groupComboboxOptions(filteredOptions, groupBy),
    [filteredOptions, groupBy],
  );

  const setInputValue = useCallback(
    (next: string) => {
      setInputValueState(next);
      setCompletionQuery(next);
    },
    [setInputValueState],
  );

  useEffect(() => {
    if (isOpen && inputBehavior === "autohighlight") setHighlightedValue(filteredOptions.find(option => !option.disabled)?.value ?? null);
  }, [inputValue, isOpen, inputBehavior, filteredOptions, setHighlightedValue]);
  useEffect(() => {
    if (highlightedValue !== null && !filteredOptions.some(option => option.value === highlightedValue && !option.disabled)) setHighlightedValue(null);
  }, [filteredOptions, highlightedValue, setHighlightedValue]);

  const completeOption = useCallback((itemValue: string) => {
    const option = options.find(option => option.value === itemValue);
    if (!option || option.disabled || isDisabled || isReadOnly || multiple) return;
    setValue(itemValue);
    setInputValueState(getComboboxOptionLabel(option));
  }, [options, isDisabled, isReadOnly, multiple, setValue, setInputValueState]);

  const onOpen = useCallback(() => {
    if (!isDisabled && !isReadOnly) setOpen(true);
  }, [isDisabled, isReadOnly, setOpen]);

  const onClose = useCallback(() => {
    setOpen(false);
    setHighlightedValue(null);
  }, [setOpen]);

  const onToggle = useCallback(() => {
    if (isDisabled || isReadOnly) return;
    if (isOpen) {
      onClose();
    } else {
      setOpen(true);
    }
  }, [isDisabled, isOpen, isReadOnly, onClose, setOpen]);

  const registerItem = useCallback((itemValue: string, entry: ComboboxItemEntry) => {
    registerCollectionItem(itemValue, entry.element, {
      disabled: entry.disabled,
      data: { id: entry.id },
    });
  }, [registerCollectionItem]);

  const unregisterItem = useCallback((itemValue: string) => {
    unregisterCollectionItem(itemValue);
  }, [unregisterCollectionItem]);

  const getItemElement = useCallback((itemValue: string) => {
    return getCollectionItem(itemValue)?.element;
  }, [getCollectionItem]);

  const getItemId = useCallback((itemValue: string) => {
    return getCollectionItem(itemValue)?.data.id;
  }, [getCollectionItem]);

  const getEnabledItemValues = useCallback(() => {
    return filteredOptions.filter((option) => !option.disabled && !getCollectionItem(option.value)?.disabled).map((option) => option.value);
  }, [filteredOptions, getCollectionItem]);

  const getOption = useCallback(
    (itemValue: string) => options.find((option) => option.value === itemValue),
    [options],
  );

  const registerEmpty = useCallback(() => {
    setEmptyMounted(true);
  }, []);

  const unregisterEmpty = useCallback(() => {
    setEmptyMounted(false);
  }, []);

  const suppressNextInputFocusOpen = useCallback(() => {
    suppressInputFocusOpenRef.current = true;
  }, []);

  const consumeInputFocusOpenSuppression = useCallback(() => {
    if (!suppressInputFocusOpenRef.current) return false;
    suppressInputFocusOpenRef.current = false;
    return true;
  }, []);

  const selectOption = useCallback(
    (option: ComboboxOption) => {
      if (isDisabled || isReadOnly || option.disabled || getCollectionItem(option.value)?.disabled) return;

      if (multiple) setValues(values.includes(option.value) ? values.filter(value => value !== option.value) : [...values, option.value]);
      else setValue(option.value);
      if (multiple || selectionBehavior === "clear") setInputValue("");
      else if (selectionBehavior === "replace") setInputValue(getComboboxOptionLabel(option));
      onSelect?.(option);
      if (closeOnSelect) onClose();
      inputRef.current?.focus({ preventScroll: true });
    },
    [selectionBehavior, onSelect, closeOnSelect, multiple, values, setValues, isDisabled, isReadOnly, onClose, setInputValue, setValue, getCollectionItem],
  );

  const clearSelection = useCallback(() => {
    if (isDisabled || isReadOnly) return;
    setValue(null);
    if (multiple) setValues([]);
    setInputValue("");
    setHighlightedValue(null);
    inputRef.current?.focus({ preventScroll: true });
  }, [isDisabled, isReadOnly, setInputValue, setValue, multiple, setValues]);

  const contextValue = useMemo<ComboboxContextValue>(
    () => ({
      inputBehavior,
      openOnKeyPress,
      completeOption,
      isOpen,
      onOpen,
      onClose,
      onToggle,
      value,
      multiple,
      values,
      onValuesChange: setValues,
      openOnClick,
      openOnChange,
      loopFocus,
      scrollToIndexFn,
      onValueChange: setValue,
      inputValue,
      onInputValueChange: setInputValue,
      highlightedValue,
      onHighlight: setHighlightedValue,
      options,
      filteredOptions,
      groupedOptions,
      comboboxId,
      inputId,
      listboxId,
      inputRef,
      controlRef,
      fieldLabelId: field?.labelId,
      fieldDescribedBy: field?.describedBy,
      form,
      contentRef,
      registerItem,
      unregisterItem,
      getItemElement,
      getItemId,
      getEnabledItemValues,
      getOption,
      selectOption,
      registerEmpty,
      unregisterEmpty,
      emptyMounted,
      suppressNextInputFocusOpen,
      consumeInputFocusOpenSuppression,
      clearSelection,
      disabled: isDisabled,
      readOnly: isReadOnly,
      required: isRequired,
      invalid: isInvalid,
      freeSolo,
      clearOnSelect,
      openOnFocus,
      loading,
      noOptionsText,
      loadingText,
    }),
    [
      inputBehavior,
      openOnKeyPress,
      completeOption,
      comboboxId,
      clearSelection,
      clearOnSelect,
      field?.describedBy,
      field?.labelId,
      form,
      emptyMounted,
      filteredOptions,
      freeSolo,
      consumeInputFocusOpenSuppression,
      getEnabledItemValues,
      getItemElement,
      getItemId,
      getOption,
      groupedOptions,
      highlightedValue,
      inputId,
      inputValue,
      isDisabled,
      isInvalid,
      isOpen,
      listboxId,
      loading,
      loadingText,
      noOptionsText,
      onClose,
      onOpen,
      onToggle,
      openOnFocus,
      options,
      isReadOnly,
      registerEmpty,
      registerItem,
      registryVersion,
      isRequired,
      selectOption,
      setInputValue,
      setValue,
      suppressNextInputFocusOpen,
      unregisterEmpty,
      unregisterItem,
      value,
      multiple,
      values,
      setValues,
      openOnClick,
      openOnChange,
      loopFocus,
      scrollToIndexFn,
    ],
  );

  return (
    <ComboboxContextProvider value={contextValue}>
      {name !== undefined || isRequired ? (
        <input
          ref={validationInputRef}
          type="text"
          name={multiple ? undefined : name}
          value={multiple ? (values.length ? "selected" : "") : value ?? ""}
          form={form}
          disabled={isDisabled}
          required={isRequired}
          aria-hidden="true"
          tabIndex={-1}
          onFocus={() => inputRef.current?.focus()}
          {...validation.validationProps}
          style={formControlProxyStyle}
        />
      ) : null}
      {multiple && name !== undefined ? values.map(selected => <input key={selected} type="hidden" name={name} value={selected} form={form} disabled={isDisabled} />) : null}
      {children}
    </ComboboxContextProvider>
  );
}
