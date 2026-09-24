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
import type { TreeCollection } from "./collection.js";
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
  focusedValue?: string | null;
  defaultFocusedValue?: string | null;
  onFocusedValueChange?: (value: string | null) => void;
  /** Leave selection untouched while retaining tree navigation and expansion. */
  selectionMode?: "none" | "single" | "multiple";
  /** Disable row-click expansion when composing a separate disclosure trigger. */
  expandOnClick?: boolean;
  /** Complete logical collection for operations involving collapsed descendants. */
  collection?: TreeCollection;
  checkable?: boolean;
  checkedValue?: string[];
  defaultCheckedValue?: string[];
  onCheckedValueChange?: (value: string[]) => void;
  checkPropagation?: "none" | "descendants";
  /** Resolve after the application has supplied children; Atom owns request lifetime, not records. */
  loadChildren?: (value: string, options: { signal: AbortSignal }) => Promise<void>;
  onLoadError?: (value: string, error: unknown) => void;
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

export function getTreeInitialActiveValue(
  visibleItems: TreeItemEntry[],
  selectedValues: string[],
): string | null {
  const selectedSet = new Set(selectedValues);
  const selectedItem = visibleItems.find(
    (item) => !item.disabled && selectedSet.has(item.value),
  );
  if (selectedItem) return selectedItem.value;

  return visibleItems.find((item) => !item.disabled)?.value ?? null;
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
      focusedValue,
      defaultFocusedValue = null,
      onFocusedValueChange,
      selectionMode,
      expandOnClick = true,
      collection,
      checkable = false,
      checkedValue,
      defaultCheckedValue = [],
      onCheckedValueChange,
      checkPropagation = "none",
      loadChildren,
      onLoadError,
      multiple: multipleProp = false,
      disabled,
      readOnly,
      required,
      invalid,
      orientation = "vertical",
      dir: dirProp,
      loop = false,
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
    const [interacting, setInteracting] = useState(false);
    const [loadingValues, setLoadingValues] = useState<string[]>([]);
    const [loadErrors, setLoadErrors] = useState<Record<string, unknown>>({});
    const requests = useRef(new Map<string, AbortController>());
    const loaded = useRef(new Set<string>());
    const loader = useRef({ loadChildren, onLoadError });
    loader.current = { loadChildren, onLoadError };
    const multiple = selectionMode ? selectionMode === "multiple" : multipleProp;
    const composedRef = useMemo(() => composeRefs(treeRef, ref), [ref]);
    const {
      version: collectionVersion,
      getItem,
      getItems,
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
    const [activeValue, setActiveValue] = useControllableState<string | null>({
      value: focusedValue,
      defaultValue: defaultFocusedValue,
      onChange: onFocusedValueChange,
    });
    const previousItemsRef = useRef<TreeItemEntry[]>([]);
    const recoveryRequest = useRef<string | null>(null);
    const selectionAnchor = useRef<string | null>(null);
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
    const [checkedValues, setCheckedValues] = useControllableState<string[]>({
      value: checkedValue, defaultValue: defaultCheckedValue, onChange: onCheckedValueChange,
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

    const getCheckTargets = useCallback((value: string) => {
      if (checkPropagation === "none") return [value];
      const nodes = collection?.entries.map(entry => ({ value: entry.value, parent: entry.parentValue, disabled: entry.node.disabled }))
        ?? getItems().map(item => ({ value: item.value, parent: item.data.parentValue, disabled: item.disabled }));
      const target = nodes.find(node => node.value === value);
      if (!target || target.disabled) return [value];
      const included = new Set([value]);
      // Logical collections are preorder, but mounted DOM registration order is not assumed.
      let changed = true;
      while (changed) {
        changed = false;
        for (const node of nodes) {
          if (!node.disabled && node.parent && included.has(node.parent) && !included.has(node.value)) {
            included.add(node.value); changed = true;
          }
        }
      }
      const leaves = nodes.filter(node => included.has(node.value) && !nodes.some(child => !child.disabled && child.parent === node.value));
      return leaves.map(node => node.value);
    }, [checkPropagation, collection, getItems]);
    const getCheckedState = useCallback((value: string): boolean | "mixed" => {
      const targets = getCheckTargets(value);
      const count = targets.filter(target => checkedValues.includes(target)).length;
      return count === 0 ? false : count === targets.length ? true : "mixed";
    }, [checkedValues, getCheckTargets]);
    const toggleChecked = useCallback((value: string) => {
      if (!checkable || isDisabled || isReadOnly) return;
      if (!getItem(value) && !collection?.find(value)) return;
      if (getItem(value)?.disabled || collection?.find(value)?.node.disabled) return;
      const targets = getCheckTargets(value);
      if (!targets.length) return;
      setCheckedValues(current => targets.every(target => current.includes(target))
        ? current.filter(target => !targets.includes(target))
        : [...new Set([...current, ...targets])]);
    }, [checkable, isDisabled, isReadOnly, getCheckTargets, getItem, collection, setCheckedValues]);

    useEffect(() => () => {
      for (const request of requests.current.values()) request.abort();
      requests.current.clear();
    }, []);
    useEffect(() => {
      if (!collection) return;
      for (const [value, request] of requests.current) {
        if (!collection.find(value)) { request.abort(); requests.current.delete(value); loaded.current.delete(value); }
      }
      for (const value of loaded.current) if (!collection.find(value)) loaded.current.delete(value);
      setLoadingValues(current => current.filter(value => collection.find(value)));
      setLoadErrors(current => Object.fromEntries(Object.entries(current).filter(([value]) => collection.find(value))));
    }, [collection]);
    const requestChildren = useCallback((value: string, retry = false) => {
      const load = loader.current.loadChildren;
      if (!load || isDisabled || getItem(value)?.disabled || requests.current.has(value) || (!retry && loaded.current.has(value))) return;
      const logical = collection?.find(value)?.node;
      const mounted = getItem(value);
      if ((!mounted && !logical) || logical?.disabled || !(mounted?.data.expandable || logical?.expandable || logical?.children?.length)) return;
      if (!retry && (logical?.children !== undefined || getItems().some(item => item.data.parentValue === value))) return;
      const controller = new AbortController();
      requests.current.set(value, controller);
      setLoadingValues(current => [...current, value]);
      setLoadErrors(current => { const next = { ...current }; delete next[value]; return next; });
      Promise.resolve().then(() => controller.signal.aborted ? undefined : load(value, { signal: controller.signal })).then(() => {
        if (!controller.signal.aborted) loaded.current.add(value);
      }).catch(error => {
        if (controller.signal.aborted) return;
        setLoadErrors(current => ({ ...current, [value]: error }));
        loader.current.onLoadError?.(value, error);
      }).finally(() => {
        if (controller.signal.aborted || requests.current.get(value) !== controller) return;
        requests.current.delete(value);
        setLoadingValues(current => current.filter(item => item !== value));
      });
    }, [collection, getItem, getItems, isDisabled]);
    const retryLoad = useCallback((value: string) => requestChildren(value, true), [requestChildren]);

    useEffect(() => {
      const previousItems = previousItemsRef.current;
      previousItemsRef.current = getItems();
      if (!activeValue) return;
      const visibleItems = getEnabledVisibleItems();
      if (visibleItems.some((item) => item.value === activeValue)) {
        recoveryRequest.current = null;
        return;
      }
      const request = (next: string | null) => {
        const key = `${activeValue}->${next}`;
        if (recoveryRequest.current === key) return;
        recoveryRequest.current = key;
        setActiveValue(next);
      };

      const previousMap = new Map(previousItems.map(item => [item.value, item]));
      let parentValue = (getItem(activeValue) ?? previousMap.get(activeValue))?.data.parentValue ?? null;
      const visited = new Set<string>();
      while (parentValue && !visited.has(parentValue)) {
        visited.add(parentValue);
        if (visibleItems.some((item) => item.value === parentValue)) {
          request(parentValue);
          return;
        }
        parentValue = (getItem(parentValue) ?? previousMap.get(parentValue))?.data.parentValue ?? null;
      }

      request(visibleItems[0]?.value ?? null);
    }, [activeValue, collectionVersion, getItem, getItems, getEnabledVisibleItems, setActiveValue]);

    const isValueSelected = useCallback(
      (nextValue: string) => selectedValues.includes(nextValue),
      [selectedValues],
    );

    const isValueExpanded = useCallback(
      (nextValue: string) => expandedValues.includes(nextValue),
      [expandedValues],
    );

    useEffect(() => {
      for (const value of expandedValues) {
        if (!Object.prototype.hasOwnProperty.call(loadErrors, value)) requestChildren(value);
      }
    }, [expandedValues, requestChildren, loadErrors]);

    const selectValue = useCallback(
      (nextValue: string, range = false, additive = false) => {
        if (isDisabled || isReadOnly || selectionMode === "none" || !getItem(nextValue) || getItem(nextValue)?.disabled || getItem(nextValue)?.data.selectable === false) return;

        if (multiple) {
          const items = getEnabledVisibleItems().filter(item => item.data.selectable !== false);
          const from = items.findIndex(item => item.value === selectionAnchor.current);
          const to = items.findIndex(item => item.value === nextValue);
          if (range && from >= 0 && to >= 0) {
            setSelectedValue(items.slice(Math.min(from, to), Math.max(from, to) + 1).map(item => item.value));
            return;
          }
          selectionAnchor.current = nextValue;
          if (!additive) {
            setSelectedValue([nextValue]);
            return;
          }
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
      [isDisabled, isReadOnly, multiple, selectionMode, getItem, getEnabledVisibleItems, setSelectedValue],
    );

    const expandValue = useCallback(
      (nextValue: string) => {
        if (isDisabled || getItem(nextValue)?.disabled || !getItem(nextValue)?.data.expandable) return;
        const currentValues = expandedValuesRef.current;
        if (currentValues.includes(nextValue)) return;
        const nextValues = [...currentValues, nextValue];
        setExpandedValues(nextValues);
      },
      [isDisabled, getItem, setExpandedValues],
    );

    const collapseValue = useCallback(
      (nextValue: string) => {
        if (isDisabled || getItem(nextValue)?.disabled || !getItem(nextValue)?.data.expandable) return;
        const currentValues = expandedValuesRef.current;
        if (!currentValues.includes(nextValue)) return;
        const nextValues = currentValues.filter((itemValue) => itemValue !== nextValue);
        setExpandedValues(nextValues);
      },
      [isDisabled, getItem, setExpandedValues],
    );

    const toggleExpandedValue = useCallback(
      (nextValue: string) => {
        if (isDisabled || isReadOnly || getItem(nextValue)?.disabled || !getItem(nextValue)?.data.expandable) return;
        const currentValues = expandedValuesRef.current;
        const nextValues = currentValues.includes(nextValue)
          ? currentValues.filter((itemValue) => itemValue !== nextValue)
          : [...currentValues, nextValue];
        setExpandedValues(nextValues);
      },
      [isDisabled, isReadOnly, getItem, setExpandedValues],
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
        if (nextValue && (isDisabled || !getEnabledVisibleItems().some(item => item.value === nextValue))) return;
        setActiveValue(nextValue);
        if (!nextValue) return;
        getItem(nextValue)?.element.scrollIntoView({ block: "nearest" });
      },
      [getItem, getEnabledVisibleItems, isDisabled, setActiveValue],
    );

    const moveFocus = useCallback(
      (direction: "next" | "previous", range = false) => {
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
        if (nextItem) {
          if (range && multiple) {
            if (!selectionAnchor.current) selectionAnchor.current = activeValue ?? nextItem.value;
            selectValue(nextItem.value, true);
          }
          focusValue(nextItem.value);
        }
      },
      [activeValue, focusValue, getEnabledVisibleItems, loop, multiple, selectValue],
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
        if (isDisabled || event.nativeEvent.isComposing || event.target !== event.currentTarget) return;
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a" && multiple && !isReadOnly) {
          event.preventDefault();
          const values = getEnabledVisibleItems().filter(item => item.data.selectable !== false).map(item => item.value);
          setSelectedValue(current => {
            const existing = normalizeSelectedValues(current);
            return values.every(value => existing.includes(value))
              ? existing.filter(value => !values.includes(value))
              : [...new Set([...existing, ...values])];
          });
          return;
        }

        const navigationAction = getTreeNavigationAction(orientation, event.key, dir);

        if (navigationAction === "next") {
          event.preventDefault();
          moveFocus("next", event.shiftKey);
          return;
        }

        if (navigationAction === "previous") {
          event.preventDefault();
          moveFocus("previous", event.shiftKey);
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
            const firstItem = getEnabledVisibleItems()[0];
            if (firstItem) {
              if (event.shiftKey && multiple) {
                if (!selectionAnchor.current) selectionAnchor.current = activeValue ?? firstItem.value;
                selectValue(firstItem.value, true);
              }
              focusValue(firstItem.value);
            }
            return;
          }
          case "End": {
            event.preventDefault();
            const visibleItems = getEnabledVisibleItems();
            const lastItem = visibleItems[visibleItems.length - 1];
            if (lastItem) {
              if (event.shiftKey && multiple) {
                if (!selectionAnchor.current) selectionAnchor.current = activeValue ?? lastItem.value;
                selectValue(lastItem.value, true);
              }
              focusValue(lastItem.value);
            }
            return;
          }
          case "F2":
          case "Enter":
          case " ": {
            if (!activeValue) return;
            if ((event.key === "Enter" || event.key === "F2") && getItem(activeValue)?.data.enterInteraction?.()) { event.preventDefault(); return; }
            if (event.key === "F2" || isReadOnly) return;
            event.preventDefault();
            if (event.key === " " && checkable) { toggleChecked(activeValue); return; }
            selectValue(activeValue, event.shiftKey, event.ctrlKey || event.metaKey || event.key === " ");
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
        getItem,
        getVisibleItems,
        isDisabled,
        isReadOnly,
        moveFocus,
        multiple,
        setSelectedValue,
        orientation,
        selectValue,
        toggleExpandedValue,
        checkable,
        toggleChecked,
        loadingValues,
        loadErrors,
        retryLoad,
      ],
    );

    const handleFocus = useCallback<FocusEventHandler<HTMLElement>>((event) => {
      setInteracting(event.target !== event.currentTarget);
      // A pointer can focus an embedded control before its click. Scrolling the
      // branch here moves that control out from under pointerup on narrow screens.
      if (event.target !== event.currentTarget) return;
      if (activeValue) return;
      const visibleItems = getEnabledVisibleItems();
      const lastActiveItem = lastActiveValueRef.current
        ? visibleItems.find((item) => item.value === lastActiveValueRef.current)
        : undefined;
      if (lastActiveItem) {
        focusValue(lastActiveItem.value);
        return;
      }
      const initialValue = getTreeInitialActiveValue(visibleItems, selectedValues);
      if (initialValue) focusValue(initialValue);
    }, [activeValue, focusValue, getEnabledVisibleItems, selectedValues]);

    const handleBlur = useCallback<FocusEventHandler<HTMLElement>>((event) => {
      const nextTarget = event.relatedTarget;
      if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
        setInteracting(false);
        if (activeValueRef.current) {
          lastActiveValueRef.current = activeValueRef.current;
        }
        setActiveValue(null);
      }
    }, [setActiveValue]);

    const contextValue = useMemo<TreeContextValue>(
      () => ({
        value: selectedValue,
        selectedValues,
        multiple,
        selectionMode: selectionMode ?? (multiple ? "multiple" : "single"),
        expandOnClick,
        checkable,
        checkedValues,
        getCheckedState,
        toggleChecked,
        loadingValues,
        loadErrors,
        retryLoad,
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
        selectionMode,
        expandOnClick,
        checkable,
        checkedValues,
        getCheckedState,
        toggleChecked,
        orientation,
        loadingValues,
        loadErrors,
        retryLoad,
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
      "aria-activedescendant": interacting ? undefined : activeDescendant,
      "data-interacting": interacting ? "" : undefined,
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
