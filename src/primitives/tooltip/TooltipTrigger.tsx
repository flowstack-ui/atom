"use client";

import {
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
import { useTooltipTouchContext } from "./touchContext.js";

type TooltipTriggerNativeProps = NativeSpanProps<"children">;

export interface TooltipTriggerProps extends TooltipTriggerNativeProps {
  value?: string;
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  render?: RenderProp;
  "data-slot"?: string;
}

const LONG_PRESS_DELAY = 700;
const LONG_PRESS_MOVE_TOLERANCE = 10;

export const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
function TooltipTrigger(
  {
    children,
    value,
    asChild = false,
    className,
    render,
    "data-slot": dataSlot = "tooltip-trigger",
    onMouseEnter,
    onMouseLeave,
    onContextMenu,
    onFocus,
    onBlur,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    ...restProps
  },
  ref,
) {
  const { isOpen, onOpen: requestOpen, onClose, tooltipId, disabled, isTouchRef,
    registerTrigger, activateTrigger, triggerValue, ids, rootId } =
    useTooltipContext();
  const triggerRef = useRef<HTMLElement | null>(null);
  const registerRef = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
    registerTrigger(value, node);
  }, [registerTrigger, value]);
  const onOpen = useCallback(() => {
    if (triggerRef.current) activateTrigger(value, triggerRef.current);
    requestOpen();
  }, [activateTrigger, requestOpen, value]);
  const {
    onTouchLongPress,
    onTouchRelease,
    onTouchCancel: cancelRootTouchSession,
  } = useTooltipTouchContext();
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTouchIdRef = useRef<number | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const didLongPressRef = useRef(false);
  const ignoreCompatibilityEventsUntilRef = useRef(0);
  const scrollCleanupRef = useRef<(() => void) | null>(null);
  const [isTouchTracking, setIsTouchTracking] = useState(false);
  const composedRef = useMemo(
    () => composeRefs(registerRef, ref),
    [ref, registerRef],
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

  const shouldIgnoreCompatibilityEvent = useCallback(() => (
    activeTouchIdRef.current !== null ||
    Date.now() < ignoreCompatibilityEventsUntilRef.current
  ), []);

  const handleMouseEnter: MouseEventHandler<HTMLSpanElement> = useCallback(() => {
    if (
      disabled ||
      shouldIgnoreCompatibilityEvent() ||
      shouldSuppressForPopover()
    ) return;
    isTouchRef.current = false;
    onOpen();
  }, [disabled, isTouchRef, onOpen, shouldIgnoreCompatibilityEvent, shouldSuppressForPopover]);

  const handleMouseLeave: MouseEventHandler<HTMLSpanElement> = useCallback(() => {
    if (!disabled && !shouldIgnoreCompatibilityEvent()) onClose();
  }, [disabled, onClose, shouldIgnoreCompatibilityEvent]);

  const handleFocus: FocusEventHandler<HTMLSpanElement> = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (
        !shouldIgnoreCompatibilityEvent() &&
        event.target.matches(":focus-visible")
      ) {
        if (disabled || shouldSuppressForPopover()) return;
        isTouchRef.current = false;
        onOpen();
      }
    },
    [disabled, isTouchRef, onOpen, shouldIgnoreCompatibilityEvent, shouldSuppressForPopover],
  );

  const handleBlur: FocusEventHandler<HTMLSpanElement> = useCallback(() => {
    if (!disabled && !shouldIgnoreCompatibilityEvent()) onClose();
  }, [disabled, onClose, shouldIgnoreCompatibilityEvent]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const resetTouchTracking = useCallback((preserveLongPress = false) => {
    scrollCleanupRef.current?.();
    scrollCleanupRef.current = null;
    activeTouchIdRef.current = null;
    startPointRef.current = null;
    setIsTouchTracking(false);
    if (!preserveLongPress) didLongPressRef.current = false;
  }, []);

  const suppressCompatibilityEventsAfterTouch = useCallback(() => {
    ignoreCompatibilityEventsUntilRef.current = Date.now() + 1000;
  }, []);

  const cancelTouchSession = useCallback(() => {
    if (activeTouchIdRef.current !== null || didLongPressRef.current) {
      suppressCompatibilityEventsAfterTouch();
    }
    clearLongPressTimer();
    if (didLongPressRef.current) cancelRootTouchSession();
    resetTouchTracking();
  }, [cancelRootTouchSession, clearLongPressTimer, resetTouchTracking, suppressCompatibilityEventsAfterTouch]);

  const handleTouchStart: TouchEventHandler<HTMLSpanElement> = useCallback((event) => {
    if (disabled || shouldSuppressForPopover()) return;
    if (event.touches.length !== 1) {
      cancelTouchSession();
      return;
    }

    cancelTouchSession();
    const touch = event.touches[0];
    isTouchRef.current = true;
    ignoreCompatibilityEventsUntilRef.current = Number.POSITIVE_INFINITY;
    activeTouchIdRef.current = touch.identifier;
    startPointRef.current = { x: touch.clientX, y: touch.clientY };
    setIsTouchTracking(true);
    const ownerDocument = event.currentTarget.ownerDocument;
    const handleScroll = () => cancelTouchSession();
    ownerDocument.addEventListener("scroll", handleScroll, true);
    ownerDocument.defaultView?.addEventListener("scroll", handleScroll, true);
    scrollCleanupRef.current = () => {
      ownerDocument.removeEventListener("scroll", handleScroll, true);
      ownerDocument.defaultView?.removeEventListener("scroll", handleScroll, true);
    };
    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null;
      didLongPressRef.current = true;
      if (triggerRef.current) activateTrigger(value, triggerRef.current);
      onTouchLongPress();
    }, LONG_PRESS_DELAY);
  }, [activateTrigger, value, cancelTouchSession, disabled, isTouchRef, onTouchLongPress, shouldSuppressForPopover]);

  const handleTouchMove: TouchEventHandler<HTMLSpanElement> = useCallback((event) => {
    const touchId = activeTouchIdRef.current;
    const startPoint = startPointRef.current;
    if (touchId === null || !startPoint) return;
    if (event.touches.length !== 1) {
      cancelTouchSession();
      return;
    }

    const touch = Array.from(event.touches).find(
      (candidate) => candidate.identifier === touchId,
    );
    if (!touch) {
      cancelTouchSession();
      return;
    }

    const distance = Math.hypot(
      touch.clientX - startPoint.x,
      touch.clientY - startPoint.y,
    );
    if (distance > LONG_PRESS_MOVE_TOLERANCE) cancelTouchSession();
  }, [cancelTouchSession]);

  const handleTouchEnd: TouchEventHandler<HTMLSpanElement> = useCallback((event) => {
    const touchId = activeTouchIdRef.current;
    if (touchId === null) return;
    const endedActiveTouch = Array.from(event.changedTouches).some(
      (touch) => touch.identifier === touchId,
    );
    if (!endedActiveTouch) return;

    clearLongPressTimer();
    suppressCompatibilityEventsAfterTouch();
    const didLongPress = didLongPressRef.current;
    if (didLongPress) onTouchRelease();
    resetTouchTracking(didLongPress);
  }, [clearLongPressTimer, onTouchRelease, resetTouchTracking, suppressCompatibilityEventsAfterTouch]);

  const handleTouchCancel: TouchEventHandler<HTMLSpanElement> = useCallback(() => {
    cancelTouchSession();
  }, [cancelTouchSession]);

  const handleContextMenu: MouseEventHandler<HTMLSpanElement> = useCallback((event) => {
    if (activeTouchIdRef.current !== null) event.preventDefault();
  }, []);

  useEffect(() => {
    if (disabled) cancelTouchSession();
  }, [cancelTouchSession, disabled]);

  useEffect(() => () => cancelTouchSession(), [cancelTouchSession]);

  const composedElement = asChild ? children : render;
  const childDescription = isValidElement<{ "aria-describedby"?: string }>(composedElement)
    ? composedElement.props["aria-describedby"]
    : undefined;
  const describedBy = [...new Set(
    [childDescription, restProps["aria-describedby"], isOpen && value === triggerValue ? tooltipId : undefined]
      .filter(Boolean).join(" ").split(/\s+/).filter(Boolean),
  )].join(" ") || undefined;
  const triggerProps = {
    ...restProps,
    id: restProps.id ?? (typeof ids.trigger === "function" ? ids.trigger(value) : ids.trigger) ?? `${rootId}-trigger${value === undefined ? "" : `-${encodeURIComponent(value)}`}`,
    "data-state": isOpen && value === triggerValue ? "open" : "closed",
    ref: composedRef,
    "data-slot": dataSlot,
    "aria-describedby": describedBy,
    onMouseEnter: composeEventHandlers(onMouseEnter, handleMouseEnter),
    onMouseLeave: composeEventHandlers(onMouseLeave, handleMouseLeave),
    onContextMenu: composeEventHandlers(onContextMenu, handleContextMenu),
    onFocus: composeEventHandlers(onFocus, handleFocus),
    onBlur: composeEventHandlers(onBlur, handleBlur),
    onTouchStart: composeEventHandlers(onTouchStart, handleTouchStart),
    onTouchMove: composeEventHandlers(onTouchMove, handleTouchMove),
    onTouchEnd: composeEventHandlers(onTouchEnd, handleTouchEnd),
    onTouchCancel: composeEventHandlers(onTouchCancel, handleTouchCancel),
    style: isTouchTracking
      ? {
          ...restProps.style,
          WebkitUserSelect: "none" as const,
          userSelect: "none" as const,
        }
      : restProps.style,
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
