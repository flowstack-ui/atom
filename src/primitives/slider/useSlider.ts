"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import { useFieldContext } from "../field/context.js";
import {
  applySliderCollision,
  getClosestThumbIndex,
  normalizeSliderConfig,
  normalizeSliderValues,
  percentToValue,
  valueToPercent,
  type SliderCollisionBehavior,
} from "./utils.js";

export type SliderOrientation = "horizontal" | "vertical";
export type SliderOrigin = "start" | "center" | "end";
export type SliderThumbAlignment = "contain" | "center";
export type SliderHiddenInputMode = "automatic" | "explicit";
export type SliderValue = number | number[];

export interface SliderThumbSize {
  width: number;
  height: number;
}

export interface UseSliderProps {
  value?: SliderValue;
  defaultValue?: SliderValue;
  onValueChange?: (value: SliderValue) => void;
  onValueCommit?: (value: SliderValue) => void;
  onFocusChange?: (index: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;
  minStepsBetweenThumbs?: number;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  orientation?: SliderOrientation;
  dir?: DirectionValue;
  origin?: SliderOrigin;
  thumbAlignment?: SliderThumbAlignment;
  thumbSize?: SliderThumbSize;
  thumbCollisionBehavior?: SliderCollisionBehavior;
  hiddenInputMode?: SliderHiddenInputMode;
  name?: string;
  form?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  ariaValueText?: (value: number, index: number) => string;
}

export interface SliderThumbBehaviorProps {
  role: "slider";
  tabIndex: number;
  id: string;
  "aria-valuenow": number;
  "aria-valuemin": number;
  "aria-valuemax": number;
  "aria-orientation": SliderOrientation;
  "aria-label"?: string;
  "aria-valuetext"?: string;
  "aria-disabled"?: true;
  "aria-readonly"?: true;
  "aria-invalid"?: true;
  "aria-required"?: true;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "data-slot": "slider-thumb";
  "data-focus"?: "";
  "data-dragging"?: "";
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
  onPointerCancel: (event: PointerEvent) => void;
  onLostPointerCapture: (event: PointerEvent) => void;
}

export interface SliderThumbState {
  index: number;
  value: number;
  percent: number;
  focused: boolean;
  dragging: boolean;
}

export interface SliderRangeState {
  minPercent: number;
  maxPercent: number;
  startPercent: number;
  endPercent: number;
}

interface PointerSession {
  pointerId: number;
  thumbIndex: number;
  initialValues: number[];
  currentValues: number[];
  captureTarget: Element;
  offsetX: number;
  offsetY: number;
}

export interface SliderController {
  values: number[];
  isRange: boolean;
  min: number;
  max: number;
  step: number;
  largeStep: number;
  minGap: number;
  orientation: SliderOrientation;
  dir: DirectionValue;
  origin: SliderOrigin;
  thumbAlignment: SliderThumbAlignment;
  thumbCollisionBehavior: SliderCollisionBehavior;
  hiddenInputMode: SliderHiddenInputMode;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  name?: string;
  form?: string;
  focusedIndex: number | null;
  draggingIndex: number | null;
  rootRef: RefObject<HTMLElement | null>;
  controlRef: RefObject<HTMLDivElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
  ids: {
    root: string;
    control: string;
    label: string;
    valueText: string;
    markerGroup: string;
    thumb: (index: number) => string;
    hiddenInput: (index: number) => string;
  };
  valueToPercent: (value: number) => number;
  getThumbState: (index: number) => SliderThumbState;
  getThumbProps: (index: number) => SliderThumbBehaviorProps;
  getRangeState: () => SliderRangeState;
  getRangeOffsetStyle: () => Record<string, string>;
  getMarkerState: (value: number) => { value: number; percent: number; selected: boolean };
  getThumbOffsetStyle: (index: number) => Record<string, string>;
  getMarkerOffsetStyle: (value: number) => Record<string, string>;
  registerThumb: (index: number, node: HTMLElement | null) => void;
  handleTrackPointerDown: (event: PointerEvent) => void;
  handlePointerMove: (event: PointerEvent) => void;
  handlePointerUp: (event: PointerEvent) => void;
  handlePointerCancel: (event: PointerEvent) => void;
  setValue: (value: SliderValue) => void;
  commitValue: (value?: SliderValue) => void;
  focusThumb: (index: number) => void;
  getHiddenInputProps: (index: number) => {
    id: string;
    type: "hidden";
    name?: string;
    form?: string;
    value: number;
    disabled: boolean;
  };
}

function toArray(value: SliderValue | undefined, min: number): number[] {
  if (value === undefined) return [min];
  return Array.isArray(value) ? [...value] : [value];
}

function toOutput(values: number[]): SliderValue {
  return values.length === 1 ? values[0] : values;
}

function joinIds(...values: Array<string | undefined>): string | undefined {
  const ids = [...new Set(values.flatMap((value) => value?.split(/\s+/u) ?? []).filter(Boolean))];
  return ids.length ? ids.join(" ") : undefined;
}

export function useSlider(props: UseSliderProps = {}): SliderController {
  const field = useFieldContext();
  const direction = useDirection();
  const rawValues = toArray(props.value ?? props.defaultValue, props.min ?? 0);
  const config = normalizeSliderConfig(
    props.min ?? 0,
    props.max ?? 100,
    props.step ?? 1,
    rawValues.length,
    props.minStepsBetweenThumbs ?? 0,
  );
  const defaultValues = normalizeSliderValues(
    toArray(props.defaultValue, config.min),
    config.min,
    config.max,
    config.step,
    config.minGap,
  );
  const controlledValues = props.value === undefined
    ? undefined
    : normalizeSliderValues(toArray(props.value, config.min), config.min, config.max, config.step, config.minGap);
  const [values, setValues] = useControllableState<number[]>({
    value: controlledValues,
    defaultValue: defaultValues,
    onChange: (next) => props.onValueChange?.(toOutput(next)),
  });
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const rootRef = useRef<HTMLElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerSessionRef = useRef<PointerSession | null>(null);
  const pendingCommitRef = useRef<number[] | null>(null);
  const thumbNodesRef = useRef(new Map<number, HTMLElement>());
  const thumbObserversRef = useRef(new Map<number, ResizeObserver>());
  const [measuredThumbSize, setMeasuredThumbSize] = useState<SliderThumbSize>({ width: 0, height: 0 });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const generatedId = useId().replace(/:/gu, "");
  const prefix = `slider-${generatedId}`;
  const orientation = props.orientation ?? "horizontal";
  const dir = props.dir ?? direction;
  const disabled = props.disabled ?? field?.disabled ?? false;
  const readOnly = props.readOnly ?? field?.readOnly ?? false;
  const invalid = props.invalid ?? field?.invalid ?? false;
  const required = props.required ?? field?.required ?? false;
  const origin = props.origin ?? "start";
  const thumbAlignment = props.thumbAlignment ?? "contain";
  const collision = props.thumbCollisionBehavior ?? "none";
  const hiddenInputMode = props.hiddenInputMode ?? "automatic";
  const largeStep = Number.isFinite(props.largeStep) && (props.largeStep ?? 0) > 0
    ? props.largeStep!
    : config.step * 10;
  const resolvedThumbSize = props.thumbSize ?? measuredThumbSize;

  const reset = useCallback(() => {
    pointerSessionRef.current = null;
    setDraggingIndex(null);
    if (props.value === undefined) setValues(defaultValues);
  }, [defaultValues, props.value, setValues]);
  useFormReset(rootRef, props.form, props.value !== undefined, reset);

  const finishSession = useCallback((mode: "commit" | "cancel") => {
    const session = pointerSessionRef.current;
    if (!session) return;
    pointerSessionRef.current = null;
    setDraggingIndex(null);
    if (mode === "cancel") {
      pendingCommitRef.current = null;
      setValues(session.initialValues);
    } else if (props.value !== undefined) {
      // React batches the final change with the owner's render. Commit only
      // after that render accepts the proposal, never the rejected draft.
      pendingCommitRef.current = session.currentValues;
    } else props.onValueCommit?.(toOutput(session.currentValues));
  }, [props.onValueCommit, props.value, setValues]);

  useEffect(() => {
    const proposed = pendingCommitRef.current;
    pendingCommitRef.current = null;
    if (proposed && values.length === proposed.length && values.every((value, index) => value === proposed[index])) {
      props.onValueCommit?.(toOutput(proposed));
    }
  });

  useEffect(() => {
    if (disabled || readOnly) finishSession("cancel");
  }, [disabled, finishSession, readOnly]);
  useEffect(() => () => {
    pointerSessionRef.current = null;
  }, []);

  // A configuration change invalidates the old gesture coordinate system.
  const geometryKey = [orientation, dir, config.min, config.max, config.step, config.minGap, values.length].join(":");
  const previousGeometryRef = useRef(geometryKey);
  useEffect(() => {
    if (previousGeometryRef.current !== geometryKey) {
      pointerSessionRef.current = null;
      setDraggingIndex(null);
      previousGeometryRef.current = geometryKey;
    }
  }, [geometryKey]);
  const controlledValueKey = props.value === undefined ? undefined : values.join(":");
  useEffect(() => {
    const session = pointerSessionRef.current;
    if (props.value !== undefined && session &&
      (values.length !== session.currentValues.length || values.some((value, index) => value !== session.currentValues[index]))) {
      // Controlled owners may reject or replace a proposal. Never commit the
      // speculative gesture value over the owner's accepted state.
      pointerSessionRef.current = null;
      setDraggingIndex(null);
    }
  // Normalization produces a fresh array on local focus/drag renders. Those
  // renders are not an external value replacement and must not cancel a gesture
  // while React is still batching the owner's onValueChange update.
  }, [controlledValueKey]);

  const axisThumbSize = orientation === "horizontal" ? resolvedThumbSize.width : resolvedThumbSize.height;
  const pointerToValue = useCallback((clientX: number, clientY: number) => {
    const node = controlRef.current ?? trackRef.current;
    if (!node) return config.min;
    const rect = node.getBoundingClientRect();
    const total = orientation === "horizontal" ? rect.width : rect.height;
    const inset = thumbAlignment === "contain" ? Math.min(axisThumbSize / 2, total / 2) : 0;
    const usable = Math.max(0, total - inset * 2);
    let coordinate = orientation === "horizontal"
      ? (dir === "rtl" ? rect.right - clientX : clientX - rect.left)
      : rect.bottom - clientY;
    coordinate = Math.max(inset, Math.min(total - inset, coordinate));
    const percent = usable > 0 ? ((coordinate - inset) / usable) * 100 : 0;
    return percentToValue(percent, config.min, config.max, config.step);
  }, [axisThumbSize, config.max, config.min, config.step, dir, orientation, thumbAlignment]);

  const applyPointerValue = useCallback((requested: number, session: PointerSession) => {
    const previousActiveIndex = session.thumbIndex;
    const result = applySliderCollision(
      session.currentValues,
      requested,
      session.thumbIndex,
      collision,
      config.min,
      config.max,
      config.step,
      config.minGap,
    );
    session.currentValues = result.values;
    session.thumbIndex = result.activeIndex;
    setDraggingIndex(result.activeIndex);
    setValues(result.values);
    if (
      result.activeIndex !== previousActiveIndex &&
      thumbNodesRef.current.get(previousActiveIndex)?.ownerDocument.activeElement === thumbNodesRef.current.get(previousActiveIndex)
    ) {
      thumbNodesRef.current.get(result.activeIndex)?.focus({ preventScroll: true });
    }
  }, [collision, config.max, config.min, config.minGap, config.step, setValues]);

  const handleTrackPointerDown = useCallback((event: PointerEvent) => {
    if (disabled || readOnly || pointerSessionRef.current || event.button !== 0 || event.isPrimary === false) return;
    event.preventDefault();
    const requested = pointerToValue(event.clientX, event.clientY);
    const thumbIndex = values.length > 1 ? getClosestThumbIndex(requested, values) : 0;
    const session: PointerSession = {
      pointerId: event.pointerId,
      thumbIndex,
      initialValues: [...values],
      currentValues: [...values],
      captureTarget: event.currentTarget,
      offsetX: 0,
      offsetY: 0,
    };
    pointerSessionRef.current = session;
    setDraggingIndex(thumbIndex);
    applyPointerValue(requested, session);
    thumbNodesRef.current.get(session.thumbIndex)?.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [applyPointerValue, disabled, pointerToValue, readOnly, values]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const session = pointerSessionRef.current;
    if (!session || session.pointerId !== event.pointerId || disabled || readOnly) return;
    applyPointerValue(pointerToValue(event.clientX - session.offsetX, event.clientY - session.offsetY), session);
  }, [applyPointerValue, disabled, pointerToValue, readOnly]);
  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (event.type === "pointerup") handlePointerMove(event);
    if (pointerSessionRef.current?.pointerId === event.pointerId) finishSession("commit");
  }, [finishSession, handlePointerMove]);
  const handlePointerCancel = useCallback((event: PointerEvent) => {
    if (pointerSessionRef.current?.pointerId === event.pointerId) finishSession("cancel");
  }, [finishSession]);

  const valueToSliderPercent = useCallback(
    (value: number) => valueToPercent(value, config.min, config.max),
    [config.max, config.min],
  );

  const constrainedKeyboardValue = useCallback((requested: number, index: number) => {
    const lower = index > 0 ? values[index - 1] + config.minGap : config.min;
    const upper = index < values.length - 1 ? values[index + 1] - config.minGap : config.max;
    return Math.max(lower, Math.min(upper, requested));
  }, [config.max, config.min, config.minGap, values]);

  const handleKeyDown = useCallback((event: KeyboardEvent, index: number) => {
    if (disabled || readOnly) return;
    const ordinary = event.shiftKey ? largeStep : config.step;
    let requested = values[index];
    let handled = true;
    switch (event.key) {
      case "ArrowRight": requested += orientation === "horizontal" && dir === "rtl" ? -ordinary : ordinary; break;
      case "ArrowLeft": requested += orientation === "horizontal" && dir === "rtl" ? ordinary : -ordinary; break;
      case "ArrowUp": requested += ordinary; break;
      case "ArrowDown": requested -= ordinary; break;
      case "PageUp": requested += largeStep; break;
      case "PageDown": requested -= largeStep; break;
      case "Home": requested = index > 0 ? values[index - 1] + config.minGap : config.min; break;
      case "End": requested = index < values.length - 1 ? values[index + 1] - config.minGap : config.max; break;
      default: handled = false;
    }
    if (!handled) return;
    event.preventDefault();
    const next = [...values];
    next[index] = constrainedKeyboardValue(requested, index);
    const normalized = normalizeSliderValues(next, config.min, config.max, config.step, config.minGap);
    setValues(normalized);
    props.onValueCommit?.(toOutput(normalized));
  }, [config.max, config.min, config.minGap, config.step, constrainedKeyboardValue, dir, disabled, largeStep, orientation, props.onValueCommit, readOnly, setValues, values]);

  const getThumbState = useCallback((index: number): SliderThumbState => {
    const value = values[index] ?? config.min;
    return { index, value, percent: valueToSliderPercent(value), focused: focusedIndex === index, dragging: draggingIndex === index };
  }, [config.min, draggingIndex, focusedIndex, valueToSliderPercent, values]);

  const getRangeState = useCallback((): SliderRangeState => {
    const percents = values.map(valueToSliderPercent);
    const minPercent = Math.min(...percents);
    const maxPercent = Math.max(...percents);
    if (values.length > 1) return { minPercent, maxPercent, startPercent: minPercent, endPercent: maxPercent };
    const originPercent = origin === "start" ? 0 : origin === "end" ? 100 : valueToSliderPercent((config.min + config.max) / 2);
    return {
      minPercent,
      maxPercent,
      startPercent: Math.min(originPercent, maxPercent),
      endPercent: Math.max(originPercent, maxPercent),
    };
  }, [config.max, config.min, origin, valueToSliderPercent, values]);

  const getMarkerState = useCallback((value: number) => {
    const range = getRangeState();
    const percent = valueToSliderPercent(value);
    return { value, percent, selected: percent >= range.startPercent && percent <= range.endPercent };
  }, [getRangeState, valueToSliderPercent]);

  const getOffsetStyle = useCallback((percent: number): Record<string, string> => {
    const dimension = orientation === "horizontal" ? resolvedThumbSize.width : resolvedThumbSize.height;
    const offset = thumbAlignment === "contain" && dimension > 0
      ? `calc(${dimension / 2}px + (100% - ${dimension}px) * ${percent / 100})`
      : `${percent}%`;
    return orientation === "horizontal" ? { insetInlineStart: offset } : { insetBlockEnd: offset };
  }, [orientation, resolvedThumbSize.height, resolvedThumbSize.width, thumbAlignment]);
  const getRangeOffsetStyle = useCallback((): Record<string, string> => {
    const range = getRangeState();
    const dimension = orientation === "horizontal" ? resolvedThumbSize.width : resolvedThumbSize.height;
    // Scalar boundary fills reach the rail caps; ranges still join thumb centers.
    const position = (percent: number) => values.length === 1 && (percent === 0 || percent === 100)
      ? `${percent}%`
      : thumbAlignment === "contain" && dimension > 0
      ? `calc(${dimension / 2}px + (100% - ${dimension}px) * ${percent / 100})`
      : `${percent}%`;
    const end = thumbAlignment === "contain" && dimension > 0
      ? `calc(100% - ${position(range.endPercent)})`
      : `${100 - range.endPercent}%`;
    return orientation === "horizontal"
      ? { insetInlineStart: position(range.startPercent), insetInlineEnd: end }
      : { insetBlockStart: end, insetBlockEnd: position(range.startPercent) };
  }, [getRangeState, orientation, resolvedThumbSize.height, resolvedThumbSize.width, thumbAlignment, values.length]);

  const registerThumb = useCallback((index: number, node: HTMLElement | null) => {
    thumbObserversRef.current.get(index)?.disconnect();
    thumbObserversRef.current.delete(index);
    if (!node) thumbNodesRef.current.delete(index);
    else thumbNodesRef.current.set(index, node);
    if (props.thumbSize) return;
    const update = () => {
      const next = [...thumbNodesRef.current.values()].reduce((size, current) => {
        const rect = current.getBoundingClientRect();
        return { width: Math.max(size.width, rect.width), height: Math.max(size.height, rect.height) };
      }, { width: 0, height: 0 });
      setMeasuredThumbSize((previous) => previous.width === next.width && previous.height === next.height ? previous : next);
    };
    update();
    const Observer = node?.ownerDocument.defaultView?.ResizeObserver;
    if (!node || !Observer) return;
    const observer = new Observer(update);
    observer.observe(node);
    thumbObserversRef.current.set(index, observer);
  }, [props.thumbSize]);

  const getThumbProps = useCallback((index: number): SliderThumbBehaviorProps => {
    const state = getThumbState(index);
    const rootLabel = props["aria-label"];
    const rootLabelledBy = props["aria-labelledby"];
    const fallbackLabelledBy = rootLabel || rootLabelledBy ? undefined : joinIds(field?.labelId, `${prefix}-label`);
    return {
      role: "slider",
      tabIndex: disabled ? -1 : 0,
      id: `${prefix}-thumb-${index}`,
      "aria-valuenow": state.value,
      "aria-valuemin": index > 0 ? values[index - 1] + config.minGap : config.min,
      "aria-valuemax": index < values.length - 1 ? values[index + 1] - config.minGap : config.max,
      "aria-orientation": orientation,
      "aria-label": rootLabel ? (values.length > 1 ? `${rootLabel} ${index + 1}` : rootLabel) : undefined,
      "aria-labelledby": rootLabelledBy ?? fallbackLabelledBy,
      "aria-describedby": joinIds(props["aria-describedby"], field?.describedBy),
      "aria-valuetext": props.ariaValueText?.(state.value, index),
      "aria-disabled": disabled || undefined,
      "aria-readonly": readOnly || undefined,
      "aria-invalid": invalid || undefined,
      "aria-required": required || undefined,
      "data-slot": "slider-thumb",
      "data-focus": state.focused ? "" : undefined,
      "data-dragging": state.dragging ? "" : undefined,
      onFocus: () => { setFocusedIndex(index); props.onFocusChange?.(index); },
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocusedIndex(null);
          props.onFocusChange?.(null);
        }
      },
      onKeyDown: (event) => handleKeyDown(event, index),
      onPointerDown: (event) => {
        if (disabled || readOnly || pointerSessionRef.current || event.button !== 0 || event.isPrimary === false) return;
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        const session: PointerSession = {
          pointerId: event.pointerId,
          thumbIndex: index,
          initialValues: [...values],
          currentValues: [...values],
          captureTarget: event.currentTarget,
          offsetX: event.clientX - (rect.left + rect.width / 2),
          offsetY: event.clientY - (rect.top + rect.height / 2),
        };
        pointerSessionRef.current = session;
        setDraggingIndex(index);
        thumbNodesRef.current.get(index)?.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture?.(event.pointerId);
      },
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onLostPointerCapture: handlePointerUp,
    };
  }, [config.max, config.min, config.minGap, disabled, field?.describedBy, field?.labelId, getThumbState, handleKeyDown, handlePointerCancel, handlePointerMove, handlePointerUp, invalid, orientation, prefix, props, readOnly, required, values]);

  const setValue = useCallback((next: SliderValue) => {
    pointerSessionRef.current = null;
    setDraggingIndex(null);
    setValues(normalizeSliderValues(toArray(next, config.min), config.min, config.max, config.step, config.minGap));
  }, [config.max, config.min, config.minGap, config.step, setValues]);
  const commitValue = useCallback((next?: SliderValue) => {
    props.onValueCommit?.(toOutput(next === undefined ? valuesRef.current : toArray(next, config.min)));
  }, [config.min, props.onValueCommit]);
  const focusThumb = useCallback((index: number) => thumbNodesRef.current.get(index)?.focus({ preventScroll: true }), []);
  const getHiddenInputProps = useCallback((index: number) => ({
    id: `${prefix}-input-${index}`,
    type: "hidden" as const,
    name: props.name ? (values.length > 1 ? `${props.name}[${index}]` : props.name) : undefined,
    form: props.form,
    value: values[index] ?? config.min,
    disabled,
  }), [config.min, disabled, prefix, props.form, props.name, values]);

  return useMemo(() => ({
    values,
    isRange: values.length > 1,
    min: config.min,
    max: config.max,
    step: config.step,
    largeStep,
    minGap: config.minGap,
    orientation,
    dir,
    origin,
    thumbAlignment,
    thumbCollisionBehavior: collision,
    hiddenInputMode,
    disabled,
    readOnly,
    invalid,
    required,
    name: props.name,
    form: props.form,
    focusedIndex,
    draggingIndex,
    rootRef,
    controlRef,
    trackRef,
    ids: {
      root: `${prefix}-root`,
      control: `${prefix}-control`,
      label: `${prefix}-label`,
      valueText: `${prefix}-value-text`,
      markerGroup: `${prefix}-markers`,
      thumb: (index: number) => `${prefix}-thumb-${index}`,
      hiddenInput: (index: number) => `${prefix}-input-${index}`,
    },
    valueToPercent: valueToSliderPercent,
    getThumbState,
    getThumbProps,
    getRangeState,
    getRangeOffsetStyle,
    getMarkerState,
    getThumbOffsetStyle: (index: number) => getOffsetStyle(getThumbState(index).percent),
    getMarkerOffsetStyle: (value: number) => getOffsetStyle(valueToSliderPercent(value)),
    registerThumb,
    handleTrackPointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    setValue,
    commitValue,
    focusThumb,
    getHiddenInputProps,
  }), [collision, commitValue, config.max, config.min, config.minGap, config.step, dir, disabled, draggingIndex, focusThumb, focusedIndex, getHiddenInputProps, getMarkerState, getOffsetStyle, getRangeOffsetStyle, getRangeState, getThumbProps, getThumbState, handlePointerCancel, handlePointerMove, handlePointerUp, handleTrackPointerDown, hiddenInputMode, invalid, largeStep, orientation, origin, prefix, props.form, props.name, readOnly, registerThumb, required, setValue, thumbAlignment, valueToSliderPercent, values]);
}
