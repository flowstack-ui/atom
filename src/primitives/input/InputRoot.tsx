"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
  type FocusEventHandler,
  type ReactNode,
} from "react";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { useFieldContext } from "../field/context.js";
import type { ValidationBehavior } from "../form/validation.js";
import type { NativeInputProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import {
  InputContextProvider,
  type InputContextValue,
} from "./context.js";

type InputRootNativeProps = NativeInputProps<
  | "children"
  | "defaultValue"
  | "disabled"
  | "onChange"
  | "readOnly"
  | "required"
  | "value"
  | "aria-invalid"
  | "aria-readonly"
  | "aria-required"
>;

export interface InputRootProps extends InputRootNativeProps {
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  validationBehavior?: ValidationBehavior;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  "data-slot"?: string;
}

export const InputRoot = forwardRef<HTMLInputElement, InputRootProps>(
  function InputRoot(
    {
      children,
      value,
      defaultValue = "",
      onValueChange,
      invalid,
      disabled,
      required,
      readOnly,
      validationBehavior,
      id,
      onChange,
      onFocus,
      onBlur,
      "aria-describedby": ariaDescribedBy,
      "data-slot": dataSlot = "input",
      ...restProps
    },
    ref,
  ) {
    const fieldCtx = useFieldContext();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const handledInputEvents = useRef(new WeakSet<Event>());
    const composedRef = useMemo(() => composeRefs(inputRef, ref), [ref]);
    const [focused, setFocused] = useState(false);
    // An uncontrolled native input must stay DOM-owned. A controlled React
    // value would overwrite ref-based registration, autofill and input masks.
    // This snapshot feeds compound parts without writing it back to the DOM.
    const [nativeValue, setNativeValue] = useState(defaultValue);
    const resolvedValue = value ?? nativeValue;
    const lastNotifiedValue = useRef(resolvedValue);
    const setResolvedValue = useCallback((next: string) => {
      if (value === undefined) setNativeValue(next);
      if (lastNotifiedValue.current !== next) {
        lastNotifiedValue.current = next;
        onValueChange?.(next);
      }
    }, [value, onValueChange]);
    useEffect(() => {
      if (value === undefined && inputRef.current) {
        lastNotifiedValue.current = inputRef.current.value;
        setNativeValue(inputRef.current.value);
      } else if (value !== undefined) {
        lastNotifiedValue.current = value;
      }
    });
    useEffect(() => {
      if (value !== undefined) return;
      const input = inputRef.current;
      const form = input?.form;
      if (!input || !form) return;
      let active = true;
      const reset = (event: Event) => {
        queueMicrotask(() => {
          if (active && !event.defaultPrevented) setResolvedValue(input.value);
        });
      };
      form.addEventListener("reset", reset);
      return () => { active = false; form.removeEventListener("reset", reset); };
    }, [value, restProps.form, setResolvedValue]);
    const isDisabled = disabled ?? fieldCtx?.disabled ?? false;
    const isRequired = required ?? fieldCtx?.required ?? false;
    const isReadOnly = readOnly ?? fieldCtx?.readOnly ?? false;
    const validation = useFormValidation({
      validityRef: inputRef,
      ownerRef: inputRef,
      invalid,
      inheritedInvalid: fieldCtx?.invalid,
      validationBehavior,
      inheritedValidationBehavior: fieldCtx?.validationBehavior,
      form: restProps.form,
      reportValidity: fieldCtx?.reportControlValidity,
    });
    const isInvalid = validation.invalid;
    const controlId = id ?? fieldCtx?.controlId;
    const describedBy = ariaDescribedBy !== undefined
      ? ariaDescribedBy
      : fieldCtx?.describedBy;

    const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
      (event) => {
        setResolvedValue(event.currentTarget.value);
      },
      [setResolvedValue],
    );

    const handleFocus = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
      setFocused(true);
    }, []);

    const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
      setFocused(false);
    }, []);

    const clearValue = useCallback(() => {
      if (isDisabled || isReadOnly) return;
      if (value === undefined && inputRef.current) inputRef.current.value = "";
      setResolvedValue("");
      inputRef.current?.focus({ preventScroll: true });
    }, [isDisabled, isReadOnly, setResolvedValue, value]);

    const setValue = useCallback((next: string) => {
      if (value === undefined && inputRef.current) inputRef.current.value = next;
      setResolvedValue(next);
    }, [value, setResolvedValue]);

    const contextValue = useMemo<InputContextValue>(
      () => ({
        value: resolvedValue,
        setValue,
        clearValue,
        inputRef,
        disabled: isDisabled,
        readOnly: isReadOnly,
        invalid: isInvalid,
        required: isRequired,
        focused,
      }),
      [
        clearValue,
        focused,
        isDisabled,
        isInvalid,
        isReadOnly,
        isRequired,
        resolvedValue,
        setValue,
      ],
    );

    const consumerOnInvalid = restProps.onInvalid;
    const consumerOnInput = restProps.onInput;
    const consumerOnInputCapture = restProps.onInputCapture;
    const behaviorProps = {
      ...restProps,
      ref: composedRef,
      id: controlId,
      ...(value === undefined ? { defaultValue } : { value }),
      disabled: isDisabled || undefined,
      readOnly: isReadOnly || undefined,
      required: isRequired || undefined,
      "aria-describedby": describedBy,
      "aria-invalid": isInvalid || undefined,
      "aria-readonly": isReadOnly || undefined,
      "aria-required": isRequired || undefined,
      "data-slot": dataSlot,
      ...(resolvedValue !== "" && { "data-filled": "" }),
      ...(focused && { "data-focused": "" }),
      ...(isDisabled && { "data-disabled": "" }),
      ...(isRequired && { "data-required": "" }),
      ...(isReadOnly && { "data-readonly": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      "data-atom-validation-owner": validation.validationProps["data-atom-validation-owner"],
      "data-atom-validation-behavior": validation.validationBehavior,
      onInvalid: (event: React.FormEvent<HTMLInputElement>) => {
        consumerOnInvalid?.(event);
        validation.validationProps.onInvalid(event);
      },
      onInput: (event: React.InputEvent<HTMLInputElement>) => {
        consumerOnInput?.(event);
        if (consumerOnInput && event.defaultPrevented) handledInputEvents.current.add(event.nativeEvent);
        validation.validationProps.onInput();
      },
      onInputCapture: (event: React.InputEvent<HTMLInputElement>) => {
        consumerOnInputCapture?.(event);
        if (consumerOnInputCapture && event.defaultPrevented) handledInputEvents.current.add(event.nativeEvent);
        const input = event.currentTarget;
        // Formatting integrations may consume the bubbling event. Read after
        // their target handlers finish instead of mirroring an intermediate value.
        queueMicrotask(() => {
          if (value === undefined && inputRef.current === input && !handledInputEvents.current.has(event.nativeEvent)) {
            setResolvedValue(input.value);
          }
        });
      },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.defaultPrevented) handledInputEvents.current.add(event.nativeEvent);
        composeEventHandlers(onChange, handleChange)(event);
        validation.validationProps.onChange();
      },
      onFocus: composeEventHandlers(onFocus, handleFocus),
      onBlur: composeEventHandlers(onBlur, handleBlur),
    };

    return (
      <InputContextProvider value={contextValue}>
        <input {...behaviorProps} />
        {children}
      </InputContextProvider>
    );
  },
);
