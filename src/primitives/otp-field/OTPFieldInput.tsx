"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  type ChangeEventHandler,
  type ClipboardEventHandler,
  type FormEventHandler,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import type { NativeInputProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/slot.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useOTPFieldContext } from "./context.js";

type OTPFieldInputNativeProps = NativeInputProps<
  | "children"
  | "type"
  | "value"
  | "defaultValue"
  | "maxLength"
  | "disabled"
  | "readOnly"
  | "required"
  | "name"
  | "form"
>;

export interface OTPFieldInputProps extends OTPFieldInputNativeProps {
  index?: number;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const OTPFieldInput = forwardRef<HTMLInputElement, OTPFieldInputProps>(
  function OTPFieldInput(
    {
      index,
      children,
      render,
      asChild,
      id,
      "aria-label": ariaLabel,
      "data-slot": dataSlot = "otp-field-input",
      onInput,
      onChange,
      onKeyDown,
      onPaste,
      onFocus,
      ...restProps
    },
    ref,
  ) {
    const context = useOTPFieldContext();
    const inputKey = useId();
    const resolvedIndex = context.getInputIndex(inputKey, index);
    const char = context.chars[resolvedIndex] ?? "";
    const displayValue = context.getDisplayChar(char);
    const { registerInput, unregisterInput } = context;

    useEffect(() => {
      registerInput(inputKey);
      return () => unregisterInput(inputKey);
    }, [inputKey, registerInput, unregisterInput]);

    const setRef = useCallback(
      (element: HTMLInputElement | null) => {
        context.setInputRef(resolvedIndex, element);

        if (typeof ref === "function") {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      },
      [context, resolvedIndex, ref],
    );

    const handleInput = useCallback<FormEventHandler<HTMLInputElement>>(
      (event) => {
        const nextValue = event.currentTarget.value;

        if (nextValue.length > 1) {
          context.pasteValue(nextValue);
          event.currentTarget.value = displayValue;
          return;
        }

        const nextChar = nextValue[nextValue.length - 1] ?? "";

        if (nextChar) {
          context.updateCell(resolvedIndex, nextChar);
        }

        event.currentTarget.value = displayValue;
      },
      [context, displayValue, resolvedIndex],
    );

    const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
      () => undefined,
      [],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
      (event) => {
        switch (event.key) {
          case "Backspace": {
            event.preventDefault();

            if (context.chars[resolvedIndex]) {
              context.clearCell(resolvedIndex);
            } else {
              context.clearPreviousCell(resolvedIndex);
            }
            break;
          }
          case "Delete": {
            event.preventDefault();
            context.clearCell(resolvedIndex);
            break;
          }
          case "ArrowLeft": {
            event.preventDefault();
            context.focusCell(resolvedIndex - 1);
            break;
          }
          case "ArrowRight": {
            event.preventDefault();
            context.focusCell(resolvedIndex + 1);
            break;
          }
          case "Home": {
            event.preventDefault();
            context.focusCell(0);
            break;
          }
          case "End": {
            event.preventDefault();
            context.focusCell(context.length - 1);
            break;
          }
        }
      },
      [context, resolvedIndex],
    );

    const handlePaste = useCallback<ClipboardEventHandler<HTMLInputElement>>(
      (event) => {
        event.preventDefault();
        context.pasteValue(event.clipboardData.getData("text"));
      },
      [context],
    );

    const handleFocus = useCallback<FocusEventHandler<HTMLInputElement>>(
      (event) => {
        context.setActiveIndex(resolvedIndex);
        event.currentTarget.select();
      },
      [context, resolvedIndex],
    );

    const cellNoun = context.type === "numeric" ? "Digit" : "Character";
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: setRef,
      id: context.getInputId(resolvedIndex, id),
      type: "text",
      inputMode: context.inputMode,
      autoComplete: resolvedIndex === 0 ? "one-time-code" : "off",
      maxLength: 1,
      value: displayValue,
      tabIndex: context.activeIndex === resolvedIndex ? 0 : -1,
      disabled: context.disabled || undefined,
      readOnly: context.readOnly || undefined,
      "aria-label": ariaLabel ?? `${cellNoun} ${resolvedIndex + 1} of ${context.length}`,
      "aria-invalid": context.invalid || undefined,
      "aria-required": context.required || undefined,
      "data-slot": dataSlot,
      "data-index": resolvedIndex,
      ...(char && { "data-filled": "" }),
      ...(context.disabled && { "data-disabled": "" }),
      ...(context.readOnly && { "data-readonly": "" }),
      ...(context.invalid && { "data-invalid": "" }),
      onInput: composeEventHandlers(onInput, handleInput),
      onChange: composeEventHandlers(onChange, handleChange),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      onPaste: composeEventHandlers(onPaste, handlePaste),
      onFocus: composeEventHandlers(onFocus, handleFocus),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "input", behaviorProps);
  },
);
