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
import { OverlayScopeProvider, useCreateOverlayScope } from "../../hooks/overlayScope.js";
import { useOptionalModalContext } from "../modal/context.js";
import { activateModalLayer, createModalLayer } from "../modal/layer.js";
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
import { useDetachedLayerPolicy } from "./detached-policy.js";
import type { PopoverIds, PopoverLifecycleOptions, PopoverOutsideEvents, PopoverPositioningOptions } from "./options.js";

export interface PopoverRootProps extends PopoverLifecycleOptions, PopoverOutsideEvents {
  children: ReactNode;
  triggerMode?: PopoverTriggerMode;
  openDelay?: number;
  closeDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason?: PopoverCloseReason) => void;
  onExitComplete?: () => void;
  modal?: boolean;
  closeOnEscape?: boolean;
  closeOnInteractOutside?: boolean;
  disabled?: boolean;
  id?: string;
  ids?: PopoverIds;
  positioning?: PopoverPositioningOptions;
  portalled?: boolean;
  triggerValue?: string;
  defaultTriggerValue?: string;
  onTriggerValueChange?: (value: string | undefined) => void;
}

export type UsePopoverOptions = Omit<PopoverRootProps, "children">;

export interface UsePopoverReturn {
  readonly open: boolean;
  readonly triggerValue: string | undefined;
  readonly triggerMode: PopoverTriggerMode;
  readonly setOpen: (open: boolean, reason?: PopoverCloseReason) => void;
  readonly setTriggerValue: (value: string | undefined) => void;
  readonly reposition: () => void;
}
const controllerInternals = new WeakMap<UsePopoverReturn, {
  context: PopoverContextValue;
  scope: ReturnType<typeof useCreateOverlayScope>;
}>();

