"use client";

import { createContext, useContext, type RefObject } from "react";
import type { CollectionItem } from "../../collection.js";

export type ListboxSelectionValue = string | string[] | null;
export type ListboxOrientation = "vertical" | "horizontal";

export interface ListboxItemData extends Record<string, unknown> {
  id: string;
  textValue: string;
  groupLabelId?: string;
}

export type ListboxItemEntry = CollectionItem<string, HTMLElement, ListboxItemData>;

export interface ListboxContextValue {
  value: ListboxSelectionValue;
  selectedValues: string[];
  multiple: boolean;
  highlightedValue: string | null;
  setHighlightedValue: (value: string | null) => void;
  selectValue: (value: string) => void;
  isValueSelected: (value: string) => boolean;
  listboxId: string;
  listboxRef: RefObject<HTMLElement | null>;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  orientation: ListboxOrientation;
  loop: boolean;
  registerItem: (
    value: string,
    element: HTMLElement,
    data: ListboxItemData,
    disabled?: boolean,
  ) => void;
  updateItem: (
    value: string,
    data: ListboxItemData,
    disabled?: boolean,
  ) => void;
  unregisterItem: (value: string) => void;
  getItem: (value: string) => ListboxItemEntry | null;
  getItems: () => ListboxItemEntry[];
  getEnabledItems: () => ListboxItemEntry[];
  getItemId: (value: string) => string | undefined;
}

const ListboxContext = createContext<ListboxContextValue | null>(null);
ListboxContext.displayName = "ListboxContext";

export const ListboxContextProvider = ListboxContext.Provider;

export function useListboxContext(): ListboxContextValue {
  const ctx = useContext(ListboxContext);
  if (!ctx) {
    throw new Error("Listbox compound components must be used within <ListboxRoot>");
  }
  return ctx;
}

export interface ListboxOptionContextValue {
  value: string;
  selected: boolean;
  highlighted: boolean;
  disabled: boolean;
  textId: string;
  hasOptionText: boolean;
  registerText: (textValue: string) => void;
}

const ListboxOptionContext = createContext<ListboxOptionContextValue | null>(null);
ListboxOptionContext.displayName = "ListboxOptionContext";

export const ListboxOptionContextProvider = ListboxOptionContext.Provider;

export function useListboxOptionContext(): ListboxOptionContextValue {
  const ctx = useContext(ListboxOptionContext);
  if (!ctx) {
    throw new Error("Listbox option compounds must be used within <ListboxOption>");
  }
  return ctx;
}

export interface ListboxGroupContextValue {
  labelId: string | undefined;
  setLabelId: (id: string | undefined) => void;
}

const ListboxGroupContext = createContext<ListboxGroupContextValue | null>(null);
ListboxGroupContext.displayName = "ListboxGroupContext";

export const ListboxGroupContextProvider = ListboxGroupContext.Provider;

export function useListboxGroupContext(): ListboxGroupContextValue | null {
  return useContext(ListboxGroupContext);
}
