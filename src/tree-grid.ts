"use client";

import {
  TreeGridBody,
  TreeGridCaption,
  TreeGridCell,
  TreeGridColumnHeader,
  TreeGridFooter,
  TreeGridHeader,
  TreeGridRoot,
  TreeGridRow,
  TreeGridRowHeader,
} from "./primitives/tree-grid/index.js";

export {
  TreeGridBody,
  TreeGridCaption,
  TreeGridCell,
  TreeGridColumnHeader,
  TreeGridContextProvider,
  TreeGridFooter,
  TreeGridHeader,
  TreeGridRoot,
  TreeGridRow,
  TreeGridRowContextProvider,
  TreeGridRowHeader,
  useTreeGridContext,
  useTreeGridRowContext,
} from "./primitives/tree-grid/index.js";
export type {
  TreeGridBodyProps,
  TreeGridCaptionProps,
  TreeGridCellCoordinates,
  TreeGridCellData,
  TreeGridCellProps,
  TreeGridColumnHeaderProps,
  TreeGridContextValue,
  TreeGridFooterProps,
  TreeGridHeaderProps,
  TreeGridRootProps,
  TreeGridRowContextValue,
  TreeGridRowData,
  TreeGridRowEntry,
  TreeGridRowHeaderProps,
  TreeGridRowProps,
  TreeGridSelectionMode,
  TreeGridSelectionValue,
  TreeGridSortDirection,
} from "./primitives/tree-grid/index.js";

export const TreeGrid = {
  Root: TreeGridRoot,
  Header: TreeGridHeader,
  Body: TreeGridBody,
  Footer: TreeGridFooter,
  Row: TreeGridRow,
  ColumnHeader: TreeGridColumnHeader,
  RowHeader: TreeGridRowHeader,
  Cell: TreeGridCell,
  Caption: TreeGridCaption,
} as const;
