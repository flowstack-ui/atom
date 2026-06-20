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
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
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

  const onContentEnter = useCallback(() => {
    if (disabled) return;
    clearTimers();
    setOpen(true);
  }, [clearTimers, disabled, setOpen]);

  const onContentLeave = useCallback(() => {
    if (!disabled) onClose();
  }, [disabled, onClose]);

  const handleEscape = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers, setOpen]);

  useEscapeKey(handleEscape, isOpen);
  useEffect(() => () => clearTimers(), [clearTimers]);

  const contextValue: HoverCardContextValue = useMemo(
    () => ({
      isOpen,
      onOpen,
      onClose,
      onContentEnter,
      onContentLeave,
      hoverCardId,
      triggerRef,
      disabled,
    }),
    [
      disabled,
      hoverCardId,
      isOpen,
      onClose,
      onContentEnter,
      onContentLeave,
      onOpen,
    ],
  );

  return (
    <HoverCardContextProvider value={contextValue}>
      {children}
    </HoverCardContextProvider>
  );
}
