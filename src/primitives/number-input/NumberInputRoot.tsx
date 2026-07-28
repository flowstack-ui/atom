"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { useFieldContext } from "../field/context.js";
import type { ValidationBehavior } from "../form/validation.js";
import { NumberInputContextProvider, type NumberInputContextValue } from "./context.js";
import { NumberInputInput } from "./NumberInputInput.js";
import {
  clampNumberValue,
  formatNumber,
  parseNumber,
  stepNumberValue,
} from "./utils.js";

type NumberInputRootNativeProps = NativeDivProps<
  | "children"
  | "defaultValue"
  | "onChange"
  | "aria-label"
  | "aria-describedby"
  | "aria-valuetext"
>;

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
  /** Chooses inline Atom presentation or the browser's native validation UI. */
  validationBehavior?: ValidationBehavior;
  /** Placeholder text when empty. */
  placeholder?: string;
  /** HTML name attribute for form submission. */
  name?: string;
  /** Associates the hidden input with a form by ID. */
  form?: string;
  /** HTML id attribute. */
  id?: string;
  /** Native accessible label forwarded to the inner spinbutton input. */
  "aria-label"?: string;
  /** Human-readable value text for the inner spinbutton input. */
  "aria-valuetext"?: string | ((value: number) => string);
  /** Native description relationship forwarded to the inner spinbutton input. */
  "aria-describedby"?: string;
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
      disabled,
      readOnly,
      required,
      invalid,
      validationBehavior,
      placeholder,
      name,
      form,
      id,
      "aria-label": ariaLabel,
      "aria-valuetext": ariaValueText,
      "aria-describedby": ariaDescribedBy,
      className,
      inputClassName,
      children,
      "data-slot": dataSlot = "number-input",
      ...restProps
    } = props;

    const field = useFieldContext();
    const isDisabled = disabled ?? field?.disabled ?? false;
    const isReadOnly = readOnly ?? field?.readOnly ?? false;
    const isRequired = required ?? field?.required ?? false;

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
    const validation = useFormValidation({
      validityRef: inputRef,
      ownerRef: inputRef,
      invalid,
      inheritedInvalid: field?.invalid,
      validationBehavior,
      inheritedValidationBehavior: field?.validationBehavior,
      form,
      reportValidity: field?.reportControlValidity,
    });
    const isInvalid = validation.invalid;

    const toDisplayString = useCallback(
      (value: number | null): string => {
        if (value === null || value === undefined) return "";
        const formatted = formatNumber(value, precision, step);
        return formatter ? formatter(formatted) : formatted;
      },
      [formatter, precision, step],
    );
    const reset = useCallback(() => {
      if (isControlled) return;
      const nextValue = defaultValue ?? null;
      setInternalValue(nextValue);
      setDisplayValue(toDisplayString(nextValue));
    }, [defaultValue, isControlled, toDisplayString]);
    useFormReset(inputRef, form, isControlled, reset);
    const resolvedAriaValueText = numericValue !== null && typeof ariaValueText === "function"
      ? ariaValueText(numericValue)
      : typeof ariaValueText === "string"
        ? ariaValueText
        : undefined;

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
        if (isDisabled || isReadOnly) return;

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
      [isDisabled, isReadOnly, max, min, numericValue, precision, step, toDisplayString, updateValue],
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (isDisabled || isReadOnly) return;

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
        isDisabled,
        effectiveLargeStep,
        handleStep,
        max,
        min,
        isReadOnly,
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
      disabled: isDisabled,
      readOnly: isReadOnly,
      handleStep,
      inputRef,
    };
    const contextValue = useMemo<NumberInputContextValue>(
      () => ({
        numericValue,
        displayValue,
        min,
        max,
        disabled: isDisabled,
        readOnly: isReadOnly,
        required: isRequired,
        invalid: isInvalid,
        inputId: id ?? field?.controlId,
        inputRef,
        inputMode: "decimal",
        placeholder,
        form,
        inputClassName,
        ariaLabel,
        ariaValueText: resolvedAriaValueText,
        ariaDescribedBy: Object.prototype.hasOwnProperty.call(props, "aria-describedby")
          ? ariaDescribedBy
          : field?.describedBy,
        validationBehavior: validation.validationBehavior,
        isAtMin,
        isAtMax,
        handleStep,
        handleChange: (event) => {
          handleChange(event);
          validation.validationProps.onChange();
        },
        handleInput: validation.validationProps.onInput,
        handleInvalid: validation.validationProps.onInvalid,
        handleKeyDown,
        handleFocus,
        handleBlur,
      }),
      [
        ariaDescribedBy,
        ariaLabel,
        displayValue,
        field?.controlId,
        field?.describedBy,
        form,
        handleBlur,
        handleChange,
        handleFocus,
        handleKeyDown,
        handleStep,
        id,
        inputClassName,
        isAtMax,
        isAtMin,
        isDisabled,
        isInvalid,
        isReadOnly,
        isRequired,
        max,
        min,
        numericValue,
        placeholder,
        props,
        resolvedAriaValueText,
        validation.validationBehavior,
        validation.validationProps.onChange,
        validation.validationProps.onInput,
        validation.validationProps.onInvalid,
      ],
    );
    const usesCompoundInput = children !== undefined && typeof children !== "function";

    return (
      <NumberInputContextProvider value={contextValue}>
        <div
          {...restProps}
          ref={ref}
          data-slot={dataSlot}
          className={className}
          {...(isDisabled && { "data-disabled": "" })}
          {...(isReadOnly && { "data-readonly": "" })}
          {...(isInvalid && { "data-invalid": "" })}
          {...(isRequired && { "data-required": "" })}
        >
          {!usesCompoundInput ? <NumberInputInput /> : null}

          {name ? (
            <input
              type="hidden"
              name={name}
              form={form}
              value={numericValue ?? ""}
              disabled={isDisabled}
            />
          ) : null}

          {typeof children === "function"
            ? children(renderState)
            : children}
        </div>
      </NumberInputContextProvider>
    );
  },
);
