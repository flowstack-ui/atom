"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useFieldContext } from "../field/context.js";
import { useDirection } from "../direction/index.js";
import type { ValidationBehavior } from "../form/validation.js";
import {
  PinInputContextProvider,
  type PinInputContextValue,
} from "./context.js";
import {
  getPinInputChars,
  getPinInputPattern,
  isPinInputCharAccepted,
  type PinInputType,
} from "./utils.js";

export interface PinInputValueChangeDetails {
  value: string[];
  valueAsString: string;
  complete: boolean;
}
export interface PinInputInvalidDetails {
  value: string;
  index: number;
  reason: "invalidCharacter";
}
export interface PinInputOptions {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (details: PinInputValueChangeDetails) => void;
  onComplete?: (value: string) => void;
  onValueInvalid?: (details: PinInputInvalidDetails) => void;
  length?: number;
  type?: PinInputType;
  pattern?: RegExp;
  mask?: boolean | string;
  otp?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  autoSubmit?: boolean;
  blurOnComplete?: boolean;
  selectOnFocus?: boolean;
  placeholder?: string;
  sanitizeValue?: (value: string) => string;
  name?: string;
  form?: string;
  id?: string;
  inputId?: string;
  dir?: "ltr" | "rtl";
  getInputLabel?: (index: number, length: number, type: PinInputType) => string;
  translations?: { label?: string; required?: string };
  validationBehavior?: ValidationBehavior;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}
export interface PinInputController {
  value: string[];
  valueAsString: string;
  complete: boolean;
  focusedIndex: number;
  setValue(value: string[]): void;
  setValueAtIndex(index: number, value: string): void;
  clearValue(): void;
  focus(index?: number): void;
  blur(): void;
}
interface Internal {
  context: PinInputContextValue;
  rootProps: Record<string, unknown>;
  name?: string;
}
const internals = new WeakMap<PinInputController, Internal>();
function getInternal(controller: PinInputController): Internal {
  const internal = internals.get(controller);
  if (!internal)
    throw new Error(
      "PinInput.RootProvider requires a controller from usePinInput",
    );
  return internal;
}

