"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { switchComposedHost } from "./composedHost.js";
import { useSwitchInternalContext } from "./context.js";
import { useSwitchPartId } from "./usePartId.js";

type SwitchControlNativeProps = NativeButtonProps<
  "children" | "defaultChecked" | "disabled" | "onChange" | "role" | "type" | "value"
>;

export interface SwitchControlProps extends SwitchControlNativeProps {
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export const SwitchControl = forwardRef<HTMLButtonElement, SwitchControlProps>(
  function SwitchControl(
    {
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "switch-control",
      onClick,
      onBlur,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const context = useSwitchInternalContext();
    useSwitchPartId("control", restProps.id);
    const registerPart = context.registerPart;
    const host = switchComposedHost(children, render, asChild);
    const isDisabled = context.disabled || host.disabled;
    const unregisterRef = useRef<(() => void) | null>(null);
    const registeredNodeRef = useRef<HTMLButtonElement | null>(null);
    const registrationRef = useCallback((node: HTMLButtonElement | null) => {
      if (registeredNodeRef.current === node) return;
      unregisterRef.current?.();
      registeredNodeRef.current = node;
      unregisterRef.current = node && registerPart
        ? registerPart("control")
        : null;
    }, [registerPart]);
    const composedRef = useMemo(
      () => composeRefs(context.controlRef, registrationRef, ref),
      [context.controlRef, ref, registrationRef],
    );
    const handleClick: MouseEventHandler<HTMLElement> = () => {
      if (!isDisabled) context.toggle();
    };
    const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
      if (event.currentTarget.tagName === "BUTTON") return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      if (!isDisabled) context.toggle();
    };
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: restProps.id ?? context.controlId,
      type: "button",
      role: "switch",
      "aria-checked": context.checked,
      "aria-labelledby": restProps["aria-labelledby"] ??
        (restProps["aria-label"] ? undefined : context.labelId),
      "aria-describedby": Object.prototype.hasOwnProperty.call(restProps, "aria-describedby")
        ? restProps["aria-describedby"]
        : context.describedBy,
      "aria-disabled": isDisabled || undefined,
      "aria-readonly": context.readOnly || undefined,
      "aria-required": restProps["aria-required"] ?? (context.required || undefined),
      "aria-invalid": restProps["aria-invalid"] ?? (context.invalid || undefined),
      disabled: isDisabled || undefined,
      tabIndex: isDisabled ? -1 : (restProps.tabIndex ?? 0),
      "data-state": context.checked ? "checked" : "unchecked",
      "data-slot": dataSlot,
      ...(isDisabled && { "data-disabled": "" }),
      ...(context.readOnly && { "data-readonly": "" }),
      ...(context.invalid && { "data-invalid": "" }),
      ...(context.required && { "data-required": "" }),
      className,
      onClick: composeEventHandlers(
        onClick,
        composeEventHandlers(host.onClick, handleClick),
      ),
      onBlur: composeEventHandlers(onBlur, () => context.revealNativeInvalid?.()),
      onKeyDown: composeEventHandlers(
        onKeyDown,
        composeEventHandlers(host.onKeyDown, handleKeyDown),
      ),
    };
    const element = asChild
      ? cloneAndMerge(host.children, behaviorProps)
      : renderElement(host.render, "button", { ...behaviorProps, children });

    return element;
  },
);
