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
  PopoverContextProvider,
  type PopoverContextValue,
  type PopoverTriggerMode,
} from "./context.js";

export interface PopoverRootProps {
  children: ReactNode;
  triggerMode?: PopoverTriggerMode;
  openDelay?: number;
  closeDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  closeOnEscape?: boolean;
  closeOnInteractOutside?: boolean;
  disabled?: boolean;
}

export function PopoverRoot({
  children,
  triggerMode = "click",
  openDelay = 200,
  closeDelay = 300,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = false,
  closeOnEscape = true,
  closeOnInteractOutside = true,
  disabled = false,
}: PopoverRootProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverId = useId();

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

  const onToggle = useCallback(() => {
    if (!disabled) setOpen(!isOpen);
  }, [disabled, isOpen, setOpen]);

  const onOpen = useCallback(() => {
    if (disabled) return;
    clearTimers();
    if (triggerMode === "click" || openDelay === 0) {
      setOpen(true);
    } else {
      openTimerRef.current = setTimeout(() => setOpen(true), openDelay);
    }
  }, [clearTimers, disabled, openDelay, setOpen, triggerMode]);

  const onClose = useCallback(() => {
    clearTimers();
    if (triggerMode === "click" || closeDelay === 0) {
      setOpen(false);
    } else {
      closeTimerRef.current = setTimeout(() => setOpen(false), closeDelay);
    }
  }, [clearTimers, closeDelay, setOpen, triggerMode]);

  useEscapeKey(onClose, isOpen && closeOnEscape);
  useEffect(() => () => clearTimers(), [clearTimers]);

  const contextValue: PopoverContextValue = useMemo(
    () => ({
      isOpen,
      onToggle,
      onOpen,
      onClose,
      popoverId,
      triggerRef,
      anchorRef,
      disabled,
      modal,
      closeOnInteractOutside,
      triggerMode,
    }),
    [
      closeOnInteractOutside,
      disabled,
      isOpen,
      modal,
      onClose,
      onOpen,
      onToggle,
      popoverId,
      triggerMode,
    ],
  );

  return (
    <PopoverContextProvider value={contextValue}>
      {children}
    </PopoverContextProvider>
  );
}
