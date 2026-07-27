"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type KeyboardEventHandler,
  type PointerEventHandler,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { ToastRootContextProvider, useToastProviderContext, useToastViewportContext } from "./context.js";
import { dismissToast, getDefaultToastDuration } from "./store.js";
import type { ToastData, ToastState, ToastSwipeDirection, ToastSwipeState, ToastType } from "./types.js";

type ToastRootNativeProps = NativeDivProps<"children" | "role">;

export interface ToastRootProps extends ToastRootNativeProps {
  toast?: ToastData;
  type?: ToastType;
  duration?: number;
  paused?: boolean;
  dismissible?: boolean;
  closeButton?: boolean;
  index?: number;
  expanded?: boolean;
  removeDelay?: number;
  forceMount?: boolean;
  onAutoClose?: () => void;
  onDismiss?: () => void;
  swipeDirection?: ToastSwipeDirection;
  swipeThreshold?: number;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ToastRoot = forwardRef<HTMLDivElement, ToastRootProps>(
  function ToastRoot(
    {
      toast,
      type = toast?.type ?? "default",
      duration = toast?.duration ?? getDefaultToastDuration(type),
      paused = toast?.paused ?? false,
      dismissible = toast?.dismissible ?? true,
      closeButton,
      index,
      expanded,
      removeDelay = 200,
      forceMount = false,
      onAutoClose,
      onDismiss,
      swipeDirection,
      swipeThreshold,
      children,
      render,
      asChild,
      "data-slot": dataSlot = "toast",
      ...restProps
    },
    ref,
  ) {
    const provider = useToastProviderContext();
    const viewport = useToastViewportContext();
    const [state, setState] = useState<ToastState>("entering");
    const [removed, setRemoved] = useState(false);
    const closeButtonEnabled = closeButton ?? toast?.closeButton ?? provider.closeButton;
    const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stateRef = useRef<ToastState>(state);
    const escapeDismissedRef = useRef(false);
    const pointerRef = useRef<{ id: number; x: number; y: number } | null>(null);
    const [swipeState, setSwipeState] = useState<ToastSwipeState | null>(null);
    const [swipeDelta, setSwipeDelta] = useState({ x: 0, y: 0 });
    const resolvedSwipeDirection = swipeDirection ?? provider.swipeDirection;
    const resolvedSwipeThreshold = swipeThreshold ?? provider.swipeThreshold;

    const runRemove = useCallback(() => {
      onDismiss?.();
      if (toast) dismissToast(toast.id);
    }, [onDismiss, toast]);

    const completeRemove = useCallback(() => {
      runRemove();
      if (!toast && !forceMount) setRemoved(true);
      if (escapeDismissedRef.current) viewport?.restoreFocusAfterDismiss();
    }, [forceMount, runRemove, toast, viewport]);

    useEffect(() => {
      stateRef.current = state;
    }, [state]);

    const startExit = useCallback(() => {
      if (stateRef.current === "exiting") return;

      stateRef.current = "exiting";
      setState("exiting");

      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
      removeTimerRef.current = setTimeout(completeRemove, removeDelay);
    }, [completeRemove, removeDelay]);

    const handleDismiss = useCallback(() => {
      startExit();
    }, [startExit]);

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>((event) => {
      if (event.key !== "Escape" || !dismissible) return;
      event.preventDefault();
      event.stopPropagation();
      escapeDismissedRef.current = true;
      startExit();
    }, [dismissible, startExit]);

    const handlePointerDown = useCallback<PointerEventHandler<HTMLDivElement>>((event) => {
      if (!resolvedSwipeDirection || !dismissible || event.button !== 0) return;
      if ((event.target as Element).closest("button, a, input, select, textarea")) return;
      pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
      setSwipeDelta({ x: 0, y: 0 });
      setSwipeState("start");
    }, [dismissible, resolvedSwipeDirection]);

    const handlePointerMove = useCallback<PointerEventHandler<HTMLDivElement>>((event) => {
      const pointer = pointerRef.current;
      if (!pointer || pointer.id !== event.pointerId || !resolvedSwipeDirection) return;
      const rawX = event.clientX - pointer.x;
      const rawY = event.clientY - pointer.y;
      const x = resolvedSwipeDirection === "right" ? Math.max(0, rawX) : resolvedSwipeDirection === "left" ? Math.min(0, rawX) : 0;
      const y = resolvedSwipeDirection === "down" ? Math.max(0, rawY) : resolvedSwipeDirection === "up" ? Math.min(0, rawY) : 0;
      if (x === 0 && y === 0) return;
      event.preventDefault();
      setSwipeDelta({ x, y });
      setSwipeState("move");
    }, [resolvedSwipeDirection]);

    const finishSwipe = useCallback<PointerEventHandler<HTMLDivElement>>((event) => {
      const pointer = pointerRef.current;
      if (!pointer || pointer.id !== event.pointerId || !resolvedSwipeDirection) return;
      pointerRef.current = null;
      const distance = resolvedSwipeDirection === "left" || resolvedSwipeDirection === "right"
        ? Math.abs(swipeDelta.x)
        : Math.abs(swipeDelta.y);
      if (distance >= resolvedSwipeThreshold) {
        setSwipeState("end");
        startExit();
      } else {
        setSwipeState("cancel");
        setSwipeDelta({ x: 0, y: 0 });
      }
    }, [resolvedSwipeDirection, resolvedSwipeThreshold, startExit, swipeDelta.x, swipeDelta.y]);

    const cancelSwipe = useCallback<PointerEventHandler<HTMLDivElement>>((event) => {
      const pointer = pointerRef.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      pointerRef.current = null;
      setSwipeState("cancel");
      setSwipeDelta({ x: 0, y: 0 });
    }, []);

    useEffect(() => {
      const visibleTimer = setTimeout(() => {
        setState((current) => {
          if (current !== "entering") return current;

          return "visible";
        });
      }, 0);

      return () => clearTimeout(visibleTimer);
    }, []);

    useEffect(() => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (duration === Infinity || paused || stateRef.current === "exiting") return undefined;

      autoCloseTimerRef.current = setTimeout(() => {
        if (stateRef.current === "exiting") return;

        toast?.onAutoClose?.(toast.id);
        onAutoClose?.();
        startExit();
      }, toast?.remainingDuration ?? duration);

      return () => {
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      };
    }, [
      duration,
      onAutoClose,
      paused,
      startExit,
      toast?.id,
      toast?.onAutoClose,
      toast?.remainingDuration,
    ]);

    useEffect(
      () => () => {
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
      },
      [],
    );

    if (removed) return null;

    const contextValue = useMemo(
      () => ({
        toast,
        type,
        state,
        dismissible,
        closeButton: closeButtonEnabled,
        onDismiss: handleDismiss,
      }),
      [closeButtonEnabled, dismissible, handleDismiss, state, toast, type],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-state": state,
      "data-type": type,
      ...(typeof index === "number" && { "data-index": index }),
      ...(expanded && { "data-expanded": "" }),
      ...(toast?.id && { "data-toast-id": toast.id }),
      ...(resolvedSwipeDirection && { "data-swipe-direction": resolvedSwipeDirection }),
      ...(swipeState && { "data-swipe": swipeState }),
      style: resolvedSwipeDirection
        ? {
            ...(restProps.style as CSSProperties | undefined),
            "--atom-toast-swipe-move-x": `${swipeDelta.x}px`,
            "--atom-toast-swipe-move-y": `${swipeDelta.y}px`,
          } as CSSProperties
        : restProps.style,
      onKeyDown: composeEventHandlers(restProps.onKeyDown, handleKeyDown),
      onPointerDown: composeEventHandlers(restProps.onPointerDown, handlePointerDown),
      onPointerMove: composeEventHandlers(restProps.onPointerMove, handlePointerMove),
      onPointerUp: composeEventHandlers(restProps.onPointerUp, finishSwipe),
      onPointerCancel: composeEventHandlers(restProps.onPointerCancel, cancelSwipe),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return <ToastRootContextProvider value={contextValue}>{element}</ToastRootContextProvider>;
  },
);
