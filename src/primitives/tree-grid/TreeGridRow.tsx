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
import type { NativeTableRowProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  TreeGridRowContextProvider,
  normalizeTreeGridIndex,
  useTreeGridContext,
  type TreeGridRowContextValue,
  type TreeGridRowData,
} from "./context.js";

type TreeGridRowNativeProps = NativeTableRowProps<
  | "children"
  | "role"
  | "aria-disabled"
  | "aria-expanded"
  | "aria-hidden"
  | "aria-level"
  | "aria-rowindex"
  | "aria-selected"
>;

export interface TreeGridRowProps extends TreeGridRowNativeProps {
  children?: ReactNode;
  value: string;
  parentValue?: string | null;
  rowIndex?: number;
  index?: number;
  level?: number;
  expandable?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TreeGridRow = forwardRef<HTMLTableRowElement, TreeGridRowProps>(
  function TreeGridRow(
    {
      children,
      value,
      parentValue = null,
      rowIndex,
      index,
      level,
      expandable = false,
      selectable = true,
      disabled = false,
      render,
      asChild,
      onClick,
      "data-slot": dataSlot = "tree-grid-row",
      ...restProps
    },
    ref,
  ) {
    const {
      disabled: treeGridDisabled,
      isRowExpanded,
      isRowSelected,
      isRowVisible,
      registerRow,
      selectOnRowClick,
      selectRow,
      selectionMode,
      unregisterRow,
      updateRow,
    } = useTreeGridContext();
    const rowRef = useRef<HTMLElement | null>(null);
    const composedRef = useMemo(() => composeRefs(rowRef, ref), [ref]);
    const generatedId = useId();
    const resolvedRowIndex = normalizeTreeGridIndex(
      rowIndex ?? (index === undefined ? undefined : index + 1),
    );
    const resolvedLevel = normalizeTreeGridIndex(level) ?? 1;
    const isDisabled = disabled || treeGridDisabled;
    const selected = isRowSelected(value);
    const expanded = isRowExpanded(value);
    const visible = isRowVisible(value, parentValue);
    const rowId = `tree-grid-row-${generatedId}`;

    const rowData = useMemo<TreeGridRowData>(
      () => ({
        id: rowId,
        rowIndex: resolvedRowIndex ?? 0,
        value,
        parentValue,
        level: resolvedLevel,
        expandable,
        selectable,
      }),
      [expandable, parentValue, resolvedLevel, resolvedRowIndex, rowId, selectable, value],
    );

    useEffect(() => {
      const element = rowRef.current;
      if (!element || !resolvedRowIndex) return undefined;
      registerRow(value, element, rowData, isDisabled);
      return () => unregisterRow(value);
    }, [registerRow, resolvedRowIndex, unregisterRow, value]);

    useEffect(() => {
      if (!resolvedRowIndex) return;
      updateRow(value, rowData, isDisabled);
    }, [isDisabled, resolvedRowIndex, rowData, updateRow, value]);

    const handleClick = useCallback<MouseEventHandler<HTMLTableRowElement>>(() => {
      if (isDisabled) return;
      if (selectOnRowClick) selectRow(value);
    }, [isDisabled, selectOnRowClick, selectRow, value]);

    const rowContext = useMemo<TreeGridRowContextValue>(
      () => ({
        rowIndex: resolvedRowIndex,
        value,
        parentValue,
        level: resolvedLevel,
        expandable,
        selectable,
        expanded,
        visible,
        disabled: isDisabled,
        selected,
      }),
      [
        expandable,
        expanded,
        isDisabled,
        parentValue,
        resolvedLevel,
        resolvedRowIndex,
        selectable,
        selected,
        value,
        visible,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: rowId,
      role: "row",
      "aria-disabled": isDisabled || undefined,
      "aria-expanded": expandable ? expanded : undefined,
      "aria-hidden": visible ? undefined : true,
      "aria-level": resolvedLevel,
      "aria-rowindex": resolvedRowIndex,
      "aria-selected": selectionMode === "none" ? undefined : selected,
      "data-slot": dataSlot,
      ...(expandable && { "data-expandable": "" }),
      ...(selectable && selectionMode !== "none" && { "data-selectable": "" }),
      ...(!selectable && selectionMode !== "none" && { "data-selection-disabled": "" }),
      ...(expanded && { "data-expanded": "" }),
      ...(!visible && { "data-hidden": "", hidden: true }),
      ...(isDisabled && { "data-disabled": "" }),
      ...(parentValue !== null && { "data-parent-value": parentValue }),
      ...(resolvedLevel !== undefined && { "data-level": resolvedLevel }),
      ...(resolvedRowIndex !== undefined && { "data-row-index": resolvedRowIndex }),
      ...(selected && { "data-selected": "" }),
      "data-value": value,
      onClick: composeEventHandlers(onClick, handleClick),
    };

    return (
      <TreeGridRowContextProvider value={rowContext}>
        {asChild
          ? cloneAndMerge(children, behaviorProps)
          : renderElement(render, "tr", { ...behaviorProps, children })}
      </TreeGridRowContextProvider>
    );
  },
);
