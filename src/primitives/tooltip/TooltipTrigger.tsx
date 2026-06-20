"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type FocusEvent,
  type FocusEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type TouchEventHandler,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useTooltipContext } from "./context.js";

type TooltipTriggerNativeProps = NativeSpanProps<"children">;

export interface TooltipTriggerProps extends TooltipTriggerNativeProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  render?: RenderProp;
  "data-slot"?: string;
}

const LONG_PRESS_DELAY = 700;

export const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
function TooltipTrigger(
  {
    children,
    asChild = false,
    className,
    render,
    "data-slot": dataSlot = "tooltip-trigger",
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onTouchStart,
    onTouchEnd,
    ...restProps
  },
  ref,
) {
  const { isOpen, onOpen, onClose, tooltipId, triggerRef, disabled, isTouchRef } =
    useTooltipContext();
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composedRef = useMemo(
    () => composeRefs(triggerRef, ref),
    [ref, triggerRef],
  );

  const shouldSuppressForPopover = useCallback((): boolean => {
    const element = triggerRef.current;
    if (!element) return false;
    // Avoid showing nested tooltips while a Popover trigger is already managing hover/open state.
    return Boolean(
      element.closest(
        '[data-slot="popover-trigger"][data-state="open"],' +
          '[data-slot="popover-trigger"][data-trigger-mode="hover"]',
      ),
    );
  }, [triggerRef]);

  const handleMouseEnter: MouseEventHandler<HTMLSpanElement> = useCallback(() => {
    if (disabled || shouldSuppressForPopover()) return;
    isTouchRef.current = false;
    onOpen();
  }, [disabled, isTouchRef, onOpen, shouldSuppressForPopover]);

  const handleMouseLeave: MouseEventHandler<HTMLSpanElement> = useCallback(() => {
    if (!disabled) onClose();
  }, [disabled, onClose]);

  const handleFocus: FocusEventHandler<HTMLSpanElement> = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (event.target.matches(":focus-visible")) {
        if (disabled || shouldSuppressForPopover()) return;
        isTouchRef.current = false;
        onOpen();
      }
    },
    [disabled, isTouchRef, onOpen, shouldSuppressForPopover],
  );

  const handleBlur: FocusEventHandler<HTMLSpanElement> = useCallback(() => {
    if (!disabled) onClose();
  }, [disabled, onClose]);

  const handleTouchStart: TouchEventHandler<HTMLSpanElement> = useCallback(() => {
    if (disabled || shouldSuppressForPopover()) return;
    isTouchRef.current = true;
    longPressTimerRef.current = setTimeout(() => {
      onOpen();
    }, LONG_PRESS_DELAY);
  }, [disabled, isTouchRef, onOpen, shouldSuppressForPopover]);

  const handleTouchEnd: TouchEventHandler<HTMLSpanElement> = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const triggerProps = {
    ...restProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "aria-describedby": isOpen ? tooltipId : undefined,
    onMouseEnter: composeEventHandlers(onMouseEnter, handleMouseEnter),
    onMouseLeave: composeEventHandlers(onMouseLeave, handleMouseLeave),
    onFocus: composeEventHandlers(onFocus, handleFocus),
    onBlur: composeEventHandlers(onBlur, handleBlur),
    onTouchStart: composeEventHandlers(onTouchStart, handleTouchStart),
    onTouchEnd: composeEventHandlers(onTouchEnd, handleTouchEnd),
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
