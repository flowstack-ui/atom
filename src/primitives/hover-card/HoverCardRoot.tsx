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

const TOUCH_COMPATIBILITY_EVENT_WINDOW = 1_000;
const HOVER_INPUT_QUERY = "(any-hover: hover)";

function supportsHoverInput() {
  return typeof window === "undefined" ||
    typeof window.matchMedia !== "function" ||
    window.matchMedia(HOVER_INPUT_QUERY).matches;
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
  const [hoverInputAvailable, setHoverInputAvailable] = useState(supportsHoverInput);
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const [contentElement, setContentElement] = useState<HTMLElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouchInteractionRef = useRef(0);
  const hoverCardId = useId();

  const markTouchInteraction = useCallback(() => {
    lastTouchInteractionRef.current = Date.now();
  }, []);
  const hasRecentTouchInteraction = useCallback(
    () => Date.now() - lastTouchInteractionRef.current < TOUCH_COMPATIBILITY_EVENT_WINDOW,
    [],
  );

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
    onOpenChange: (nextOpen, event, reason) => {
      const target = event?.target;
      const touchGeneratedHoverTriedToOpen =
        nextOpen && reason === "hover" && hasRecentTouchInteraction();
      const closingContentTriedToReopen =
        nextOpen &&
        !isOpen &&
        contentElement !== null &&
        target !== null &&
        contentElement.contains(target as Node);
      if (!disabled && !touchGeneratedHoverTriedToOpen && !closingContentTriedToReopen) {
        setOpen(nextOpen);
      }
    },
    elements: {
      reference: triggerElement,
      floating: contentElement,
    },
  });
  const hover = useHover(floatingRootContext, {
    enabled: !disabled && hoverInputAvailable,
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
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const hoverMedia = window.matchMedia(HOVER_INPUT_QUERY);
    const updateHoverInput = () => setHoverInputAvailable(hoverMedia.matches);
    updateHoverInput();
    hoverMedia.addEventListener("change", updateHoverInput);
    return () => hoverMedia.removeEventListener("change", updateHoverInput);
  }, []);
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
      markTouchInteraction,
      hasRecentTouchInteraction,
      disabled,
    }),
    [
      disabled,
      hoverCardId,
      isOpen,
      floatingRootContext,
      getFloatingProps,
      getReferenceProps,
      hasRecentTouchInteraction,
      markTouchInteraction,
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
