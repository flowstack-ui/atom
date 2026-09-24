"use client";

import { useCallback, useId, useMemo, useRef } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { getProgressState, type ProgressState, type ProgressStateOptions } from "./utils.js";

export interface ProgressIds {
  root?: string;
  label?: string;
}

export interface UseProgressProps extends ProgressStateOptions {
  /** Initial uncontrolled value; omitted means unknown progress. */
  defaultValue?: number | null;
  /** Called for a changed value requested through the controller. */
  onValueChange?: (details: ProgressState) => void;
  /** Stable IDs for external labeling and host composition. */
  ids?: ProgressIds;
}

export interface ProgressController extends ProgressState {
  ids: Required<ProgressIds>;
  /** Update application-owned progress; does not make the bar interactive. */
  setValue: (value: number | null) => void;
}

export function useProgress({ value, defaultValue = null, min = 0, max = 100, onValueChange, ids }: UseProgressProps = {}): ProgressController {
  const generatedId = useId();
  const onChange = useCallback((next: number | null) => {
    onValueChange?.(getProgressState({ value: next, min, max }));
  }, [onValueChange, min, max]);
  const [current, update] = useControllableState<number | null>({ value, defaultValue, onChange });
  const state = useMemo(() => getProgressState({ value: current, min, max }), [current, min, max]);
  const latestValue = useRef(state.value);
  latestValue.current = state.value;
  const setValue = useCallback((next: number | null) => {
    const normalized = getProgressState({ value: next, min, max }).value;
    if (Object.is(normalized, latestValue.current)) return;
    // Uncontrolled requests compose before React commits the next render.
    // Controlled requests never replace the owner's accepted value.
    if (value === undefined) latestValue.current = normalized;
    update(normalized);
  }, [min, max, value, update]);
  const rootId = ids?.root ?? `progress-${generatedId}`;
  const labelId = ids?.label ?? `${rootId}-label`;
  return useMemo(() => ({ ...state, ids: { root: rootId, label: labelId }, setValue }), [state, rootId, labelId, setValue]);
}
