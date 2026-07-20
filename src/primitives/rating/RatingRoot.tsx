"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
  composeRefs,
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
import { useFieldContext } from "../field/context.js";

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
      disabled,
      readOnly,
      invalid,
      required,
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
    const field = useFieldContext();
    const isDisabled = disabled ?? field?.disabled ?? false;
    const isReadOnly = readOnly ?? field?.readOnly ?? false;
    const isInvalid = invalid ?? field?.invalid ?? false;
    const isRequired = required ?? field?.required ?? false;
    const rootRef = useRef<HTMLDivElement>(null);
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
    const reset = useCallback(() => {
      if (value === undefined) {
        setRatingValue(clampRatingValue(defaultValue ?? range.min, range.min, range.max));
      }
    }, [defaultValue, range.max, range.min, setRatingValue, value]);
    useFormReset(rootRef, form, value !== undefined, reset);
    const valueText =
      ariaValueText ??
      getValueLabel?.(clampedValue, range.min, range.max) ??
      getRatingValueLabel(clampedValue, range.min, range.max);

    const setValue = useCallback(
      (nextValue: number) => {
        if (isDisabled || isReadOnly) return;
        const snapped = snapRatingValue(nextValue, step, range.min);
        setRatingValue(clampRatingValue(snapped, range.min, range.max));
      },
      [isDisabled, isReadOnly, range.max, range.min, setRatingValue, step],
    );

    const getItemState = useCallback(
      (itemValue: number) => getRatingItemState(clampedValue, itemValue, range.min),
      [clampedValue, range.min],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
      (event) => {
        if (isDisabled || isReadOnly) return;

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
        isDisabled,
        dir,
        largeStep,
        range.max,
        range.min,
        isReadOnly,
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
        disabled: isDisabled,
        readOnly: isReadOnly,
        invalid: isInvalid,
        required: isRequired,
        dir,
        setValue,
        getItemState,
      }),
      [
        clampedValue,
        isDisabled,
        getItemState,
        isInvalid,
        range.max,
        range.min,
        isReadOnly,
        isRequired,
        dir,
        setValue,
        step,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composeRefs(rootRef, ref),
      id: restProps.id ?? field?.controlId,
      role: "slider",
      tabIndex: tabIndex ?? 0,
      "aria-valuemin": range.min,
      "aria-valuemax": range.max,
      "aria-valuenow": clampedValue,
      "aria-valuetext": valueText,
      "aria-labelledby": restProps["aria-labelledby"] ??
        (restProps["aria-label"] === undefined ? field?.labelId : undefined),
      "aria-describedby": Object.prototype.hasOwnProperty.call(restProps, "aria-describedby")
        ? restProps["aria-describedby"]
        : field?.describedBy,
      ...(isDisabled && { "aria-disabled": true, "data-disabled": "" }),
      ...(isReadOnly && { "aria-readonly": true, "data-readonly": "" }),
      ...(isInvalid && { "aria-invalid": true, "data-invalid": "" }),
      ...(isRequired && { "aria-required": true, "data-required": "" }),
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
            disabled={isDisabled}
          />
        ) : null}
      </RatingContextProvider>
    );
  },
);
