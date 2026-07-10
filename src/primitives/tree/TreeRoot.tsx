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
import { getTypeaheadMatch } from "../../utils/typeahead.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  TreeBranchContextProvider,
  TreeContextProvider,
  type TreeContextValue,
  type TreeItemData,
  type TreeItemEntry,
  type TreeOrientation,
  type TreeSelectionValue,
} from "./context.js";

type TreeRootNativeProps = NativeDivProps<
  | "children"
  | "defaultValue"
  | "onBlur"
  | "onChange"
  | "onFocus"
  | "onKeyDown"
  | "dir"
  | "role"
  | "aria-activedescendant"
  | "aria-disabled"
  | "aria-invalid"
  | "aria-multiselectable"
  | "aria-orientation"
  | "aria-readonly"
  | "aria-required"
>;

export interface TreeRootProps extends TreeRootNativeProps {
  children?: ReactNode;
  value?: TreeSelectionValue;
  defaultValue?: TreeSelectionValue;
  onValueChange?: (value: TreeSelectionValue) => void;
  expandedValue?: string[];
  defaultExpandedValue?: string[];
  onExpandedValueChange?: (value: string[]) => void;
  onBlur?: FocusEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  multiple?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  orientation?: TreeOrientation;
  /** Text direction used for horizontal and expand/collapse arrow-key navigation. Defaults to Direction.Provider. */
  dir?: DirectionValue;
  loop?: boolean;
  name?: string;
  form?: string;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function normalizeSelectedValues(value: TreeSelectionValue): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

function getDefaultTreeValue(
  value: TreeSelectionValue | undefined,
  multiple: boolean,
): TreeSelectionValue {
  if (value !== undefined) return value;
  return multiple ? [] : null;
}

function createVisibilityPredicate(
  items: TreeItemEntry[],
  expandedValues: string[],
): (item: TreeItemEntry) => boolean {
  const itemByValue = new Map(items.map((item) => [item.value, item]));
  const expandedSet = new Set(expandedValues);

  return (item) => {
    let parentValue = item.data.parentValue;
    const seenValues = new Set<string>();

    while (parentValue) {
      if (seenValues.has(parentValue)) return false;
      seenValues.add(parentValue);
      if (!expandedSet.has(parentValue)) return false;
      parentValue = itemByValue.get(parentValue)?.data.parentValue ?? null;
    }

    return true;
  };
}

function getTreeTypeaheadMatch(
  items: TreeItemEntry[],
  search: string,
  currentValue: string | null,
): string | null {
  return getTypeaheadMatch(
    items.map((item) => ({ value: item.value, label: item.data.textValue })),
    search,
    currentValue,
  );
}

export type TreeNavigationAction =
  | "next"
  | "previous"
  | "expand-or-child"
  | "collapse-or-parent";

export function getTreeNavigationAction(
  orientation: TreeOrientation,
  key: string,
  dir: DirectionValue = "ltr",
): TreeNavigationAction | null {
  if (orientation === "horizontal") {
    if (key === "ArrowRight") return dir === "rtl" ? "previous" : "next";
    if (key === "ArrowLeft") return dir === "rtl" ? "next" : "previous";
    return null;
  }

  if (key === "ArrowDown") return "next";
  if (key === "ArrowUp") return "previous";
  if (key === "ArrowRight") {
    return dir === "rtl" ? "collapse-or-parent" : "expand-or-child";
  }
  if (key === "ArrowLeft") {
    return dir === "rtl" ? "expand-or-child" : "collapse-or-parent";
  }

  return null;
}

export const TreeRoot = forwardRef<HTMLElement, TreeRootProps>(
  function TreeRoot(
    {
      children,
      value,
      defaultValue,
      onValueChange,
      expandedValue,
      defaultExpandedValue = [],
      onExpandedValueChange,
      multiple = false,
      disabled,
      readOnly,
      required,
      invalid,
      orientation = "vertical",
      dir: dirProp,
      loop = true,
      name,
      form,
      render,
      asChild,
      id,
      tabIndex,
      onBlur,
      onFocus,
      onKeyDown,
      "aria-describedby": ariaDescribedBy,
      "data-slot": dataSlot = "tree",
      ...restProps
    },
    ref,
  ) {
    const fieldCtx = useFieldContext();
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const treeRef = useRef<HTMLElement | null>(null);
    const composedRef = useMemo(() => composeRefs(treeRef, ref), [ref]);
    const {
      getFirstItem,
      getItem,
      getItems,
      getLastItem,
      registerItem: registerCollectionItem,
      updateItem: updateCollectionItem,
      unregisterItem: unregisterCollectionItem,
    } = useCollection<string, HTMLElement, TreeItemData>();
    const generatedId = useId();
    const treeId = id ?? fieldCtx?.controlId ?? `tree-${generatedId}`;
    const isDisabled = disabled ?? fieldCtx?.disabled ?? false;
    const isReadOnly = readOnly ?? fieldCtx?.readOnly ?? false;
    const isRequired = required ?? fieldCtx?.required ?? false;
    const isInvalid = invalid ?? fieldCtx?.invalid ?? false;
    const describedBy = ariaDescribedBy ?? fieldCtx?.describedBy;
    const [activeValue, setActiveValue] = useState<string | null>(null);
    const activeValueRef = useRef<string | null>(null);
    const lastActiveValueRef = useRef<string | null>(null);
    const typeaheadBufferRef = useRef("");
    const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [selectedValue, setSelectedValue] = useControllableState<TreeSelectionValue>({
      value,
      defaultValue: getDefaultTreeValue(defaultValue, multiple),
      onChange: onValueChange,
    });
    const [expandedValues, setExpandedValues] = useControllableState<string[]>({
      value: expandedValue,
      defaultValue: defaultExpandedValue,
      onChange: onExpandedValueChange,
    });
    const expandedValuesRef = useRef(expandedValues);
    expandedValuesRef.current = expandedValues;
    const selectedValues = useMemo(
      () => normalizeSelectedValues(selectedValue),
      [selectedValue],
    );

    useEffect(() => {
      activeValueRef.current = activeValue;
      if (activeValue) {
        lastActiveValueRef.current = activeValue;
      }
    }, [activeValue]);

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

    const getVisibleItems = useCallback(() => {
      const items = getItems();
      const isVisible = createVisibilityPredicate(items, expandedValues);
      return items.filter(isVisible);
    }, [expandedValues, getItems]);

    const getEnabledVisibleItems = useCallback(() => {
      return getVisibleItems().filter((item) => !item.disabled);
    }, [getVisibleItems]);

    useEffect(() => {
      if (!activeValue) return;
      const visibleItems = getVisibleItems();
      if (visibleItems.some((item) => item.value === activeValue)) return;

      let parentValue = getItem(activeValue)?.data.parentValue ?? null;
      while (parentValue) {
        if (visibleItems.some((item) => item.value === parentValue)) {
          setActiveValue(parentValue);
          return;
        }
        parentValue = getItem(parentValue)?.data.parentValue ?? null;
      }

      setActiveValue(null);
    }, [activeValue, getItem, getVisibleItems]);

    const isValueSelected = useCallback(
      (nextValue: string) => selectedValues.includes(nextValue),
      [selectedValues],
    );

    const isValueExpanded = useCallback(
      (nextValue: string) => expandedValues.includes(nextValue),
      [expandedValues],
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

    const expandValue = useCallback(
      (nextValue: string) => {
        const currentValues = expandedValuesRef.current;
        if (currentValues.includes(nextValue)) return;
        const nextValues = [...currentValues, nextValue];
        expandedValuesRef.current = nextValues;
        setExpandedValues(nextValues);
      },
      [setExpandedValues],
    );

    const collapseValue = useCallback(
      (nextValue: string) => {
        const currentValues = expandedValuesRef.current;
        if (!currentValues.includes(nextValue)) return;
        const nextValues = currentValues.filter((itemValue) => itemValue !== nextValue);
        expandedValuesRef.current = nextValues;
        setExpandedValues(nextValues);
      },
      [setExpandedValues],
    );

    const toggleExpandedValue = useCallback(
      (nextValue: string) => {
        const currentValues = expandedValuesRef.current;
        const nextValues = currentValues.includes(nextValue)
          ? currentValues.filter((itemValue) => itemValue !== nextValue)
          : [...currentValues, nextValue];
        expandedValuesRef.current = nextValues;
        setExpandedValues(nextValues);
      },
      [setExpandedValues],
    );

    const registerItem = useCallback(
      (
        itemValue: string,
        element: HTMLElement,
        data: TreeItemData,
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
        data: TreeItemData,
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
        setActiveValue(nextValue);
        if (!nextValue) return;
        getItem(nextValue)?.element.scrollIntoView({ block: "nearest" });
      },
      [getItem],
    );

    const moveFocus = useCallback(
      (direction: "next" | "previous") => {
        const enabledItems = getEnabledVisibleItems();
        if (enabledItems.length === 0) return;

        const currentIndex = activeValue
          ? enabledItems.findIndex((item) => item.value === activeValue)
          : -1;
        let nextIndex = currentIndex === -1
          ? direction === "next" ? 0 : enabledItems.length - 1
          : currentIndex + (direction === "next" ? 1 : -1);

        if (loop) {
          nextIndex = ((nextIndex % enabledItems.length) + enabledItems.length) % enabledItems.length;
        }

        const nextItem = enabledItems[nextIndex];
        if (nextItem) focusValue(nextItem.value);
      },
      [activeValue, focusValue, getEnabledVisibleItems, loop],
    );

    const focusFirstChild = useCallback(
      (itemValue: string) => {
        const childItem = getEnabledVisibleItems().find(
          (item) => item.data.parentValue === itemValue,
        );
        if (childItem) focusValue(childItem.value);
      },
      [focusValue, getEnabledVisibleItems],
    );

    const focusParent = useCallback(
      (itemValue: string) => {
        const parentValue = getItem(itemValue)?.data.parentValue;
        if (parentValue) focusValue(parentValue);
      },
      [focusValue, getItem],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
      (event) => {
        if (isDisabled) return;

        const navigationAction = getTreeNavigationAction(orientation, event.key, dir);

        if (navigationAction === "next") {
          event.preventDefault();
          moveFocus("next");
          return;
        }

        if (navigationAction === "previous") {
          event.preventDefault();
          moveFocus("previous");
          return;
        }

        if (navigationAction === "expand-or-child") {
          if (activeValue) {
            const item = getItem(activeValue);
            if (item?.data.expandable) {
              event.preventDefault();
              if (!expandedValues.includes(activeValue)) {
                expandValue(activeValue);
                return;
              }
              focusFirstChild(activeValue);
              return;
            }
          }
        }

        if (navigationAction === "collapse-or-parent") {
          if (activeValue) {
            const item = getItem(activeValue);
            if (item?.data.expandable && expandedValues.includes(activeValue)) {
              event.preventDefault();
              collapseValue(activeValue);
              return;
            }
            if (item?.data.parentValue) {
              event.preventDefault();
              focusParent(activeValue);
              return;
            }
          }
        }

        switch (event.key) {
          case "Home": {
            event.preventDefault();
            const firstItem = getVisibleItems()[0] ?? getFirstItem(true);
            if (firstItem) focusValue(firstItem.value);
            return;
          }
          case "End": {
            event.preventDefault();
            const visibleItems = getVisibleItems();
            const lastItem = visibleItems[visibleItems.length - 1] ?? getLastItem(true);
            if (lastItem) focusValue(lastItem.value);
            return;
          }
          case "Enter":
          case " ": {
            if (!activeValue || isReadOnly) return;
            event.preventDefault();
            selectValue(activeValue);
            if (getItem(activeValue)?.data.expandable) {
              toggleExpandedValue(activeValue);
            }
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

          const match = getTreeTypeaheadMatch(
            getEnabledVisibleItems(),
            typeaheadBufferRef.current,
            activeValue,
          );
          if (match) {
            event.preventDefault();
            focusValue(match);
          }
        }
      },
      [
        activeValue,
        collapseValue,
        dir,
        expandValue,
        expandedValues,
        focusFirstChild,
        focusParent,
        focusValue,
        getEnabledVisibleItems,
        getFirstItem,
        getItem,
        getLastItem,
        getVisibleItems,
        isDisabled,
        isReadOnly,
        moveFocus,
        orientation,
        selectValue,
        toggleExpandedValue,
      ],
    );

    const handleFocus = useCallback<FocusEventHandler<HTMLElement>>(() => {
      if (activeValue) return;
      const visibleItems = getVisibleItems();
      const lastActiveItem = lastActiveValueRef.current
        ? visibleItems.find((item) => item.value === lastActiveValueRef.current)
        : undefined;
      if (lastActiveItem) {
        focusValue(lastActiveItem.value);
        return;
      }
      const firstItem = getEnabledVisibleItems()[0] ?? getVisibleItems()[0] ?? null;
      if (firstItem) focusValue(firstItem.value);
    }, [activeValue, focusValue, getEnabledVisibleItems, getVisibleItems]);

    const handleBlur = useCallback<FocusEventHandler<HTMLElement>>((event) => {
      const nextTarget = event.relatedTarget;
      if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
        if (activeValueRef.current) {
          lastActiveValueRef.current = activeValueRef.current;
        }
        setActiveValue(null);
      }
    }, []);

    const contextValue = useMemo<TreeContextValue>(
      () => ({
        value: selectedValue,
        selectedValues,
        multiple,
        expandedValues,
        activeValue,
        setActiveValue: focusValue,
        selectValue,
        toggleExpandedValue,
        expandValue,
        collapseValue,
        isValueSelected,
        isValueExpanded,
        treeId,
        treeRef,
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
        getVisibleItems,
        getEnabledVisibleItems,
        getItemId,
      }),
      [
        activeValue,
        collapseValue,
        expandValue,
        expandedValues,
        focusValue,
        getEnabledVisibleItems,
        getItem,
        getItemId,
        getItems,
        getVisibleItems,
        isDisabled,
        isInvalid,
        isReadOnly,
        isRequired,
        isValueExpanded,
        isValueSelected,
        loop,
        multiple,
        orientation,
        registerItem,
        selectValue,
        selectedValue,
        selectedValues,
        toggleExpandedValue,
        treeId,
        unregisterItem,
        updateItem,
      ],
    );

    const activeDescendant = activeValue ? getItemId(activeValue) : undefined;
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: treeId,
      dir,
      role: "tree",
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
      ...(activeValue && { "data-active": "" }),
      ...(isDisabled && { "data-disabled": "" }),
      ...(isReadOnly && { "data-readonly": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      ...(multiple && { "data-multiple": "" }),
      onBlur: composeEventHandlers(onBlur, handleBlur),
      onFocus: composeEventHandlers(onFocus, handleFocus),
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
      <TreeContextProvider value={contextValue}>
        <TreeBranchContextProvider value={{ parentValue: null, level: 1 }}>
          {asChild
            ? cloneAndMerge(children, behaviorProps)
            : renderElement(render, "div", { ...behaviorProps, children })}
        </TreeBranchContextProvider>
        {hiddenInputs}
      </TreeContextProvider>
    );
  },
);
