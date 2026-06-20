"use client";

import {
  forwardRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  childHasNativeButtonSemantics,
  childIsNativeButton,
  renderHasNativeButtonSemantics,
  renderIsNativeButton,
} from "../../utils/native-semantics.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type ToggleRootNativeProps = NativeButtonProps<
  "children" | "defaultChecked" | "disabled" | "onChange" | "role" | "type" | "value"
>;

export function isToggleActivationKey(key: string): boolean {
  return key === " " || key === "Enter";
}

export interface ToggleRootProps extends ToggleRootNativeProps {
  /** Controlled pressed state. */
  pressed?: boolean;
  /** Initial pressed state for uncontrolled mode. */
  defaultPressed?: boolean;
  /** Callback when pressed state changes. */
  onPressedChange?: (pressed: boolean) => void;
  /** Disable interaction. */
  disabled?: boolean;
  /** Value identifier when used inside a toggle group. */
  value?: string;
  /** Accessible label. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Children rendered inside the toggle. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ToggleRoot = forwardRef<HTMLButtonElement, ToggleRootProps>(
  function ToggleRoot(
    {
      pressed,
      defaultPressed = false,
      onPressedChange,
      disabled = false,
      value,
      ariaLabel,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "toggle",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const [isPressed, setIsPressed] = useControllableState({
      value: pressed,
      defaultValue: defaultPressed,
      onChange: onPressedChange,
    });
    const isDefaultButton = !asChild && render === undefined;
    const hasNativeSemantics = isDefaultButton ||
      (asChild ? childHasNativeButtonSemantics(children) : renderHasNativeButtonSemantics(render));
    const isNativeButton = isDefaultButton ||
      (asChild ? childIsNativeButton(children) : renderIsNativeButton(render));

    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      if (disabled) return;
      setIsPressed(!isPressed);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
      if (!isToggleActivationKey(event.key)) return;

      event.preventDefault();
      if (disabled) return;
      setIsPressed(!isPressed);
    };

    // Native button props pass through first; Atom state and ARIA stay authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      ...(isNativeButton ? { type: "button", disabled: disabled || undefined } : {}),
      ...(!hasNativeSemantics ? { role: "button" } : {}),
      "aria-pressed": isPressed,
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      "aria-disabled": disabled || undefined,
      tabIndex: disabled ? undefined : 0,
      ...(disabled && { "data-disabled": "" }),
      "data-state": isPressed ? "on" : "off",
      "data-slot": dataSlot,
      ...(value !== undefined && { "data-value": value }),
      onClick: composeEventHandlers(onClick, handleClick),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      className,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", { ...behaviorProps, children });
  },
);
