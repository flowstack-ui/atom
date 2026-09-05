"use client";

import {
  DataGridBody,
  DataGridCaption,
  DataGridCell,
  DataGridColumn,
  DataGridColumnGroup,
  DataGridColumnHeader,
  DataGridFooter,
  DataGridHeader,
  DataGridRoot,
  DataGridRow,
} from "./primitives/data-grid/index.js";

export {
  DataGridBody,
  DataGridCaption,
  DataGridCell,
  DataGridColumn,
  DataGridColumnGroup,
  DataGridColumnHeader,
  DataGridContextProvider,
  DataGridFooter,
  DataGridHeader,
  DataGridRoot,
  DataGridRow,
  DataGridRowContextProvider,
  useDataGridContext,
  useDataGridRowContext,
} from "./primitives/data-grid/index.js";
export type {
  DataGridBodyProps,
  DataGridCaptionProps,
  DataGridCellCoordinates,
  DataGridCellData,
  DataGridCellProps,
  DataGridColumnGroupProps,
  DataGridColumnProps,
  DataGridColumnHeaderProps,
  DataGridContextValue,
  DataGridFooterProps,
  DataGridHeaderProps,
  DataGridRootProps,
  DataGridRowContextValue,
  DataGridRowProps,
  DataGridSelectionMode,
  DataGridSelectionValue,
  DataGridSortDirection,
} from "./primitives/data-grid/index.js";

export const DataGrid = {
  Root: DataGridRoot,
  ColumnGroup: DataGridColumnGroup,
  Column: DataGridColumn,
  Header: DataGridHeader,
  Body: DataGridBody,
  Footer: DataGridFooter,
  Row: DataGridRow,
  ColumnHeader: DataGridColumnHeader,
  Cell: DataGridCell,
  Caption: DataGridCaption,
} as const;
