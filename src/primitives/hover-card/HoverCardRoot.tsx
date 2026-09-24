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
import { useControllableState } from "../../hooks/useControllableState.js";
import { useOutsideInteraction } from "../../hooks/useOutsideInteraction.js";
import { OverlayScopeProvider, useCreateOverlayScope } from "../../hooks/overlayScope.js";
import type { HoverCardIds, HoverCardLifecycleOptions, HoverCardOutsideEvents, HoverCardPositioningOptions } from "./options.js";
import {
  HoverCardContextProvider,
  type HoverCardContextValue,
} from "./context.js";

export interface HoverCardRootProps extends HoverCardLifecycleOptions, HoverCardOutsideEvents {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
  id?: string;
  ids?: HoverCardIds;
  positioning?: HoverCardPositioningOptions;
  triggerValue?: string;
  defaultTriggerValue?: string;
  onTriggerValueChange?: (value: string | undefined) => void;
}

export type UseHoverCardOptions = Omit<HoverCardRootProps, "children">;
export interface UseHoverCardReturn {
  readonly open: boolean;
  readonly triggerValue: string | undefined;
  readonly setOpen: (open: boolean) => void;
  readonly setTriggerValue: (value: string | undefined) => void;
  readonly reposition: () => void;
}
const controllers = new WeakMap<UseHoverCardReturn, { context: HoverCardContextValue; scope: ReturnType<typeof useCreateOverlayScope> }>();

const TOUCH_COMPATIBILITY_EVENT_WINDOW = 1_000;
const HOVER_INPUT_QUERY = "(any-hover: hover)";

function supportsHoverInput() {
  return typeof window === "undefined" ||
    typeof window.matchMedia !== "function" ||
    window.matchMedia(HOVER_INPUT_QUERY).matches;
}

