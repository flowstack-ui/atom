"use client";

import {
  forwardRef,
  useCallback,
  type MouseEventHandler,
  type KeyboardEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { usePopoverContext } from "./context.js";
import {
  getPopoverPointerInteractionType,
  isPopoverActivationKey,
} from "./interaction.js";

type PopoverCloseNativeProps = NativeButtonProps<"children" | "type">;

export interface PopoverCloseProps extends PopoverCloseNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
function PopoverClose(
  {
    children,
    asChild = false,
    render,
    "data-slot": dataSlot = "popover-close",
    onClick,
    onKeyDown,
    onPointerDown,
    onPointerCancel,
    ...restProps
  },
  ref,
) {
  const {
    onClose,
    recordInteraction,
    consumeInteraction,
    clearInteraction,
  } = usePopoverContext();
  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
    (onClick as MouseEventHandler<HTMLButtonElement> | undefined)?.(event);
    const interactionType = consumeInteraction(event.currentTarget);
    if (!event.defaultPrevented) onClose("closeClick", interactionType);
  }, [consumeInteraction, onClick, onClose]);
  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (isPopoverActivationKey(event.key)) {
        recordInteraction("keyboard", event.currentTarget);
      }
    },
    [recordInteraction],
  );
  const handlePointerDown: PointerEventHandler<HTMLButtonElement> = useCallback(
    (event) => recordInteraction(
      getPopoverPointerInteractionType(event.pointerType),
      event.currentTarget,
    ),
    [recordInteraction],
  );
  const handlePointerCancel: PointerEventHandler<HTMLButtonElement> = useCallback(
    (event) => clearInteraction(event.currentTarget),
    [clearInteraction],
  );
  const closeProps = {
    ...restProps,
    ref,
    "data-slot": dataSlot,
    onClick: handleClick,
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    onPointerDown: composeEventHandlers(onPointerDown, handlePointerDown),
    onPointerCancel: composeEventHandlers(onPointerCancel, handlePointerCancel),
  };

  if (asChild) {
    return cloneAndMerge(children, closeProps);
  }

  return renderElement(render, "button", {
    ...closeProps,
    type: "button",
    children,
  });
});
