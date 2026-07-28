"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeInputProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useNumberInputContext } from "./context.js";

type NumberInputInputNativeProps = NativeInputProps<"children" | "defaultValue" | "type">;

export interface NumberInputInputProps extends NumberInputInputNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const NumberInputInput = forwardRef<HTMLInputElement, NumberInputInputProps>(
  function NumberInputInput(
    { children, asChild, render, "data-slot": dataSlot = "number-input-input", onChange, onInput, onInvalid, onKeyDown, onFocus, onBlur, ...restProps },
    ref,
  ) {
    const context = useNumberInputContext();
    const behaviorProps = {
      ...restProps,
      ref: composeRefs(context.inputRef, ref),
      type: "text",
      inputMode: context.inputMode,
      role: "spinbutton",
      id: restProps.id ?? context.inputId,
      value: context.displayValue,
      placeholder: restProps.placeholder ?? context.placeholder,
      disabled: context.disabled || undefined,
      readOnly: context.readOnly || undefined,
      required: context.required || undefined,
      form: restProps.form ?? context.form,
      className: restProps.className ?? context.inputClassName,
      "aria-label": restProps["aria-label"] ?? context.ariaLabel,
      "aria-valuenow": context.numericValue ?? undefined,
      "aria-valuemin": context.min,
      "aria-valuemax": context.max,
      "aria-valuetext": restProps["aria-valuetext"] ?? context.ariaValueText,
      "aria-invalid": context.invalid || undefined,
      "aria-required": context.required || undefined,
      "aria-readonly": context.readOnly || undefined,
      "aria-describedby": restProps["aria-describedby"] ?? context.ariaDescribedBy,
      autoComplete: restProps.autoComplete ?? "off",
      "data-slot": dataSlot,
      "data-atom-validation-owner": "",
      "data-atom-validation-behavior": context.validationBehavior,
      onChange: composeEventHandlers(onChange, context.handleChange),
      onInput: composeEventHandlers(onInput, context.handleInput),
      onInvalid: composeEventHandlers(onInvalid, context.handleInvalid),
      onKeyDown: composeEventHandlers(onKeyDown, context.handleKeyDown),
      onFocus: composeEventHandlers(onFocus, context.handleFocus),
      onBlur: composeEventHandlers(onBlur, context.handleBlur),
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "input", behaviorProps);
  },
);
