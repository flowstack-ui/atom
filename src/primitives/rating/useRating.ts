"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { clampRatingValue, getRatingItemState, normalizeRatingRange, snapRatingValue } from "./utils.js";
import type { RatingRootProps } from "./RatingRoot.js";

export type UseRatingProps = RatingRootProps;
export const ratingControllerGuards = new WeakMap<RatingController, Set<() => boolean>>();

export function useRating(options: UseRatingProps = {}) {
  const range = normalizeRatingRange(options.min, options.max);
  const step = Number.isFinite(options.step) && options.step! > 0 ? options.step! : 1;
  const guards = useRef(new Set<() => boolean>());
  const [rawValue, updateValue] = useControllableState({
    value: options.value,
    defaultValue: options.defaultValue ?? range.min,
    onChange: options.onValueChange,
  });
  const value = clampRatingValue(rawValue, range.min, range.max);
  const [hoveredValue, updateHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const canEdit = useCallback(() => !options.disabled && !options.readOnly &&
    [...guards.current].every(guard => guard()), [options.disabled, options.readOnly]);
  const setValue = useCallback((next: number) => {
    if (canEdit()) updateValue(clampRatingValue(snapRatingValue(next, step, range.min), range.min, range.max));
  }, [canEdit, updateValue, step, range.min, range.max]);
  const setHoveredValue = useCallback((next: number | null) => {
    const resolved = next === null || !canEdit() ? null : clampRatingValue(next, range.min, range.max);
    if (hoverRef.current === resolved) return;
    hoverRef.current = resolved;
    updateHover(resolved);
    options.onHoverChange?.(resolved);
  }, [canEdit, options.onHoverChange, range.min, range.max]);
  const reset = useCallback(() => {
    setHoveredValue(null);
    if (options.value === undefined) updateValue(clampRatingValue(options.defaultValue ?? range.min, range.min, range.max));
  }, [setHoveredValue, options.value, options.defaultValue, range.min, range.max, updateValue]);
  const previewValue = hoveredValue ?? value;
  const getItemState = useCallback((endpoint: number) => getRatingItemState(previewValue, endpoint, range.min), [previewValue, range.min]);
  const items = useMemo(() => Number.isInteger(range.min) && Number.isInteger(range.max) && range.max - range.min <= 1000
    ? Array.from({ length: range.max - range.min }, (_, index) => range.min + index + 1) : [], [range.min, range.max]);
  const controller = {
    options, value, min: range.min, max: range.max, step, hoveredValue, previewValue,
    disabled: options.disabled ?? false, readOnly: options.readOnly ?? false,
    items, setValue, setHoveredValue, clearValue: () => setValue(range.min), reset, getItemState,
  };
  ratingControllerGuards.set(controller, guards.current);
  return controller;
}

export type RatingController = ReturnType<typeof useRating>;
