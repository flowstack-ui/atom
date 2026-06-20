"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
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
import { useModalContext } from "./context.js";

type ModalTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

export interface ModalTriggerProps extends ModalTriggerNativeProps {
  /** Trigger content. */
  children: ReactNode;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Slot name for styling hooks. */
  "data-slot"?: string;
  /** Override the rendered element. */
  render?: RenderProp;
}

function isNativeKeyboardClickable(element: EventTarget | null): boolean {
  return element instanceof HTMLElement &&
    (element.tagName === "BUTTON" ||
      element.tagName === "A" ||
      element.tagName === "INPUT" ||
      element.tagName === "SELECT" ||
      element.tagName === "TEXTAREA");
}

export const ModalTrigger = forwardRef<HTMLElement, ModalTriggerProps>(
function ModalTrigger(
  {
    children,
    asChild = false,
    className,
    "data-slot": dataSlot = "modal-trigger",
    render,
    onClick,
    onKeyDown,
    ...restProps
  },
  ref,
) {
  const { isOpen, onOpen, modalId, triggerRef, disabled } = useModalContext();
  const composedRef = useMemo(
    () => composeRefs(triggerRef, ref),
    [ref, triggerRef],
  );

  const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (!disabled) onOpen();
  }, [disabled, onOpen]);

  const handleKeyDown: KeyboardEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled || isNativeKeyboardClickable(event.currentTarget)) return;
      if (event.key !== " " && event.key !== "Enter") return;

      event.preventDefault();
      onOpen();
    },
    [disabled, onOpen],
  );

  const triggerProps = {
    ...restProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-state": isOpen ? "open" : "closed",
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? modalId : undefined,
    "aria-disabled": disabled || undefined,
    ...(disabled && { "data-disabled": "" }),
    disabled: disabled || undefined,
    role: asChild || render ? "button" : undefined,
    tabIndex: asChild || render ? (disabled ? -1 : 0) : undefined,
    onClick: composeEventHandlers(onClick, handleClick),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    className,
  };

  if (asChild) {
    return cloneAndMerge(children, triggerProps);
  }

  return renderElement(render, "button", {
    ...triggerProps,
    type: "button",
    children,
  });
});
