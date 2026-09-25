"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useId,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
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
import {
  getPopoverPointerInteractionType,
  isPopoverActivationKey,
} from "./interaction.js";

type PopoverTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

export interface PopoverTriggerProps extends PopoverTriggerNativeProps {
  value?: string;
  disabled?: boolean;
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  render?: RenderProp;
  "data-slot"?: string;
}

function isNativeKeyboardClickable(element: EventTarget | null): boolean {
  return element != null && "ownerDocument" in element && element instanceof (element as HTMLElement).ownerDocument.defaultView!.HTMLElement &&
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
    value: suppliedValue,
    disabled: locallyDisabled = false,
    asChild = false,
    className,
    render,
    "data-slot": dataSlot = "popover-trigger",
    onClick,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    onPointerDown,
    onPointerCancel,
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
    disabled: rootDisabled,
    triggerValue,
    activateTrigger,
    registerTrigger,
    ids,
    triggerMode,
    recordInteraction,
    consumeInteraction,
    clearInteraction,
  } = usePopoverContext();
  const generatedValue = useId();
  const value = suppliedValue ?? generatedValue;
  const disabled = rootDisabled || locallyDisabled;
  const active = triggerValue === undefined || triggerValue === value;
  const registrationRef = useCallback((node: HTMLElement | null) => registerTrigger(value, node), [registerTrigger, value]);
  const composedRef = useMemo(
    () => composeRefs(registrationRef, ref),
    [ref, registrationRef],
  );

  const handleClick: MouseEventHandler<HTMLElement> = useCallback((event) => {
    (onClick as MouseEventHandler<HTMLElement> | undefined)?.(event);
    const interactionType = consumeInteraction(event.currentTarget);
    if (!event.defaultPrevented && !disabled) activateTrigger(value, event.currentTarget, interactionType);
  }, [consumeInteraction, disabled, onClick, activateTrigger, value]);

  const handlePointerDown: PointerEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (!disabled) {
        recordInteraction(
          getPopoverPointerInteractionType(event.pointerType),
          event.currentTarget,
        );
      }
    },
    [disabled, recordInteraction],
  );

  const handlePointerCancel: PointerEventHandler<HTMLElement> = useCallback(
    (event) => clearInteraction(event.currentTarget),
    [clearInteraction],
  );

  const handleKeyDown: KeyboardEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled) return;
      if (!isPopoverActivationKey(event.key)) return;
      if (isNativeKeyboardClickable(event.currentTarget)) {
        recordInteraction("keyboard", event.currentTarget);
        return;
      }
      event.preventDefault();
      activateTrigger(value, event.currentTarget, "keyboard");
    },
    [disabled, activateTrigger, value, recordInteraction],
  );

  const handleMouseEnter: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (disabled || triggerMode !== "hover") return;
    onOpen("triggerHover", "mouse");
  }, [disabled, onOpen, triggerMode]);

  const handleMouseLeave: MouseEventHandler<HTMLElement> = useCallback(() => {
    if (disabled || triggerMode !== "hover") return;
    onClose("hoverLeave", "mouse");
  }, [disabled, onClose, triggerMode]);

  const triggerProps = {
    ...restProps,
    id: restProps.id ?? (typeof ids.trigger === "function" ? ids.trigger(suppliedValue) : ids.trigger) ?? `${popoverId}-trigger-${value}`,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-state": isOpen && active ? "open" : "closed",
    "data-value": suppliedValue,
    "data-trigger-mode": triggerMode,
    ...(disabled && { "data-disabled": "" }),
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen && active,
    "aria-controls": isOpen && active ? popoverId : undefined,
    "aria-disabled": disabled || undefined,
    disabled: disabled || undefined,
    role: asChild || render ? "button" : undefined,
    tabIndex: asChild || render ? (disabled ? -1 : 0) : undefined,
    onClick: handleClick,
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    onMouseEnter:
      triggerMode === "hover"
        ? composeEventHandlers(onMouseEnter, handleMouseEnter)
        : onMouseEnter,
    onMouseLeave:
      triggerMode === "hover"
        ? composeEventHandlers(onMouseLeave, handleMouseLeave)
        : onMouseLeave,
    onPointerDown: composeEventHandlers(onPointerDown, handlePointerDown),
    onPointerCancel: composeEventHandlers(onPointerCancel, handlePointerCancel),
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
