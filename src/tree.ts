"use client";

import {
  TreeGroup,
  TreeItem,
  TreeItemText,
  TreeRoot,
  TreeRootProvider,
  TreeTrigger,
  TreeCheckbox,
} from "./primitives/tree/index.js";

export {
  TreeBranchContextProvider,
  TreeContextProvider,
  TreeGroup,
  TreeItem,
  TreeItemContextProvider,
  TreeItemText,
  TreeRoot,
  TreeRootProvider,
  TreeTrigger,
  TreeCheckbox,
  useTreeBranchContext,
  useTreeContext,
  useTreeItemContext,
  createTreeCollection,
  useTreeController,
} from "./primitives/tree/index.js";
export type {
  TreeBranchContextValue,
  TreeContextValue,
  TreeGroupProps,
  TreeItemContextValue,
  TreeItemData,
  TreeItemEntry,
  TreeItemProps,
  TreeItemTextProps,
  TreeOrientation,
  TreeRootProps,
  TreeRootProviderProps,
  TreeTriggerProps,
  TreeCheckboxProps,
  TreeSelectionValue,
  TreeNode,
  TreeNodeEntry,
  TreeCollection,
  UseTreeControllerOptions,
} from "./primitives/tree/index.js";

export const Tree = {
  Root: TreeRoot,
  RootProvider: TreeRootProvider,
  Item: TreeItem,
  ItemText: TreeItemText,
  Group: TreeGroup,
  Trigger: TreeTrigger,
  Checkbox: TreeCheckbox,
} as const;
