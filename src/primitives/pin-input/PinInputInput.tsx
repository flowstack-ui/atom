"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
  type ClipboardEventHandler,
  type FormEventHandler,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import type { NativeInputProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { usePinInputInternalContext } from "./context.js";

type PinInputInputNativeProps = NativeInputProps<
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

export interface PinInputInputProps extends PinInputInputNativeProps {
  index?: number;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const PinInputInput = forwardRef<HTMLInputElement, PinInputInputProps>(
  function PinInputInput(
    {
      index,
      children,
      render,
      asChild,
      id,
      "aria-label": ariaLabel,
      "data-slot": dataSlot = "pin-input-input",
      onInput,
      onChange,
      onKeyDown,
      onPaste,
      onFocus,
      onInvalid,
      onBlur,
      onCompositionStart,
      onCompositionEnd,
      ...restProps
    },
    ref,
  ) {
    const context = usePinInputInternalContext();
    const composing = useRef(false);
    const [compositionValue, setCompositionValue] = useState<string | null>(
      null,
    );
    const lastComposition = useRef<string | null>(null);
    const inputKey = useId();
    const resolvedIndex = context.getInputIndex(inputKey, index);
    const char = context.chars[resolvedIndex] ?? "";
    const displayValue = context.getDisplayChar(char);
    const { registerInput, unregisterInput } = context;

    useEffect(() => {
      registerInput(inputKey);
      return () => unregisterInput(inputKey);
    }, [inputKey, registerInput, unregisterInput]);

    const setInputRef = context.setInputRef;
    const registerRef = useCallback(
      (element: HTMLInputElement | null) => {
        setInputRef(resolvedIndex, element);
      },
      [setInputRef, resolvedIndex],
    );
    const setRef = useMemo(() => composeRefs(registerRef, ref), [registerRef, ref]);

    const handleInput = useCallback<FormEventHandler<HTMLInputElement>>(
      (event) => {
        const nextValue = event.currentTarget.value;
        if (
          composing.current ||
          (event.nativeEvent as InputEvent).isComposing
        ) {
          setCompositionValue(nextValue);
          return;
        }
        if (lastComposition.current === nextValue) {
          lastComposition.current = null;
          event.currentTarget.value = displayValue;
          return;
        }
        lastComposition.current = null;

        const native = event.nativeEvent as InputEvent;
        if (
          native.inputType === "insertText" &&
          native.data &&
          Array.from(native.data).length === 1
        ) {
          context.updateCell(resolvedIndex, native.data);
          event.currentTarget.value = displayValue;
          return;
        }

        if (nextValue.length > 1) {
          context.pasteValue(nextValue, resolvedIndex);
          event.currentTarget.value = displayValue;
          return;
        }

        const nextChar = nextValue[nextValue.length - 1] ?? "";

        if (nextChar) {
          context.updateCell(resolvedIndex, nextChar);
        } else context.clearCell(resolvedIndex);

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
        if (
          composing.current ||
          event.nativeEvent.isComposing ||
          event.keyCode === 229
        )
          return;
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
            context.focusCell(resolvedIndex + (context.dir === "rtl" ? 1 : -1));
            break;
          }
          case "ArrowRight": {
            event.preventDefault();
            context.focusCell(resolvedIndex + (context.dir === "rtl" ? -1 : 1));
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
        context.pasteValue(event.clipboardData.getData("text"), resolvedIndex);
      },
      [context],
    );

    const handleFocus = useCallback<FocusEventHandler<HTMLInputElement>>(
      (event) => {
        context.setActiveIndex(resolvedIndex);
        if (context.selectOnFocus) event.currentTarget.select();
      },
      [context, resolvedIndex],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: setRef,
      id: context.getInputId(resolvedIndex, id),
      type: context.mask === true ? "password" : "text",
      inputMode: context.inputMode,
      autoComplete:
        restProps.autoComplete ??
        (context.otp && resolvedIndex === 0 ? "one-time-code" : "off"),
      placeholder: restProps.placeholder ?? context.placeholder,
      value: compositionValue ?? displayValue,
      tabIndex: context.activeIndex === resolvedIndex ? 0 : -1,
      disabled: context.disabled || undefined,
      readOnly: context.readOnly || undefined,
      required: context.required && resolvedIndex === 0 ? true : undefined,
      form: context.form,
      "aria-label": ariaLabel ?? context.getInputLabel(resolvedIndex),
      "aria-invalid": context.invalid || undefined,
      "aria-required": context.required || undefined,
      "aria-describedby": restProps["aria-describedby"] ?? context.describedBy,
      "data-slot": dataSlot,
      "data-index": resolvedIndex,
      ...(char && { "data-filled": "" }),
      ...(context.disabled && { "data-disabled": "" }),
      ...(context.readOnly && { "data-readonly": "" }),
      ...(context.invalid && { "data-invalid": "" }),
      ...(resolvedIndex === 0 && {
        "data-atom-validation-owner": "",
        "data-atom-validation-behavior": context.validationBehavior,
      }),
      onInvalid: (event: React.FormEvent<HTMLInputElement>) => {
        onInvalid?.(event);
        if (resolvedIndex === 0) context.onValidationInvalid(event);
      },
      onInput: (event: React.InputEvent<HTMLInputElement>) => {
        composeEventHandlers(onInput, handleInput)(event);
        if (resolvedIndex === 0) context.syncValidation();
      },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        composeEventHandlers(onChange, handleChange)(event);
        if (resolvedIndex === 0) context.syncValidation();
      },
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      onPaste: composeEventHandlers(onPaste, handlePaste),
      onFocus: composeEventHandlers(onFocus, handleFocus),
      onBlur: composeEventHandlers(onBlur, () => context.setFocusedIndex(-1)),
      onCompositionStart: composeEventHandlers(
        onCompositionStart,
        (event: React.CompositionEvent<HTMLInputElement>) => {
          composing.current = true;
          setCompositionValue(event.currentTarget.value);
          lastComposition.current = null;
        },
      ),
      onCompositionEnd: composeEventHandlers(
        onCompositionEnd,
        (event: React.CompositionEvent<HTMLInputElement>) => {
          composing.current = false;
          const value = event.currentTarget.value;
          setCompositionValue(null);
          lastComposition.current = value;
          queueMicrotask(() => {
            lastComposition.current = null;
          });
          if (Array.from(value).length > 1)
            context.pasteValue(value, resolvedIndex);
          else if (value) context.updateCell(resolvedIndex, value);
          else context.clearCell(resolvedIndex);
          event.currentTarget.value = displayValue;
        },
      ),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "input", behaviorProps);
  },
);
