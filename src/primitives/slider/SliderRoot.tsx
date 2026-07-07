"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  clampSliderValue,
  getClosestThumbIndex,
  percentToValue,
  snapToStep,
  valueToPercent,
} from "./utils.js";
import { SliderContextProvider } from "./context.js";

export type SliderOrientation = "horizontal" | "vertical";
export type SliderValue = number | number[];

type SliderRootNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange">;

export interface SliderRootProps extends SliderRootNativeProps {
  /** Controlled value. Number for single, number array for range. */
  value?: SliderValue;
  /** Initial value for uncontrolled mode. */
  defaultValue?: SliderValue;
  /** Callback on every value change. */
  onValueChange?: (value: SliderValue) => void;
  /** Callback on final committed value. */
  onValueCommit?: (value: SliderValue) => void;
  /** Minimum value. */
  min?: number;
  /** Maximum value. */
  max?: number;
  /** Step increment. */
  step?: number;
  /** Large step for Page Up and Page Down. */
  largeStep?: number;
  /** Minimum steps between thumbs in range mode. */
  minStepsBetweenThumbs?: number;
  /** Disable interaction. */
  disabled?: boolean;
  /** Slider orientation. */
  orientation?: SliderOrientation;
  /** Text direction used for horizontal pointer and keyboard behavior. */
  dir?: DirectionValue;
  /** HTML name attribute for hidden inputs. */
  name?: string;
  /** Associates hidden inputs with a form by ID. */
  form?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Function to generate aria-valuetext from the current value. */
  ariaValueText?: (value: number) => string;
  /** CSS class name on the root container. */
  className?: string;
  /** Slider compound parts. */
  children?: ReactNode;
  /** Data slot identifier on the root container. */
  "data-slot"?: string;
}

export interface SliderThumbBehaviorProps {
  role: "slider";
  tabIndex: number;
  "aria-valuenow": number;
  "aria-valuemin": number;
  "aria-valuemax": number;
  "aria-orientation": SliderOrientation;
  "aria-label"?: string;
  "aria-valuetext"?: string;
  "aria-disabled"?: true;
  "data-slot": "slider-thumb";
  onKeyDown: (event: KeyboardEvent) => void;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
}

function normalizeValues(value: SliderValue | undefined, min: number): number[] {
  if (value === undefined) return [min];
  return Array.isArray(value) ? [...value] : [value];
}

function outputValue(values: number[]): SliderValue {
  return values.length === 1 ? values[0] : values;
}

