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
import { usePopoverContext } from "./context.js";

type PopoverTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

export interface PopoverTriggerProps extends PopoverTriggerNativeProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  render?: RenderProp;
  "data-slot"?: string;
}

function isNativeKeyboardClickable(element: EventTarget | null): boolean {
  return element instanceof HTMLElement &&
    (element.tagName === "BUTTON" ||
      element.tagName === "A" ||
      element.tagName === "INPUT" ||
      element.tagName === "SELECT" ||
      element.tagName === "TEXTAREA");
}

export const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(
function PopoverTrigger(
  {
    children,
    asChild = false,
    className,
    render,
    "data-slot": dataSlot = "popover-trigger",
    onClick,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    ...restProps
  },
  ref,
) {
  const {
    isOpen,
    onToggle,
    onOpen,
    onClose,
    popoverId,
    triggerRef,
    disabled,
    triggerMode,
  } = usePopoverContext();
  const composedRef = useMemo(
    () => composeRefs(triggerRef, ref),
    [ref, triggerRef],
  );

  const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (!disabled) onToggle();
  }, [disabled, onToggle]);

  const handleKeyDown: KeyboardEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled || isNativeKeyboardClickable(event.currentTarget)) return;
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      onToggle();
    },
    [disabled, onToggle],
  );

  const handleMouseEnter: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (disabled || triggerMode !== "hover") return;
    onOpen();
  }, [disabled, onOpen, triggerMode]);

  const handleMouseLeave: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (disabled || triggerMode !== "hover") return;
    onClose();
  }, [disabled, onClose, triggerMode]);

  const triggerProps = {
    ...restProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-state": isOpen ? "open" : "closed",
    "data-trigger-mode": triggerMode,
    ...(disabled && { "data-disabled": "" }),
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? popoverId : undefined,
    "aria-disabled": disabled || undefined,
    disabled: disabled || undefined,
    role: asChild || render ? "button" : undefined,
    tabIndex: asChild || render ? (disabled ? -1 : 0) : undefined,
    onClick: composeEventHandlers(onClick, handleClick),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    onMouseEnter:
      triggerMode === "hover"
        ? composeEventHandlers(onMouseEnter, handleMouseEnter)
        : onMouseEnter,
    onMouseLeave:
      triggerMode === "hover"
        ? composeEventHandlers(onMouseLeave, handleMouseLeave)
        : onMouseLeave,
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