export function usePinInput(options: PinInputOptions = {}): PinInputController {
  const field = useFieldContext();
  const inheritedDirection = useDirection();
  const generatedId = useId();
  const baseId = options.id ?? generatedId;
  const length = Number.isFinite(options.length ?? 6)
    ? Math.max(1, Math.floor(options.length ?? 6))
    : 6;
  const type = options.type ?? "numeric";
  const pattern = useMemo(
    () => getPinInputPattern(type, options.pattern),
    [type, options.pattern],
  );
  const normalize = (value: readonly string[]) =>
    getPinInputChars(value, length).map((char) =>
      !char || isPinInputCharAccepted(pattern, char) ? char : "",
    );
  const initial = useRef(normalize(options.defaultValue ?? []));
  const [uncontrolled, setUncontrolled] = useState(initial.current);
  const chars = normalize(options.value ?? uncontrolled);
  const key = JSON.stringify(chars);
  const live = useRef(chars);
  live.current = chars;
  const complete = chars.every(Boolean);
  const disabled = options.disabled ?? field?.disabled ?? false;
  const readOnly = options.readOnly ?? field?.readOnly ?? false;
  const required = options.required ?? field?.required ?? false;
  const direction = options.dir ?? inheritedDirection;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const firstInputRef = useMemo(
    () => ({
      get current() {
        return inputRefs.current[0] ?? null;
      },
    }),
    [],
  );
  const validation = useFormValidation({
    validityRef: firstInputRef,
    ownerRef: firstInputRef,
    invalid: options.invalid,
    inheritedInvalid: field?.invalid,
    validationBehavior: options.validationBehavior,
    inheritedValidationBehavior: field?.validationBehavior,
    form: options.form,
    reportValidity: field?.reportControlValidity,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const pending = useRef<string | null>(null);
  const [, setTransaction] = useState(0);
  const latest = useRef(options);
  latest.current = options;
  const clamp = (index: number) =>
    Number.isFinite(index)
      ? Math.max(0, Math.min(Math.floor(index), length - 1))
      : 0;
  const focusCell = useCallback(
    (index: number) => {
      if (disabled) return;
      const next = Number.isFinite(index)
        ? Math.max(0, Math.min(Math.floor(index), length - 1))
        : 0;
      setActiveIndex(next);
      inputRefs.current[next]?.focus({ preventScroll: true });
    },
    [disabled, length],
  );
  const blur = () => {
    inputRefs.current.forEach((input) => {
      if (input === input?.ownerDocument.activeElement) input?.blur();
    });
    setFocusedIndex(-1);
  };
  const commit = (next: string[]): boolean => {
    if (disabled || readOnly) return false;
    const normalized = getPinInputChars(next, length);
    const badIndex = next.findIndex(
      (char) =>
        Array.from(char).length > 1 ||
        (char && !isPinInputCharAccepted(pattern, char)),
    );
    if (badIndex !== -1) {
      options.onValueInvalid?.({
        value: next.join(""),
        index: badIndex,
        reason: "invalidCharacter",
      });
      return false;
    }
    const nextKey = JSON.stringify(normalized);
    if (nextKey === JSON.stringify(live.current)) return false;
    pending.current = nextKey;
    setTransaction((version) => version + 1);
    live.current = normalized;
    if (options.value === undefined) setUncontrolled(normalized);
    options.onValueChange?.({
      value: [...normalized],
      valueAsString: normalized.join(""),
      complete: normalized.every(Boolean),
    });
    return true;
  };
  const setCell = (index: number, char: string, advance = false) => {
    if (!Number.isInteger(index) || index < 0 || index >= length) return;
    if (
      Array.from(char).length > 1 ||
      (char && !isPinInputCharAccepted(pattern, char))
    ) {
      if (!disabled && !readOnly)
        options.onValueInvalid?.({
          value: char,
          index,
          reason: "invalidCharacter",
        });
      return;
    }
    const next = [...live.current];
    next[index] = char;
    if (
      commit(next) &&
      advance &&
      index < length - 1 &&
      !(options.blurOnComplete && next.every(Boolean))
    )
      focusCell(index + 1);
  };
  const pasteValue = (raw: string, index = 0) => {
    if (disabled || readOnly) return;
    const text = options.sanitizeValue
      ? options.sanitizeValue(raw)
      : raw.trim();
    const pasted = Array.from(text);
    if (!pasted.length) return;
    if (pasted.some((char) => !isPinInputCharAccepted(pattern, char))) {
      options.onValueInvalid?.({
        value: text,
        index,
        reason: "invalidCharacter",
      });
      return;
    }
    const next = getPinInputChars(pasted, length);
    if (commit(next) && !(options.blurOnComplete && next.every(Boolean)))
      focusCell(Math.min(pasted.length, length - 1));
  };
  useEffect(() => {
    firstInputRef.current?.setCustomValidity(
      required && !readOnly && !disabled && !complete
        ? (options.translations?.required ?? "Complete all code characters.")
        : "",
    );
    validation.validationProps.onInput();
  }, [
    key,
    required,
    readOnly,
    disabled,
    complete,
    options.translations?.required,
    firstInputRef,
    validation.validationProps.onInput,
  ]);
  // Effects follow the committed value, so requestSubmit observes the new hidden
  // input. A controlled parent refusing the transaction cannot complete/submit.
  useEffect(() => {
    if (pending.current !== key) {
      pending.current = null;
      return;
    }
    pending.current = null;
    if (!complete || disabled || readOnly) return;
    latest.current.onComplete?.(chars.join(""));
    if (latest.current.blurOnComplete) blur();
    if (latest.current.autoSubmit) firstInputRef.current?.form?.requestSubmit();
  });
  useEffect(() => {
    const form = firstInputRef.current?.form;
    if (!form) return;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        pending.current = null;
        if (latest.current.value === undefined)
          setUncontrolled([...initial.current]);
        setActiveIndex(0);
      });
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [options.form, firstInputRef]);
  const didAutoFocus = useRef(false);
  useEffect(() => {
    if (options.autoFocus && !disabled && !didAutoFocus.current) {
      didAutoFocus.current = true;
      focusCell(0);
    }
  }, [options.autoFocus, disabled, focusCell]);
  useEffect(() => {
    setActiveIndex((index) => Math.min(index, length - 1));
  }, [length]);

  const registry = useRef({
    generation: 0,
    next: 0,
    claims: new Map<string, { generation: number; index: number }>(),
    mounted: new Set<string>(),
  });
  const [inputRegistryVersion, setRegistryVersion] = useState(0);
  registry.current.generation += 1;
  registry.current.next = 0;
  const getInputIndex = useCallback((inputKey: string, explicit?: number) => {
    const state = registry.current;
    let claim = state.claims.get(inputKey);
    if (claim?.generation !== state.generation) {
      claim = { generation: state.generation, index: state.next++ };
      state.claims.set(inputKey, claim);
    }
    return explicit ?? claim!.index;
  }, []);
  const registerInput = useCallback((inputKey: string) => {
    if (!registry.current.mounted.has(inputKey)) {
      registry.current.mounted.add(inputKey);
      setRegistryVersion((v) => v + 1);
    }
  }, []);
  const unregisterInput = useCallback((inputKey: string) => {
    if (registry.current.mounted.delete(inputKey)) {
      registry.current.claims.delete(inputKey);
      setRegistryVersion((v) => v + 1);
    }
  }, []);
  const setInputRef = useCallback(
    (index: number, element: HTMLInputElement | null) => {
      inputRefs.current[index] = element;
    },
    [],
  );
  const firstId = options.inputId ?? field?.controlId ?? `${baseId}-input-1`;
  const [labelMounted, setLabelMounted] = useState(false);
  const labelledBy =
    options["aria-labelledby"] ??
    (options["aria-label"]
      ? undefined
      : labelMounted
        ? `${baseId}-label`
        : field?.labelId);
  const describedBy = Object.prototype.hasOwnProperty.call(
    options,
    "aria-describedby",
  )
    ? options["aria-describedby"]
    : field?.describedBy;
  const controller: PinInputController = {
    value: chars,
    valueAsString: chars.join(""),
    complete,
    focusedIndex,
    setValue: commit,
    setValueAtIndex: (index, char) => setCell(index, char),
    clearValue: () => commit(Array(length).fill("")),
    focus: (index = 0) => focusCell(index),
    blur,
  };
  const context: PinInputContextValue = {
    controller,
    value: chars,
    chars,
    length,
    type,
    mask: options.mask ?? false,
    otp: options.otp ?? false,
    selectOnFocus: options.selectOnFocus ?? true,
    placeholder: options.placeholder ?? "○",
    dir: direction,
    disabled,
    readOnly,
    required,
    invalid: validation.invalid,
    form: options.form,
    describedBy,
    labelId: `${baseId}-label`,
    setLabelMounted,
    inputMode: type === "numeric" ? "numeric" : "text",
    inputRefs,
    activeIndex,
    inputRegistryVersion,
    getInputIndex,
    getInputId: (index, explicit) =>
      explicit ?? (index === 0 ? firstId : `${firstId}-${index + 1}`),
    getDisplayChar: (char) =>
      typeof options.mask === "string" && char ? options.mask : char,
    getInputLabel: (index) =>
      options.getInputLabel?.(index, length, type) ??
      `${type === "numeric" ? "Digit" : "Character"} ${index + 1} of ${length}`,
    registerInput,
    unregisterInput,
    setInputRef,
    setActiveIndex: (index) => {
      setActiveIndex(clamp(index));
      setFocusedIndex(clamp(index));
    },
    setFocusedIndex,
    focusCell,
    updateCell: (index, char) => setCell(index, char, true),
    clearCell: (index) => setCell(index, ""),
    clearPreviousCell: (index) => {
      if (index > 0 && !disabled && !readOnly) {
        setCell(index - 1, "");
        focusCell(index - 1);
      }
    },
    pasteValue,
    validationBehavior: validation.validationBehavior,
    onValidationInvalid: validation.validationProps.onInvalid,
    syncValidation: validation.validationProps.onInput,
  };
  internals.set(controller, {
    context,
    name: options.name,
    rootProps: {
      id: options.id,
      dir: direction,
      role: "group",
      "aria-label":
        options["aria-label"] ??
        (labelledBy ? undefined : (options.translations?.label ?? "Code")),
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      "aria-invalid": validation.invalid || undefined,
      "data-slot": "pin-input",
      "data-disabled": disabled ? "" : undefined,
      "data-readonly": readOnly ? "" : undefined,
      "data-required": required ? "" : undefined,
      "data-invalid": validation.invalid ? "" : undefined,
      "data-complete": complete ? "" : undefined,
    },
  });
  return controller;
}

export interface PinInputRootProviderProps extends NativeDivProps<
  "children" | "defaultValue" | "onChange"
> {
  value: PinInputController;
  children: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}
export const PinInputRootProvider = forwardRef<
  HTMLDivElement,
  PinInputRootProviderProps
>(function PinInputRootProvider(
  { value, children, render, asChild, ...props },
  ref,
) {
  const { context, rootProps, name } = getInternal(value);
  const behavior = { ...rootProps, ...props, ref };
  const element = asChild
    ? cloneAndMerge(children, behavior)
    : renderElement(render, "div", { ...behavior, children });
  return (
    <PinInputContextProvider value={context}>
      {element}
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value.valueAsString}
          form={context.form}
          disabled={context.disabled}
        />
      ) : null}
    </PinInputContextProvider>
  );
});
export interface PinInputRootProps
  extends Omit<PinInputRootProviderProps, "value" | "dir">, PinInputOptions {}
