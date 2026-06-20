"use client";

import { createContext, useContext, type RefObject } from "react";
import type { CollectionItem } from "../../collection.js";

export type TreeSelectionValue = string | string[] | null;
export type TreeOrientation = "vertical" | "horizontal";

export interface TreeItemData extends Record<string, unknown> {
  id: string;
  textValue: string;
  parentValue: string | null;
  level: number;
  expandable: boolean;
}

export type TreeItemEntry = CollectionItem<string, HTMLElement, TreeItemData>;

export interface TreeContextValue {
  value: TreeSelectionValue;
  selectedValues: string[];
  multiple: boolean;
  expandedValues: string[];
  activeValue: string | null;
  setActiveValue: (value: string | null) => void;
  selectValue: (value: string) => void;
  toggleExpandedValue: (value: string) => void;
  expandValue: (value: string) => void;
  collapseValue: (value: string) => void;
  isValueSelected: (value: string) => boolean;
  isValueExpanded: (value: string) => boolean;
  treeId: string;
  treeRef: RefObject<HTMLElement | null>;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  orientation: TreeOrientation;
  loop: boolean;
  registerItem: (
    value: string,
    element: HTMLElement,
    data: TreeItemData,
    disabled?: boolean,
  ) => void;
  updateItem: (
    value: string,
    data: TreeItemData,
    disabled?: boolean,
  ) => void;
  unregisterItem: (value: string) => void;
  getItem: (value: string) => TreeItemEntry | null;
  getItems: () => TreeItemEntry[];
  getVisibleItems: () => TreeItemEntry[];
  getEnabledVisibleItems: () => TreeItemEntry[];
  getItemId: (value: string) => string | undefined;
}

const TreeContext = createContext<TreeContextValue | null>(null);
TreeContext.displayName = "TreeContext";

export const TreeContextProvider = TreeContext.Provider;

export function useTreeContext(): TreeContextValue {
  const ctx = useContext(TreeContext);
  if (!ctx) {
    throw new Error("Tree compound components must be used within <TreeRoot>");
  }
  return ctx;
}

export interface TreeItemContextValue {
  value: string;
  selected: boolean;
  active: boolean;
  expanded: boolean;
  expandable: boolean;
  disabled: boolean;
  textId: string;
  level: number;
  hasItemText: boolean;
  registerText: (textValue: string) => void;
  registerGroup: () => () => void;
}

const TreeItemContext = createContext<TreeItemContextValue | null>(null);
TreeItemContext.displayName = "TreeItemContext";

export const TreeItemContextProvider = TreeItemContext.Provider;

export function useTreeItemContext(): TreeItemContextValue {
  const ctx = useContext(TreeItemContext);
  if (!ctx) {
    throw new Error("Tree item compounds must be used within <TreeItem>");
  }
  return ctx;
}

export interface TreeBranchContextValue {
  parentValue: string | null;
  level: number;
}

const TreeBranchContext = createContext<TreeBranchContextValue>({
  parentValue: null,
  level: 1,
});
TreeBranchContext.displayName = "TreeBranchContext";

export const TreeBranchContextProvider = TreeBranchContext.Provider;

export function useTreeBranchContext(): TreeBranchContextValue {
  return useContext(TreeBranchContext);
}
