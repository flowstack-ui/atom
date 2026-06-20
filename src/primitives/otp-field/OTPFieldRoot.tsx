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
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldContext } from "../field/context.js";
import {
  OTPFieldContextProvider,
  type OTPFieldContextValue,
} from "./context.js";
import {
  filterOTPFieldValue,
  getOTPFieldChars,
  getOTPFieldDisplayChar,
  getOTPFieldPattern,
  isOTPFieldCharAccepted,
  type OTPFieldType,
} from "./utils.js";

type OTPFieldRootNativeProps = NativeDivProps<
  "children" | "defaultValue" | "onChange"
>;

export interface OTPFieldRootProps extends OTPFieldRootNativeProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  type?: OTPFieldType;
  pattern?: RegExp;
  mask?: boolean | string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  autoSubmit?: boolean;
  name?: string;
  form?: string;
  inputId?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const OTPFieldRoot = forwardRef<HTMLDivElement, OTPFieldRootProps>(
  function OTPFieldRoot(
    {
      children,
      value,
      defaultValue = "",
      onValueChange,
      onComplete,
      length = 6,
      type = "numeric",
      pattern: customPattern,
      mask = false,
      disabled,
      readOnly,
      required,
      invalid,
      autoFocus = false,
      autoSubmit = false,
      name,
      form,
      inputId,
      ariaLabel,
      ariaDescribedBy,
      render,
      asChild,
      id: providedId,
      "aria-label": nativeAriaLabel,
      "aria-labelledby": nativeAriaLabelledBy,
      "aria-describedby": nativeAriaDescribedBy,
      "data-slot": dataSlot = "otp-field",
      ...restProps
    },
    ref,
  ) {
    const fieldContext = useFieldContext();
    const autoId = useId();
    const baseId = providedId ?? autoId;
    const normalizedLength = Math.max(1, Math.floor(length));
    const pattern = useMemo(
      () => getOTPFieldPattern(type, customPattern),
      [customPattern, type],
    );
    const [currentValue, setCurrentValue] = useControllableState({
      value,
      defaultValue: filterOTPFieldValue(defaultValue, pattern, normalizedLength),
      onChange: onValueChange,
    });
    const isDisabled = disabled ?? fieldContext?.disabled ?? false;
    const isReadOnly = readOnly ?? fieldContext?.readOnly ?? false;
    const isRequired = required ?? fieldContext?.required ?? false;
    const isInvalid = invalid ?? fieldContext?.invalid ?? false;
    const resolvedAriaDescribedBy =
      nativeAriaDescribedBy ?? ariaDescribedBy ?? fieldContext?.describedBy;
    const hasExternalLabel = nativeAriaLabelledBy ?? fieldContext?.labelId;
    const resolvedAriaLabel =
      nativeAriaLabel ?? ariaLabel ?? (hasExternalLabel ? undefined : "Verification code");
    const resolvedAriaLabelledBy =
      nativeAriaLabelledBy ?? (resolvedAriaLabel ? undefined : fieldContext?.labelId);
    const firstInputId = inputId ?? fieldContext?.controlId ?? `${baseId}-input-1`;
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const didAutoFocusRef = useRef(false);
    const registeredInputKeysRef = useRef(new Set<string>());
    const inputIndexStateRef = useRef({
      generation: 0,
      nextIndex: 0,
      claims: new Map<string, { generation: number; index: number }>(),
    });
    const [inputRegistryVersion, setInputRegistryVersion] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    inputIndexStateRef.current.generation += 1;
    inputIndexStateRef.current.nextIndex = 0;
    const chars = useMemo(
      () => getOTPFieldChars(currentValue, normalizedLength),
      [currentValue, normalizedLength],
    );

    const commitValue = useCallback(
      (nextChars: string[]) => {
        const nextValue = nextChars.join("").slice(0, normalizedLength);
        setCurrentValue(nextValue);

        if (nextValue.length === normalizedLength) {
          onComplete?.(nextValue);

          if (autoSubmit) {
            inputRefs.current[0]?.form?.requestSubmit();
          }
        }
      },
      [autoSubmit, normalizedLength, onComplete, setCurrentValue],
    );

    const focusCell = useCallback(
      (index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, normalizedLength - 1));
        setActiveIndex(clampedIndex);
        inputRefs.current[clampedIndex]?.focus({ preventScroll: true });
      },
      [normalizedLength],
    );

    const setInputRef = useCallback(
      (index: number, element: HTMLInputElement | null) => {
        inputRefs.current[index] = element;
      },
      [],
    );

    const setActiveCellIndex = useCallback(
      (index: number) => {
        setActiveIndex(Math.max(0, Math.min(index, normalizedLength - 1)));
      },
      [normalizedLength],
    );

    const updateCell = useCallback(
      (index: number, char: string) => {
        if (isDisabled || isReadOnly || !isOTPFieldCharAccepted(pattern, char)) return;

        const nextChars = [...chars];
        nextChars[index] = char;
        commitValue(nextChars);

        if (index < normalizedLength - 1) {
          focusCell(index + 1);
        }
      },
      [
        chars,
        commitValue,
        focusCell,
        isDisabled,
        isReadOnly,
        normalizedLength,
        pattern,
      ],
    );

    const clearCell = useCallback(
      (index: number) => {
        if (isDisabled || isReadOnly) return;

        const nextChars = [...chars];
        nextChars[index] = "";
        commitValue(nextChars);
      },
      [chars, commitValue, isDisabled, isReadOnly],
    );

    const clearPreviousCell = useCallback(
      (index: number) => {
        if (isDisabled || isReadOnly || index <= 0) return;

        const nextChars = [...chars];
        nextChars[index - 1] = "";
        commitValue(nextChars);
        focusCell(index - 1);
      },
      [chars, commitValue, focusCell, isDisabled, isReadOnly],
    );

    const pasteValue = useCallback(
      (nextValue: string) => {
        if (isDisabled || isReadOnly) return;

        const validValue = filterOTPFieldValue(nextValue.trim(), pattern, normalizedLength);
        if (!validValue) return;

        const nextChars = getOTPFieldChars(validValue, normalizedLength);
        commitValue(nextChars);
        focusCell(Math.min(validValue.length, normalizedLength - 1));
      },
      [
        commitValue,
        focusCell,
        isDisabled,
        isReadOnly,
        normalizedLength,
        pattern,
      ],
    );

    const getInputIndex = useCallback((inputKey: string, explicitIndex?: number) => {
      const state = inputIndexStateRef.current;
      const existingClaim = state.claims.get(inputKey);
      const renderOrderIndex =
        existingClaim?.generation === state.generation
          ? existingClaim.index
          : state.nextIndex;

      if (existingClaim?.generation !== state.generation) {
        state.claims.set(inputKey, {
          generation: state.generation,
          index: renderOrderIndex,
        });
        state.nextIndex += 1;
      }

      return explicitIndex ?? renderOrderIndex;
    }, []);

    const getInputId = useCallback(
      (index: number, explicitId?: string) => {
        if (explicitId) return explicitId;
        if (index === 0) return firstInputId;
        return `${firstInputId}-${index + 1}`;
      },
      [firstInputId],
    );

    const registerInput = useCallback((inputKey: string) => {
      if (registeredInputKeysRef.current.has(inputKey)) return;

      registeredInputKeysRef.current.add(inputKey);
      setInputRegistryVersion((version) => version + 1);
    }, []);

    const unregisterInput = useCallback((inputKey: string) => {
      if (!registeredInputKeysRef.current.delete(inputKey)) return;

      inputIndexStateRef.current.claims.delete(inputKey);
      setInputRegistryVersion((version) => version + 1);
    }, []);

    const getDisplayChar = useCallback(
      (char: string) => getOTPFieldDisplayChar(char, mask),
      [mask],
    );

    useEffect(() => {
      if (autoFocus && !isDisabled && !didAutoFocusRef.current) {
        didAutoFocusRef.current = true;
        focusCell(0);
      }
    }, [autoFocus, focusCell, isDisabled]);

    useEffect(() => {
      setActiveIndex((previousIndex) =>
        Math.max(0, Math.min(previousIndex, normalizedLength - 1)),
      );
    }, [normalizedLength]);

    const contextValue = useMemo<OTPFieldContextValue>(
      () => ({
        value: currentValue,
        chars,
        length: normalizedLength,
        type,
        mask,
        disabled: isDisabled,
        readOnly: isReadOnly,
        required: isRequired,
        invalid: isInvalid,
        inputMode: type === "numeric" ? "numeric" : "text",
        inputRefs,
        activeIndex,
        inputRegistryVersion,
        getInputIndex,
        getInputId,
        getDisplayChar,
        registerInput,
        unregisterInput,
        setInputRef,
        setActiveIndex: setActiveCellIndex,
        focusCell,
        updateCell,
        clearCell,
        clearPreviousCell,
        pasteValue,
      }),
      [
        chars,
        clearCell,
        clearPreviousCell,
        currentValue,
        focusCell,
        getDisplayChar,
        getInputIndex,
        getInputId,
        inputRegistryVersion,
        isDisabled,
        isInvalid,
        isReadOnly,
        isRequired,
        mask,
        normalizedLength,
        pasteValue,
        registerInput,
        setInputRef,
        setActiveCellIndex,
        type,
        unregisterInput,
        updateCell,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: providedId,
      role: "group",
      "aria-label": resolvedAriaLabel,
      "aria-labelledby": resolvedAriaLabelledBy,
      "aria-describedby": resolvedAriaDescribedBy,
      "aria-invalid": isInvalid || undefined,
      "aria-required": isRequired || undefined,
      "data-slot": dataSlot,
      ...(isDisabled && { "data-disabled": "" }),
      ...(isReadOnly && { "data-readonly": "" }),
      ...(isRequired && { "data-required": "" }),
      ...(isInvalid && { "data-invalid": "" }),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", {
          ...behaviorProps,
          children,
        });

    return (
      <OTPFieldContextProvider value={contextValue}>
        {element}
        {name ? (
          <input
            type="hidden"
            name={name}
            value={currentValue}
            form={form}
            disabled={isDisabled}
            aria-hidden="true"
            tabIndex={-1}
            readOnly
          />
        ) : null}
      </OTPFieldContextProvider>
    );
  },
);