export const PinInputRoot = forwardRef<HTMLDivElement, PinInputRootProps>(
  function PinInputRoot(props, ref) {
    const {
      value,
      defaultValue,
      onValueChange,
      onComplete,
      onValueInvalid,
      length,
      type,
      pattern,
      mask,
      otp,
      disabled,
      readOnly,
      required,
      invalid,
      autoFocus,
      autoSubmit,
      blurOnComplete,
      selectOnFocus,
      placeholder,
      sanitizeValue,
      name,
      form,
      inputId,
      getInputLabel,
      translations,
      validationBehavior,
      ...native
    } = props;
    const controller = usePinInput({
      value,
      defaultValue,
      onValueChange,
      onComplete,
      onValueInvalid,
      length,
      type,
      pattern,
      mask,
      otp,
      disabled,
      readOnly,
      required,
      invalid,
      autoFocus,
      autoSubmit,
      blurOnComplete,
      selectOnFocus,
      placeholder,
      sanitizeValue,
      name,
      form,
      inputId,
      getInputLabel,
      translations,
      validationBehavior,
      id: props.id,
      dir: props.dir,
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
      ...(Object.prototype.hasOwnProperty.call(props, "aria-describedby")
        ? { "aria-describedby": props["aria-describedby"] }
        : {}),
    });
    return <PinInputRootProvider {...native} ref={ref} value={controller} />;
  },
);
