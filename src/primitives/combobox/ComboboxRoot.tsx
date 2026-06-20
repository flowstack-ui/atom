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
  disabled = false,
  readOnly = false,
  required = false,
  invalid = false,
  name,
  form,
}: ComboboxRootProps) {
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

  const idPrefix = useId();
  const comboboxId = `combobox-${idPrefix}`;
  const inputId = `combobox-input-${idPrefix}`;
  const listboxId = `combobox-listbox-${idPrefix}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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
    if (!disabled && !readOnly) setOpen(true);
  }, [disabled, readOnly, setOpen]);

  const onClose = useCallback(() => {
    setOpen(false);
    setHighlightedValue(null);
  }, [setOpen]);

  const onToggle = useCallback(() => {
    if (disabled || readOnly) return;
    if (isOpen) {
      onClose();
    } else {
      setOpen(true);
    }
  }, [disabled, isOpen, onClose, readOnly, setOpen]);

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

  const selectOption = useCallback(
    (option: ComboboxOption) => {
      if (disabled || readOnly || option.disabled) return;

      setValue(option.value);
      const nextInputValue = clearOnSelect ? "" : getComboboxOptionLabel(option);
      setInputValue(nextInputValue);
      onClose();
      inputRef.current?.focus({ preventScroll: true });
    },
    [clearOnSelect, disabled, onClose, readOnly, setInputValue, setValue],
  );

  const clearSelection = useCallback(() => {
    if (disabled || readOnly) return;
    setValue(null);
    setInputValue("");
    setHighlightedValue(null);
    inputRef.current?.focus({ preventScroll: true });
  }, [disabled, readOnly, setInputValue, setValue]);

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
      contentRef,
      registerItem,
      unregisterItem,
      getItemElement,
      getItemId,
      getEnabledItemValues,
      getOption,
      selectOption,
      clearSelection,
      disabled,
      readOnly,
      required,
      invalid,
      freeSolo,
      openOnFocus,
      loading,
      noOptionsText,
      loadingText,
    }),
    [
      comboboxId,
      clearSelection,
      disabled,
      filteredOptions,
      freeSolo,
      getEnabledItemValues,
      getItemElement,
      getItemId,
      getOption,
      groupedOptions,
      highlightedValue,
      inputId,
      inputValue,
      invalid,
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
      readOnly,
      registerItem,
      registryVersion,
      required,
      selectOption,
      setInputValue,
      setValue,
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
          disabled={disabled}
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
    </ComboboxContextProvider>
  );
}
