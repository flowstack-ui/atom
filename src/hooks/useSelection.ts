"use client";

import { useMemo, useRef } from "react";
import { useControllableState } from "./useControllableState.js";
import type { CheckboxRootProps } from "../primitives/checkbox/CheckboxRoot.js";

export type SelectionMode = "single" | "multiple";
export interface SelectionOptions {
  mode?: SelectionMode;
  selectedKeys?: readonly string[];
  defaultSelectedKeys?: readonly string[];
  onSelectionChange?: (keys: readonly string[]) => void;
  orderedKeys: readonly string[];
  disabledKeys?: readonly string[];
  disabled?: boolean;
  readOnly?: boolean;
}
export interface SelectionState {
  readonly selectedKeys: readonly string[];
  isSelected(key: string): boolean;
  canSelect(key: string): boolean;
  setSelected(key: string, selected: boolean): void;
  toggle(key: string): void;
  setSelection(keys: readonly string[]): void;
  clearSelection(): void;
  selectRange(anchor: string, target: string, selected?: boolean): void;
  setScopeSelected(keys: readonly string[], selected: boolean): void;
  getScopeState(keys: readonly string[]): "none" | "some" | "all";
}
const empty: readonly string[] = Object.freeze([]);
function keys(values: readonly string[], unique = false): readonly string[] {
  if (values.some((value) => typeof value !== "string" || value.length === 0)) {
    throw new TypeError("Selection keys must be nonempty strings.");
  }
  const result = [...new Set(values)];
  if (unique && result.length !== values.length) throw new TypeError("orderedKeys must be unique.");
  return Object.freeze(result);
}
function validateMode(values: readonly string[], mode: SelectionMode) {
  if (mode === "single" && values.length > 1) throw new TypeError("Single selection accepts at most one key.");
}
interface Binding {
  readOnly: boolean;
  isDisabled(value: string): boolean;
  activate(value: string, checked: boolean, range: boolean): void;
}
const bindings = new WeakMap<SelectionState, Binding>();

/** Record-ID state only: does not create DOM, focus management or ARIA roles. */
export function useSelection(options: SelectionOptions): SelectionState {
  const { mode = "multiple", disabled = false, readOnly = false } = options;
  const order = useMemo(() => keys(options.orderedKeys, true), [options.orderedKeys]);
  const orderSet = useMemo(() => new Set(order), [order]);
  const disabledSet = useMemo(() => new Set(keys(options.disabledKeys ?? empty)), [options.disabledKeys]);
  const defaults = useMemo(() => keys(options.defaultSelectedKeys ?? empty), [options.defaultSelectedKeys]);
  const [value, setValue] = useControllableState<readonly string[]>({
    value: options.selectedKeys,
    defaultValue: defaults,
    onChange: options.onSelectionChange,
  });
  const selected = useMemo(() => keys(value), [value]);
  validateMode(selected, mode);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  // Immediate sequential commands must compose before React commits a render.
  const latest = useRef(selected);
  latest.current = selected;
  const anchor = useRef<string | null>(null);
  const orderIdentity = JSON.stringify([mode, order]);
  const anchorOrder = useRef(orderIdentity);
  if (anchorOrder.current !== orderIdentity) {
    anchor.current = null;
    anchorOrder.current = orderIdentity;
  }
  const state = useMemo<SelectionState>(() => {
    const eligible = (key: string) => orderSet.has(key) && !disabledSet.has(key);
    const commit = (next: readonly string[]) => {
      if (disabled || readOnly) return;
      const normalized = keys(next);
      validateMode(normalized, mode);
      const previous = latest.current;
      if (previous.length === normalized.length && previous.every((key, index) => key === normalized[index])) return;
      if (options.selectedKeys === undefined) latest.current = normalized;
      setValue(normalized);
    };
    const setSelected = (key: string, checked: boolean) => {
      if (!eligible(key)) return;
      commit(checked
        ? mode === "single" ? [key] : [...latest.current, key]
        : latest.current.filter((item) => item !== key));
    };
    const setScopeSelected = (scope: readonly string[], checked: boolean) => {
      if (disabled || readOnly) return;
      const targets = keys(scope).filter(eligible);
      if (checked && mode === "single" && targets.length > 1) {
        throw new TypeError("Single selection cannot select a multi-key scope.");
      }
      if (!targets.length) return;
      const targetSet = new Set(targets);
      commit(checked
        ? mode === "single" ? targets : [...latest.current, ...targets]
        : latest.current.filter((item) => !targetSet.has(item)));
    };
    return {
      selectedKeys: selected,
      isSelected: (key) => selectedSet.has(key),
      canSelect: (key) => !disabled && !readOnly && eligible(key),
      setSelected,
      toggle: (key) => setSelected(key, !latest.current.includes(key)),
      setSelection: commit,
      clearSelection: () => commit(empty),
      setScopeSelected,
      selectRange: (from, to, checked = true) => {
        if (!eligible(to)) return;
        const start = eligible(from) ? order.indexOf(from) : -1;
        const end = order.indexOf(to);
        setScopeSelected(start < 0 ? [to] : order.slice(Math.min(start, end), Math.max(start, end) + 1), checked);
      },
      getScopeState: (scope) => {
        const targets = keys(scope).filter(eligible);
        if (!targets.length) return "none";
        const count = targets.filter((key) => selectedSet.has(key)).length;
        return count === 0 ? "none" : count === targets.length ? "all" : "some";
      },
    };
  }, [disabled, readOnly, mode, order, orderSet, disabledSet, selected, selectedSet, options.selectedKeys, setValue]);
  bindings.set(state, {
    readOnly,
    isDisabled: (key) => disabled || !orderSet.has(key) || disabledSet.has(key),
    activate: (key, checked, range) => {
      if (!state.canSelect(key)) return;
      if (range && mode === "multiple") state.selectRange(anchor.current ?? key, key, checked);
      else {
        state.setSelected(key, checked);
        anchor.current = key;
      }
    },
  });
  return state;
}

export interface SelectionCheckboxOptions {
  selection: SelectionState;
  value: string;
  rangeSelection?: boolean;
}
export type SelectionCheckboxProps = Pick<CheckboxRootProps,
  "checked" | "disabled" | "readOnly" | "onClick" | "onKeyDown" | "onBlur" | "onCheckedChange"
>;

/** Bind these props to Atom/Brick Checkbox, not to an arbitrary native input. */
export function useSelectionCheckbox({ selection, value, rangeSelection = false }: SelectionCheckboxOptions): SelectionCheckboxProps {
  const shift = useRef(false);
  const binding = bindings.get(selection);
  if (!binding) throw new TypeError("selection must be returned by useSelection.");
  return {
    checked: selection.isSelected(value),
    disabled: binding.isDisabled(value),
    readOnly: binding.readOnly,
    onClick: (event) => { shift.current = rangeSelection && event.shiftKey; },
    onKeyDown: (event) => { shift.current = rangeSelection && event.shiftKey && event.key === " "; },
    onBlur: () => { shift.current = false; },
    onCheckedChange: (checked) => {
      const range = shift.current;
      shift.current = false;
      binding.activate(value, checked === true, range);
    },
  };
}
