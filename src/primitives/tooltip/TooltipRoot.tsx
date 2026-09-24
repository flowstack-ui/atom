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
import {
  TooltipTouchContextProvider,
  type TooltipTouchContextValue,
} from "./touchContext.js";
import type { TooltipIds, TooltipLifecycleOptions, TooltipPositioningOptions } from "./options.js";

export interface UseTooltipOptions extends TooltipLifecycleOptions {
  id?: string;
  ids?: TooltipIds;
  "aria-label"?: string;
  positioning?: TooltipPositioningOptions;
  triggerValue?: string;
  defaultTriggerValue?: string;
  onTriggerValueChange?: (value: string | undefined) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
  variant?: "plain" | "rich";
  interactive?: boolean;
  closeOnClick?: boolean;
  closeOnPointerDown?: boolean;
  closeOnScroll?: boolean;
  closeOnEscape?: boolean;
}

export interface TooltipRootProps extends UseTooltipOptions {
  children: ReactNode;
}

const AUTO_DISMISS_DURATION = 1500;
const RICH_AUTO_DISMISS_DURATION = 3000;

export function useTooltip({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay: instanceOpenDelay,
  closeDelay: instanceCloseDelay,
  disabled = false,
  variant = "plain",
  interactive = variant === "rich",
  closeOnClick = true,
  closeOnPointerDown = true,
  closeOnScroll = true,
  closeOnEscape = true,
  id,
  ids = {},
  "aria-label": ariaLabel,
  positioning,
  triggerValue: controlledTriggerValue,
  defaultTriggerValue,
  onTriggerValueChange,
  lazyMount = true,
  unmountOnExit = true,
  present,
  onExitComplete,
  immediate = false,
  skipAnimationOnMount = false,
  hideMode = "display-none",
}: UseTooltipOptions = {}) {
  const providerContext = useTooltipProviderContext();
  const effectiveOpenDelay = instanceOpenDelay ?? providerContext?.openDelay ?? 400;
  const effectiveCloseDelay = instanceCloseDelay ?? providerContext?.closeDelay ?? 150;
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const requestedOpen = isControlled ? controlledOpen : internalOpen;
  const isOpen = !disabled && requestedOpen;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const openRef = useRef(isOpen);
  openRef.current = isOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const [contentElement, registerContent] = useState<HTMLElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchDismissCleanupRef = useRef<(() => void) | null>(null);
  const isTouchRef = useRef(false);
  const isTouchSessionActiveRef = useRef(false);
  const generatedId = useId();
  const rootId = id ?? generatedId;
  const tooltipId = ids.content ?? `${rootId}-content`;
  const [internalTriggerValue, setInternalTriggerValue] = useState(defaultTriggerValue);
  const triggerValue = controlledTriggerValue ?? internalTriggerValue;
  const triggers = useRef(new Map<string | undefined, HTMLElement>());
  const dismissRemovedTrigger = useRef(() => {});
  const setTriggerValue = useCallback((value: string | undefined) => {
    if (value === triggerValue) return;
    if (controlledTriggerValue === undefined) setInternalTriggerValue(value);
    onTriggerValueChange?.(value);
  }, [controlledTriggerValue, onTriggerValueChange, triggerValue]);
  const registerTrigger = useCallback((value: string | undefined, node: HTMLElement | null) => {
    if (node) {
      triggers.current.set(value, node);
      if (value === triggerValue) triggerRef.current = node;
    } else {
      const removed = triggers.current.get(value);
      triggers.current.delete(value);
      if (removed && triggerRef.current === removed) {
        triggerRef.current = null;
        // Callback refs may detach and reattach in the same commit. Only
        // dismiss once the commit has finished without a replacement anchor.
        queueMicrotask(() => {
          if (!triggerRef.current) dismissRemovedTrigger.current();
        });
      }
    }
  }, [triggerValue]);
  const activateTrigger = useCallback((value: string | undefined, node: HTMLElement) => {
    if (disabled) return;
    if (controlledTriggerValue === undefined || controlledTriggerValue === value) triggerRef.current = node;
    setTriggerValue(value);
  }, [controlledTriggerValue, disabled, setTriggerValue]);
  useEffect(() => {
    triggerRef.current = triggers.current.get(triggerValue) ?? null;
  }, [triggerValue]);

  const clearTouchDismissListeners = useCallback(() => {
    touchDismissCleanupRef.current?.();
    touchDismissCleanupRef.current = null;
  }, []);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    clearTouchDismissListeners();
  }, [clearTouchDismissListeners]);

  const setOpen = useCallback(
    (value: boolean) => {
      clearTimers();
      if (value && disabledRef.current) return;
      if (openRef.current === value) return;
      openRef.current = value;
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [clearTimers, isControlled, onOpenChange],
  );
  useEffect(() => {
    dismissRemovedTrigger.current = () => setOpen(false);
    return () => { dismissRemovedTrigger.current = () => {}; };
  }, [setOpen]);

  const onOpen = useCallback(() => {
    if (disabled) return;
    clearTimers();
    const skipActive = providerContext?.isSkipDelayActive() ?? false;
    const delay = skipActive ? 0 : effectiveOpenDelay;
    if (delay === 0) {
      setOpen(true);
    } else {
      openTimerRef.current = setTimeout(() => {
        if (!disabledRef.current) setOpen(true);
      }, delay);
    }
  }, [clearTimers, disabled, effectiveOpenDelay, providerContext, setOpen]);

  const onClose = useCallback(() => {
    clearTimers();
    if (effectiveCloseDelay === 0) {
      isTouchSessionActiveRef.current = false;
      setOpen(false);
      providerContext?.onTooltipClose();
    } else {
      closeTimerRef.current = setTimeout(() => {
        isTouchSessionActiveRef.current = false;
        setOpen(false);
        providerContext?.onTooltipClose();
      }, effectiveCloseDelay);
    }
  }, [clearTimers, effectiveCloseDelay, providerContext, setOpen]);

  const onContentEnter = useCallback(() => {
    if (!interactive) return;
    clearTimers();
    if (!disabled) {
      setOpen(true);
    }
  }, [clearTimers, disabled, interactive, setOpen]);

  const onContentLeave = useCallback(() => {
    if (!disabled) {
      onClose();
    }
  }, [disabled, onClose]);

  const onTouchLongPress = useCallback(() => {
    if (disabled) return;
    clearTimers();
    isTouchRef.current = true;
    isTouchSessionActiveRef.current = true;
    setOpen(true);
  }, [clearTimers, disabled, isTouchRef, setOpen]);

  const onTouchRelease = useCallback(() => {
    if (!isTouchSessionActiveRef.current) return;
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    const duration = variant === "rich"
      ? RICH_AUTO_DISMISS_DURATION
      : AUTO_DISMISS_DURATION;
    autoDismissTimerRef.current = setTimeout(() => {
      clearTouchDismissListeners();
      isTouchSessionActiveRef.current = false;
      setOpen(false);
      providerContext?.onTooltipClose();
    }, duration);

    const ownerDocument = triggerRef.current?.ownerDocument;
    const ownerWindow = ownerDocument?.defaultView;
    if (ownerDocument) {
      const dismiss = (event: Event) => {
        if (
          event.type === "touchstart" &&
          triggerRef.current?.contains(event.target as Node)
        ) {
          return;
        }
        clearTimers();
        isTouchSessionActiveRef.current = false;
        setOpen(false);
        providerContext?.onTooltipClose();
      };
      ownerDocument.addEventListener("touchstart", dismiss, true);
      ownerDocument.addEventListener("scroll", dismiss, true);
      ownerWindow?.addEventListener("scroll", dismiss, true);
      touchDismissCleanupRef.current = () => {
        ownerDocument.removeEventListener("touchstart", dismiss, true);
        ownerDocument.removeEventListener("scroll", dismiss, true);
        ownerWindow?.removeEventListener("scroll", dismiss, true);
      };
    }
  }, [clearTimers, clearTouchDismissListeners, providerContext, setOpen, variant]);

  const onTouchCancel = useCallback(() => {
    if (!isTouchSessionActiveRef.current) return;
    clearTimers();
    isTouchSessionActiveRef.current = false;
    setOpen(false);
    providerContext?.onTooltipClose();
  }, [clearTimers, providerContext, setOpen]);

  const handleEscape = useCallback(() => {
    clearTimers();
    isTouchSessionActiveRef.current = false;
    setOpen(false);
    providerContext?.onTooltipClose();
  }, [clearTimers, providerContext, setOpen]);

  useDismissableLayer({
    enabled: isOpen,
    ownerDocument: triggerRef.current?.ownerDocument,
    elements: [contentElement],
    onEscapeKeyDown: () => { if (closeOnEscape) handleEscape(); },
  });

  useEffect(() => {
    if (!isOpen) return;
    const doc = triggerRef.current?.ownerDocument;
    if (!doc) return;
    const scrollPositions = new Map<EventTarget, [number, number]>();
    const position = (target: EventTarget): [number, number] => target === doc
      ? [doc.defaultView?.scrollX ?? 0, doc.defaultView?.scrollY ?? 0]
      : [(target as HTMLElement).scrollLeft, (target as HTMLElement).scrollTop];
    scrollPositions.set(doc, position(doc));
    for (let ancestor = triggerRef.current?.parentElement; ancestor; ancestor = ancestor.parentElement) {
      scrollPositions.set(ancestor, position(ancestor));
    }
    const dismiss = (event: Event) => {
      if (interactive && doc.getElementById(tooltipId)?.contains(event.target as Node)) return;
      if (event.type === "scroll") {
        const target = event.target;
        if (!target) return;
        const previous = scrollPositions.get(target);
        if (!previous) return;
        const next = position(target);
        if (previous[0] === next[0] && previous[1] === next[1]) return;
        scrollPositions.set(target, next);
      }
      handleEscape();
    };
    if (closeOnClick) doc.addEventListener("click", dismiss, true);
    if (closeOnPointerDown) doc.addEventListener("pointerdown", dismiss, true);
    if (closeOnScroll) doc.addEventListener("scroll", dismiss, true);
    return () => {
      doc.removeEventListener("click", dismiss, true);
      doc.removeEventListener("pointerdown", dismiss, true);
      doc.removeEventListener("scroll", dismiss, true);
    };
  }, [closeOnClick, closeOnPointerDown, closeOnScroll, handleEscape, interactive, isOpen, tooltipId]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!disabled) return;
    clearTimers();
    isTouchSessionActiveRef.current = false;
    if (!isControlled) setInternalOpen(false);
  }, [clearTimers, disabled, isControlled]);

  useEffect(() => {
    if (!isOpen) isTouchSessionActiveRef.current = false;
  }, [isOpen]);

  const contextValue: TooltipContextValue = useMemo(
    () => ({
      open: isOpen,
      setOpen,
      triggerValue,
      setTriggerValue,
      registerTrigger,
      registerContent,
      activateTrigger,
      ids,
      rootId,
      positioning,
      ariaLabel,
      lifecycle: { lazyMount, unmountOnExit, present, onExitComplete, immediate, skipAnimationOnMount, hideMode },
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
      setOpen, triggerValue, setTriggerValue, registerTrigger, activateTrigger, ids, rootId, positioning,
      ariaLabel, lazyMount, unmountOnExit, present, onExitComplete, immediate, skipAnimationOnMount, hideMode,
    ],
  );

  const touchContextValue: TooltipTouchContextValue = useMemo(
    () => ({
      onTouchLongPress,
      onTouchRelease,
      onTouchCancel,
    }),
    [onTouchCancel, onTouchLongPress, onTouchRelease],
  );

  return { ...contextValue, open: isOpen, setOpen, touch: touchContextValue };
}

export type UseTooltipReturn = ReturnType<typeof useTooltip>;

export interface TooltipRootProviderProps {
  children: ReactNode;
  value: UseTooltipReturn;
}

export function TooltipRootProvider({ children, value }: TooltipRootProviderProps) {
  return (
    <TooltipTouchContextProvider value={value.touch}>
      <TooltipContextProvider value={value}>
        {children}
      </TooltipContextProvider>
    </TooltipTouchContextProvider>
  );
}

export function TooltipRoot({ children, ...options }: TooltipRootProps) {
  const value = useTooltip(options);
  return <TooltipRootProvider value={value}>{children}</TooltipRootProvider>;
}
