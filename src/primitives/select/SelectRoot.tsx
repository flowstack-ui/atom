"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SelectContextProvider,
  type SelectItemData,
  type SelectItemEntry,
  type SelectContextValue,
} from "./context.js";
import { useCollection } from "../../collection.js";

export interface SelectRootProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
}

export function SelectRoot({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  required = false,
  name,
  form,
}: SelectRootProps) {
  const isOpenControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isOpenControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);

  const onOpen = useCallback(() => {
    if (!disabled) setOpen(true);
  }, [disabled, setOpen]);

  const onClose = useCallback(() => {
    setOpen(false);
    setHighlightedValue(null);
  }, [setOpen]);

  const onToggle = useCallback(() => {
    if (disabled) return;
    if (isOpen) {
      onClose();
    } else {
      setOpen(true);
    }
  }, [disabled, isOpen, onClose, setOpen]);

  const isValueControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = isValueControlled ? controlledValue : internalValue;

  const handleValueChange = useCallback(
    (next: string) => {
      if (!isValueControlled) setInternalValue(next);
      onValueChange?.(next);
      setOpen(false);
      setHighlightedValue(null);
    },
    [isValueControlled, onValueChange, setOpen],
  );

  const [isInsidePortal, setInsidePortal] = useState(false);

  const idPrefix = useId();
  const selectId = `select-${idPrefix}`;
  const triggerId = `select-trigger-${idPrefix}`;
  const listboxId = `select-listbox-${idPrefix}`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const labelMapRef = useRef<Map<string, string>>(new Map());
  const {
    version: registryVersion,
    registerItem: registerCollectionItem,
    unregisterItem: unregisterCollectionItem,
    updateItem: updateCollectionItem,
    getItem: getCollectionItem,
    getItems: getCollectionItems,
    getEnabledItems: getEnabledCollectionItems,
  } = useCollection<string, HTMLElement, SelectItemData>();

  const registerItem = useCallback((itemValue: string, entry: SelectItemEntry) => {
    registerCollectionItem(itemValue, entry.element, {
      disabled: entry.disabled,
      data: {
        id: entry.id,
        textValue: entry.textValue,
      },
    });
  }, [registerCollectionItem]);

  const updateItemText = useCallback((itemValue: string, textValue: string) => {
    const entry = getCollectionItem(itemValue);
    if (!entry) return;

    updateCollectionItem(itemValue, {
      data: {
        ...entry.data,
        textValue,
      },
    });
  }, [getCollectionItem, updateCollectionItem]);

  const unregisterItem = useCallback((itemValue: string) => {
    unregisterCollectionItem(itemValue);
    labelMapRef.current.delete(itemValue);
  }, [unregisterCollectionItem]);

  const getItemElement = useCallback((itemValue: string) => {
    return getCollectionItem(itemValue)?.element;
  }, [getCollectionItem]);

  const getItemId = useCallback((itemValue: string) => {
    return getCollectionItem(itemValue)?.data.id;
  }, [getCollectionItem]);

  const registerLabel = useCallback((itemValue: string, label: string) => {
    labelMapRef.current.set(itemValue, label);
  }, []);

  const getLabel = useCallback((itemValue: string) => {
    return labelMapRef.current.get(itemValue) ?? getCollectionItem(itemValue)?.data.textValue;
  }, [getCollectionItem]);

  const getItemValues = useCallback(() => {
    return getCollectionItems().map((item) => item.value);
  }, [getCollectionItems]);

  const getEnabledItemValues = useCallback(() => {
    return getEnabledCollectionItems().map((item) => item.value);
  }, [getEnabledCollectionItems]);

  const ctx: SelectContextValue = useMemo(
    () => ({
      isOpen,
      onOpen,
      onClose,
      onToggle,
      value,
      onValueChange: handleValueChange,
      highlightedValue,
      onHighlight: setHighlightedValue,
      selectId,
      triggerId,
      listboxId,
      triggerRef,
      listboxRef,
      viewportRef,
      registerItem,
      updateItemText,
      unregisterItem,
      getItemElement,
      getItemId,
      getItemValues,
      getEnabledItemValues,
      disabled,
      required,
      name,
      registryVersion,
      isInsidePortal,
      setInsidePortal,
      registerLabel,
      getLabel,
    }),
    [
      disabled,
      getEnabledItemValues,
      getItemElement,
      getItemId,
      getItemValues,
      getLabel,
      handleValueChange,
      highlightedValue,
      isInsidePortal,
      isOpen,
      listboxId,
      name,
      onClose,
      onOpen,
      onToggle,
      registerItem,
      registerLabel,
      registryVersion,
      required,
      selectId,
      triggerId,
      unregisterItem,
      updateItemText,
      value,
    ],
  );

  return (
    <SelectContextProvider value={ctx}>
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
    </SelectContextProvider>
  );
}
