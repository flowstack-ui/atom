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
import type { NativeTableHeadProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  getTreeGridCellValue,
  normalizeTreeGridIndex,
  useTreeGridContext,
  useTreeGridRowContext,
  type TreeGridCellData,
  type TreeGridSortDirection,
} from "./context.js";

type TreeGridColumnHeaderNativeProps = NativeTableHeadProps<
  | "children"
  | "role"
  | "aria-colindex"
  | "aria-disabled"
  | "aria-selected"
  | "aria-sort"
>;

export interface TreeGridColumnHeaderProps extends TreeGridColumnHeaderNativeProps {
  children?: ReactNode;
  columnIndex?: number;
  index?: number;
  disabled?: boolean;
  sortDirection?: TreeGridSortDirection;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TreeGridColumnHeader = forwardRef<HTMLTableCellElement, TreeGridColumnHeaderProps>(
  function TreeGridColumnHeader(
    {
      children,
      columnIndex,
      index,
      disabled = false,
      sortDirection,
      scope = "col",
      render,
      asChild,
      onClick,
      "data-slot": dataSlot = "tree-grid-column-header",
      ...restProps
    },
    ref,
  ) {
    const {
      activeCell,
      disabled: treeGridDisabled,
      focusCell,
      focused,
      registerCell,
      selectionMode,
      treeGridId,
      unregisterCell,
      updateCell,
    } = useTreeGridContext();
    const rowCtx = useTreeGridRowContext();
    const cellRef = useRef<HTMLElement | null>(null);
    const composedRef = useMemo(() => composeRefs(cellRef, ref), [ref]);
    const generatedId = useId();
    const resolvedRowIndex = rowCtx?.rowIndex;
    const resolvedColumnIndex = normalizeTreeGridIndex(
      columnIndex ?? (index === undefined ? undefined : index + 1),
    );
    const isNavigable =
      rowCtx?.visible !== false &&
      resolvedRowIndex !== undefined &&
      resolvedColumnIndex !== undefined;
    const actuallyDisabled = disabled || rowCtx?.disabled || treeGridDisabled;
    const isDisabled = actuallyDisabled || !isNavigable;
    const selected = rowCtx?.selected ?? false;
    const cellValue = resolvedRowIndex && resolvedColumnIndex
      ? getTreeGridCellValue(resolvedRowIndex, resolvedColumnIndex)
      : `column-header-${generatedId}`;
    const cellId = `${treeGridId}-cell-${generatedId}`;

    const cellData = useMemo<TreeGridCellData>(
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
      role: "columnheader",
      scope,
      "aria-colindex": resolvedColumnIndex,
      "aria-disabled": actuallyDisabled || undefined,
      "aria-selected": selectionMode === "none" ? undefined : selected,
      "aria-sort": sortDirection,
      "data-slot": dataSlot,
      ...(active && { "data-active": "" }),
      ...(actuallyDisabled && { "data-disabled": "" }),
      ...(resolvedColumnIndex !== undefined && { "data-column-index": resolvedColumnIndex }),
      ...(selected && { "data-selected": "" }),
      ...(sortDirection !== undefined && { "data-sort": sortDirection }),
      onClick: composeEventHandlers(onClick, handleClick),
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "th", { ...behaviorProps, children });
  },
);
