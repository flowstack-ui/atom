"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  clampNumberValue,
  formatNumber,
  parseNumber,
  stepNumberValue,
} from "./utils.js";

type NumberInputRootNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange">;

export interface NumberInputRootProps extends NumberInputRootNativeProps {
  /** Current numeric value. Use null to represent an empty controlled value. */
  value?: number | null;
  /** Initial numeric value. */
  defaultValue?: number;
  /** Callback when value changes. */
  onValueChange?: (value: number | null) => void;
  /** Minimum allowed value. */
  min?: number;
  /** Maximum allowed value. */
  max?: number;
  /** Step increment. */
  step?: number;
  /** Large step for Page Up and Page Down. */
  largeStep?: number;
  /** Number of decimal places to display. */
  precision?: number;
  /** Clamp value to min and max on blur. */
  clampOnBlur?: boolean;
  /** Format the displayed value. */
  formatter?: (value: string) => string;
  /** Parse the displayed value back to a number string. */
  parser?: (displayValue: string) => string;
  /** Disable interaction. */
  disabled?: boolean;
  /** Read-only mode. */
  readOnly?: boolean;
  /** Mark as required. */
  required?: boolean;
  /** Mark as invalid. */
  invalid?: boolean;
  /** Placeholder text when empty. */
  placeholder?: string;
  /** HTML name attribute for form submission. */
  name?: string;
  /** Associates the hidden input with a form by ID. */
  form?: string;
  /** HTML id attribute. */
  id?: string;
  /** Accessible label for the inner spinbutton input. */
  ariaLabel?: string;
  /** Human-readable value text for the inner spinbutton input. */
  ariaValueText?: (value: number) => string;
  /** ARIA described-by IDs for the inner spinbutton input. */
  ariaDescribedBy?: string;
  /** CSS class name on the root container. */
  className?: string;
  /** CSS class name on the input element. */
  inputClassName?: string;
  /** Render prop or children. */
  children?: ReactNode | ((state: NumberInputRenderState) => ReactNode);
  /** Data slot identifier on the root container. */
  "data-slot"?: string;
}

export interface NumberInputRenderState {
  /** Current numeric value, or null when empty. */
  numericValue: number | null;
  /** Current display string. */
  displayValue: string;
  /** Whether the value is at the minimum. */
  isAtMin: boolean;
  /** Whether the value is at the maximum. */
  isAtMax: boolean;
  /** Whether interaction is disabled. */
  disabled: boolean;
  /** Whether the input is read-only. */
  readOnly: boolean;
  /** Step the value up or down. */
  handleStep: (direction: 1 | -1, stepSize?: number) => void;
  /** Ref to the input element. */
  inputRef: RefObject<HTMLInputElement | null>;
}

