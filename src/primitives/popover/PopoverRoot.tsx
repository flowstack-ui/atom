"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import {
  PopoverContextProvider,
  type PopoverContextValue,
  type PopoverCloseReason,
  type PopoverFinalFocusDetails,
  type PopoverInitialFocusDetails,
  type PopoverInteractionType,
  type PopoverOpenReason,
  type PopoverTriggerMode,
} from "./context.js";
import type { PopoverPartKind } from "./parts.js";

export interface PopoverRootProps {
  children: ReactNode;
  triggerMode?: PopoverTriggerMode;
  openDelay?: number;
  closeDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason?: PopoverCloseReason) => void;
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
  const titleId = useId();
  const descriptionId = useId();
  const [partCounts, setPartCounts] = useState({ title: 0, description: 0 });
  const [partRegistryReady, setPartRegistryReady] = useState(false);
  const pendingOpenRef = useRef<(
    PopoverInitialFocusDetails & { expiresAt: number }
  ) | null>(null);
  const pendingCloseRef = useRef<(
    PopoverFinalFocusDetails & { expiresAt: number }
  ) | null>(null);
  const initialFocusDetailsRef = useRef<PopoverInitialFocusDetails>({
    interactionType: "programmatic",
    reason: "programmatic",
  });
  const finalFocusDetailsRef = useRef<PopoverFinalFocusDetails>({
    interactionType: "programmatic",
    reason: "programmatic",
  });
  const previousOpenRef = useRef(isOpen);
  const interactionRef = useRef<{
    interactionType: Exclude<PopoverInteractionType, "programmatic">;
    target: EventTarget | null;
    expiresAt: number;
  } | null>(null);

  if (previousOpenRef.current !== isOpen) {
    if (isOpen) {
      const pending = pendingOpenRef.current;
      initialFocusDetailsRef.current = pending && pending.expiresAt >= Date.now()
        ? { interactionType: pending.interactionType, reason: pending.reason }
        : { interactionType: "programmatic", reason: "programmatic" };
      pendingOpenRef.current = null;
    } else {
      const pending = pendingCloseRef.current;
      finalFocusDetailsRef.current = pending && pending.expiresAt >= Date.now()
        ? { interactionType: pending.interactionType, reason: pending.reason }
        : { interactionType: "programmatic", reason: "programmatic" };
      pendingCloseRef.current = null;
    }
    previousOpenRef.current = isOpen;
  }

  useEffect(() => {
    setPartRegistryReady(true);
  }, []);

  const registerPart = useCallback((kind: PopoverPartKind) => {
    let registered = true;
    setPartCounts((counts) => ({ ...counts, [kind]: counts[kind] + 1 }));
    return () => {
      if (!registered) return;
      registered = false;
      setPartCounts((counts) => ({
        ...counts,
        [kind]: Math.max(0, counts[kind] - 1),
      }));
    };
  }, []);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const setOpen = useCallback(
    (value: boolean, reason?: PopoverCloseReason) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value, reason);
    },
    [isControlled, onOpenChange],
  );

  const recordPendingOpen = useCallback((
    reason: PopoverOpenReason,
    interactionType: PopoverInteractionType,
  ) => {
    const transaction = { reason, interactionType, expiresAt: Date.now() + 1000 };
    pendingOpenRef.current = transaction;
    setTimeout(() => {
      if (pendingOpenRef.current === transaction) pendingOpenRef.current = null;
    }, 1000);
  }, []);

  const recordPendingClose = useCallback((
    reason: PopoverCloseReason,
    interactionType: PopoverInteractionType,
  ) => {
    const transaction = { reason, interactionType, expiresAt: Date.now() + 1000 };
    pendingCloseRef.current = transaction;
    setTimeout(() => {
      if (pendingCloseRef.current === transaction) pendingCloseRef.current = null;
    }, 1000);
  }, []);

  const onToggle = useCallback((
    interactionType: PopoverInteractionType = "programmatic",
  ) => {
    if (disabled) return;
    clearTimers();
    if (isOpen) {
      recordPendingClose("triggerClick", interactionType);
      setOpen(false, "triggerClick");
    } else {
      recordPendingOpen("triggerClick", interactionType);
      setOpen(true);
    }
  }, [clearTimers, disabled, isOpen, recordPendingClose, recordPendingOpen, setOpen]);

  const onOpen = useCallback((
    reason: PopoverOpenReason = "programmatic",
    interactionType: PopoverInteractionType = "programmatic",
  ) => {
    if (disabled) return;
    clearTimers();
    const commit = () => {
      recordPendingOpen(reason, interactionType);
      setOpen(true);
    };
    if (triggerMode === "click" || openDelay === 0) {
      commit();
    } else {
      openTimerRef.current = setTimeout(commit, openDelay);
    }
  }, [clearTimers, disabled, openDelay, recordPendingOpen, setOpen, triggerMode]);

  const onClose = useCallback((
    reason: PopoverCloseReason = "programmatic",
    interactionType: PopoverInteractionType = "programmatic",
  ) => {
    clearTimers();
    const commit = () => {
      recordPendingClose(reason, interactionType);
      setOpen(false, reason);
    };
    if (triggerMode === "click" || closeDelay === 0) {
      commit();
    } else {
      closeTimerRef.current = setTimeout(commit, closeDelay);
    }
  }, [clearTimers, closeDelay, recordPendingClose, setOpen, triggerMode]);

  const recordInteraction = useCallback((
    interactionType: Exclude<PopoverInteractionType, "programmatic">,
    target: EventTarget | null,
  ) => {
    interactionRef.current = {
      interactionType,
      target,
      expiresAt: Date.now() + 1000,
    };
  }, []);

  const consumeInteraction = useCallback((target: EventTarget | null) => {
    const interaction = interactionRef.current;
    interactionRef.current = null;
    if (
      !interaction ||
      interaction.target !== target ||
      interaction.expiresAt < Date.now()
    ) {
      return "programmatic";
    }
    return interaction.interactionType;
  }, []);

  const clearInteraction = useCallback((target?: EventTarget | null) => {
    if (target !== undefined && interactionRef.current?.target !== target) return;
    interactionRef.current = null;
  }, []);

  useDismissableLayer({
    enabled: isOpen && closeOnEscape,
    onEscapeKeyDown: () => onClose("escapeKeyDown", "keyboard"),
  });
  useEffect(() => () => clearTimers(), [clearTimers]);
  useLayoutEffect(() => {
    if (!disabled) return;
    clearTimers();
    clearInteraction();
  }, [clearInteraction, clearTimers, disabled]);

  const contextValue: PopoverContextValue = useMemo(
    () => ({
      isOpen,
      onToggle,
      onOpen,
      onClose,
      initialFocusDetails: initialFocusDetailsRef.current,
      finalFocusDetails: finalFocusDetailsRef.current,
      recordInteraction,
      consumeInteraction,
      clearInteraction,
      popoverId,
      titleId,
      descriptionId,
      titleCount: partCounts.title,
      descriptionCount: partCounts.description,
      partRegistryReady,
      registerPart,
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
      titleId,
      descriptionId,
      partCounts.title,
      partCounts.description,
      partRegistryReady,
      registerPart,
      recordInteraction,
      consumeInteraction,
      clearInteraction,
      triggerMode,
    ],
  );

  return (
    <PopoverContextProvider value={contextValue}>
      {children}
    </PopoverContextProvider>
  );
}
