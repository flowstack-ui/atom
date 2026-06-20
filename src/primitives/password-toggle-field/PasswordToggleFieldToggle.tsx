"use client";

import { forwardRef, useCallback, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { usePasswordToggleFieldContext } from "./context.js";

type PasswordToggleFieldToggleNativeProps = NativeButtonProps<
  "children" | "disabled" | "type"
>;

export interface PasswordToggleFieldToggleProps
  extends PasswordToggleFieldToggleNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const PasswordToggleFieldToggle = forwardRef<
  HTMLButtonElement,
  PasswordToggleFieldToggleProps
>(function PasswordToggleFieldToggle(
  {
    children,
    asChild = false,
    render,
    "data-slot": dataSlot = "password-toggle-field-toggle",
    onClick,
    onMouseDown,
    ...restProps
  },
  ref,
) {
  const ctx = usePasswordToggleFieldContext();
  const { onToggle } = ctx;

  const handleMouseDown: MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    onToggle();
  }, [onToggle]);

  const toggleProps = {
    ...restProps,
    ref,
    type: "button",
    disabled: ctx.disabled || undefined,
    "aria-label":
      restProps["aria-label"] ?? (ctx.visible ? "Hide password" : "Show password"),
    "data-slot": dataSlot,
    "data-state": ctx.visible ? "visible" : "hidden",
    "data-disabled": ctx.disabled ? "" : undefined,
    "data-readonly": ctx.readOnly ? "" : undefined,
    "data-invalid": ctx.invalid ? "" : undefined,
    "data-required": ctx.required ? "" : undefined,
    onClick: composeEventHandlers(onClick, handleClick),
    onMouseDown: composeEventHandlers(onMouseDown, handleMouseDown),
  };

  if (asChild) return cloneAndMerge(children, toggleProps);

  return renderElement(render, "button", { ...toggleProps, children });
});
