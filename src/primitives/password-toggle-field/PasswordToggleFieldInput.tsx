"use client";

import { forwardRef, useMemo, useRef, type ReactNode } from "react";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import type { NativeInputProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { usePasswordToggleFieldContext } from "./context.js";

type PasswordToggleFieldInputNativeProps = NativeInputProps<
  | "children"
  | "disabled"
  | "readOnly"
  | "required"
  | "type"
  | "aria-invalid"
  | "aria-readonly"
  | "aria-required"
>;

export interface PasswordToggleFieldInputProps
  extends PasswordToggleFieldInputNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const PasswordToggleFieldInput = forwardRef<
  HTMLInputElement,
  PasswordToggleFieldInputProps
>(function PasswordToggleFieldInput(
  {
    children,
    asChild = false,
    render,
    "data-slot": dataSlot = "password-toggle-field-input",
    ...restProps
  },
  ref,
) {
  const ctx = usePasswordToggleFieldContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const composedRef = useMemo(() => composeRefs(inputRef, ref), [ref]);
  const validation = useFormValidation({
    validityRef: inputRef,
    ownerRef: inputRef,
    inheritedInvalid: ctx.invalid,
    inheritedValidationBehavior: ctx.validationBehavior,
    form: restProps.form,
    reportValidity: ctx.reportControlValidity,
  });
  const consumerOnInvalid = restProps.onInvalid;
  const consumerOnInput = restProps.onInput;
  const consumerOnChange = restProps.onChange;
  const inputProps = {
    ...restProps,
    ref: composedRef,
    type: ctx.visible ? "text" : "password",
    disabled: ctx.disabled || undefined,
    readOnly: ctx.readOnly || undefined,
    required: ctx.required || undefined,
    "aria-invalid": validation.invalid || undefined,
    "aria-readonly": ctx.readOnly || undefined,
    "aria-required": ctx.required || undefined,
    "data-slot": dataSlot,
    "data-state": ctx.visible ? "visible" : "hidden",
    "data-disabled": ctx.disabled ? "" : undefined,
    "data-readonly": ctx.readOnly ? "" : undefined,
    "data-invalid": validation.invalid ? "" : undefined,
    "data-required": ctx.required ? "" : undefined,
    "data-atom-validation-owner": "",
    "data-atom-validation-behavior": validation.validationBehavior,
    onInvalid: (event: React.FormEvent<HTMLInputElement>) => {
      consumerOnInvalid?.(event);
      validation.validationProps.onInvalid(event);
    },
    onInput: (event: React.InputEvent<HTMLInputElement>) => {
      consumerOnInput?.(event);
      validation.validationProps.onInput();
    },
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      consumerOnChange?.(event);
      validation.validationProps.onChange();
    },
  };

  if (asChild) return cloneAndMerge(children, inputProps);

  return renderElement(render, "input", inputProps);
});
