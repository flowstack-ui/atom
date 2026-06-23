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
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import {
  TooltipContextProvider,
  useTooltipProviderContext,
  type TooltipContextValue,
} from "./context.js";

export interface TooltipRootProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
  variant?: "plain" | "rich";
}

const AUTO_DISMISS_DURATION = 1500;

export function TooltipRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay: instanceOpenDelay,
  closeDelay: instanceCloseDelay,
  disabled = false,
  variant = "plain",
}: TooltipRootProps) {
  const providerContext = useTooltipProviderContext();
  const effectiveOpenDelay = instanceOpenDelay ?? providerContext?.openDelay ?? 400;
  const effectiveCloseDelay = instanceCloseDelay ?? providerContext?.closeDelay ?? 150;
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchRef = useRef(false);
  const tooltipId = useId();

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
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
    const skipActive = providerContext?.isSkipDelayActive() ?? false;
    const delay = skipActive ? 0 : effectiveOpenDelay;
    if (delay === 0) {
      setOpen(true);
    } else {
      openTimerRef.current = setTimeout(() => setOpen(true), delay);
    }
  }, [clearTimers, disabled, effectiveOpenDelay, providerContext, setOpen]);

  const onClose = useCallback(() => {
    clearTimers();
    if (effectiveCloseDelay === 0) {
      setOpen(false);
      providerContext?.onTooltipClose();
    } else {
      closeTimerRef.current = setTimeout(() => {
        setOpen(false);
        providerContext?.onTooltipClose();
      }, effectiveCloseDelay);
    }
  }, [clearTimers, effectiveCloseDelay, providerContext, setOpen]);

  const onContentEnter = useCallback(() => {
    clearTimers();
    if (!disabled && variant === "rich") {
      setOpen(true);
    }
  }, [clearTimers, disabled, setOpen, variant]);

  const onContentLeave = useCallback(() => {
    if (!disabled) {
      onClose();
    }
  }, [disabled, onClose]);

  useEffect(() => {
    if (isOpen && variant === "plain" && isTouchRef.current) {
      autoDismissTimerRef.current = setTimeout(() => {
        setOpen(false);
        providerContext?.onTooltipClose();
      }, AUTO_DISMISS_DURATION);
    }

    return () => {
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    };
  }, [isOpen, providerContext, setOpen, variant]);

  const handleEscape = useCallback(() => {
    clearTimers();
    setOpen(false);
    providerContext?.onTooltipClose();
  }, [clearTimers, providerContext, setOpen]);

  useDismissableLayer({
    enabled: isOpen,
    onEscapeKeyDown: handleEscape,
  });

  useEffect(() => () => clearTimers(), [clearTimers]);

  const contextValue: TooltipContextValue = useMemo(
    () => ({
      isOpen,
      onOpen,
      onClose,
      onContentEnter,
      onContentLeave,
      tooltipId,
      triggerRef,
      disabled,
      isTouchRef,
      variant,
    }),
    [
      disabled,
      isOpen,
      onClose,
      onContentEnter,
      onContentLeave,
      onOpen,
      tooltipId,
      variant,
    ],
  );

  return (
    <TooltipContextProvider value={contextValue}>
      {children}
    </TooltipContextProvider>
  );
}
