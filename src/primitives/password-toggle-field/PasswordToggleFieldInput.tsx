"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeInputProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
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
  const inputProps = {
    ...restProps,
    ref,
    type: ctx.visible ? "text" : "password",
    disabled: ctx.disabled || undefined,
    readOnly: ctx.readOnly || undefined,
    required: ctx.required || undefined,
    "aria-invalid": ctx.invalid || undefined,
    "aria-readonly": ctx.readOnly || undefined,
    "aria-required": ctx.required || undefined,
    "data-slot": dataSlot,
    "data-state": ctx.visible ? "visible" : "hidden",
    "data-disabled": ctx.disabled ? "" : undefined,
    "data-readonly": ctx.readOnly ? "" : undefined,
    "data-invalid": ctx.invalid ? "" : undefined,
    "data-required": ctx.required ? "" : undefined,
  };

  if (asChild) return cloneAndMerge(children, inputProps);

  return renderElement(render, "input", inputProps);
});
