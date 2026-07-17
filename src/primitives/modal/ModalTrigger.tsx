"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
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
import { useModalContext } from "./context.js";
import {
  getModalPointerInteractionType,
  isModalActivationKey,
} from "./interaction.js";

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
    onPointerDown,
    onPointerCancel,
    ...restProps
  },
  ref,
) {
  const {
    isOpen,
    onOpen,
    modalId,
    triggerRef,
    disabled,
    recordInteraction,
    consumeInteraction,
    clearInteraction,
  } = useModalContext();
  const composedRef = useMemo(
    () => composeRefs(triggerRef, ref),
    [ref, triggerRef],
  );

  const handleClick: MouseEventHandler<HTMLElement> = useCallback((event) => {
    (onClick as MouseEventHandler<HTMLElement> | undefined)?.(event);
    const interactionType = consumeInteraction(event.currentTarget);
    if (!event.defaultPrevented && !disabled) onOpen(interactionType);
  }, [consumeInteraction, disabled, onClick, onOpen]);

  const handlePointerDown: PointerEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (!disabled) {
        recordInteraction(
          getModalPointerInteractionType(event.pointerType),
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
      if (disabled || !isModalActivationKey(event.key)) return;

      if (isNativeKeyboardClickable(event.currentTarget)) {
        recordInteraction("keyboard", event.currentTarget);
        return;
      }

      event.preventDefault();
      onOpen("keyboard");
    },
    [disabled, onOpen, recordInteraction],
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
    onClick: handleClick,
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
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
