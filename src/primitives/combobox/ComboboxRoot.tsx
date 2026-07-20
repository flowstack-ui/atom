"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFieldContext } from "../field/context.js";
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
}

export function ComboboxRoot({
  children,
  options,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  inputValue: controlledInputValue,
  defaultInputValue = "",
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
}: ComboboxRootProps) {
  const field = useFieldContext();
  const isDisabled = disabled ?? field?.disabled ?? false;
  const isReadOnly = readOnly ?? field?.readOnly ?? false;
  const isRequired = required ?? field?.required ?? false;
  const isInvalid = invalid ?? field?.invalid ?? false;
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
  const [inputValue, setInputValueState] = useControllableState<string>({
    value: controlledInputValue,
    defaultValue: defaultInputValue,
    onChange: onInputValueChange,
  });

  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
  const [emptyMounted, setEmptyMounted] = useState(false);

  const idPrefix = useId();
  const comboboxId = `combobox-${idPrefix}`;
  const inputId = field?.controlId ?? `combobox-input-${idPrefix}`;
  const listboxId = `combobox-listbox-${idPrefix}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const suppressInputFocusOpenRef = useRef(false);
  const reset = useCallback(() => {
    if (controlledValue === undefined) setValue(defaultValue);
    if (controlledInputValue === undefined) setInputValueState(defaultInputValue);
    if (controlledOpen === undefined) setOpen(defaultOpen);
    setHighlightedValue(null);
  }, [
    controlledInputValue,
    controlledOpen,
    controlledValue,
    defaultInputValue,
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
    () => filterOptions(options, inputValue),
    [filterOptions, inputValue, options],
  );
  const groupedOptions = useMemo(
    () => groupComboboxOptions(filteredOptions, groupBy),
    [filteredOptions, groupBy],
  );

  const setInputValue = useCallback(
    (next: string) => {
      setInputValueState(next);
    },
    [setInputValueState],
  );

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
    return filteredOptions.filter((option) => !option.disabled).map((option) => option.value);
  }, [filteredOptions]);

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
      if (isDisabled || isReadOnly || option.disabled) return;

      setValue(option.value);
      const nextInputValue = clearOnSelect ? "" : getComboboxOptionLabel(option);
      setInputValue(nextInputValue);
      onClose();
      inputRef.current?.focus({ preventScroll: true });
    },
    [clearOnSelect, isDisabled, isReadOnly, onClose, setInputValue, setValue],
  );

  const clearSelection = useCallback(() => {
    if (isDisabled || isReadOnly) return;
    setValue(null);
    setInputValue("");
    setHighlightedValue(null);
    inputRef.current?.focus({ preventScroll: true });
  }, [isDisabled, isReadOnly, setInputValue, setValue]);

  const contextValue = useMemo<ComboboxContextValue>(
    () => ({
      isOpen,
      onOpen,
      onClose,
      onToggle,
      value,
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
    ],
  );

  return (
    <ComboboxContextProvider value={contextValue}>
      {children}
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value ?? ""}
          form={form}
          disabled={isDisabled}
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
    </ComboboxContextProvider>
  );
}
