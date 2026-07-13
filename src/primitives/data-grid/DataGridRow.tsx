"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeTableRowProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  DataGridRowContextProvider,
  normalizeDataGridIndex,
  useDataGridContext,
  type DataGridRowContextValue,
  type DataGridRowData,
} from "./context.js";

type DataGridRowNativeProps = NativeTableRowProps<
  "children" | "role" | "aria-disabled" | "aria-rowindex" | "aria-selected"
>;

export interface DataGridRowProps extends DataGridRowNativeProps {
  children?: ReactNode;
  value?: string;
  rowIndex?: number;
  index?: number;
  selectable?: boolean;
  disabled?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const DataGridRow = forwardRef<HTMLTableRowElement, DataGridRowProps>(
  function DataGridRow(
    {
      children,
      value,
      rowIndex,
      index,
      selectable = true,
      disabled = false,
      render,
      asChild,
      onClick,
      "data-slot": dataSlot = "data-grid-row",
      ...restProps
    },
    ref,
  ) {
    const {
      disabled: gridDisabled,
      isRowSelected,
      registerRow,
      selectOnRowClick,
      selectRow,
      selectionMode,
      unregisterRow,
      updateRow,
    } = useDataGridContext();
    const rowRef = useRef<HTMLElement | null>(null);
    const composedRef = useMemo(() => composeRefs(rowRef, ref), [ref]);
    const resolvedRowIndex = normalizeDataGridIndex(
      rowIndex ?? (index === undefined ? undefined : index + 1),
    );
    const isDisabled = disabled || gridDisabled;
    const selected = isRowSelected(value);

    const rowData = useMemo<DataGridRowData | null>(
      () => {
        if (!value) return null;
        return {
          rowIndex: resolvedRowIndex ?? 0,
          value,
          selectable,
        };
      },
      [resolvedRowIndex, selectable, value],
    );

    useEffect(() => {
      const element = rowRef.current;
      if (!element || !value || !rowData) return undefined;
      registerRow(value, element, rowData, isDisabled);
      return () => unregisterRow(value);
    }, [isDisabled, registerRow, rowData, unregisterRow, value]);

    useEffect(() => {
      if (!value || !rowData) return;
      updateRow(value, rowData, isDisabled);
    }, [isDisabled, rowData, updateRow, value]);

    const handleClick = useCallback<MouseEventHandler<HTMLTableRowElement>>(() => {
      if (!selectOnRowClick || isDisabled || !selectable) return;
      selectRow(value);
    }, [isDisabled, selectOnRowClick, selectable, selectRow, value]);

    const rowContext = useMemo<DataGridRowContextValue>(
      () => ({
        rowIndex: resolvedRowIndex,
        value,
        selectable,
        disabled: isDisabled,
        selected,
      }),
      [isDisabled, resolvedRowIndex, selectable, selected, value],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      role: "row",
      "aria-disabled": isDisabled || undefined,
      "aria-rowindex": resolvedRowIndex,
      "aria-selected": selectionMode === "none" ? undefined : selected,
      "data-slot": dataSlot,
      ...(selectable && value !== undefined && selectionMode !== "none" && { "data-selectable": "" }),
      ...(!selectable && selectionMode !== "none" && { "data-selection-disabled": "" }),
      ...(resolvedRowIndex !== undefined && { "data-row-index": resolvedRowIndex }),
      ...(value !== undefined && { "data-value": value }),
      ...(selected && { "data-selected": "" }),
      ...(isDisabled && { "data-disabled": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
    };

    return (
      <DataGridRowContextProvider value={rowContext}>
        {asChild
          ? cloneAndMerge(children, behaviorProps)
          : renderElement(render, "tr", { ...behaviorProps, children })}
      </DataGridRowContextProvider>
    );
  },
);
