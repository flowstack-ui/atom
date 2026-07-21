"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  safePolygon,
  useFloatingRootContext,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import {
  HoverCardContextProvider,
  type HoverCardContextValue,
} from "./context.js";

export interface HoverCardRootProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
}

export function HoverCardRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
  disabled = false,
}: HoverCardRootProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const [contentElement, setContentElement] = useState<HTMLElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverCardId = useId();

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  const floatingRootContext = useFloatingRootContext({
    open: isOpen,
    onOpenChange: (nextOpen, event) => {
      const target = event?.target;
      const closingContentTriedToReopen =
        nextOpen &&
        !isOpen &&
        contentElement !== null &&
        target !== null &&
        contentElement.contains(target as Node);
      if (!disabled && !closingContentTriedToReopen) setOpen(nextOpen);
    },
    elements: {
      reference: triggerElement,
      floating: contentElement,
    },
  });
  const hover = useHover(floatingRootContext, {
    enabled: !disabled,
    mouseOnly: true,
    delay: { open: openDelay, close: closeDelay },
    handleClose: safePolygon(),
    move: false,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const onOpen = useCallback(() => {
    if (disabled) return;
    clearTimers();
    if (openDelay === 0) {
      setOpen(true);
    } else {
      openTimerRef.current = setTimeout(() => setOpen(true), openDelay);
    }
  }, [clearTimers, disabled, openDelay, setOpen]);

  const onClose = useCallback(() => {
    clearTimers();
    if (closeDelay === 0) {
      setOpen(false);
    } else {
      closeTimerRef.current = setTimeout(() => setOpen(false), closeDelay);
    }
  }, [clearTimers, closeDelay, setOpen]);

  const handleEscape = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers, setOpen]);

  useDismissableLayer({
    enabled: isOpen,
    onEscapeKeyDown: handleEscape,
  });
  useEffect(() => () => clearTimers(), [clearTimers]);

  const contextValue: HoverCardContextValue = useMemo(
    () => ({
      isOpen,
      onOpen,
      onClose,
      hoverCardId,
      triggerRef,
      setTriggerElement,
      setContentElement,
      floatingRootContext,
      getReferenceProps,
      getFloatingProps,
      disabled,
    }),
    [
      disabled,
      hoverCardId,
      isOpen,
      floatingRootContext,
      getFloatingProps,
      getReferenceProps,
      onClose,
      onOpen,
      setContentElement,
      setTriggerElement,
    ],
  );

  return (
    <HoverCardContextProvider value={contextValue}>
      {children}
    </HoverCardContextProvider>
  );
}
