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
import { FOCUSABLE_SELECTOR as NATIVE_FOCUSABLE_SELECTOR } from "../../hooks/focus.js";
const FOCUSABLE_SELECTOR = `${NATIVE_FOCUSABLE_SELECTOR}, [tabindex="-1"], [contenteditable="true"]`;
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
  type DataGridSortDirection,
} from "./context.js";

type DataGridColumnHeaderNativeProps = NativeTableHeadProps<
  | "children"
  | "role"
  | "aria-colindex"
  | "aria-disabled"
  | "aria-selected"
  | "aria-sort"
>;

export interface DataGridColumnHeaderProps extends DataGridColumnHeaderNativeProps {
  children?: ReactNode;
  columnIndex?: number;
  index?: number;
  disabled?: boolean;
  /** Enter/F2 focuses a child control authored with tabIndex=-1. */
  interactive?: boolean;
  sortDirection?: DataGridSortDirection;
  onAction?: () => void;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const DataGridColumnHeader = forwardRef<HTMLTableCellElement, DataGridColumnHeaderProps>(
  function DataGridColumnHeader(
    {
      children,
      columnIndex,
      index,
      disabled = false,
      interactive = false,
      sortDirection,
      onAction,
      scope = "col",
      render,
      asChild,
      onClick,
      onMouseDown,
      onKeyDown,
      onFocus,
      "data-slot": dataSlot = "data-grid-column-header",
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
      setActiveCell,
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
      : `header-${generatedId}`;
    const cellId = `${gridId}-cell-${generatedId}`;
    const enterInteraction = useCallback(() => {
      if (!interactive || isDisabled) return false;
      const child = [...(cellRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [])]
        .find(node => !node.matches(":disabled, [aria-disabled='true']") && !node.closest("[hidden], [inert]") && node.getClientRects().length > 0);
      if (!child) return false;
      child.focus({ preventScroll: true });
      return child.ownerDocument.activeElement === child;
    }, [interactive, isDisabled]);

    const cellData = useMemo<DataGridCellData>(
      () => ({
        id: cellId,
        rowIndex: resolvedRowIndex ?? 0,
        columnIndex: resolvedColumnIndex ?? 0,
        rowValue: rowCtx?.value,
        onAction,
        enterInteraction: interactive ? enterInteraction : undefined,
      }),
      [cellId, enterInteraction, interactive, onAction, resolvedColumnIndex, resolvedRowIndex, rowCtx?.value],
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
      const control = (event.target as Element).closest(FOCUSABLE_SELECTOR);
      if (control && event.currentTarget.contains(control)) return;
      focusCell(resolvedRowIndex, resolvedColumnIndex);
      onAction?.();
    }, [focusCell, isDisabled, onAction, resolvedColumnIndex, resolvedRowIndex]);

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
      ...(resolvedColumnIndex !== undefined && { "data-column-index": resolvedColumnIndex }),
      ...(sortDirection !== undefined && { "data-sort": sortDirection }),
      ...(onAction && isNavigable && !actuallyDisabled && { "data-actionable": "" }),
      ...(active && { "data-active": "" }),
      ...(selected && { "data-selected": "" }),
      ...(actuallyDisabled && { "data-disabled": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
      onMouseDown: composeEventHandlers(onMouseDown, event => {
        if (event.button !== 0 || !resolvedRowIndex || !resolvedColumnIndex || isDisabled) return;
        if ((event.target as Element).closest("[role='grid']") !== event.currentTarget.closest("[role='grid']")) return;
        const control = (event.target as Element).closest(FOCUSABLE_SELECTOR);
        if (control && event.currentTarget.contains(control)) return;
        setActiveCell({ rowIndex: resolvedRowIndex, columnIndex: resolvedColumnIndex });
      }),
      onFocus: composeEventHandlers(onFocus, event => {
        if (!isDisabled && resolvedRowIndex && resolvedColumnIndex && event.target !== event.currentTarget)
          setActiveCell({ rowIndex: resolvedRowIndex, columnIndex: resolvedColumnIndex });
      }),
      onKeyDown: composeEventHandlers(onKeyDown, event => {
        if (!interactive || event.key !== "Escape" || event.target === event.currentTarget || isDisabled) return;
        if ((event.target as Element).closest("[role='grid']") !== event.currentTarget.closest("[role='grid']")) return;
        if (!resolvedRowIndex || !resolvedColumnIndex) return;
        event.preventDefault(); event.stopPropagation();
        focusCell(resolvedRowIndex, resolvedColumnIndex);
      }),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "th", { ...behaviorProps, children });
  },
);
