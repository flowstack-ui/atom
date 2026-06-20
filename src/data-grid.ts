"use client";

import {
  DataGridBody,
  DataGridCaption,
  DataGridCell,
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
  Header: DataGridHeader,
  Body: DataGridBody,
  Footer: DataGridFooter,
  Row: DataGridRow,
  ColumnHeader: DataGridColumnHeader,
  Cell: DataGridCell,
  Caption: DataGridCaption,
} as const;
