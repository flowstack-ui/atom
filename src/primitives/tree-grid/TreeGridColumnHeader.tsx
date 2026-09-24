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
import { useCompositeInteraction } from "../../utils/useCompositeInteraction.js";
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
  onAction?: () => void;
  interactive?: boolean;
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
      onAction,
      interactive = false,
      scope = "col",
      render,
      asChild,
      onClick,
      onMouseDown,
      onKeyDown,
      "data-slot": dataSlot = "tree-grid-column-header",
      ...restProps
    },
    ref,
  ) {
    const {
      activeCell,
      disabled: treeGridDisabled,
      focusCell,
      setActiveCell,
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
    const interaction = useCompositeInteraction(cellRef, interactive, isDisabled,
      () => { if (resolvedRowIndex && resolvedColumnIndex) setActiveCell({ rowIndex: resolvedRowIndex, columnIndex: resolvedColumnIndex }); },
      () => { if (resolvedRowIndex && resolvedColumnIndex) focusCell(resolvedRowIndex, resolvedColumnIndex); });

    const cellData = useMemo<TreeGridCellData>(
      () => ({
        id: cellId,
        rowIndex: resolvedRowIndex ?? 0,
        columnIndex: resolvedColumnIndex ?? 0,
        rowValue: rowCtx?.value,
        onAction,
        enterInteraction: interactive ? interaction.enterInteraction : undefined,
      }),
      [cellId, onAction, resolvedColumnIndex, resolvedRowIndex, rowCtx?.value, interactive, interaction.enterInteraction],
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

    const handleClick = useCallback<MouseEventHandler<HTMLTableCellElement>>((event) => {
      if (!resolvedRowIndex || !resolvedColumnIndex || isDisabled) return;
      if (interactive && (event.target as Element).closest('button, input, select, textarea, a[href], [contenteditable="true"], [tabindex]')) return;
      focusCell(resolvedRowIndex, resolvedColumnIndex);
      onAction?.();
    }, [focusCell, isDisabled, interactive, onAction, resolvedColumnIndex, resolvedRowIndex]);

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
      ...(onAction && isNavigable && !actuallyDisabled && { "data-actionable": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
      onMouseDown: composeEventHandlers(onMouseDown, event => {
        if (event.button !== 0 || !resolvedRowIndex || !resolvedColumnIndex || isDisabled) return;
        const target = event.target as Element;
        if (target.closest("[role='treegrid']") !== event.currentTarget.closest("[role='treegrid']")) return;
        const control = target.closest('button, input, select, textarea, a[href], [contenteditable="true"], [tabindex]');
        if (control && event.currentTarget.contains(control)) return;
        // Resolve the pointer cell before native focus initializes keyboard entry.
        setActiveCell({ rowIndex: resolvedRowIndex, columnIndex: resolvedColumnIndex });
      }),
      onKeyDown: composeEventHandlers(onKeyDown, interaction.onKeyDown),
      "data-interactive": interactive ? "" : undefined,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "th", { ...behaviorProps, children });
  },
);
