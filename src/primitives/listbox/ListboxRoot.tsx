"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFieldContext } from "../field/context.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  ListboxContextProvider,
  type ListboxContextValue,
  type ListboxItemData,
  type ListboxOrientation,
  type ListboxSelectionValue,
} from "./context.js";

type ListboxRootNativeProps = NativeDivProps<
  | "children"
  | "defaultValue"
  | "onBlur"
  | "onChange"
  | "onKeyDown"
  | "role"
  | "aria-activedescendant"
  | "aria-disabled"
  | "aria-invalid"
  | "aria-multiselectable"
  | "aria-orientation"
  | "aria-readonly"
  | "aria-required"
>;

export interface ListboxRootProps extends ListboxRootNativeProps {
  children?: ReactNode;
  value?: ListboxSelectionValue;
  defaultValue?: ListboxSelectionValue;
  onValueChange?: (value: ListboxSelectionValue) => void;
  onBlur?: FocusEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  multiple?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  orientation?: ListboxOrientation;
  loop?: boolean;
  name?: string;
  form?: string;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function normalizeSelectedValues(value: ListboxSelectionValue): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

function getDefaultListboxValue(
  value: ListboxSelectionValue | undefined,
  multiple: boolean,
): ListboxSelectionValue {
  if (value !== undefined) return value;
  return multiple ? [] : null;
}

function getTypeaheadMatch(
  items: { value: string; data: ListboxItemData }[],
  search: string,
  currentValue: string | null,
): string | null {
  if (!search) return null;

  const normalizedSearch = search.toLocaleLowerCase();
  const currentIndex = currentValue
    ? items.findIndex((item) => item.value === currentValue)
    : -1;
  const orderedItems = [
    ...items.slice(currentIndex + 1),
    ...items.slice(0, currentIndex + 1),
  ];

  return orderedItems.find((item) =>
    item.data.textValue.toLocaleLowerCase().startsWith(normalizedSearch),
  )?.value ?? null;
}

export const ListboxRoot = forwardRef<HTMLElement, ListboxRootProps>(
  function ListboxRoot(
    {
      children,
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      disabled,
      readOnly,
      required,
      invalid,
      orientation = "vertical",
      loop = true,
      name,
      form,
      render,
      asChild,
      id,
      tabIndex,
      onBlur,
      onKeyDown,
      "aria-describedby": ariaDescribedBy,
      "data-slot": dataSlot = "listbox",
      ...restProps
    },
    ref,
  ) {
    const fieldCtx = useFieldContext();
    const listboxRef = useRef<HTMLElement | null>(null);
    const composedRef = useMemo(() => composeRefs(listboxRef, ref), [ref]);
    const {
      getEnabledItems,
      getFirstItem,
      getItem,
      getItems,
      getLastItem,
      getNextItem,
      registerItem: registerCollectionItem,
      updateItem: updateCollectionItem,
      unregisterItem: unregisterCollectionItem,
    } = useCollection<string, HTMLElement, ListboxItemData>();
    const generatedId = useId();
    const listboxId = id ?? fieldCtx?.controlId ?? `listbox-${generatedId}`;
    const isDisabled = disabled ?? fieldCtx?.disabled ?? false;
    const isReadOnly = readOnly ?? fieldCtx?.readOnly ?? false;
    const isRequired = required ?? fieldCtx?.required ?? false;
    const isInvalid = invalid ?? fieldCtx?.invalid ?? false;
    const describedBy = ariaDescribedBy ?? fieldCtx?.describedBy;
    const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
    const typeaheadBufferRef = useRef("");
    const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [selectedValue, setSelectedValue] = useControllableState<ListboxSelectionValue>({
      value,
      defaultValue: getDefaultListboxValue(defaultValue, multiple),
      onChange: onValueChange,
    });
    const selectedValues = useMemo(
      () => normalizeSelectedValues(selectedValue),
      [selectedValue],
    );

    useEffect(() => {
      return () => {
        if (typeaheadTimeoutRef.current) {
          clearTimeout(typeaheadTimeoutRef.current);
        }
      };
    }, []);

    useEffect(() => {
      if (!multiple && Array.isArray(selectedValue)) {
        setSelectedValue(selectedValue[0] ?? null);
      }
    }, [multiple, selectedValue, setSelectedValue]);

    const isValueSelected = useCallback(
      (nextValue: string) => selectedValues.includes(nextValue),
      [selectedValues],
    );

    const selectValue = useCallback(
      (nextValue: string) => {
        if (isDisabled || isReadOnly) return;

        if (multiple) {
          setSelectedValue((currentValue) => {
            const currentValues = normalizeSelectedValues(currentValue);
            if (currentValues.includes(nextValue)) {
              return currentValues.filter((itemValue) => itemValue !== nextValue);
            }
            return [...currentValues, nextValue];
          });
          return;
        }

        setSelectedValue(nextValue);
      },
      [isDisabled, isReadOnly, multiple, setSelectedValue],
    );

    const registerItem = useCallback(
      (
        itemValue: string,
        element: HTMLElement,
        data: ListboxItemData,
        itemDisabled = false,
      ) => {
        registerCollectionItem(itemValue, element, {
          disabled: itemDisabled,
          data,
        });
      },
      [registerCollectionItem],
    );

    const updateItem = useCallback(
      (
        itemValue: string,
        data: ListboxItemData,
        itemDisabled = false,
      ) => {
        updateCollectionItem(itemValue, {
          disabled: itemDisabled,
          data,
        });
      },
      [updateCollectionItem],
    );

    const unregisterItem = useCallback(
      (itemValue: string) => {
        unregisterCollectionItem(itemValue);
      },
      [unregisterCollectionItem],
    );

    const getItemId = useCallback(
      (itemValue: string) => getItem(itemValue)?.data.id,
      [getItem],
    );

    const focusValue = useCallback(
      (nextValue: string | null) => {
        setHighlightedValue(nextValue);
        if (!nextValue) return;
        getItem(nextValue)?.element.scrollIntoView({ block: "nearest" });
      },
      [getItem],
    );

    const moveHighlight = useCallback(
      (direction: "next" | "previous") => {
        const enabledItems = getEnabledItems();
        if (enabledItems.length === 0) return;

        const currentValue = highlightedValue ?? enabledItems[0]?.value ?? null;
        const nextItem = currentValue
          ? getNextItem(currentValue, direction, { loop })
          : direction === "next"
            ? getFirstItem()
            : getLastItem();

        if (nextItem) focusValue(nextItem.value);
      },
      [
        focusValue,
        getEnabledItems,
        getFirstItem,
        getLastItem,
        getNextItem,
        highlightedValue,
        loop,
      ],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
      (event) => {
        if (isDisabled) return;

        const horizontal = orientation === "horizontal";
        const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
        const previousKey = horizontal ? "ArrowLeft" : "ArrowUp";

        switch (event.key) {
          case nextKey: {
            event.preventDefault();
            moveHighlight("next");
            return;
          }
          case previousKey: {
            event.preventDefault();
            moveHighlight("previous");
            return;
          }
          case "Home": {
            event.preventDefault();
            const firstItem = getFirstItem(true);
            if (firstItem) focusValue(firstItem.value);
            return;
          }
          case "End": {
            event.preventDefault();
            const lastItem = getLastItem(true);
            if (lastItem) focusValue(lastItem.value);
            return;
          }
          case "Enter":
          case " ": {
            if (!highlightedValue || isReadOnly) return;
            event.preventDefault();
            selectValue(highlightedValue);
            return;
          }
          default:
            break;
        }

        const isAltGr = event.ctrlKey && event.altKey;
        if (
          event.key.length === 1 &&
          !event.metaKey &&
          (isAltGr || (!event.ctrlKey && !event.altKey))
        ) {
          typeaheadBufferRef.current += event.key;
          if (typeaheadTimeoutRef.current) {
            clearTimeout(typeaheadTimeoutRef.current);
          }
          typeaheadTimeoutRef.current = setTimeout(() => {
            typeaheadBufferRef.current = "";
            typeaheadTimeoutRef.current = null;
          }, 700);

          const match = getTypeaheadMatch(
            getEnabledItems(),
            typeaheadBufferRef.current,
            highlightedValue,
          );
          if (match) {
            event.preventDefault();
            focusValue(match);
          }
        }
      },
      [
        focusValue,
        getEnabledItems,
        getFirstItem,
        getLastItem,
        highlightedValue,
        isDisabled,
        isReadOnly,
        moveHighlight,
        orientation,
        selectValue,
      ],
    );

    const handleBlur = useCallback<FocusEventHandler<HTMLElement>>((event) => {
      const nextTarget = event.relatedTarget;
      if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
        setHighlightedValue(null);
      }
    }, []);

    const contextValue = useMemo<ListboxContextValue>(
      () => ({
        value: selectedValue,
        selectedValues,
        multiple,
        highlightedValue,
        setHighlightedValue: focusValue,
        selectValue,
        isValueSelected,
        listboxId,
        listboxRef,
        disabled: isDisabled,
        readOnly: isReadOnly,
        required: isRequired,
        invalid: isInvalid,
        orientation,
        loop,
        registerItem,
        updateItem,
        unregisterItem,
        getItem,
        getItems,
        getEnabledItems,
        getItemId,
      }),
      [
        focusValue,
        getEnabledItems,
        getItemId,
        getItem,
        getItems,
        highlightedValue,
        isDisabled,
        isInvalid,
        isReadOnly,
        isRequired,
        isValueSelected,
        listboxId,
        loop,
        multiple,
        orientation,
        registerItem,
        selectValue,
        selectedValue,
        selectedValues,
        updateItem,
        unregisterItem,
      ],
    );

    const activeDescendant = highlightedValue ? getItemId(highlightedValue) : undefined;
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: listboxId,
      role: "listbox",
      tabIndex: tabIndex ?? 0,
      "aria-activedescendant": activeDescendant,
      "aria-describedby": describedBy,
      "aria-disabled": isDisabled || undefined,
      "aria-invalid": isInvalid || undefined,
      "aria-multiselectable": multiple || undefined,
      "aria-orientation": orientation,
      "aria-readonly": isReadOnly || undefined,
      "aria-required": isRequired || undefined,
      "data-slot": dataSlot,
      ...(selectedValues.length > 0 && { "data-filled": "" }),
      ...(highlightedValue && { "data-highlighted": "" }),
      ...(isDisabled && { "data-disabled": "" }),
      ...(isReadOnly && { "data-readonly": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      ...(multiple && { "data-multiple": "" }),
      onBlur: composeEventHandlers(onBlur, handleBlur),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    const hiddenInputs = name
      ? multiple
        ? selectedValues.map((itemValue) => (
            <input
              key={itemValue}
              type="hidden"
              name={name}
              value={itemValue}
              form={form}
              disabled={isDisabled}
              aria-hidden="true"
              tabIndex={-1}
            />
          ))
        : (
            <input
              type="hidden"
              name={name}
              value={selectedValues[0] ?? ""}
              form={form}
              disabled={isDisabled}
              aria-hidden="true"
              tabIndex={-1}
            />
          )
      : null;

    return (
      <ListboxContextProvider value={contextValue}>
        {asChild
          ? cloneAndMerge(children, behaviorProps)
          : renderElement(render, "div", { ...behaviorProps, children })}
        {hiddenInputs}
      </ListboxContextProvider>
    );
  },
);
