"use client";

import { useMemo } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { TreeRootProps } from "./TreeRoot.js";
import type { TreeCollection, TreeNode } from "./collection.js";

export interface UseTreeControllerOptions<T extends TreeNode = TreeNode> extends TreeRootProps {
  collection: TreeCollection<T>;
}

/** Own state outside Root without exposing an untyped internal context provider. */
export function useTreeController<T extends TreeNode>(options: UseTreeControllerOptions<T>) {
  const { collection, value: controlledValue, defaultValue, onValueChange,
    expandedValue: controlledExpanded, defaultExpandedValue, onExpandedValueChange,
    focusedValue: controlledFocus, defaultFocusedValue, onFocusedValueChange,
    checkedValue: controlledChecked, defaultCheckedValue, onCheckedValueChange, ...rest } = options;
  const [value, setValue] = useControllableState({ value: controlledValue,
    defaultValue: defaultValue ?? (rest.multiple || rest.selectionMode === "multiple" ? [] : null), onChange: onValueChange });
  const [expandedValue, setExpandedValue] = useControllableState({ value: controlledExpanded,
    defaultValue: defaultExpandedValue ?? [], onChange: onExpandedValueChange });
  const [focusedValue, setFocusedValue] = useControllableState({ value: controlledFocus,
    defaultValue: defaultFocusedValue ?? null, onChange: onFocusedValueChange });
  const [checkedValue, setCheckedValue] = useControllableState({ value: controlledChecked,
    defaultValue: defaultCheckedValue ?? [], onChange: onCheckedValueChange });
  return useMemo(() => {
    const rootProps: TreeRootProps = { ...rest, collection, value, onValueChange: setValue,
      expandedValue, onExpandedValueChange: setExpandedValue, focusedValue, onFocusedValueChange: setFocusedValue,
      checkedValue, onCheckedValueChange: setCheckedValue };
    return {
    collection, value, expandedValue, focusedValue, checkedValue, setValue, setExpandedValue, setFocusedValue, setCheckedValue,
    getNodeState(nodeValue: string) {
      return { node: collection.find(nodeValue)?.node, focused: focusedValue === nodeValue,
        selected: Array.isArray(value) ? value.includes(nodeValue) : value === nodeValue,
        expanded: expandedValue.includes(nodeValue), checked: checkedValue.includes(nodeValue) };
    },
    expandAll() {
      if (rest.disabled || rest.readOnly) return;
      setExpandedValue(collection.entries.filter(({ node }) => !node.disabled && (node.expandable || node.children?.length)).map(entry => entry.value));
    },
    collapseAll() { if (!rest.disabled && !rest.readOnly) setExpandedValue([]); },
    rootProps,
  }; }, [collection, value, expandedValue, focusedValue, checkedValue, setValue, setExpandedValue, setFocusedValue, setCheckedValue, rest]);
}
