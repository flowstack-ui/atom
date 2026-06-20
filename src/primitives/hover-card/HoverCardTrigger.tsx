"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type FocusEvent,
  type FocusEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useHoverCardContext } from "./context.js";

type HoverCardTriggerNativeProps = NativeSpanProps<"children">;

export interface HoverCardTriggerProps extends HoverCardTriggerNativeProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  render?: RenderProp;
  "data-slot"?: string;
}

export const HoverCardTrigger = forwardRef<HTMLElement, HoverCardTriggerProps>(
function HoverCardTrigger(
  {
    children,
    asChild = false,
    className,
    render,
    "data-slot": dataSlot = "hover-card-trigger",
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...restProps
  },
  ref,
) {
  const { isOpen, onOpen, onClose, triggerRef, disabled } = useHoverCardContext();
  const composedRef = useMemo(
    () => composeRefs(triggerRef, ref),
    [ref, triggerRef],
  );

  const handleMouseEnter: MouseEventHandler<HTMLSpanElement> = useCallback(() => {
    if (!disabled) onOpen();
  }, [disabled, onOpen]);

  const handleMouseLeave: MouseEventHandler<HTMLSpanElement> = useCallback(() => {
    if (!disabled) onClose();
  }, [disabled, onClose]);

  const handleFocus: FocusEventHandler<HTMLSpanElement> = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (event.target.matches(":focus-visible")) {
        if (!disabled) onOpen();
      }
    },
    [disabled, onOpen],
  );

  const handleBlur: FocusEventHandler<HTMLSpanElement> = useCallback(() => {
    if (!disabled) onClose();
  }, [disabled, onClose]);

  const triggerProps = {
    ...restProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-state": isOpen ? "open" : "closed",
    onMouseEnter: composeEventHandlers(onMouseEnter, handleMouseEnter),
    onMouseLeave: composeEventHandlers(onMouseLeave, handleMouseLeave),
    onFocus: composeEventHandlers(onFocus, handleFocus),
    onBlur: composeEventHandlers(onBlur, handleBlur),
    className,
  };

  if (asChild) {
    return cloneAndMerge(children, triggerProps);
  }

  return renderElement(render, "span", {
    ...triggerProps,
    children,
  });
});
