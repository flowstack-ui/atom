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
  TreeGridContextProvider,
  getDefaultTreeGridSelectionValue,
  getTreeGridCellValue,
  normalizeTreeGridSelectionValue,
  type TreeGridCellCoordinates,
  type TreeGridCellData,
  type TreeGridContextValue,
  type TreeGridRowData,
  type TreeGridSelectionMode,
  type TreeGridSelectionValue,
} from "./context.js";

type TreeGridRootNativeProps = NativeTableProps<
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

export interface TreeGridRootProps extends TreeGridRootNativeProps {
  children?: ReactNode;
  value?: TreeGridSelectionValue;
  defaultValue?: TreeGridSelectionValue;
  onValueChange?: (value: TreeGridSelectionValue) => void;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  expandedValue?: string[];
  defaultExpandedValue?: string[];
  onExpandedValueChange?: (value: string[]) => void;
  activeCell?: TreeGridCellCoordinates | null;
  defaultActiveCell?: TreeGridCellCoordinates | null;
  onActiveCellChange?: (cell: TreeGridCellCoordinates | null) => void;
  selectionMode?: TreeGridSelectionMode;
  disabled?: boolean;
  readOnly?: boolean;
  loop?: boolean;
  /** Number of visible mounted rows moved by Page Up/Down. */
  pageSize?: number;
  /** Text direction used for horizontal cell and expand/collapse arrow-key navigation. Defaults to Direction.Provider. */
  dir?: DirectionValue;
  rowCount?: number;
  columnCount?: number;
  selectOnRowClick?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function normalizeTreeGridCount(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;

  const nextValue = Math.trunc(value);
  return nextValue > 0 ? nextValue : undefined;
}

function getCellsByRow(
  cells: { value: string; disabled: boolean; data: TreeGridCellData }[],
) {
  const rows = new Map<number, { value: string; disabled: boolean; data: TreeGridCellData }[]>();

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
  row: { value: string; disabled: boolean; data: TreeGridCellData }[],
  columnIndex: number,
) {
  return row.reduce<typeof row[number] | null>((closest, cell) => {
    if (!closest) return cell;
    const currentDistance = Math.abs(cell.data.columnIndex - columnIndex);
    const closestDistance = Math.abs(closest.data.columnIndex - columnIndex);
    return currentDistance < closestDistance ? cell : closest;
  }, null);
}

export function getTreeGridNavigationDirection(
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

export const TreeGridRoot = forwardRef<HTMLElement, TreeGridRootProps>(
  function TreeGridRoot(
    {
      children,
      value,
      defaultValue,
      onValueChange,
      expandedValue,
      defaultExpandedValue = [],
      onExpandedValueChange,
      activeCell: activeCellProp,
      defaultActiveCell = null,
      onActiveCellChange,
      selectionMode = "none",
      disabled = false,
      readOnly = false,
      loop = false,
      pageSize = 10,
      dir: dirProp,
      rowCount,
      columnCount,
      selectOnRowClick = false,
      render,
      asChild,
      tabIndex,
      onKeyDown,
      "data-slot": dataSlot = "tree-grid",
      ...restProps
    },
    ref,
  ) {
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const generatedId = useId();
    const treeGridId = restProps.id ?? `tree-grid-${generatedId}`;
    const treeGridRef = useRef<HTMLElement | null>(null);
    const composedRef = useMemo(() => composeRefs(treeGridRef, ref), [ref]);
    const [focused, setFocused] = useState(false);
    const [interacting, setInteracting] = useState(false);
    const selectionAnchor = useRef<string | null>(null);
    const resolvedPageSize = normalizeTreeGridCount(pageSize) ?? 10;
    const {
      version: rowVersion,
      getItem: getRow,
      getItems: getRows,
      registerItem: registerCollectionRow,
      updateItem: updateCollectionRow,
      unregisterItem: unregisterCollectionRow,
    } = useCollection<string, HTMLElement, TreeGridRowData>();
    const {
      version: cellVersion,
      getItem: getCell,
      getItems: getCells,
      registerItem: registerCollectionCell,
      updateItem: updateCollectionCell,
      unregisterItem: unregisterCollectionCell,
    } = useCollection<string, HTMLElement, TreeGridCellData>();
    const [selectedValue, setSelectedValue] = useControllableState<TreeGridSelectionValue>({
      value,
      defaultValue: getDefaultTreeGridSelectionValue(defaultValue, selectionMode),
      onChange: onValueChange,
    });
    const [expandedValues, setExpandedValues] = useControllableState<string[]>({
      value: expandedValue,
      defaultValue: defaultExpandedValue,
      onChange: onExpandedValueChange,
    });
    const [activeCell, setResolvedActiveCell] = useControllableState<TreeGridCellCoordinates | null>({
      value: activeCellProp,
      defaultValue: defaultActiveCell,
      onChange: onActiveCellChange,
    });
    const expandedValuesRef = useRef(expandedValues);
    expandedValuesRef.current = expandedValues;
    const selectedValues = useMemo(
      () => normalizeTreeGridSelectionValue(selectedValue),
      [selectedValue],
    );
    const resolvedColumnCount = normalizeTreeGridCount(columnCount);
    const resolvedRowCount = normalizeTreeGridCount(rowCount);

    useEffect(() => {
      const treeGrid = treeGridRef.current;
      if (!treeGrid) return undefined;

      const handleFocusIn = (event: FocusEvent) => { setFocused(true); setInteracting(event.target !== treeGrid); };
      const handleFocusOut = (event: FocusEvent) => {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && treeGrid.contains(nextTarget)) return;
        setFocused(false);
        setInteracting(false);
      };

      treeGrid.addEventListener("focusin", handleFocusIn);
      treeGrid.addEventListener("focusout", handleFocusOut);
      return () => {
        treeGrid.removeEventListener("focusin", handleFocusIn);
        treeGrid.removeEventListener("focusout", handleFocusOut);
      };
    }, []);

    const isRowVisible = useCallback(
      (rowValue: string | undefined, parentValue: string | null = null) => {
        if (!rowValue) return true;

        let nextParentValue = parentValue ?? getRow(rowValue)?.data.parentValue ?? null;
        const expandedSet = new Set(expandedValuesRef.current);
        const seenValues = new Set<string>();

        while (nextParentValue) {
          if (seenValues.has(nextParentValue)) return false;
          seenValues.add(nextParentValue);
          if (!expandedSet.has(nextParentValue)) return false;
          nextParentValue = getRow(nextParentValue)?.data.parentValue ?? null;
        }

        return true;
      },
      [getRow],
    );

    const getVisibleCells = useCallback(() => {
      return getCells().filter((cell) => {
        const rowValue = cell.data.rowValue;
        if (!rowValue) return true;
        return isRowVisible(rowValue);
      });
    }, [getCells, isRowVisible]);

    const registerRow = useCallback(
      (rowValue: string, element: HTMLElement, data: TreeGridRowData, rowDisabled = false) => {
        registerCollectionRow(rowValue, element, { disabled: rowDisabled, data });
      },
      [registerCollectionRow],
    );

    const updateRow = useCallback(
      (rowValue: string, data: TreeGridRowData, rowDisabled = false) => {
        updateCollectionRow(rowValue, { disabled: rowDisabled, data });
      },
      [updateCollectionRow],
    );

    const unregisterRow = useCallback(
      (rowValue: string) => unregisterCollectionRow(rowValue),
      [unregisterCollectionRow],
    );

    const registerCell = useCallback(
      (cellValue: string, element: HTMLElement, data: TreeGridCellData, cellDisabled = false) => {
        registerCollectionCell(cellValue, element, { disabled: cellDisabled, data });
      },
      [registerCollectionCell],
    );

    const updateCell = useCallback(
      (cellValue: string, data: TreeGridCellData, cellDisabled = false) => {
        updateCollectionCell(cellValue, { disabled: cellDisabled, data });
      },
      [updateCollectionCell],
    );

    const unregisterCell = useCallback(
      (cellValue: string) => unregisterCollectionCell(cellValue),
      [unregisterCollectionCell],
    );

    const getCellId = useCallback(
      (rowIndex: number, columnIndex: number) =>
        getCell(getTreeGridCellValue(rowIndex, columnIndex))?.data.id,
      [getCell],
    );

    const focusCell = useCallback(
      (rowIndex: number, columnIndex: number) => {
        const nextValue = getTreeGridCellValue(rowIndex, columnIndex);
        const item = getCell(nextValue);
        if (!item || item.disabled) return;
        if (item.data.rowValue && !isRowVisible(item.data.rowValue)) return;

        if (activeCell?.rowIndex !== rowIndex || activeCell.columnIndex !== columnIndex)
          setResolvedActiveCell({ rowIndex, columnIndex });
        treeGridRef.current?.focus({ preventScroll: true });
        item.element.scrollIntoView({ block: "nearest", inline: "nearest" });
      },
      [activeCell, getCell, isRowVisible, setResolvedActiveCell],
    );

    const isRowSelected = useCallback(
      (rowValue: string | undefined) =>
        rowValue === undefined ? false : selectedValues.includes(rowValue),
      [selectedValues],
    );

    const isRowExpanded = useCallback(
      (rowValue: string | undefined) =>
        rowValue === undefined ? false : expandedValues.includes(rowValue),
      [expandedValues],
    );

    const selectRow = useCallback(
      (rowValue: string | undefined, range = false) => {
        if (!rowValue || disabled || readOnly || selectionMode === "none") return;
        const row = getRow(rowValue);
        if (!row || row.disabled || !row.data.selectable || !isRowVisible(rowValue)) return;

        if (selectionMode === "multiple") {
          const rows = getRows().filter(item => !item.disabled && item.data.selectable && isRowVisible(item.value));
          const from = rows.findIndex(item => item.value === selectionAnchor.current);
          const to = rows.findIndex(item => item.value === rowValue);
          if (range && from >= 0 && to >= 0) {
            setSelectedValue(rows.slice(Math.min(from, to), Math.max(from, to) + 1).map(item => item.value));
            return;
          }
          selectionAnchor.current = rowValue;
          setSelectedValue((currentValue) => {
            const currentValues = normalizeTreeGridSelectionValue(currentValue);
            if (currentValues.includes(rowValue)) {
              return currentValues.filter((itemValue) => itemValue !== rowValue);
            }
            return [...currentValues, rowValue];
          });
          return;
        }

        setSelectedValue(rowValue);
      },
      [disabled, getRow, getRows, isRowVisible, readOnly, selectionMode, setSelectedValue],
    );

    const recoveryRequest = useRef<string | null>(null);
    useEffect(() => {
      if (disabled || (!activeCell && !focused)) return;
      const activeItem = activeCell && getCell(getTreeGridCellValue(activeCell.rowIndex, activeCell.columnIndex));
      const activeRowValue = activeItem?.data.rowValue;
      if (activeItem && !activeItem.disabled && (!activeRowValue || isRowVisible(activeRowValue))) {
        recoveryRequest.current = null;
        return;
      }

      const request = (next: TreeGridCellCoordinates | null) => {
        const key = `${activeCell?.rowIndex}:${activeCell?.columnIndex}->${next?.rowIndex}:${next?.columnIndex}`;
        if (key === recoveryRequest.current) return;
        recoveryRequest.current = key;
        setResolvedActiveCell(next);
      };

      let parentValue = activeRowValue ? getRow(activeRowValue)?.data.parentValue ?? null : null;
      const seenValues = new Set<string>();
      while (parentValue && !seenValues.has(parentValue)) {
        seenValues.add(parentValue);
        const parentRow = getRow(parentValue);
        if (!parentRow) break;
        if (!parentRow.disabled && isRowVisible(parentValue) && !expandedValues.includes(parentValue)) {
          request({ rowIndex: parentRow.data.rowIndex, columnIndex: 1 });
          return;
        }
        parentValue = parentRow.data.parentValue;
      }
      const cells = getVisibleCells().filter(item => !item.disabled).sort((a, b) =>
        a.data.rowIndex - b.data.rowIndex || a.data.columnIndex - b.data.columnIndex);
      const next = cells.find(item => item.data.rowIndex >= (activeCell?.rowIndex ?? 1)) ?? cells[cells.length - 1];
      request(next ? { rowIndex: next.data.rowIndex, columnIndex: next.data.columnIndex } : null);
    }, [activeCell, cellVersion, rowVersion, disabled, focused, expandedValues, getCell, getRow, getVisibleCells, isRowVisible, setResolvedActiveCell]);

    const expandRow = useCallback(
      (rowValue: string | undefined) => {
        if (!rowValue || disabled || getRow(rowValue)?.disabled || !getRow(rowValue)?.data.expandable) return;
        setExpandedValues((currentValues) => {
          if (currentValues.includes(rowValue)) return currentValues;
          return [...currentValues, rowValue];
        });
      },
      [disabled, getRow, setExpandedValues],
    );

    const collapseRow = useCallback(
      (rowValue: string | undefined) => {
        if (!rowValue || disabled || getRow(rowValue)?.disabled || !getRow(rowValue)?.data.expandable) return;
        setExpandedValues((currentValues) => currentValues.filter((itemValue) => itemValue !== rowValue));
      },
      [disabled, getRow, setExpandedValues],
    );

    const toggleExpandedRow = useCallback(
      (rowValue: string | undefined) => {
        if (!rowValue || disabled || getRow(rowValue)?.disabled || !getRow(rowValue)?.data.expandable) return;
        setExpandedValues((currentValues) => {
          if (currentValues.includes(rowValue)) {
            return currentValues.filter((itemValue) => itemValue !== rowValue);
          }
          return [...currentValues, rowValue];
        });
      },
      [disabled, getRow, setExpandedValues],
    );

    const moveActiveCell = useCallback(
      (direction: "up" | "down" | "left" | "right" | "row-start" | "row-end" | "grid-start" | "grid-end" | "page-up" | "page-down") => {
        const enabledCells = getVisibleCells().filter((item) => !item.disabled);
        if (enabledCells.length === 0) return;

        const rows = getCellsByRow(enabledCells);
        const rowIndexes = [...rows.keys()].sort((first, second) => first - second);
        const current = activeCell ?? (
          direction === "up" || direction === "left" || direction === "grid-end"
            ? enabledCells[enabledCells.length - 1]?.data
            : enabledCells[0]?.data
        ) ?? null;
        if (!current) return;
        if (!activeCell) {
          focusCell(current.rowIndex, current.columnIndex);
          return;
        }

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
        if (direction === "page-up" || direction === "page-down") {
          const index = Math.max(0, rowIndexes.indexOf(current.rowIndex));
          const nextIndex = Math.max(0, Math.min(rowIndexes.length - 1,
            index + (direction === "page-down" ? resolvedPageSize : -resolvedPageSize)));
          const target = getClosestColumnCell(rows.get(rowIndexes[nextIndex]) ?? [], current.columnIndex);
          if (target) focusCell(target.data.rowIndex, target.data.columnIndex);
          return;
        }
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
          if (nextCell) focusCell(nextCell.data.rowIndex, nextCell.data.columnIndex);
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
      [activeCell, focusCell, getVisibleCells, loop, resolvedPageSize],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
      (event) => {
        if (disabled || event.nativeEvent.isComposing || event.target !== event.currentTarget) return;
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a" && selectionMode === "multiple" && !readOnly) {
          event.preventDefault();
          const values = getRows().filter(row => !row.disabled && row.data.selectable && isRowVisible(row.value)).map(row => row.value);
          setSelectedValue(current => {
            const existing = normalizeTreeGridSelectionValue(current);
            return values.every(value => existing.includes(value))
              ? existing.filter(value => !values.includes(value))
              : [...new Set([...existing, ...values])];
          });
          return;
        }

        const activeItem = activeCell
          ? getCell(getTreeGridCellValue(activeCell.rowIndex, activeCell.columnIndex))
          : null;
        const activeRow = activeItem?.data.rowValue
          ? getRow(activeItem.data.rowValue)
          : null;
        const activeCellIsTreeColumn = activeItem?.data.columnIndex === 1;
        const activeRowCanExpand = activeCellIsTreeColumn && activeRow?.data.expandable === true;
        const navigationDirection = getTreeGridNavigationDirection(event.key, dir);

        if (navigationDirection === "right") {
          event.preventDefault();
          if (activeRowCanExpand && !expandedValues.includes(activeRow.value)) {
            expandRow(activeRow.value);
            return;
          }
          moveActiveCell("right");
          return;
        }

        if (navigationDirection === "left") {
          event.preventDefault();
          if (activeRowCanExpand && expandedValues.includes(activeRow.value)) {
            collapseRow(activeRow.value);
            return;
          }
          if (activeCellIsTreeColumn && activeRow?.data.parentValue) {
            const parentRow = getRow(activeRow.data.parentValue);
            if (parentRow) {
              focusCell(parentRow.data.rowIndex, activeCell?.columnIndex ?? 1);
              return;
            }
          }
          moveActiveCell("left");
          return;
        }

        if (navigationDirection === "down") {
          event.preventDefault();
          moveActiveCell("down");
          return;
        }

        if (navigationDirection === "up") {
          event.preventDefault();
          moveActiveCell("up");
          return;
        }

        switch (event.key) {
          case "PageUp":
          case "PageDown":
            event.preventDefault();
            moveActiveCell(event.key === "PageDown" ? "page-down" : "page-up");
            return;
          case "Home":
            event.preventDefault();
            moveActiveCell(event.ctrlKey || event.metaKey ? "grid-start" : "row-start");
            return;
          case "End":
            event.preventDefault();
            moveActiveCell(event.ctrlKey || event.metaKey ? "grid-end" : "row-end");
            return;
          case "F2":
          case "Enter":
            if (!activeItem || activeItem.disabled || activeRow?.disabled) return;
            if (event.key === "Enter" && activeItem.data.onAction) {
              event.preventDefault();
              activeItem.data.onAction();
              return;
            }
            if (activeItem.data.enterInteraction?.()) { event.preventDefault(); return; }
            if (event.key === "F2") return;
            if (activeItem?.data.onAction) {
              event.preventDefault();
              activeItem.data.onAction();
              return;
            }
            if (!activeRow) return;
            event.preventDefault();
            if (activeRowCanExpand) {
              toggleExpandedRow(activeRow.value);
              return;
            }
            selectRow(activeRow.value, event.shiftKey);
            return;
          case " ": {
            if (!activeItem || activeItem.disabled || !activeRow || activeRow.disabled) return;
            event.preventDefault();
            selectRow(activeRow.value, event.shiftKey);
            return;
          }
          default:
            break;
        }
      },
      [
        activeCell,
        collapseRow,
        dir,
        disabled,
        expandRow,
        expandedValues,
        focusCell,
        getCell,
        getRow,
        getRows,
        isRowVisible,
        readOnly,
        selectionMode,
        setSelectedValue,
        moveActiveCell,
        selectRow,
        toggleExpandedRow,
      ],
    );

    const activeCellId = activeCell
      ? getCellId(activeCell.rowIndex, activeCell.columnIndex)
      : undefined;

    const contextValue = useMemo<TreeGridContextValue>(
      () => ({
        dir,
        treeGridId,
        treeGridRef,
        setActiveCell: setResolvedActiveCell,
        disabled,
        readOnly,
        focused,
        selectionMode,
        selectedValues,
        expandedValues,
        activeCell,
        activeCellId,
        registerRow,
        updateRow,
        unregisterRow,
        registerCell,
        updateCell,
        unregisterCell,
        getCellId,
        focusCell,
        isRowVisible,
        isRowSelected,
        isRowExpanded,
        selectRow,
        toggleExpandedRow,
        expandRow,
        collapseRow,
        selectOnRowClick,
      }),
      [
        activeCell,
        activeCellId,
        collapseRow,
        dir,
        disabled,
        expandRow,
        expandedValues,
        focusCell,
        focused,
        getCellId,
        isRowExpanded,
        isRowSelected,
        isRowVisible,
        readOnly,
        registerCell,
        registerRow,
        selectOnRowClick,
        selectRow,
        selectedValues,
        selectionMode,
        toggleExpandedRow,
        treeGridId,
        setResolvedActiveCell,
        unregisterCell,
        unregisterRow,
        updateCell,
        updateRow,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: treeGridId,
      dir,
      role: "treegrid",
      tabIndex: tabIndex ?? 0,
      "aria-activedescendant": interacting ? undefined : activeCellId,
      "data-interacting": interacting ? "" : undefined,
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
      <TreeGridContextProvider value={contextValue}>
        {asChild
          ? cloneAndMerge(children, behaviorProps)
          : renderElement(render, "table", { ...behaviorProps, children })}
      </TreeGridContextProvider>
    );
  },
);