export function usePopover({
  triggerMode = "click",
  openDelay = 200,
  closeDelay = 300,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onExitComplete,
  modal = false,
  closeOnEscape = true,
  closeOnInteractOutside = true,
  disabled = false,
  id,
  ids = {},
  positioning,
  portalled = true,
  triggerValue: controlledTriggerValue,
  defaultTriggerValue,
  onTriggerValueChange,
  lazyMount = true,
  unmountOnExit = true,
  present,
  immediate = true,
  skipAnimationOnMount = false,
  hideMode = "display-none",
  onInteractOutside,
  onPointerDownOutside,
  onFocusOutside,
  onEscapeKeyDown,
  onRequestDismiss,
  persistentElements,
}: UsePopoverOptions = {}) {
  const parentModal = useOptionalModalContext();
  const detached = useDetachedLayerPolicy();
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = !disabled && (isControlled ? controlledOpen : internalOpen);
  const triggerRef = useRef<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generatedId = useId();
  const popoverId = ids.content ?? id ?? generatedId;
  const titleId = ids.title ?? `${popoverId}-title`;
  const descriptionId = ids.description ?? `${popoverId}-description`;
  const [internalTriggerValue, setInternalTriggerValue] = useState(defaultTriggerValue);
  const triggerValue = controlledTriggerValue ?? internalTriggerValue;
  const triggers = useRef(new Map<string, HTMLElement>());
  const mounted = useRef(false);
  const onTriggerRemoved = useRef<() => void>(() => {});
  useLayoutEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const updateRef = useRef<(() => void) | null>(null);
  const reposition = useCallback(() => updateRef.current?.(), []);
  const isTriggerTarget = useCallback((node: Node) => Array.from(triggers.current.values()).some(trigger => trigger.contains(node)), []);
  const setTriggerValue = useCallback((value: string | undefined) => {
    if (controlledTriggerValue === undefined) setInternalTriggerValue(value);
    if (value !== triggerValue) onTriggerValueChange?.(value);
  }, [controlledTriggerValue, triggerValue, onTriggerValueChange]);
  const registerTrigger = useCallback((value: string, node: HTMLElement | null) => {
    const previous = triggers.current.get(value);
    if (node) triggers.current.set(value, node);
    else triggers.current.delete(value);
    if (node && (value === triggerValue || (!triggerRef.current && triggerValue === undefined))) triggerRef.current = node;
    if (!node && previous && triggerRef.current === previous) {
      triggerRef.current = null;
      queueMicrotask(() => {
        if (mounted.current && !triggers.current.has(value) && !triggerRef.current) onTriggerRemoved.current();
      });
    }
  }, [triggerValue]);
  useLayoutEffect(() => {
    triggerRef.current = triggerValue === undefined
      ? triggerRef.current ?? triggers.current.values().next().value ?? null
      : triggers.current.get(triggerValue) ?? null;
    reposition();
  }, [triggerValue, reposition]);
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
  const modalLayer = useMemo(
    () => createModalLayer(parentModal?.layer ?? null),
    [parentModal?.layer],
  );

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
      if ((value && disabled) || value === isOpen) return;
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value, reason);
    },
    [isControlled, onOpenChange, disabled, isOpen],
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

  const activateTrigger = useCallback((value: string, node: HTMLElement, interactionType: PopoverInteractionType) => {
    triggerRef.current = node;
    setTriggerValue(value);
    if (isOpen && triggerValue !== undefined && triggerValue !== value) {
      reposition();
    } else onToggle(interactionType);
  }, [isOpen, triggerValue, setTriggerValue, onToggle, reposition]);
  onTriggerRemoved.current = () => {
    if (isOpen) onClose("programmatic");
    setTriggerValue(undefined);
  };

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

  const overlayScope = useCreateOverlayScope(modal);
  useDismissableLayer({
    enabled: isOpen,
    ownerDocument: modalLayer.content?.ownerDocument ?? triggerRef.current?.ownerDocument,
    scope: overlayScope, elements: [modalLayer.content],
    getElements: () => [modalLayer.content],
    onRequestDismiss: (event) => {
      onRequestDismiss?.(event);
      if (!event.defaultPrevented) onClose("programmatic");
    },
    onEscapeKeyDown: (event) => {
      detached?.onEscapeKeyDown?.(event);
      onEscapeKeyDown?.(event);
      if (closeOnEscape && !event.defaultPrevented) onClose("escapeKeyDown", "keyboard");
    },
  });
  useLayoutEffect(() => {
    if (!isOpen || !modal) return undefined;
    const doc = modalLayer.content?.ownerDocument ?? triggerRef.current?.ownerDocument;
    return doc ? activateModalLayer(modalLayer, doc) : undefined;
  }, [isOpen, modal, modalLayer]);
  useEffect(() => () => clearTimers(), [clearTimers]);
  useLayoutEffect(() => {
    if (!disabled) return;
    clearTimers();
    clearInteraction();
  }, [clearInteraction, clearTimers, disabled]);

  const contextValue: PopoverContextValue = useMemo(
    () => ({
      ids, positioning, portalled, triggerValue, setTriggerValue, registerTrigger,
      activateTrigger, reposition, updateRef, isTriggerTarget,
      lifecycle: { lazyMount, unmountOnExit, present, immediate, skipAnimationOnMount, hideMode, onExitComplete },
      outsideEvents: { onInteractOutside, onPointerDownOutside, onFocusOutside, onEscapeKeyDown, persistentElements },
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
      modalLayer,
      disabled,
      modal,
      closeOnInteractOutside,
      triggerMode,
    }),
    [
      ids, positioning, portalled, triggerValue, setTriggerValue, registerTrigger,
      activateTrigger, reposition, isTriggerTarget, lazyMount, unmountOnExit, present, immediate,
      skipAnimationOnMount, hideMode, onExitComplete, onInteractOutside,
      onPointerDownOutside, onFocusOutside, onEscapeKeyDown, persistentElements,
      closeOnInteractOutside,
      disabled,
      isOpen,
      modal,
      modalLayer,
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

  const controller: UsePopoverReturn = { open: isOpen, triggerValue, triggerMode, setOpen, setTriggerValue, reposition };
  controllerInternals.set(controller, { context: contextValue, scope: overlayScope });
  return controller;
}

export interface PopoverRootProviderProps { value: UsePopoverReturn; children: ReactNode }
export function PopoverRootProvider({ value, children }: PopoverRootProviderProps) {
  const internals = controllerInternals.get(value);
  if (!internals) throw new Error("Popover.RootProvider requires the unchanged controller returned by usePopover.");
  return (
    <OverlayScopeProvider value={internals.scope}>
    <PopoverContextProvider value={internals.context}>
      {children}
    </PopoverContextProvider>
    </OverlayScopeProvider>
  );
}

export function PopoverRoot({ children, ...options }: PopoverRootProps) {
  const value = usePopover(options);
  return <PopoverRootProvider value={value}>{children}</PopoverRootProvider>;
}