export const SliderRoot = forwardRef<HTMLDivElement, SliderRootProps>(
  function SliderRoot(props, ref) {
    const {
      value,
      defaultValue,
      onValueChange,
      onValueCommit,
      min: minProp,
      max: maxProp,
      step: stepProp,
      largeStep: largeStepProp,
      minStepsBetweenThumbs,
      disabled: disabledProp,
      orientation: orientationProp,
      dir: dirProp,
      name,
      form,
      ariaLabel,
      ariaValueText,
      className,
      children,
      "data-slot": dataSlot = "slider",
      ...restProps
    } = props;
    const min = minProp ?? 0;
    const max = maxProp ?? 100;
    const step = stepProp ?? 1;
    const largeStep = largeStepProp ?? step * 10;
    const minStepsBetween = minStepsBetweenThumbs ?? 0;
    const orientation = orientationProp ?? "horizontal";
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const isHorizontal = orientation === "horizontal";
    const disabled = disabledProp ?? false;
    const isControlled = value !== undefined;
    const [internalValues, setInternalValues] = useState<number[]>(
      normalizeValues(defaultValue, min),
    );
    const values = isControlled ? normalizeValues(value, min) : internalValues;
    const isRange = values.length > 1;
    const trackRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef<number | null>(null);

    const updateValues = useCallback(
      (newValues: number[]) => {
        if (!isControlled) setInternalValues(newValues);
        onValueChange?.(outputValue(newValues));
      },
      [isControlled, onValueChange],
    );

    const commitValues = useCallback(
      (newValues: number[]) => {
        onValueCommit?.(outputValue(newValues));
      },
      [onValueCommit],
    );

    const constrainValue = useCallback(
      (
        newValue: number,
        thumbIndex: number,
        currentValues: number[],
      ): number => {
        let clamped = clampSliderValue(newValue, min, max);
        clamped = snapToStep(clamped, step, min);

        if (isRange) {
          const minGap = minStepsBetween * step;
          if (thumbIndex > 0) {
            clamped = Math.max(clamped, currentValues[thumbIndex - 1] + minGap);
          }
          if (thumbIndex < currentValues.length - 1) {
            clamped = Math.min(clamped, currentValues[thumbIndex + 1] - minGap);
          }
        }

        return clampSliderValue(clamped, min, max);
      },
      [isRange, max, min, minStepsBetween, step],
    );

    const pointerToValue = useCallback((clientX: number, clientY: number): number => {
      const track = trackRef.current;
      if (!track) return min;

      const rect = track.getBoundingClientRect();
      const percent = isHorizontal
        ? rect.width > 0
          ? (dir === "rtl"
              ? ((rect.right - clientX) / rect.width) * 100
              : ((clientX - rect.left) / rect.width) * 100)
          : 0
        : rect.height > 0
          ? ((rect.bottom - clientY) / rect.height) * 100
          : 0;

      return percentToValue(Math.max(0, Math.min(100, percent)), min, max, step);
    }, [dir, isHorizontal, max, min, step]);

    const handleTrackPointerDown = useCallback((event: PointerEvent) => {
      if (disabled) return;
      event.preventDefault();

      const clickValue = pointerToValue(event.clientX, event.clientY);
      const thumbIndex = isRange ? getClosestThumbIndex(clickValue, values) : 0;
      const newValues = [...values];
      newValues[thumbIndex] = constrainValue(clickValue, thumbIndex, values);
      updateValues(newValues);

      draggingRef.current = thumbIndex;
      (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    }, [
      constrainValue,
      disabled,
      isRange,
      pointerToValue,
      updateValues,
      values,
    ]);

    const handlePointerMove = useCallback((event: PointerEvent) => {
      if (draggingRef.current === null || disabled) return;

      const thumbIndex = draggingRef.current;
      const newValues = [...values];
      newValues[thumbIndex] = constrainValue(
        pointerToValue(event.clientX, event.clientY),
        thumbIndex,
        values,
      );
      updateValues(newValues);
    }, [constrainValue, disabled, pointerToValue, updateValues, values]);

    const handlePointerUp = useCallback(() => {
      if (draggingRef.current !== null) {
        draggingRef.current = null;
        commitValues(values);
      }
    }, [commitValues, values]);

    const handleThumbKeyDown = useCallback((event: KeyboardEvent, thumbIndex: number) => {
      if (disabled) return;

      let newValue = values[thumbIndex];
      let handled = true;

      switch (event.key) {
        case "ArrowRight":
          newValue += isHorizontal && dir === "rtl" ? -step : step;
          break;
        case "ArrowLeft":
          newValue += isHorizontal && dir === "rtl" ? step : -step;
          break;
        case "ArrowUp":
          newValue += step;
          break;
        case "ArrowDown":
          newValue -= step;
          break;
        case "PageUp":
          newValue += largeStep;
          break;
        case "PageDown":
          newValue -= largeStep;
          break;
        case "Home":
          newValue = min;
          break;
        case "End":
          newValue = max;
          break;
        default:
          handled = false;
      }

      if (handled) {
        event.preventDefault();
        const newValues = [...values];
        newValues[thumbIndex] = constrainValue(newValue, thumbIndex, values);
        updateValues(newValues);
        commitValues(newValues);
      }
    }, [
      commitValues,
      constrainValue,
      disabled,
      dir,
      isHorizontal,
      largeStep,
      max,
      min,
      step,
      updateValues,
      values,
    ]);

    const getThumbProps = useCallback((thumbIndex: number): SliderThumbBehaviorProps => {
      const thumbValue = values[thumbIndex] ?? min;
      return {
        role: "slider",
        tabIndex: disabled ? -1 : 0,
        "aria-valuenow": thumbValue,
        "aria-valuemin": min,
        "aria-valuemax": max,
        "aria-orientation": orientation,
        "aria-label": ariaLabel
          ? isRange
            ? `${ariaLabel} ${thumbIndex + 1}`
            : ariaLabel
          : undefined,
        "aria-valuetext": ariaValueText?.(thumbValue),
        "aria-disabled": disabled || undefined,
        "data-slot": "slider-thumb",
        onKeyDown: (event) => handleThumbKeyDown(event, thumbIndex),
        onPointerDown: (event) => {
          if (disabled) return;
          event.stopPropagation();
          draggingRef.current = thumbIndex;
          (event.target as HTMLElement).setPointerCapture(event.pointerId);
        },
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerUp,
      };
    }, [
      ariaLabel,
      ariaValueText,
      disabled,
      handlePointerMove,
      handlePointerUp,
      handleThumbKeyDown,
      isRange,
      max,
      min,
      orientation,
      values,
    ]);

    const sliderValueToPercent = useCallback(
      (value: number) => valueToPercent(value, min, max),
      [min, max],
    );

    const getThumbState = useCallback(
      (thumbIndex: number) => {
        const thumbValue = values[thumbIndex] ?? min;

        return {
          index: thumbIndex,
          value: thumbValue,
          percent: sliderValueToPercent(thumbValue),
        };
      },
      [min, sliderValueToPercent, values],
    );

    const getRangeState = useCallback(() => {
      const percents = values.map(sliderValueToPercent);
      const minPercent = Math.min(...percents);
      const maxPercent = Math.max(...percents);

      return {
        minPercent,
        maxPercent,
        startPercent: isRange ? minPercent : 0,
        endPercent: isRange ? maxPercent : maxPercent,
      };
    }, [isRange, sliderValueToPercent, values]);

    const contextValue = useMemo(
      () => ({
        values,
        isRange,
        min,
        max,
        step,
        orientation,
        dir,
        disabled,
        trackRef,
        valueToPercent: sliderValueToPercent,
        getThumbProps,
        getThumbState,
        getRangeState,
        handleTrackPointerDown,
        handlePointerMove,
        handlePointerUp,
      }),
      [
        values,
        isRange,
        min,
        max,
        step,
        orientation,
        dir,
        disabled,
        sliderValueToPercent,
        getThumbProps,
        getThumbState,
        getRangeState,
        handleTrackPointerDown,
        handlePointerMove,
        handlePointerUp,
        trackRef,
      ],
    );

    const hiddenInputs = name
      ? values.map((value, index) => (
          <input
            key={index}
            type="hidden"
            name={isRange ? `${name}[${index}]` : name}
            form={form}
            value={value}
            disabled={disabled}
          />
        ))
      : null;

    const root = (
      <div
        {...restProps}
        ref={ref}
        dir={dir}
        data-slot={dataSlot}
        data-orientation={orientation}
        {...(disabled ? { "data-disabled": "" } : {})}
        className={className}
      >
        {children}

        {hiddenInputs}
      </div>
    );

    return (
      <SliderContextProvider value={contextValue}>
        {root}
      </SliderContextProvider>
    );
  },
);
