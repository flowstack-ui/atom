"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  RatingContextProvider,
  type RatingContextValue,
} from "./context.js";
import {
  clampRatingValue,
  getRatingItemState,
  getRatingValueLabel,
  normalizeRatingRange,
  snapRatingValue,
} from "./utils.js";

type RatingRootNativeProps = NativeDivProps<
  | "children"
  | "defaultValue"
  | "onChange"
  | "role"
  | "tabIndex"
  | "aria-valuemin"
  | "aria-valuemax"
  | "aria-valuenow"
  | "aria-valuetext"
  | "onKeyDown"
>;

export interface RatingRootProps extends RatingRootNativeProps {
  /** Controlled rating value. */
  value?: number;
  /** Initial rating value for uncontrolled mode. */
  defaultValue?: number;
  /** Called when the rating value changes. */
  onValueChange?: (value: number) => void;
  /** Minimum rating value. */
  min?: number;
  /** Maximum rating value. */
  max?: number;
  /** Value step for pointer and keyboard changes. */
  step?: number;
  /** Larger keyboard step for Page Up and Page Down. */
  largeStep?: number;
  /** Disable interaction. */
  disabled?: boolean;
  /** Keep the rating focusable and readable but prevent edits. */
  readOnly?: boolean;
  /** Mark the rating invalid. */
  invalid?: boolean;
  /** Mark the rating required. */
  required?: boolean;
  /** Text direction used for horizontal pointer and keyboard behavior. */
  dir?: DirectionValue;
  /** HTML name attribute for hidden form input. */
  name?: string;
  /** Hidden input value. */
  formValue?: string;
  /** Associates the hidden input with a form by ID. */
  form?: string;
  /** Human-readable value text for assistive technologies. */
  "aria-valuetext"?: string;
  /** Generate human-readable value text for assistive technologies. */
  getValueLabel?: (value: number, min: number, max: number) => string;
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Rating item parts. */
  children?: ReactNode;
  /** Native tab index override. */
  tabIndex?: number;
  /** Consumer keydown handler composed before Atom keyboard behavior. */
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const RatingRoot = forwardRef<HTMLDivElement, RatingRootProps>(
  function RatingRoot(
    {
      value,
      defaultValue,
      onValueChange,
      min: minProp = 0,
      max: maxProp = 5,
      step: stepProp = 1,
      largeStep: largeStepProp,
      disabled = false,
      readOnly = false,
      invalid = false,
      required = false,
      dir: dirProp,
      name,
      formValue,
      form,
      "aria-valuetext": ariaValueText,
      getValueLabel,
      render,
      asChild,
      children,
      tabIndex,
      onKeyDown,
      "data-slot": dataSlot = "rating",
      ...restProps
    },
    ref,
  ) {
    const range = useMemo(
      () => normalizeRatingRange(minProp, maxProp),
      [maxProp, minProp],
    );
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const step = stepProp > 0 ? stepProp : 1;
    const largeStep =
      largeStepProp ??
      Math.min(
        step * 10,
        step * Math.ceil((range.max - range.min) / 2 / step),
      );
    const [ratingValue, setRatingValue] = useControllableState({
      value: value === undefined ? undefined : clampRatingValue(value, range.min, range.max),
      defaultValue: clampRatingValue(defaultValue ?? range.min, range.min, range.max),
      onChange: onValueChange,
    });
    const clampedValue = clampRatingValue(ratingValue, range.min, range.max);
    const valueText =
      ariaValueText ??
      getValueLabel?.(clampedValue, range.min, range.max) ??
      getRatingValueLabel(clampedValue, range.min, range.max);

    const setValue = useCallback(
      (nextValue: number) => {
        if (disabled || readOnly) return;
        const snapped = snapRatingValue(nextValue, step, range.min);
        setRatingValue(clampRatingValue(snapped, range.min, range.max));
      },
      [disabled, range.max, range.min, readOnly, setRatingValue, step],
    );

    const getItemState = useCallback(
      (itemValue: number) => getRatingItemState(clampedValue, itemValue, range.min),
      [clampedValue, range.min],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
      (event) => {
        if (disabled || readOnly) return;

        let nextValue = clampedValue;
        let handled = true;

        switch (event.key) {
          case "ArrowRight":
            nextValue += dir === "rtl" ? -step : step;
            break;
          case "ArrowLeft":
            nextValue += dir === "rtl" ? step : -step;
            break;
          case "ArrowUp":
            nextValue += step;
            break;
          case "ArrowDown":
            nextValue -= step;
            break;
          case "PageUp":
            nextValue += largeStep;
            break;
          case "PageDown":
            nextValue -= largeStep;
            break;
          case "Home":
            nextValue = range.min;
            break;
          case "End":
            nextValue = range.max;
            break;
          default:
            handled = false;
        }

        if (!handled) return;
        event.preventDefault();
        setValue(nextValue);
      },
      [
        clampedValue,
        disabled,
        dir,
        largeStep,
        range.max,
        range.min,
        readOnly,
        setValue,
        step,
      ],
    );

    const contextValue = useMemo<RatingContextValue>(
      () => ({
        value: clampedValue,
        min: range.min,
        max: range.max,
        step,
        disabled,
        readOnly,
        invalid,
        required,
        dir,
        setValue,
        getItemState,
      }),
      [
        clampedValue,
        disabled,
        getItemState,
        invalid,
        range.max,
        range.min,
        readOnly,
        required,
        dir,
        setValue,
        step,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "slider",
      tabIndex: tabIndex ?? 0,
      "aria-valuemin": range.min,
      "aria-valuemax": range.max,
      "aria-valuenow": clampedValue,
      "aria-valuetext": valueText,
      ...(disabled && { "aria-disabled": true, "data-disabled": "" }),
      ...(readOnly && { "aria-readonly": true, "data-readonly": "" }),
      ...(invalid && { "aria-invalid": true, "data-invalid": "" }),
      ...(required && { "aria-required": true, "data-required": "" }),
      "data-slot": dataSlot,
      dir,
      "data-value": clampedValue,
      "data-min": range.min,
      "data-max": range.max,
      "data-step": step,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    const root = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <RatingContextProvider value={contextValue}>
        {root}
        {name ? (
          <input
            type="hidden"
            name={name}
            value={formValue ?? String(clampedValue)}
            form={form}
            disabled={disabled}
          />
        ) : null}
      </RatingContextProvider>
    );
  },
);
