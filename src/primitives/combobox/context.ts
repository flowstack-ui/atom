"use client";

import { createContext, useContext, type RefObject } from "react";
import type { ComboboxOption, ComboboxOptionGroup } from "./utils.js";

export interface ComboboxItemEntry {
  id: string;
  element: HTMLElement;
  disabled: boolean;
}

export interface ComboboxItemData extends Record<string, unknown> {
  id: string;
}

export interface ComboboxContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  value: string | null;
  onValueChange: (value: string | null) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  highlightedValue: string | null;
  onHighlight: (value: string | null) => void;
  options: ComboboxOption[];
  filteredOptions: ComboboxOption[];
  groupedOptions: ComboboxOptionGroup[];
  comboboxId: string;
  inputId: string;
  listboxId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  registerItem: (value: string, entry: ComboboxItemEntry) => void;
  unregisterItem: (value: string) => void;
  getItemElement: (value: string) => HTMLElement | undefined;
  getItemId: (value: string) => string | undefined;
  getEnabledItemValues: () => string[];
  getOption: (value: string) => ComboboxOption | undefined;
  selectOption: (option: ComboboxOption) => void;
  registerEmpty: () => void;
  unregisterEmpty: () => void;
  emptyMounted: boolean;
  suppressNextInputFocusOpen: () => void;
  consumeInputFocusOpenSuppression: () => boolean;
  clearSelection: () => void;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  freeSolo: boolean;
  clearOnSelect: boolean;
  openOnFocus: boolean;
  loading: boolean;
  noOptionsText: string;
  loadingText: string;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);
ComboboxContext.displayName = "ComboboxContext";

export const ComboboxContextProvider = ComboboxContext.Provider;

export interface ComboboxGroupContextValue {
  labelId: string;
}

const ComboboxGroupContext = createContext<ComboboxGroupContextValue | null>(null);
ComboboxGroupContext.displayName = "ComboboxGroupContext";

export const ComboboxGroupContextProvider = ComboboxGroupContext.Provider;

export function useComboboxContext(): ComboboxContextValue {
  const ctx = useContext(ComboboxContext);
  if (!ctx) {
    throw new Error("Combobox compounds must be used within <Combobox.Root>");
  }
  return ctx;
}

export function useComboboxGroupContext(): ComboboxGroupContextValue | null {
  return useContext(ComboboxGroupContext);
}
