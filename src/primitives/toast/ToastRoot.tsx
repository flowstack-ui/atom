"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { ToastRootContextProvider, useToastProviderContext } from "./context.js";
import { dismissToast, getDefaultToastDuration, getToastAriaLive, getToastRole } from "./store.js";
import type { ToastData, ToastState, ToastType } from "./types.js";

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
      children,
      render,
      asChild,
      "data-slot": dataSlot = "toast",
      ...restProps
    },
    ref,
  ) {
    const provider = useToastProviderContext();
    const [state, setState] = useState<ToastState>("entering");
    const [removed, setRemoved] = useState(false);
    const closeButtonEnabled = closeButton ?? toast?.closeButton ?? provider.closeButton;
    const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stateRef = useRef<ToastState>(state);

    const runRemove = useCallback(() => {
      onDismiss?.();
      if (toast) dismissToast(toast.id);
    }, [onDismiss, toast]);

    const completeRemove = useCallback(() => {
      runRemove();
      if (!toast && !forceMount) setRemoved(true);
    }, [forceMount, runRemove, toast]);

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
      role: getToastRole(type),
      "aria-live": getToastAriaLive(type),
      "aria-atomic": true,
      "data-slot": dataSlot,
      "data-state": state,
      "data-type": type,
      ...(typeof index === "number" && { "data-index": index }),
      ...(expanded && { "data-expanded": "" }),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return <ToastRootContextProvider value={contextValue}>{element}</ToastRootContextProvider>;
  },
);
