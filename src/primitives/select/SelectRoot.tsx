"use client";

import {
  Children,
  isValidElement,
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
import { useFieldContext } from "../field/context.js";
import { SelectItemText } from "./SelectItemText.js";

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
  disabled,
  required,
  name,
  form,
}: SelectRootProps) {
  const fieldCtx = useFieldContext();
  const isDisabled = disabled ?? fieldCtx?.disabled ?? false;
  const isRequired = required ?? fieldCtx?.required ?? false;
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
  const [openHighlightIntent, setOpenHighlightIntent] =
    useState<SelectContextValue["openHighlightIntent"]>(null);

  const onOpen = useCallback((highlightIntent: SelectContextValue["openHighlightIntent"] = "current") => {
    if (!isDisabled) {
      setOpenHighlightIntent(highlightIntent);
      setOpen(true);
    }
  }, [isDisabled, setOpen]);

  const onClose = useCallback(() => {
    setOpen(false);
    setHighlightedValue(null);
    setOpenHighlightIntent(null);
  }, [setOpen]);

  const onToggle = useCallback(() => {
    if (isDisabled) return;
    if (isOpen) {
      onClose();
    } else {
      setOpen(true);
    }
  }, [isDisabled, isOpen, onClose, setOpen]);

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
  const staticItems = useMemo(() => collectStaticSelectItems(children), [children]);
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
    return (
      labelMapRef.current.get(itemValue) ??
      staticItems.get(itemValue)?.text ??
      getCollectionItem(itemValue)?.data.textValue
    );
  }, [getCollectionItem, staticItems]);

  const getItemValues = useCallback(() => {
    const mountedItems = getCollectionItems();
    if (mountedItems.length > 0) return mountedItems.map((item) => item.value);
    return Array.from(staticItems.keys());
  }, [getCollectionItems, staticItems]);

  const getEnabledItemValues = useCallback(() => {
    const mountedItems = getCollectionItems();
    if (mountedItems.length > 0) {
      return getEnabledCollectionItems().map((item) => item.value);
    }

    return Array.from(staticItems.entries())
      .filter(([, item]) => !item.disabled)
      .map(([itemValue]) => itemValue);
  }, [getCollectionItems, getEnabledCollectionItems, staticItems]);

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
      disabled: isDisabled,
      required: isRequired,
      name,
      fieldControlId: fieldCtx?.controlId,
      fieldLabelId: fieldCtx?.labelId,
      fieldDescribedBy: fieldCtx?.describedBy,
      registryVersion,
      isInsidePortal,
      setInsidePortal,
      registerLabel,
      getLabel,
      openHighlightIntent,
      clearOpenHighlightIntent: () => setOpenHighlightIntent(null),
    }),
    [
      fieldCtx?.controlId,
      fieldCtx?.describedBy,
      fieldCtx?.labelId,
      getEnabledItemValues,
      getItemElement,
      getItemId,
      getItemValues,
      getLabel,
      handleValueChange,
      highlightedValue,
      isInsidePortal,
      isOpen,
      isDisabled,
      isRequired,
      listboxId,
      name,
      onClose,
      onOpen,
      onToggle,
      openHighlightIntent,
      registerItem,
      registerLabel,
      registryVersion,
      selectId,
      staticItems,
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
          disabled={isDisabled}
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
    </SelectContextProvider>
  );
}

type StaticSelectElementProps = {
  children?: ReactNode;
  disabled?: unknown;
  label?: unknown;
  value?: unknown;
};

type StaticSelectItem = {
  disabled: boolean;
  text: string;
};

function collectStaticSelectItems(children: ReactNode) {
  const items = new Map<string, StaticSelectItem>();

  const visit = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (!isValidElement<StaticSelectElementProps>(child)) return;

      const { children: childChildren, disabled, label, value } = child.props;
      if (typeof value === "string") {
        const text = typeof label === "string"
          ? label
          : getItemTextChild(childChildren) ?? getDirectText(childChildren) ?? value;
        items.set(value, {
          disabled: disabled === true,
          text,
        });
      }

      visit(childChildren);
    });
  };

  visit(children);
  return items;
}

function getItemTextChild(children: ReactNode): string | undefined {
  let text: string | undefined;

  Children.forEach(children, (child) => {
    if (text || !isValidElement<StaticSelectElementProps>(child)) return;

    if (child.type === SelectItemText) {
      text = getPlainText(child.props.children);
      return;
    }

    text = getItemTextChild(child.props.children);
  });

  return text;
}

function getDirectText(children: ReactNode): string | undefined {
  const chunks: string[] = [];
  Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      chunks.push(String(child));
    }
  });

  const text = chunks.join("").trim();
  return text || undefined;
}

function getPlainText(children: ReactNode): string | undefined {
  const chunks: string[] = [];

  const visit = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (typeof child === "string" || typeof child === "number") {
        chunks.push(String(child));
        return;
      }

      if (isValidElement<StaticSelectElementProps>(child)) {
        visit(child.props.children);
      }
    });
  };

  visit(children);
  const text = chunks.join("").trim();
  return text || undefined;
}
