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
} from "./context.js";

type DataGridCellNativeProps = NativeTableCellProps<
  "children" | "role" | "aria-colindex" | "aria-disabled" | "aria-selected"
>;

export interface DataGridCellProps extends DataGridCellNativeProps {
  children?: ReactNode;
  columnIndex?: number;
  index?: number;
  disabled?: boolean;
  /** Opt into managed child-control focus using Enter/F2 and Escape. */
  interactive?: boolean;
  /** Render a native row header with rowheader semantics. */
  rowHeader?: boolean;
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
      interactive = false,
      rowHeader = false,
      render,
      asChild,
      onClick,
      onMouseDown,
      onKeyDown,
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
      : `cell-${generatedId}`;
    const cellId = `${gridId}-cell-${generatedId}`;
    const childTabs = useRef(new Map<HTMLElement, string | null>());
    const enterInteraction = useCallback(() => {
      if (!interactive || isDisabled) return false;
      const element = cellRef.current;
      if (!element) return false;
      const candidates = [...element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)]
        .filter(node => !node.matches(":disabled, [aria-disabled='true']") && !node.closest("[hidden], [inert]") && node.getClientRects().length > 0);
      const first = candidates[0];
      if (!first) return false;
      for (const node of candidates) {
        const authored = childTabs.current.get(node);
        if (authored === null) node.removeAttribute("tabindex");
        else node.setAttribute("tabindex", authored ?? "0");
      }
      first.focus({ preventScroll: true });
      return element.contains(element.ownerDocument.activeElement);
    }, [interactive, isDisabled]);

    useEffect(() => {
      const element = cellRef.current;
      if (!interactive || !element) return;
      const tabs = childTabs.current;
      const sync = () => {
        const editing = element.contains(element.ownerDocument.activeElement);
        for (const node of element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) {
          if (!tabs.has(node)) tabs.set(node, node.getAttribute("tabindex"));
          if (!editing || isDisabled) node.tabIndex = -1;
        }
      };
      const focusIn = () => {
        if (!isDisabled && resolvedRowIndex && resolvedColumnIndex)
          setActiveCell({ rowIndex: resolvedRowIndex, columnIndex: resolvedColumnIndex });
      };
      const focusOut = (event: FocusEvent) => {
        if (!(event.relatedTarget instanceof Node) || !element.contains(event.relatedTarget)) {
          for (const node of tabs.keys()) node.tabIndex = -1;
        }
      };
      sync();
      const observer = new MutationObserver(sync);
      observer.observe(element, { childList: true, subtree: true });
      element.addEventListener("focusin", focusIn);
      element.addEventListener("focusout", focusOut);
      return () => {
        observer.disconnect();
        element.removeEventListener("focusin", focusIn);
        element.removeEventListener("focusout", focusOut);
        for (const [node, value] of tabs) {
          if (value === null) node.removeAttribute("tabindex");
          else node.setAttribute("tabindex", value);
        }
        tabs.clear();
      };
    }, [interactive, isDisabled, resolvedColumnIndex, resolvedRowIndex, setActiveCell]);

    const cellData = useMemo<DataGridCellData>(
      () => ({
        id: cellId,
        rowIndex: resolvedRowIndex ?? 0,
        columnIndex: resolvedColumnIndex ?? 0,
        rowValue: rowCtx?.value,
        enterInteraction: interactive ? enterInteraction : undefined,
      }),
      [cellId, enterInteraction, interactive, resolvedColumnIndex, resolvedRowIndex, rowCtx?.value],
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
      if (interactive && control && event.currentTarget.contains(control)) return;
      focusCell(resolvedRowIndex, resolvedColumnIndex);
    }, [focusCell, interactive, isDisabled, resolvedColumnIndex, resolvedRowIndex]);

    const active = focused &&
      activeCell?.rowIndex === resolvedRowIndex &&
      activeCell?.columnIndex === resolvedColumnIndex;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: cellId,
      role: rowHeader ? "rowheader" : "gridcell",
      ...(rowHeader && { scope: "row" }),
      "aria-colindex": resolvedColumnIndex,
      "aria-disabled": actuallyDisabled || undefined,
      "aria-selected": selectionMode === "none" ? undefined : selected,
      "data-slot": dataSlot,
      ...(resolvedColumnIndex !== undefined && { "data-column-index": resolvedColumnIndex }),
      ...(active && { "data-active": "" }),
      ...(selected && { "data-selected": "" }),
      ...(actuallyDisabled && { "data-disabled": "" }),
      ...(interactive && { "data-interactive": "" }),
      onKeyDown: composeEventHandlers(onKeyDown, event => {
        if (!interactive || event.key !== "Escape" || event.target === event.currentTarget) return;
        if ((event.target as Element).closest("[role='grid']") !== event.currentTarget.closest("[role='grid']")) return;
        if (!resolvedRowIndex || !resolvedColumnIndex || isDisabled) return;
        event.preventDefault();
        event.stopPropagation();
        focusCell(resolvedRowIndex, resolvedColumnIndex);
        for (const node of childTabs.current.keys()) node.tabIndex = -1;
      }),
      onClick: composeEventHandlers(onClick, handleClick),
      onMouseDown: composeEventHandlers(onMouseDown, event => {
        // Establish the actual pointer target before native focus can initialize
        // the grid's keyboard-entry fallback. Touch scrolling is unaffected;
        // a completed tap receives the browser's compatibility mouse event.
        if (event.button !== 0 || !resolvedRowIndex || !resolvedColumnIndex || isDisabled) return;
        if ((event.target as Element).closest("[role='grid']") !== event.currentTarget.closest("[role='grid']")) return;
        const control = (event.target as Element).closest(FOCUSABLE_SELECTOR);
        if (control && event.currentTarget.contains(control)) return;
        setActiveCell({ rowIndex: resolvedRowIndex, columnIndex: resolvedColumnIndex });
      }),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, rowHeader ? "th" : "td", { ...behaviorProps, children });
  },
);
