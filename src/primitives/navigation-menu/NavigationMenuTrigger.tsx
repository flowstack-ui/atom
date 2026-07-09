"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import { FOCUSABLE_SELECTOR } from "../../hooks/focus.js";
import {
  useNavigationMenuContext,
  useNavigationMenuItemContext,
} from "./context.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import type { NativeButtonProps } from "../../utils/dom.js";

type NavigationMenuTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

export interface NavigationMenuTriggerProps extends NavigationMenuTriggerNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  disabled?: boolean;
  className?: string;
}

export const NavigationMenuTrigger = forwardRef<
  HTMLButtonElement,
  NavigationMenuTriggerProps
>(function NavigationMenuTrigger(
  {
    children,
    asChild,
    render,
    disabled = false,
    className,
    onClick,
    onPointerEnter,
    onPointerLeave,
    onKeyDown,
    ...restProps
  },
  ref,
) {
  const ctx = useNavigationMenuContext();
  const itemCtx = useNavigationMenuItemContext();
  const { value } = itemCtx;
  const {
    cancelCloseTimer,
    delayDuration,
    dir,
    getFirstTriggerValue,
    getLastTriggerValue,
    getNextTriggerValue,
    getTriggerElement,
    idPrefix,
    isSkipDelayActive,
    onValueChange,
    orientation,
    registerTrigger,
    startCloseTimer,
    unregisterTrigger,
    value: activeValue,
  } = ctx;

  const internalRef = useRef<HTMLButtonElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingContentFocusRef = useRef<"first" | "last" | null>(null);

  const isOpen = activeValue === value;
  const contentId = `${idPrefix}-content-${value}`;
  const composedRef = useMemo(() => composeRefs(internalRef, ref), [ref]);

  useEffect(() => {
    const el = internalRef.current;
    if (!el || disabled) return;
    registerTrigger(value, el);
    return () => unregisterTrigger(value);
  }, [disabled, registerTrigger, unregisterTrigger, value]);

  useEffect(() => {
    return () => clearTimeout(openTimerRef.current);
  }, []);

  const focusContent = useCallback(
    (position: "first" | "last") => {
      const content = document.getElementById(contentId);
      if (!content) return;

      const focusable = Array.from(
        content.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const target =
        position === "first"
          ? focusable[0]
          : focusable[focusable.length - 1];

      (target ?? content).focus({ preventScroll: true });
    },
    [contentId],
  );

  useEffect(() => {
    if (!isOpen || pendingContentFocusRef.current === null) return undefined;

    const position = pendingContentFocusRef.current;
    pendingContentFocusRef.current = null;
    const frame = requestAnimationFrame(() => focusContent(position));

    return () => cancelAnimationFrame(frame);
  }, [focusContent, isOpen]);

  const handlePointerEnter: PointerEventHandler<HTMLButtonElement> = useCallback(() => {
    if (disabled) return;
    cancelCloseTimer();

    if (activeValue === value) return;

    const delay = isSkipDelayActive || activeValue !== null
      ? 0
      : delayDuration;

    clearTimeout(openTimerRef.current);
    if (delay === 0) {
      onValueChange(value);
    } else {
      openTimerRef.current = setTimeout(() => {
        onValueChange(value);
      }, delay);
    }
  }, [
    activeValue,
    cancelCloseTimer,
    delayDuration,
    disabled,
    isSkipDelayActive,
    onValueChange,
    value,
  ]);

  const handlePointerLeave: PointerEventHandler<HTMLButtonElement> = useCallback(() => {
    clearTimeout(openTimerRef.current);
    startCloseTimer();
  }, [startCloseTimer]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    if (disabled) return;
    clearTimeout(openTimerRef.current);
    cancelCloseTimer();
    onValueChange(isOpen ? null : value);
  }, [cancelCloseTimer, disabled, isOpen, onValueChange, value]);

  const focusTrigger = useCallback(
    (nextValue: string | null) => {
      if (nextValue === null) return;

      const trigger = getTriggerElement(nextValue);
      if (!trigger) return;

      clearTimeout(openTimerRef.current);
      cancelCloseTimer();
      trigger.focus({ preventScroll: true });

      if (activeValue !== null) {
        onValueChange(nextValue);
      }
    },
    [activeValue, cancelCloseTimer, getTriggerElement, onValueChange],
  );

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (disabled) return;

      switch (event.key) {
        case "Enter":
        case " ": {
          event.preventDefault();
          onValueChange(isOpen ? null : value);
          break;
        }
        case "ArrowDown": {
          event.preventDefault();
          pendingContentFocusRef.current = "first";
          if (!isOpen) onValueChange(value);
          else requestAnimationFrame(() => focusContent("first"));
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          pendingContentFocusRef.current = "last";
          if (!isOpen) onValueChange(value);
          else requestAnimationFrame(() => focusContent("last"));
          break;
        }
        case "ArrowRight": {
          if (orientation !== "horizontal") break;

          event.preventDefault();
          focusTrigger(getNextTriggerValue(value, dir === "rtl" ? "previous" : "next"));
          break;
        }
        case "ArrowLeft": {
          if (orientation !== "horizontal") break;

          event.preventDefault();
          focusTrigger(getNextTriggerValue(value, dir === "rtl" ? "next" : "previous"));
          break;
        }
        case "Home": {
          if (orientation !== "horizontal") break;

          event.preventDefault();
          focusTrigger(getFirstTriggerValue());
          break;
        }
        case "End": {
          if (orientation !== "horizontal") break;

          event.preventDefault();
          focusTrigger(getLastTriggerValue());
          break;
        }
      }
    },
    [
      dir,
      disabled,
      focusContent,
      focusTrigger,
      getFirstTriggerValue,
      getLastTriggerValue,
      getNextTriggerValue,
      isOpen,
      onValueChange,
      orientation,
      value,
    ],
  );

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref: composedRef,
    type: "button",
    "data-slot": "navigation-menu-trigger",
    "data-state": isOpen ? "open" : "closed",
    "data-disabled": disabled ? "" : undefined,
    "aria-expanded": isOpen,
    "aria-controls": contentId,
    "aria-disabled": disabled || undefined,
    disabled,
    className,
    onClick: composeEventHandlers(onClick, handleClick),
    onPointerEnter: composeEventHandlers(onPointerEnter, handlePointerEnter),
    onPointerLeave: composeEventHandlers(onPointerLeave, handlePointerLeave),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "button", { ...behaviorProps, children });
});
