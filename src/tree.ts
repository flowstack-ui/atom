"use client";

import {
  TreeGroup,
  TreeItem,
  TreeItemText,
  TreeRoot,
} from "./primitives/tree/index.js";

export {
  TreeBranchContextProvider,
  TreeContextProvider,
  TreeGroup,
  TreeItem,
  TreeItemContextProvider,
  TreeItemText,
  TreeRoot,
  useTreeBranchContext,
  useTreeContext,
  useTreeItemContext,
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
  TreeSelectionValue,
} from "./primitives/tree/index.js";

export const Tree = {
  Root: TreeRoot,
  Item: TreeItem,
  ItemText: TreeItemText,
  Group: TreeGroup,
} as const;
