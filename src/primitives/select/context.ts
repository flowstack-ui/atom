"use client";

import { createContext, useContext, type RefObject } from "react";

export interface SelectItemEntry {
  id: string;
  element: HTMLElement;
  disabled: boolean;
  textValue: string;
}

export interface SelectItemData extends Record<string, unknown> {
  id: string;
  textValue: string;
}

export interface SelectContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  value: string | undefined;
  onValueChange: (value: string) => void;
  highlightedValue: string | null;
  onHighlight: (value: string | null) => void;
  selectId: string;
  triggerId: string;
  listboxId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  listboxRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  registerItem: (value: string, entry: SelectItemEntry) => void;
  updateItemText: (value: string, textValue: string) => void;
  unregisterItem: (value: string) => void;
  getItemElement: (value: string) => HTMLElement | undefined;
  getItemId: (value: string) => string | undefined;
  getItemValues: () => string[];
  getEnabledItemValues: () => string[];
  disabled: boolean;
  required: boolean;
  name: string | undefined;
  registryVersion: number;
  isInsidePortal: boolean;
  setInsidePortal: (value: boolean) => void;
  registerLabel: (value: string, label: string) => void;
  getLabel: (value: string) => string | undefined;
}

const SelectContext = createContext<SelectContextValue | null>(null);
SelectContext.displayName = "SelectContext";

export const SelectContextProvider = SelectContext.Provider;

export function useSelectContext(): SelectContextValue {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("Select compounds must be used within <Select.Root>");
  return ctx;
}

export interface SelectItemContextValue {
  value: string;
  selected: boolean;
  highlighted: boolean;
  disabled: boolean;
  textId: string;
  hasItemText: boolean;
  registerText: (textValue: string) => void;
}

const SelectItemContext = createContext<SelectItemContextValue | null>(null);
SelectItemContext.displayName = "SelectItemContext";

export const SelectItemContextProvider = SelectItemContext.Provider;

export function useSelectItemContext(): SelectItemContextValue {
  const ctx = useContext(SelectItemContext);
  if (!ctx) throw new Error("Select item compounds must be used within <Select.Item>");
  return ctx;
}

export interface SelectGroupContextValue {
  labelId: string | undefined;
  setLabelId: (id: string | undefined) => void;
}

const SelectGroupContext = createContext<SelectGroupContextValue | null>(null);
SelectGroupContext.displayName = "SelectGroupContext";

export const SelectGroupContextProvider = SelectGroupContext.Provider;

export function useSelectGroupContext(): SelectGroupContextValue | null {
  return useContext(SelectGroupContext);
}
