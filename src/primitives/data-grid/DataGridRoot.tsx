"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeTableProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  DataGridContextProvider,
  getDataGridCellValue,
  getDefaultDataGridSelectionValue,
  normalizeDataGridSelectionValue,
  type DataGridCellCoordinates,
  type DataGridCellData,
  type DataGridContextValue,
  type DataGridRowData,
  type DataGridSelectionMode,
  type DataGridSelectionValue,
} from "./context.js";

type DataGridRootNativeProps = NativeTableProps<
  | "children"
  | "defaultValue"
  | "dir"
  | "onChange"
  | "onKeyDown"
  | "role"
  | "aria-activedescendant"
  | "aria-colcount"
  | "aria-disabled"
  | "aria-multiselectable"
  | "aria-readonly"
  | "aria-rowcount"
>;

export interface DataGridRootProps extends DataGridRootNativeProps {
  children?: ReactNode;
  value?: DataGridSelectionValue;
  defaultValue?: DataGridSelectionValue;
  onValueChange?: (value: DataGridSelectionValue) => void;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  activeCell?: DataGridCellCoordinates | null;
  defaultActiveCell?: DataGridCellCoordinates | null;
  onActiveCellChange?: (cell: DataGridCellCoordinates | null) => void;
  selectionMode?: DataGridSelectionMode;
  dir?: DirectionValue;
  disabled?: boolean;
  readOnly?: boolean;
  loop?: boolean;
  wrapRows?: boolean;
  rowCount?: number;
  columnCount?: number;
  selectOnRowClick?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function getCellsByRow(
  cells: { value: string; disabled: boolean; data: DataGridCellData }[],
) {
  const rows = new Map<number, { value: string; disabled: boolean; data: DataGridCellData }[]>();

  for (const cell of cells) {
    const row = rows.get(cell.data.rowIndex) ?? [];
    row.push(cell);
    rows.set(cell.data.rowIndex, row);
  }

  for (const row of rows.values()) {
    row.sort((first, second) => first.data.columnIndex - second.data.columnIndex);
  }

  return rows;
}

function getClosestColumnCell(
  row: { value: string; disabled: boolean; data: DataGridCellData }[],
  columnIndex: number,
) {
  return row.reduce<typeof row[number] | null>((closest, cell) => {
    if (!closest) return cell;
    const currentDistance = Math.abs(cell.data.columnIndex - columnIndex);
    const closestDistance = Math.abs(closest.data.columnIndex - columnIndex);
    return currentDistance < closestDistance ? cell : closest;
  }, null);
}

function normalizeDataGridCount(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;

  const nextValue = Math.trunc(value);
  return nextValue > 0 ? nextValue : undefined;
}

export function getDataGridNavigationDirection(
  key: string,
  dir: DirectionValue = "ltr",
): "up" | "down" | "left" | "right" | null {
  switch (key) {
    case "ArrowRight":
      return dir === "rtl" ? "left" : "right";
    case "ArrowLeft":
      return dir === "rtl" ? "right" : "left";
    case "ArrowDown":
      return "down";
    case "ArrowUp":
      return "up";
    default:
      return null;
  }
}

export const DataGridRoot = forwardRef<HTMLElement, DataGridRootProps>(
  function DataGridRoot(
    {
      children,
      value,
      defaultValue,
      onValueChange,
      activeCell: activeCellProp,
      defaultActiveCell = null,
      onActiveCellChange,
      selectionMode = "none",
      dir: dirProp,
      disabled = false,
      readOnly = false,
      loop = false,
      wrapRows = false,
      rowCount,
      columnCount,
      selectOnRowClick = false,
      render,
      asChild,
      tabIndex,
      onKeyDown,
      "data-slot": dataSlot = "data-grid",
      ...restProps
    },
    ref,
  ) {
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const generatedId = useId();
    const gridId = restProps.id ?? `data-grid-${generatedId}`;
    const gridRef = useRef<HTMLElement | null>(null);
    const [focused, setFocused] = useState(false);
    const composedRef = useMemo(() => composeRefs(gridRef, ref), [ref]);
    const {
      getItem: getRow,
      registerItem: registerCollectionRow,
      updateItem: updateCollectionRow,
      unregisterItem: unregisterCollectionRow,
    } = useCollection<string, HTMLElement, DataGridRowData>();
    const {
      getItems,
      getItem,
      registerItem: registerCollectionCell,
      updateItem: updateCollectionCell,
      unregisterItem: unregisterCollectionCell,
    } = useCollection<string, HTMLElement, DataGridCellData>();
    const [selectedValue, setSelectedValue] = useControllableState<DataGridSelectionValue>({
      value,
      defaultValue: getDefaultDataGridSelectionValue(defaultValue, selectionMode),
      onChange: onValueChange,
    });
    const [activeCell, setResolvedActiveCell] = useControllableState<DataGridCellCoordinates | null>({
      value: activeCellProp,
      defaultValue: defaultActiveCell,
      onChange: onActiveCellChange,
    });
    const selectedValues = useMemo(
      () => normalizeDataGridSelectionValue(selectedValue),
      [selectedValue],
    );
    const resolvedColumnCount = normalizeDataGridCount(columnCount);
    const resolvedRowCount = normalizeDataGridCount(rowCount);

    useEffect(() => {
      const grid = gridRef.current;
      if (!grid) return undefined;

      const handleFocusIn = () => setFocused(true);
      const handleFocusOut = (event: FocusEvent) => {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && grid.contains(nextTarget)) return;
        setFocused(false);
      };

      grid.addEventListener("focusin", handleFocusIn);
      grid.addEventListener("focusout", handleFocusOut);
      return () => {
        grid.removeEventListener("focusin", handleFocusIn);
        grid.removeEventListener("focusout", handleFocusOut);
      };
    }, []);

    const registerCell = useCallback(
      (
        cellValue: string,
        element: HTMLElement,
        data: DataGridCellData,
        cellDisabled = false,
      ) => {
        registerCollectionCell(cellValue, element, {
          disabled: cellDisabled,
          data,
        });
      },
      [registerCollectionCell],
    );

    const updateCell = useCallback(
      (
        cellValue: string,
        data: DataGridCellData,
        cellDisabled = false,
      ) => {
        updateCollectionCell(cellValue, {
          disabled: cellDisabled,
          data,
        });
      },
      [updateCollectionCell],
    );

    const unregisterCell = useCallback(
      (cellValue: string) => unregisterCollectionCell(cellValue),
      [unregisterCollectionCell],
    );

    const registerRow = useCallback(
      (
        rowValue: string,
        element: HTMLElement,
        data: DataGridRowData,
        rowDisabled = false,
      ) => {
        registerCollectionRow(rowValue, element, {
          disabled: rowDisabled,
          data,
        });
      },
      [registerCollectionRow],
    );

    const updateRow = useCallback(
      (
        rowValue: string,
        data: DataGridRowData,
        rowDisabled = false,
      ) => {
        updateCollectionRow(rowValue, {
          disabled: rowDisabled,
          data,
        });
      },
      [updateCollectionRow],
    );

    const unregisterRow = useCallback(
      (rowValue: string) => unregisterCollectionRow(rowValue),
      [unregisterCollectionRow],
    );

    const focusCell = useCallback(
      (rowIndex: number, columnIndex: number) => {
        const nextValue = getDataGridCellValue(rowIndex, columnIndex);
        const item = getItem(nextValue);
        if (!item || item.disabled) return;
        setResolvedActiveCell({ rowIndex, columnIndex });
        gridRef.current?.focus({ preventScroll: true });
        item.element.scrollIntoView({ block: "nearest", inline: "nearest" });
      },
      [getItem, setResolvedActiveCell],
    );

    const getCellId = useCallback(
      (rowIndex: number, columnIndex: number) =>
        getItem(getDataGridCellValue(rowIndex, columnIndex))?.data.id,
      [getItem],
    );

    const isRowSelected = useCallback(
      (rowValue: string | undefined) =>
        rowValue === undefined ? false : selectedValues.includes(rowValue),
      [selectedValues],
    );

    const selectRow = useCallback(
      (rowValue: string | undefined) => {
        if (
          !rowValue ||
          disabled ||
          readOnly ||
          selectionMode === "none"
        ) {
          return;
        }
        const row = getRow(rowValue);
        if (row && !row.data.selectable) return;

        if (selectionMode === "multiple") {
          setSelectedValue((currentValue) => {
            const currentValues = normalizeDataGridSelectionValue(currentValue);
            if (currentValues.includes(rowValue)) {
              return currentValues.filter((itemValue) => itemValue !== rowValue);
            }
            return [...currentValues, rowValue];
          });
          return;
        }

        setSelectedValue(rowValue);
      },
      [disabled, getRow, readOnly, selectionMode, setSelectedValue],
    );

    const moveActiveCell = useCallback(
      (direction: "up" | "down" | "left" | "right" | "row-start" | "row-end" | "grid-start" | "grid-end") => {
        const enabledCells = getItems().filter((item) => !item.disabled);
        if (enabledCells.length === 0) return;

        const rows = getCellsByRow(enabledCells);
        const rowIndexes = [...rows.keys()].sort((first, second) => first - second);
        const current = activeCell ?? (
          direction === "up" || direction === "left" || direction === "grid-end"
            ? enabledCells[enabledCells.length - 1]?.data
            : enabledCells[0]?.data
        ) ?? null;
        if (!current) return;

        if (direction === "grid-start") {
          const firstRow = rows.get(rowIndexes[0]);
          const firstCell = firstRow?.[0];
          if (firstCell) focusCell(firstCell.data.rowIndex, firstCell.data.columnIndex);
          return;
        }

        if (direction === "grid-end") {
          const lastRow = rows.get(rowIndexes[rowIndexes.length - 1]);
          const lastCell = lastRow?.[lastRow.length - 1];
          if (lastCell) focusCell(lastCell.data.rowIndex, lastCell.data.columnIndex);
          return;
        }

        const currentRow = rows.get(current.rowIndex) ?? [];
        const currentCellIndex = currentRow.findIndex(
          (item) => item.data.columnIndex === current.columnIndex,
        );

        if (direction === "row-start" || direction === "row-end") {
          const target = direction === "row-start"
            ? currentRow[0]
            : currentRow[currentRow.length - 1];
          if (target) focusCell(target.data.rowIndex, target.data.columnIndex);
          return;
        }

        if (direction === "left" || direction === "right") {
          const nextIndex = currentCellIndex + (direction === "right" ? 1 : -1);
          const nextCell = currentRow[nextIndex];
          if (nextCell) {
            focusCell(nextCell.data.rowIndex, nextCell.data.columnIndex);
            return;
          }
          if (!wrapRows) return;

          const rowIndex = rowIndexes.indexOf(current.rowIndex);
          const nextRowIndex = direction === "right" ? rowIndex + 1 : rowIndex - 1;
          if (!loop && (nextRowIndex < 0 || nextRowIndex >= rowIndexes.length)) return;
          const wrappedRowIndex = ((nextRowIndex % rowIndexes.length) + rowIndexes.length) % rowIndexes.length;
          const wrappedRow = rows.get(rowIndexes[wrappedRowIndex]);
          const target = direction === "right" ? wrappedRow?.[0] : wrappedRow?.[wrappedRow.length - 1];
          if (target) focusCell(target.data.rowIndex, target.data.columnIndex);
          return;
        }

        const rowIndex = rowIndexes.indexOf(current.rowIndex);
        const nextRowIndex = rowIndex + (direction === "down" ? 1 : -1);
        if (!loop && (nextRowIndex < 0 || nextRowIndex >= rowIndexes.length)) return;

        const normalizedRowIndex = ((nextRowIndex % rowIndexes.length) + rowIndexes.length) % rowIndexes.length;
        const targetRow = rows.get(rowIndexes[normalizedRowIndex]);
        const target = targetRow ? getClosestColumnCell(targetRow, current.columnIndex) : null;
        if (target) focusCell(target.data.rowIndex, target.data.columnIndex);
      },
      [activeCell, focusCell, getItems, loop, wrapRows],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
      (event) => {
        if (disabled) return;

        const navigationDirection = getDataGridNavigationDirection(event.key, dir);
        if (navigationDirection) {
          event.preventDefault();
          moveActiveCell(navigationDirection);
          return;
        }

        switch (event.key) {
          case "Home":
            event.preventDefault();
            moveActiveCell(event.ctrlKey || event.metaKey ? "grid-start" : "row-start");
            return;
          case "End":
            event.preventDefault();
            moveActiveCell(event.ctrlKey || event.metaKey ? "grid-end" : "row-end");
            return;
          case "Enter":
          case " ": {
            if (!activeCell) return;
            const item = getItem(getDataGridCellValue(activeCell.rowIndex, activeCell.columnIndex));
            if (!item?.data.rowValue) return;
            event.preventDefault();
            selectRow(item.data.rowValue);
            return;
          }
          default:
            break;
        }
      },
      [activeCell, dir, disabled, getItem, moveActiveCell, selectRow],
    );

    const activeCellId = activeCell
      ? getCellId(activeCell.rowIndex, activeCell.columnIndex)
      : undefined;

    const contextValue = useMemo<DataGridContextValue>(
      () => ({
        gridId,
        gridRef,
        disabled,
        readOnly,
        selectionMode,
        selectedValues,
        activeCell,
        activeCellId,
        focused,
        setActiveCell: setResolvedActiveCell,
        registerCell,
        updateCell,
        unregisterCell,
        registerRow,
        updateRow,
        unregisterRow,
        getCellId,
        focusCell,
        isRowSelected,
        selectRow,
        selectOnRowClick,
      }),
      [
        activeCell,
        activeCellId,
        disabled,
        focusCell,
        focused,
        getCellId,
        gridId,
        isRowSelected,
        readOnly,
        registerCell,
        registerRow,
        selectOnRowClick,
        selectRow,
        selectedValues,
        selectionMode,
        setResolvedActiveCell,
        unregisterCell,
        unregisterRow,
        updateRow,
        updateCell,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: gridId,
      dir,
      role: "grid",
      tabIndex: tabIndex ?? 0,
      "aria-activedescendant": activeCellId,
      "aria-colcount": resolvedColumnCount ?? -1,
      "aria-disabled": disabled || undefined,
      "aria-multiselectable": selectionMode === "multiple" || undefined,
      "aria-readonly": readOnly || undefined,
      "aria-rowcount": resolvedRowCount ?? -1,
      "data-slot": dataSlot,
      ...(activeCellId && { "data-active": "" }),
      ...(focused && { "data-focused": "" }),
      ...(disabled && { "data-disabled": "" }),
      ...(readOnly && { "data-readonly": "" }),
      ...(resolvedColumnCount !== undefined && { "data-column-count": resolvedColumnCount }),
      ...(resolvedRowCount !== undefined && { "data-row-count": resolvedRowCount }),
      ...(selectionMode !== "none" && { "data-selection-mode": selectionMode }),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    return (
      <DataGridContextProvider value={contextValue}>
        {asChild
          ? cloneAndMerge(children, behaviorProps)
          : renderElement(render, "table", { ...behaviorProps, children })}
      </DataGridContextProvider>
    );
  },
);