export function useHoverCard({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay = 600,
  closeDelay = 300,
  disabled = false,
  id, ids, positioning,
  triggerValue: controlledTriggerValue, defaultTriggerValue, onTriggerValueChange,
  lazyMount = true, unmountOnExit = true, present, immediate = true,
  skipAnimationOnMount = false, hideMode = "display-none", onExitComplete,
  onInteractOutside, onPointerDownOutside, onFocusOutside, onEscapeKeyDown,
  onRequestDismiss, persistentElements,
}: UseHoverCardOptions = {}): UseHoverCardReturn {
  const [requestedOpen, requestOpen] = useControllableState({ value: controlledOpen, defaultValue: defaultOpen, onChange: onOpenChange });
  const [triggerValue, setTriggerValue] = useControllableState<string | undefined>({ value: controlledTriggerValue, defaultValue: defaultTriggerValue, onChange: onTriggerValueChange });
  const [hoverInputAvailable, setHoverInputAvailable] = useState(supportsHoverInput);
  const isOpen = !disabled && requestedOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const [contentElement, setContentElement] = useState<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  contentRef.current = contentElement;
  const triggers = useRef(new Map<string, HTMLElement>());
  const updateRef = useRef<(() => void) | null>(null);
  const reposition = useCallback(() => updateRef.current?.(), []);
  const scope = useCreateOverlayScope();
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouchInteractionRef = useRef(0);
  const generatedId = useId();
  const hoverCardId = ids?.content ?? id ?? generatedId;

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
      if (value && disabled) return;
      if (value !== requestedOpen) requestOpen(value);
    },
    [disabled, requestedOpen, requestOpen],
  );
  const latestSetOpen = useRef(setOpen); latestSetOpen.current = setOpen;
  const registerTrigger = useCallback((value: string, node: HTMLElement | null) => {
    const previous = triggers.current.get(value);
    if (node) triggers.current.set(value, node); else triggers.current.delete(value);
    if (node && (triggerValue === value || (!triggerRef.current && triggerValue === undefined))) {
      triggerRef.current = node; setTriggerElement(node);
    }
    if (!node && previous === triggerRef.current) {
      queueMicrotask(() => {
        if (!triggers.current.has(value) && triggerRef.current === previous) {
          triggerRef.current = null; setTriggerElement(null);
          clearTimers(); latestSetOpen.current(false);
        }
      });
    }
  }, [triggerValue, clearTimers]);
  const activateTrigger = useCallback((value: string, node: HTMLElement) => {
    if (disabled) return;
    clearTimers();
    setTriggerValue(value);
    if (controlledTriggerValue === undefined || controlledTriggerValue === value) {
      triggerRef.current = node; setTriggerElement(node);
    }
  }, [disabled, clearTimers, setTriggerValue, controlledTriggerValue]);
  useEffect(() => {
    const node = triggerValue === undefined ? triggerRef.current : triggers.current.get(triggerValue) ?? null;
    triggerRef.current = node; setTriggerElement(node); reposition();
  }, [triggerValue, reposition]);

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
      openTimerRef.current = setTimeout(() => latestSetOpen.current(true), openDelay);
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

  const handleEscape = useCallback((event: KeyboardEvent) => {
    onEscapeKeyDown?.(event);
    if (event.defaultPrevented) return;
    clearTimers();
    setOpen(false);
  }, [clearTimers, setOpen, onEscapeKeyDown]);

  useDismissableLayer({
    enabled: isOpen,
    ownerDocument: contentElement?.ownerDocument ?? triggerElement?.ownerDocument,
    elements: [contentElement],
    scope,
    onEscapeKeyDown: handleEscape,
    onRequestDismiss: event => { onRequestDismiss?.(event); if (!event.defaultPrevented) { clearTimers(); setOpen(false); } },
  });
  const isInside = useCallback((target: Node) => Array.from(triggers.current.values()).some(node => node.contains(target)) || Boolean(persistentElements?.some(get => get()?.contains(target))), [persistentElements]);
  useOutsideInteraction({ refs: [contentRef, triggerRef], enabled: isOpen && Boolean(contentElement),
    ignore: isInside, onPointerDownOutside,
    onInteractOutside: event => { onInteractOutside?.(event); if (!event.defaultPrevented) { clearTimers(); setOpen(false); } },
  });
  useEffect(() => {
    const doc = contentElement?.ownerDocument;
    if (!isOpen || !doc?.defaultView) return;
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (!target || contentElement?.contains(target) || isInside(target)) return;
      const notification = new doc.defaultView!.FocusEvent("focusoutside", { cancelable: true });
      Object.defineProperty(notification, "target", { value: target });
      onFocusOutside?.(notification); onInteractOutside?.(notification);
      clearTimers();
      if (!notification.defaultPrevented) setOpen(false);
    };
    doc.addEventListener("focusin", handleFocus);
    return () => doc.removeEventListener("focusin", handleFocus);
  }, [isOpen, contentElement, isInside, onFocusOutside, onInteractOutside, clearTimers, setOpen]);
  useEffect(() => { if (disabled) { clearTimers(); if (requestedOpen) requestOpen(false); } }, [disabled, clearTimers, requestedOpen, requestOpen]);
  useEffect(() => {
    const view = triggerElement?.ownerDocument.defaultView;
    if (typeof view?.matchMedia !== "function") return undefined;
    const hoverMedia = view.matchMedia(HOVER_INPUT_QUERY);
    const updateHoverInput = () => setHoverInputAvailable(hoverMedia.matches);
    updateHoverInput();
    hoverMedia.addEventListener("change", updateHoverInput);
    return () => hoverMedia.removeEventListener("change", updateHoverInput);
  }, [triggerElement]);
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
      hoverInputAvailable,
      ids, positioning, triggerValue, triggerElement, registerTrigger, activateTrigger, updateRef,
      lifecycle: { lazyMount, unmountOnExit, present, immediate, skipAnimationOnMount, hideMode, onExitComplete },
    }),
    [
      disabled,
      hoverInputAvailable,
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
      ids, positioning, triggerValue, triggerElement, registerTrigger, activateTrigger,
      lazyMount, unmountOnExit, present, immediate, skipAnimationOnMount, hideMode, onExitComplete,
    ],
  );

  const controller = useMemo(() => ({ open: isOpen, triggerValue, setOpen, setTriggerValue, reposition }), [isOpen, triggerValue, setOpen, setTriggerValue, reposition]);
  controllers.set(controller, { context: contextValue, scope });
  return controller;
}

export interface HoverCardRootProviderProps { value: UseHoverCardReturn; children: ReactNode }
export function HoverCardRootProvider({ value, children }: HoverCardRootProviderProps) {
  const internal = controllers.get(value);
  if (!internal) throw new Error("HoverCard.RootProvider requires the unchanged controller returned by useHoverCard.");
  return <OverlayScopeProvider value={internal.scope}><HoverCardContextProvider value={internal.context}>{children}</HoverCardContextProvider></OverlayScopeProvider>;
}
export function HoverCardRoot({ children, ...options }: HoverCardRootProps) {
  const value = useHoverCard(options);
  return <HoverCardRootProvider value={value}>{children}</HoverCardRootProvider>;
}
