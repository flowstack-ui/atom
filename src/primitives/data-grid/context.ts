"use client";

import { createContext, useContext, type RefObject } from "react";

export type DataGridSelectionMode = "none" | "single" | "multiple";
export type DataGridSelectionValue = string | string[] | null;
export type DataGridSortDirection = "ascending" | "descending" | "none" | "other";

export interface DataGridCellCoordinates {
  rowIndex: number;
  columnIndex: number;
}

export interface DataGridCellData extends Record<string, unknown> {
  id: string;
  rowIndex: number;
  columnIndex: number;
  rowValue?: string;
}

export interface DataGridContextValue {
  gridId: string;
  gridRef: RefObject<HTMLElement | null>;
  disabled: boolean;
  readOnly: boolean;
  selectionMode: DataGridSelectionMode;
  selectedValues: string[];
  activeCell: DataGridCellCoordinates | null;
  activeCellId?: string;
  focused: boolean;
  setActiveCell: (cell: DataGridCellCoordinates | null) => void;
  registerCell: (
    value: string,
    element: HTMLElement,
    data: DataGridCellData,
    disabled?: boolean,
  ) => void;
  updateCell: (
    value: string,
    data: DataGridCellData,
    disabled?: boolean,
  ) => void;
  unregisterCell: (value: string) => void;
  getCellId: (rowIndex: number, columnIndex: number) => string | undefined;
  focusCell: (rowIndex: number, columnIndex: number) => void;
  isRowSelected: (value: string | undefined) => boolean;
  selectRow: (value: string | undefined) => void;
  selectOnRowClick: boolean;
}

export interface DataGridRowContextValue {
  rowIndex?: number;
  value?: string;
  disabled: boolean;
  selected: boolean;
}

export const DataGridContext = createContext<DataGridContextValue | null>(null);
DataGridContext.displayName = "DataGridContext";

export const DataGridRowContext = createContext<DataGridRowContextValue | null>(null);
DataGridRowContext.displayName = "DataGridRowContext";

export const DataGridContextProvider = DataGridContext.Provider;
export const DataGridRowContextProvider = DataGridRowContext.Provider;

export function useDataGridContext(): DataGridContextValue {
  const context = useContext(DataGridContext);

  if (!context) {
    throw new Error("DataGrid compound components must be used within <DataGridRoot>.");
  }

  return context;
}

export function useDataGridRowContext(): DataGridRowContextValue | null {
  return useContext(DataGridRowContext);
}

export function getDataGridCellValue(rowIndex: number, columnIndex: number): string {
  return `${rowIndex}:${columnIndex}`;
}

export function normalizeDataGridIndex(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;

  const nextValue = Math.trunc(value);
  return nextValue > 0 ? nextValue : undefined;
}

export function normalizeDataGridSelectionValue(value: DataGridSelectionValue): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

export function getDefaultDataGridSelectionValue(
  value: DataGridSelectionValue | undefined,
  selectionMode: DataGridSelectionMode,
): DataGridSelectionValue {
  if (value !== undefined) return value;
  return selectionMode === "multiple" ? [] : null;
}
