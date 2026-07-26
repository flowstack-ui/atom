"use client";

import { createContext, useContext, type RefObject } from "react";

export interface MultiSelectItemEntry {
  id: string;
  element: HTMLElement;
  disabled: boolean;
  textValue: string;
}

export interface MultiSelectItemData extends Record<string, unknown> {
  id: string;
  textValue: string;
}

export interface MultiSelectContextValue {
  isOpen: boolean;
  onOpen: (highlightIntent?: MultiSelectOpenHighlightIntent) => void;
  onClose: () => void;
  onToggle: () => void;
  value: string[];
  onValueChange: (value: string) => void;
  highlightedValue: string | null;
  onHighlight: (value: string | null) => void;
  multiSelectId: string;
  triggerId: string;
  listboxId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  listboxRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  registerItem: (value: string, entry: MultiSelectItemEntry) => void;
  updateItemText: (value: string, textValue: string) => void;
  unregisterItem: (value: string) => void;
  getItemElement: (value: string) => HTMLElement | undefined;
  getItemId: (value: string) => string | undefined;
  getItemValues: () => string[];
  getEnabledItemValues: () => string[];
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  name: string | undefined;
  fieldControlId: string | undefined;
  fieldLabelId: string | undefined;
  fieldDescribedBy: string | undefined;
  registryVersion: number;
  isInsidePortal: boolean;
  setInsidePortal: (value: boolean) => void;
  registerLabel: (value: string, label: string) => void;
  getLabel: (value: string) => string | undefined;
  openHighlightIntent: MultiSelectOpenHighlightIntent | null;
  clearOpenHighlightIntent: () => void;
}

export type MultiSelectOpenHighlightIntent = "current" | "first" | "last";

const MultiSelectContext = createContext<MultiSelectContextValue | null>(null);
MultiSelectContext.displayName = "MultiSelectContext";

export const MultiSelectContextProvider = MultiSelectContext.Provider;

export function useMultiSelectContext(): MultiSelectContextValue {
  const ctx = useContext(MultiSelectContext);
  if (!ctx) throw new Error("MultiSelect compounds must be used within <MultiSelect.Root>");
  return ctx;
}

export type MultiSelectContentSide = "top" | "right" | "bottom" | "left";
export type MultiSelectContentAlign = "start" | "center" | "end";

export interface MultiSelectContentContextValue {
  arrowRef: RefObject<HTMLSpanElement | null>;
  side: MultiSelectContentSide;
  align: MultiSelectContentAlign;
  arrowX?: number;
  arrowY?: number;
}

const MultiSelectContentContext = createContext<MultiSelectContentContextValue | null>(null);
MultiSelectContentContext.displayName = "MultiSelectContentContext";

export const MultiSelectContentContextProvider = MultiSelectContentContext.Provider;

export function useMultiSelectContentContext(): MultiSelectContentContextValue {
  const ctx = useContext(MultiSelectContentContext);
  if (!ctx) throw new Error("MultiSelect.Arrow must be used within <MultiSelect.Content>");
  return ctx;
}

export interface MultiSelectItemContextValue {
  value: string;
  selected: boolean;
  highlighted: boolean;
  disabled: boolean;
  textId: string;
  hasItemText: boolean;
  registerText: (textValue: string) => void;
}

const MultiSelectItemContext = createContext<MultiSelectItemContextValue | null>(null);
MultiSelectItemContext.displayName = "MultiSelectItemContext";

export const MultiSelectItemContextProvider = MultiSelectItemContext.Provider;

export function useMultiSelectItemContext(): MultiSelectItemContextValue {
  const ctx = useContext(MultiSelectItemContext);
  if (!ctx) throw new Error("MultiSelect item compounds must be used within <MultiSelect.Item>");
  return ctx;
}

export interface MultiSelectGroupContextValue {
  labelId: string | undefined;
  setLabelId: (id: string | undefined) => void;
}

const MultiSelectGroupContext = createContext<MultiSelectGroupContextValue | null>(null);
MultiSelectGroupContext.displayName = "MultiSelectGroupContext";

export const MultiSelectGroupContextProvider = MultiSelectGroupContext.Provider;

export function useMultiSelectGroupContext(): MultiSelectGroupContextValue | null {
  return useContext(MultiSelectGroupContext);
}
