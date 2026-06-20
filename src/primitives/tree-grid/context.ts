"use client";

import { createContext, useContext, type RefObject } from "react";
import type { CollectionItem } from "../../collection.js";

export type TreeGridSelectionMode = "none" | "single" | "multiple";
export type TreeGridSelectionValue = string | string[] | null;
export type TreeGridSortDirection = "ascending" | "descending" | "none" | "other";

export interface TreeGridCellCoordinates {
  rowIndex: number;
  columnIndex: number;
}

export interface TreeGridRowData extends Record<string, unknown> {
  id: string;
  rowIndex: number;
  value: string;
  parentValue: string | null;
  level: number;
  expandable: boolean;
  selectable: boolean;
}

export interface TreeGridCellData extends Record<string, unknown> {
  id: string;
  rowIndex: number;
  columnIndex: number;
  rowValue?: string;
}

export type TreeGridRowEntry = CollectionItem<string, HTMLElement, TreeGridRowData>;

export interface TreeGridContextValue {
  treeGridId: string;
  treeGridRef: RefObject<HTMLElement | null>;
  disabled: boolean;
  readOnly: boolean;
  focused: boolean;
  selectionMode: TreeGridSelectionMode;
  selectedValues: string[];
  expandedValues: string[];
  activeCell: TreeGridCellCoordinates | null;
  activeCellId?: string;
  registerRow: (
    value: string,
    element: HTMLElement,
    data: TreeGridRowData,
    disabled?: boolean,
  ) => void;
  updateRow: (
    value: string,
    data: TreeGridRowData,
    disabled?: boolean,
  ) => void;
  unregisterRow: (value: string) => void;
  registerCell: (
    value: string,
    element: HTMLElement,
    data: TreeGridCellData,
    disabled?: boolean,
  ) => void;
  updateCell: (
    value: string,
    data: TreeGridCellData,
    disabled?: boolean,
  ) => void;
  unregisterCell: (value: string) => void;
  getCellId: (rowIndex: number, columnIndex: number) => string | undefined;
  focusCell: (rowIndex: number, columnIndex: number) => void;
  isRowVisible: (value: string | undefined, parentValue?: string | null) => boolean;
  isRowSelected: (value: string | undefined) => boolean;
  isRowExpanded: (value: string | undefined) => boolean;
  selectRow: (value: string | undefined) => void;
  toggleExpandedRow: (value: string | undefined) => void;
  expandRow: (value: string | undefined) => void;
  collapseRow: (value: string | undefined) => void;
  selectOnRowClick: boolean;
}

export interface TreeGridRowContextValue {
  rowIndex?: number;
  value?: string;
  parentValue: string | null;
  level: number;
  expandable: boolean;
  selectable: boolean;
  expanded: boolean;
  visible: boolean;
  disabled: boolean;
  selected: boolean;
}

export const TreeGridContext = createContext<TreeGridContextValue | null>(null);
TreeGridContext.displayName = "TreeGridContext";

export const TreeGridRowContext = createContext<TreeGridRowContextValue | null>(null);
TreeGridRowContext.displayName = "TreeGridRowContext";

export const TreeGridContextProvider = TreeGridContext.Provider;
export const TreeGridRowContextProvider = TreeGridRowContext.Provider;

export function useTreeGridContext(): TreeGridContextValue {
  const context = useContext(TreeGridContext);

  if (!context) {
    throw new Error("TreeGrid compound components must be used within <TreeGridRoot>.");
  }

  return context;
}

export function useTreeGridRowContext(): TreeGridRowContextValue | null {
  return useContext(TreeGridRowContext);
}

export function getTreeGridCellValue(rowIndex: number, columnIndex: number): string {
  return `${rowIndex}:${columnIndex}`;
}

export function normalizeTreeGridIndex(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;

  const nextValue = Math.trunc(value);
  return nextValue > 0 ? nextValue : undefined;
}

export function normalizeTreeGridSelectionValue(value: TreeGridSelectionValue): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

export function getDefaultTreeGridSelectionValue(
  value: TreeGridSelectionValue | undefined,
  selectionMode: TreeGridSelectionMode,
): TreeGridSelectionValue {
  if (value !== undefined) return value;
  return selectionMode === "multiple" ? [] : null;
}
