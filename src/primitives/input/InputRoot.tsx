"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
  type FocusEventHandler,
  type ReactNode,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFieldContext } from "../field/context.js";
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
    const composedRef = useMemo(() => composeRefs(inputRef, ref), [ref]);
    const [focused, setFocused] = useState(false);
    const [resolvedValue, setResolvedValue] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const reset = useCallback(() => setResolvedValue(defaultValue), [defaultValue, setResolvedValue]);
    useFormReset(inputRef, restProps.form, value !== undefined, reset);
    const isDisabled = disabled ?? fieldCtx?.disabled ?? false;
    const isRequired = required ?? fieldCtx?.required ?? false;
    const isReadOnly = readOnly ?? fieldCtx?.readOnly ?? false;
    const isInvalid = invalid ?? fieldCtx?.invalid ?? false;
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
      setResolvedValue("");
      inputRef.current?.focus({ preventScroll: true });
    }, [isDisabled, isReadOnly, setResolvedValue]);

    const contextValue = useMemo<InputContextValue>(
      () => ({
        value: resolvedValue,
        setValue: setResolvedValue,
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
        setResolvedValue,
      ],
    );

    const behaviorProps = {
      ...restProps,
      ref: composedRef,
      id: controlId,
      value: resolvedValue,
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
      onChange: composeEventHandlers(onChange, handleChange),
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
