"use client";

import { forwardRef, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFormReset } from "../../hooks/useFormReset.js";
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
  useFormReset(inputRef, restProps.form, false, ctx.resetVisibility);
  useEffect(() => {
    const input = inputRef.current;
    const form = restProps.form
      ? input?.ownerDocument.getElementById(restProps.form)
      : input?.form;
    if (!form || form.tagName !== "FORM") return undefined;
    const restorePasswordType = () => {
      if (input) input.type = "password";
    };
    form.addEventListener("submit", restorePasswordType);
    return () => form.removeEventListener("submit", restorePasswordType);
  }, [restProps.form]);
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
    id: restProps.id ?? ctx.inputId,
    "aria-labelledby": restProps["aria-labelledby"] ?? ctx.ariaLabelledBy,
    "aria-describedby": restProps["aria-describedby"] ?? ctx.ariaDescribedBy,
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