export const NumberInputRoot = forwardRef<HTMLDivElement, NumberInputRootProps>(
  function NumberInputRoot(props, ref) {
    const {
      value: controlledValue,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      largeStep: largeStepProp,
      precision,
      clampOnBlur = true,
      formatter,
      parser,
      disabled = false,
      readOnly = false,
      required = false,
      invalid = false,
      placeholder,
      name,
      form,
      id,
      ariaLabel,
      ariaValueText,
      ariaDescribedBy,
      className,
      inputClassName,
      children,
      "data-slot": dataSlot = "number-input",
      ...restProps
    } = props;

    const effectiveLargeStep = largeStepProp ?? step * 10;
    const isControlled = props.value !== undefined;
    const [internalValue, setInternalValue] = useState<number | null>(
      defaultValue ?? null,
    );
    const numericValue = isControlled ? controlledValue ?? null : internalValue;
    const [displayValue, setDisplayValue] = useState<string>(() => {
      const value = isControlled ? controlledValue : defaultValue;
      if (value === undefined || value === null) return "";
      const formatted = formatNumber(value, precision, step);
      return formatter ? formatter(formatted) : formatted;
    });
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const toDisplayString = useCallback(
      (value: number | null): string => {
        if (value === null || value === undefined) return "";
        const formatted = formatNumber(value, precision, step);
        return formatter ? formatter(formatted) : formatted;
      },
      [formatter, precision, step],
    );

    const updateValue = useCallback(
      (newValue: number | null) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange],
    );

    const handleStep = useCallback(
      (direction: 1 | -1, stepSize?: number) => {
        if (disabled || readOnly) return;

        const currentStep = stepSize ?? step;
        const current = numericValue ?? (direction === 1 ? min ?? 0 : max ?? 0);
        const nextValue = clampNumberValue(
          stepNumberValue(current, currentStep, direction, precision),
          min,
          max,
        );

        updateValue(nextValue);
        setDisplayValue(toDisplayString(nextValue));
      },
      [disabled, max, min, numericValue, precision, readOnly, step, toDisplayString, updateValue],
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (disabled || readOnly) return;

        let handled = true;

        switch (event.key) {
          case "ArrowUp":
            handleStep(1);
            break;
          case "ArrowDown":
            handleStep(-1);
            break;
          case "PageUp":
            handleStep(1, effectiveLargeStep);
            break;
          case "PageDown":
            handleStep(-1, effectiveLargeStep);
            break;
          case "Home":
            if (min !== undefined) {
              updateValue(min);
              setDisplayValue(toDisplayString(min));
            }
            break;
          case "End":
            if (max !== undefined) {
              updateValue(max);
              setDisplayValue(toDisplayString(max));
            }
            break;
          default:
            handled = false;
        }

        if (handled) {
          event.preventDefault();
        }
      },
      [
        disabled,
        effectiveLargeStep,
        handleStep,
        max,
        min,
        readOnly,
        toDisplayString,
        updateValue,
      ],
    );

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        setDisplayValue(raw);

        const parsed = parser ? parser(raw) : raw;
        const numberValue = parseNumber(parsed);

        if (numberValue !== null) {
          updateValue(numberValue);
        } else if (raw === "") {
          updateValue(null);
        }
      },
      [parser, updateValue],
    );

    const handleFocus = useCallback(() => {
      setIsEditing(true);
      if (numericValue !== null && numericValue !== undefined) {
        setDisplayValue(formatNumber(numericValue, precision, step));
      }
    }, [numericValue, precision, step]);

    const handleBlur = useCallback(() => {
      setIsEditing(false);

      if (displayValue === "" || numericValue === null) {
        setDisplayValue("");
        updateValue(null);
        return;
      }

      const finalValue = clampOnBlur
        ? clampNumberValue(numericValue, min, max)
        : numericValue;

      if (finalValue !== numericValue) {
        updateValue(finalValue);
      }

      setDisplayValue(toDisplayString(finalValue));
    }, [clampOnBlur, displayValue, max, min, numericValue, toDisplayString, updateValue]);

    const prevControlledRef = useRef(controlledValue);
    useEffect(() => {
      if (!isControlled || isEditing || controlledValue === prevControlledRef.current) {
        return;
      }

      prevControlledRef.current = controlledValue;
      setDisplayValue(toDisplayString(controlledValue ?? null));
    }, [controlledValue, isControlled, isEditing, toDisplayString]);

    const isAtMin = numericValue !== null && min !== undefined && numericValue <= min;
    const isAtMax = numericValue !== null && max !== undefined && numericValue >= max;
    const renderState: NumberInputRenderState = {
      numericValue,
      displayValue,
      isAtMin,
      isAtMax,
      disabled,
      readOnly,
      handleStep,
      inputRef,
    };

    return (
      <div
        {...restProps}
        ref={ref}
        data-slot={dataSlot}
        className={className}
        {...(disabled && { "data-disabled": "" })}
        {...(readOnly && { "data-readonly": "" })}
        {...(invalid && { "data-invalid": "" })}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          role="spinbutton"
          id={id}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={inputClassName}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={ariaLabel}
          aria-valuenow={numericValue ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={
            numericValue !== null && ariaValueText
              ? ariaValueText(numericValue)
              : undefined
          }
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-readonly={readOnly || undefined}
          aria-describedby={ariaDescribedBy}
          autoComplete="off"
        />

        {name ? (
          <input
            type="hidden"
            name={name}
            form={form}
            value={numericValue ?? ""}
            disabled={disabled}
          />
        ) : null}

        {typeof children === "function"
          ? children(renderState)
          : children}
      </div>
    );
  },
);
