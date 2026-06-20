"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeTableRowProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  DataGridRowContextProvider,
  normalizeDataGridIndex,
  useDataGridContext,
  type DataGridRowContextValue,
} from "./context.js";

type DataGridRowNativeProps = NativeTableRowProps<
  "children" | "role" | "aria-disabled" | "aria-rowindex" | "aria-selected"
>;

export interface DataGridRowProps extends DataGridRowNativeProps {
  children?: ReactNode;
  value?: string;
  rowIndex?: number;
  index?: number;
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
      selectOnRowClick,
      selectRow,
      selectionMode,
    } = useDataGridContext();
    const resolvedRowIndex = normalizeDataGridIndex(
      rowIndex ?? (index === undefined ? undefined : index + 1),
    );
    const isDisabled = disabled || gridDisabled;
    const selected = isRowSelected(value);

    const handleClick = useCallback<MouseEventHandler<HTMLTableRowElement>>(() => {
      if (!selectOnRowClick || isDisabled) return;
      selectRow(value);
    }, [isDisabled, selectOnRowClick, selectRow, value]);

    const rowContext = useMemo<DataGridRowContextValue>(
      () => ({
        rowIndex: resolvedRowIndex,
        value,
        disabled: isDisabled,
        selected,
      }),
      [isDisabled, resolvedRowIndex, selected, value],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "row",
      "aria-disabled": isDisabled || undefined,
      "aria-rowindex": resolvedRowIndex,
      "aria-selected": selectionMode === "none" ? undefined : selected,
      "data-slot": dataSlot,
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
