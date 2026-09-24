"use client";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { NumberParser } from "@internationalized/number";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { useFieldContext } from "../field/context.js";
import { useDirection } from "../direction/DirectionProvider.js";
import { clampNumberValue, formatNumber, stepNumberValue } from "./utils.js";
import type { NumberInputContextValue } from "./context.js";
import type { UseNumberInputOptions, NumberInputValueChangeDetails } from "./types.js";

export function useNumberInput(props: UseNumberInputOptions = {}): NumberInputContextValue {
  const field = useFieldContext(), inheritedDir = useDirection(), generated = useId();
  const { min, max, step = 1, largeStep = step * 10, smallStep = step / 10, precision,
    locale = "en-US", formatOptions, formatter, parser, clampOnBlur = true, allowOverflow = true,
    focusInputOnChange = true, allowMouseWheel = false } = props;
  if (![step, largeStep, smallStep].every(n => Number.isFinite(n) && n > 0)) throw new RangeError("NumberInput steps must be finite positive numbers");
  if (precision !== undefined && (!Number.isInteger(precision) || precision < 0 || precision > 100)) throw new RangeError("NumberInput precision must be an integer from 0 to 100");
  if (formatOptions && (formatter || parser)) throw new TypeError("Use formatOptions or a formatter/parser pair, not both");
  const disabled = props.disabled ?? field?.disabled ?? false, readOnly = props.readOnly ?? field?.readOnly ?? false;
  const required = props.required ?? field?.required ?? false;
  const intl = useMemo(() => new Intl.NumberFormat(locale, formatOptions), [locale, formatOptions]);
  const numberParser = useMemo(() => new NumberParser(locale, formatOptions), [locale, formatOptions]);
  const parse = useCallback((raw: string): number | null => {
    if (!raw.trim()) return null;
    const n = parser ? Number(parser(raw)) : numberParser.parse(raw);
    return Number.isFinite(n) ? n : null;
  }, [parser, numberParser]);
  const toDisplayString = useCallback((n: number | null): string => {
    if (n === null || !Number.isFinite(n)) return "";
    const raw = formatNumber(n, precision, step);
    return formatter ? formatter(raw) : formatOptions || locale !== "en-US" ? intl.format(Number(raw)) : raw;
  }, [formatter, precision, step, formatOptions, locale, intl]);
  const initial = props.defaultValue ?? (props.valueMode === "string" ? "" : null);
  const [model, setModel] = useControllableState<number | string | null>({
    value: props.value, defaultValue: initial,
    onChange: next => {
      if (props.valueMode === "string") props.onValueChange?.({ value: String(next ?? ""), valueAsNumber: parse(String(next ?? "")) ?? NaN });
      else props.onValueChange?.(typeof next === "number" ? next : null);
    },
  });
  const numericValue = typeof model === "string" ? parse(model) : Number.isFinite(model) ? model as number : null;
  const canonical = typeof model === "string" ? model : toDisplayString(numericValue);
  // Draft text is separate from the model so incomplete negatives/decimals survive typing.
  const [draft, setDraft] = useState(canonical), [focused, setFocused] = useState(false);
  const displayValue = focused ? draft : canonical;
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputElement, registerInput] = useState<HTMLInputElement | null>(null);
  const requested = useRef<number | string | null | undefined>(undefined);
  const rangeInvalid = numericValue !== null && ((min !== undefined && numericValue < min) || (max !== undefined && numericValue > max));
  const validation = useFormValidation({ validityRef: inputRef, ownerRef: inputRef,
    invalid: props.invalid ?? (rangeInvalid || undefined), inheritedInvalid: field?.invalid,
    validationBehavior: props.validationBehavior, inheritedValidationBehavior: field?.validationBehavior,
    form: props.form, reportValidity: field?.reportControlValidity });
  const publish = useCallback((n: number | null, text: string) => {
    const next = props.valueMode === "string" ? text : n;
    requested.current = next;
    setModel(next);
    setDraft(text);
  }, [setModel, props.valueMode]);
  const current = useRef({ numericValue, displayValue });
  current.current = { numericValue, displayValue };
  const details = (text: string): NumberInputValueChangeDetails => ({ value: text, valueAsNumber: parse(text) ?? NaN });
  const commit = () => {
    const text = current.current.displayValue, parsed = parse(text);
    const n = clampOnBlur && parsed !== null ? clampNumberValue(parsed, min, max) : parsed;
    const next = toDisplayString(n);
    if (parsed !== null && ((min !== undefined && parsed < min) || (max !== undefined && parsed > max))) {
      props.onValueInvalid?.({ ...details(text), reason: min !== undefined && parsed < min ? "rangeUnderflow" : "rangeOverflow" });
    }
    publish(n, next);
    props.onValueCommit?.({ value: next, valueAsNumber: n ?? NaN });
  };
  const setValue = (value: number) => { const n = Number.isFinite(value) ? clampNumberValue(value, min, max) : null; publish(n, toDisplayString(n)); };
  const handleStep = (direction: 1 | -1, stepSize = step) => {
    if (disabled || readOnly) return;
    const start = current.current.numericValue ?? (direction === 1 ? min ?? 0 : max ?? 0);
    const next = clampNumberValue(stepNumberValue(start, stepSize, direction, precision), min, max);
    if (!Number.isFinite(next)) return;
    if (focusInputOnChange) inputRef.current?.focus({ preventScroll: true });
    publish(next, toDisplayString(next));
  };
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;
    const raw = event.target.value, parsed = parse(raw);
    const out = parsed !== null && ((min !== undefined && parsed < min) || (max !== undefined && parsed > max));
    if (out) props.onValueInvalid?.({ ...details(raw), reason: min !== undefined && parsed < min ? "rangeUnderflow" : "rangeOverflow" });
    if (out && !allowOverflow) { const n = clampNumberValue(parsed!, min, max); publish(n, toDisplayString(n)); }
    else {
      setDraft(raw);
      const next = props.valueMode === "string" ? raw : parsed;
      requested.current = next;
      setModel(next);
    }
    validation.validationProps.onChange();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || readOnly || event.nativeEvent.isComposing) return;
    const amount = event.shiftKey ? largeStep : event.altKey ? smallStep : step;
    switch (event.key) {
      case "ArrowUp": handleStep(1, amount); break;
      case "ArrowDown": handleStep(-1, amount); break;
      case "PageUp": handleStep(1, largeStep); break;
      case "PageDown": handleStep(-1, largeStep); break;
      case "Home": if (min === undefined || event.metaKey || event.ctrlKey) return; setValue(min); break;
      case "End": if (max === undefined || event.metaKey || event.ctrlKey) return; setValue(max); break;
      case "Enter": commit(); return;
      default: return;
    }
    event.preventDefault();
  };
  const wheelStep = useRef(handleStep); wheelStep.current = handleStep;
  useEffect(() => {
    const input = inputElement;
    if (!input || !allowMouseWheel || disabled || readOnly) return;
    const wheel = (event: WheelEvent) => {
      if (event.defaultPrevented || input.ownerDocument.activeElement !== input || event.ctrlKey || event.deltaY === 0) return;
      event.preventDefault(); wheelStep.current(event.deltaY < 0 ? 1 : -1);
    };
    input.addEventListener("wheel", wheel, { passive: false });
    return () => input.removeEventListener("wheel", wheel);
  }, [inputElement, allowMouseWheel, disabled, readOnly]);
  const reset = useCallback(() => { setModel(initial); setDraft(typeof initial === "string" ? initial : toDisplayString(initial)); setFocused(false); }, [setModel, initial, toDisplayString]);
  useFormReset(inputRef, props.form, props.value !== undefined, reset);
  const previous = useRef({ model, toDisplayString });
  useEffect(() => {
    const externalChange = model !== previous.current.model && model !== requested.current;
    if (!focused || externalChange || toDisplayString !== previous.current.toDisplayString) setDraft(canonical);
    previous.current = { model, toDisplayString };
  }, [canonical, model, focused, toDisplayString]);
  const inputId = props.ids?.input ?? props.id ?? field?.controlId ?? `number-${generated}`;
  const ids = { ...props.ids, input: inputId, label: props.ids?.label ?? `${inputId}-label` };
  const ariaValue = props["aria-valuetext"];
  return {
    numericValue, displayValue, value: displayValue, valueAsNumber: numericValue ?? NaN,
    focused, min, max, step, disabled, readOnly, required, invalid: validation.invalid,
    inputId, ids, inputRef, registerInput, dir: props.dir ?? inheritedDir, locale, name: props.name,
    translations: props.translations ?? {}, spinOnPress: props.spinOnPress ?? true,
    inputMode: props.inputMode ?? "decimal", pattern: props.pattern, placeholder: props.placeholder,
    form: props.form, inputClassName: props.inputClassName, ariaLabel: props["aria-label"],
    ariaValueText: typeof ariaValue === "function" && numericValue !== null ? ariaValue(numericValue) : typeof ariaValue === "string" ? ariaValue : props.translations?.valueText?.(displayValue) ?? (formatOptions ? displayValue : undefined),
    ariaDescribedBy: Object.prototype.hasOwnProperty.call(props, "aria-describedby") ? props["aria-describedby"] : field?.describedBy,
    validationBehavior: validation.validationBehavior,
    isAtMin: numericValue !== null && min !== undefined && numericValue <= min,
    isAtMax: numericValue !== null && max !== undefined && numericValue >= max,
    handleStep, setValue, clearValue: () => publish(null, ""), increment: () => handleStep(1), decrement: () => handleStep(-1),
    setToMin: () => { if (min !== undefined) setValue(min); }, setToMax: () => { if (max !== undefined) setValue(max); }, focus: () => inputRef.current?.focus(),
    handleChange, handleKeyDown, handleInput: validation.validationProps.onInput, handleInvalid: validation.validationProps.onInvalid,
    handleFocus: () => { setDraft(formatter && numericValue !== null ? formatNumber(numericValue, precision, step) : canonical); setFocused(true); props.onFocusChange?.({ ...details(canonical), focused: true }); },
    handleBlur: () => { commit(); setFocused(false); props.onFocusChange?.({ ...details(current.current.displayValue), focused: false }); },
  };
}
