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
  MultiSelectContextProvider,
  type MultiSelectItemData,
  type MultiSelectItemEntry,
  type MultiSelectContextValue,
} from "./context.js";
import { useCollection } from "../../collection.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import {
  formControlProxyStyle,
  useFormControlProxy,
} from "../../hooks/useFormControlProxy.js";
import { useFieldContext } from "../field/context.js";
import type { ValidationBehavior } from "../form/validation.js";
import { MultiSelectItemText } from "./MultiSelectItemText.js";

export interface MultiSelectRootProps {
  children: ReactNode;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  validationBehavior?: ValidationBehavior;
}

export function MultiSelectRoot({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled,
  readOnly,
  invalid,
  required,
  name,
  form,
  validationBehavior,
}: MultiSelectRootProps) {
  const fieldCtx = useFieldContext();
  const isDisabled = disabled ?? fieldCtx?.disabled ?? false;
  const isReadOnly = readOnly ?? fieldCtx?.readOnly ?? false;
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
    useState<MultiSelectContextValue["openHighlightIntent"]>(null);

  const onOpen = useCallback((highlightIntent: MultiSelectContextValue["openHighlightIntent"] = "current") => {
    if (!isDisabled && !isReadOnly) {
      setOpenHighlightIntent(highlightIntent);
      setOpen(true);
    }
  }, [isDisabled, isReadOnly, setOpen]);

  const onClose = useCallback(() => {
    setOpen(false);
    setHighlightedValue(null);
    setOpenHighlightIntent(null);
  }, [setOpen]);

  const onToggle = useCallback(() => {
    if (isDisabled || isReadOnly) return;
    if (isOpen) {
      onClose();
    } else {
      setOpen(true);
    }
  }, [isDisabled, isOpen, isReadOnly, onClose, setOpen]);

  const isValueControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(() => normalizeValues(defaultValue));
  const value = normalizeValues(isValueControlled ? controlledValue : internalValue);

  const handleValueChange = useCallback(
    (next: string) => {
      if (isDisabled || isReadOnly) return;
      const nextValue = value.includes(next)
        ? value.filter((itemValue) => itemValue !== next)
        : [...value, next];
      if (!isValueControlled) setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [isDisabled, isReadOnly, isValueControlled, onValueChange, value],
  );

  const [isInsidePortal, setInsidePortal] = useState(false);

  const idPrefix = useId();
  const multiSelectId = `multi-select-${idPrefix}`;
  const triggerId = `multi-select-trigger-${idPrefix}`;
  const listboxId = `multi-select-listbox-${idPrefix}`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const multiSelectRef = useRef<HTMLSelectElement>(null);
  useFormControlProxy(multiSelectRef, triggerRef);
  const validation = useFormValidation({
    validityRef: multiSelectRef,
    ownerRef: triggerRef,
    invalid,
    inheritedInvalid: fieldCtx?.invalid,
    validationBehavior,
    inheritedValidationBehavior: fieldCtx?.validationBehavior,
    form,
    reportValidity: fieldCtx?.reportControlValidity,
  });
  const isInvalid = validation.invalid;
  const reset = useCallback(() => {
    if (!isValueControlled) setInternalValue(normalizeValues(defaultValue));
    if (!isOpenControlled) setInternalOpen(defaultOpen);
    setHighlightedValue(null);
  }, [defaultOpen, defaultValue, isOpenControlled, isValueControlled]);
  useFormReset(triggerRef, form, false, reset);
  const listboxRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const labelMapRef = useRef<Map<string, string>>(new Map());
  const staticItems = useMemo(() => collectStaticMultiSelectItems(children), [children]);
  const {
    version: registryVersion,
    registerItem: registerCollectionItem,
    unregisterItem: unregisterCollectionItem,
    updateItem: updateCollectionItem,
    getItem: getCollectionItem,
    getItems: getCollectionItems,
    getEnabledItems: getEnabledCollectionItems,
  } = useCollection<string, HTMLElement, MultiSelectItemData>();

  const registerItem = useCallback((itemValue: string, entry: MultiSelectItemEntry) => {
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

  const ctx: MultiSelectContextValue = useMemo(
    () => ({
      isOpen,
      onOpen,
      onClose,
      onToggle,
      value,
      onValueChange: handleValueChange,
      highlightedValue,
      onHighlight: setHighlightedValue,
      multiSelectId,
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
      readOnly: isReadOnly,
      invalid: isInvalid,
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
      isInvalid,
      isReadOnly,
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
      multiSelectId,
      staticItems,
      triggerId,
      unregisterItem,
      updateItemText,
      value,
    ],
  );

  return (
    <MultiSelectContextProvider value={ctx}>
      {name !== undefined || isRequired ? (
        <select
          ref={multiSelectRef}
          name={name}
          value={value}
          multiple
          form={form}
          disabled={isDisabled}
          required={isRequired}
          aria-hidden="true"
          tabIndex={-1}
          onFocus={() => triggerRef.current?.focus()}
          {...validation.validationProps}
          style={formControlProxyStyle}
        >
          {Array.from(staticItems.keys()).map((itemValue) => (
            <option key={itemValue} value={itemValue}>
              {getLabel(itemValue) ?? itemValue}
            </option>
          ))}
        </select>
      ) : null}
      {children}
    </MultiSelectContextProvider>
  );
}

function normalizeValues(value: string[] | undefined): string[] {
  return Array.from(new Set(value ?? []));
}

type StaticMultiSelectElementProps = {
  children?: ReactNode;
  disabled?: unknown;
  label?: unknown;
  value?: unknown;
};

type StaticMultiSelectItem = {
  disabled: boolean;
  text: string;
};

function collectStaticMultiSelectItems(children: ReactNode) {
  const items = new Map<string, StaticMultiSelectItem>();

  const visit = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (!isValidElement<StaticMultiSelectElementProps>(child)) return;

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
    if (text || !isValidElement<StaticMultiSelectElementProps>(child)) return;

    if (child.type === MultiSelectItemText) {
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

      if (isValidElement<StaticMultiSelectElementProps>(child)) {
        visit(child.props.children);
      }
    });
  };

  visit(children);
  const text = chunks.join("").trim();
  return text || undefined;
}
