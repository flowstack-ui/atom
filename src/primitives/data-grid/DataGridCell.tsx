"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeTableCellProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  getDataGridCellValue,
  normalizeDataGridIndex,
  useDataGridContext,
  useDataGridRowContext,
  type DataGridCellData,
} from "./context.js";

type DataGridCellNativeProps = NativeTableCellProps<
  "children" | "role" | "aria-colindex" | "aria-disabled" | "aria-selected"
>;

export interface DataGridCellProps extends DataGridCellNativeProps {
  children?: ReactNode;
  columnIndex?: number;
  index?: number;
  disabled?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const DataGridCell = forwardRef<HTMLTableCellElement, DataGridCellProps>(
  function DataGridCell(
    {
      children,
      columnIndex,
      index,
      disabled = false,
      render,
      asChild,
      onClick,
      "data-slot": dataSlot = "data-grid-cell",
      ...restProps
    },
    ref,
  ) {
    const {
      activeCell,
      disabled: gridDisabled,
      focusCell,
      focused,
      gridId,
      registerCell,
      selectionMode,
      unregisterCell,
      updateCell,
    } = useDataGridContext();
    const rowCtx = useDataGridRowContext();
    const cellRef = useRef<HTMLElement | null>(null);
    const composedRef = useMemo(() => composeRefs(cellRef, ref), [ref]);
    const generatedId = useId();
    const resolvedRowIndex = rowCtx?.rowIndex;
    const resolvedColumnIndex = normalizeDataGridIndex(
      columnIndex ?? (index === undefined ? undefined : index + 1),
    );
    const isNavigable = resolvedRowIndex !== undefined && resolvedColumnIndex !== undefined;
    const actuallyDisabled = disabled || rowCtx?.disabled || gridDisabled;
    const isDisabled = actuallyDisabled || !isNavigable;
    const selected = rowCtx?.selected ?? false;
    const cellValue = resolvedRowIndex && resolvedColumnIndex
      ? getDataGridCellValue(resolvedRowIndex, resolvedColumnIndex)
      : `cell-${generatedId}`;
    const cellId = `${gridId}-cell-${generatedId}`;

    const cellData = useMemo<DataGridCellData>(
      () => ({
        id: cellId,
        rowIndex: resolvedRowIndex ?? 0,
        columnIndex: resolvedColumnIndex ?? 0,
        rowValue: rowCtx?.value,
      }),
      [cellId, resolvedColumnIndex, resolvedRowIndex, rowCtx?.value],
    );

    useEffect(() => {
      const element = cellRef.current;
      if (!element || !resolvedRowIndex || !resolvedColumnIndex) return undefined;
      registerCell(cellValue, element, cellData, isDisabled);
      return () => unregisterCell(cellValue);
    }, [cellValue, registerCell, resolvedColumnIndex, resolvedRowIndex, unregisterCell]);

    useEffect(() => {
      if (!resolvedRowIndex || !resolvedColumnIndex) return;
      updateCell(cellValue, cellData, isDisabled);
    }, [cellData, cellValue, isDisabled, resolvedColumnIndex, resolvedRowIndex, updateCell]);

    const handleClick = useCallback<MouseEventHandler<HTMLTableCellElement>>(() => {
      if (!resolvedRowIndex || !resolvedColumnIndex || isDisabled) return;
      focusCell(resolvedRowIndex, resolvedColumnIndex);
    }, [focusCell, isDisabled, resolvedColumnIndex, resolvedRowIndex]);

    const active = focused &&
      activeCell?.rowIndex === resolvedRowIndex &&
      activeCell?.columnIndex === resolvedColumnIndex;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: cellId,
      role: "gridcell",
      "aria-colindex": resolvedColumnIndex,
      "aria-disabled": actuallyDisabled || undefined,
      "aria-selected": selectionMode === "none" ? undefined : selected,
      "data-slot": dataSlot,
      ...(resolvedColumnIndex !== undefined && { "data-column-index": resolvedColumnIndex }),
      ...(active && { "data-active": "" }),
      ...(selected && { "data-selected": "" }),
      ...(actuallyDisabled && { "data-disabled": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "td", { ...behaviorProps, children });
  },
);
