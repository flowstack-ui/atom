"use client";

import { useMemo, type ReactNode } from "react";
import {
  ToastProviderContextProvider,
  toastProviderDefaults,
  type ToastProviderContextValue,
} from "./context.js";
import { normalizeMaxVisible } from "./store.js";

export interface ToastProviderProps extends Partial<ToastProviderContextValue> {
  children?: ReactNode;
}

export function ToastProvider({
  children,
  maxVisible = toastProviderDefaults.maxVisible,
  expandOnHover = toastProviderDefaults.expandOnHover,
  closeButton = toastProviderDefaults.closeButton,
  pauseOnHover = toastProviderDefaults.pauseOnHover,
  pauseOnFocusLoss = toastProviderDefaults.pauseOnFocusLoss,
  pauseOnFocus = toastProviderDefaults.pauseOnFocus,
  hotkey = toastProviderDefaults.hotkey,
  label = toastProviderDefaults.label,
  swipeDirection = toastProviderDefaults.swipeDirection,
  swipeThreshold = toastProviderDefaults.swipeThreshold,
}: ToastProviderProps) {
  const value = useMemo<ToastProviderContextValue>(
    () => ({
      maxVisible: normalizeMaxVisible(maxVisible),
      expandOnHover,
      closeButton,
      pauseOnHover,
      pauseOnFocusLoss,
      pauseOnFocus,
      hotkey,
      label,
      swipeDirection,
      swipeThreshold: Number.isFinite(swipeThreshold) && swipeThreshold > 0 ? swipeThreshold : 50,
    }),
    [closeButton, expandOnHover, hotkey, label, maxVisible, pauseOnFocus, pauseOnFocusLoss, pauseOnHover, swipeDirection, swipeThreshold],
  );

  return <ToastProviderContextProvider value={value}>{children}</ToastProviderContextProvider>;
}
