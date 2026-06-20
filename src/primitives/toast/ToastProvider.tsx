"use client";

import { useMemo, type ReactNode } from "react";
import {
  ToastProviderContextProvider,
  toastProviderDefaults,
  type ToastProviderContextValue,
} from "./context.js";

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
}: ToastProviderProps) {
  const value = useMemo<ToastProviderContextValue>(
    () => ({
      maxVisible,
      expandOnHover,
      closeButton,
      pauseOnHover,
      pauseOnFocusLoss,
    }),
    [closeButton, expandOnHover, maxVisible, pauseOnFocusLoss, pauseOnHover],
  );

  return <ToastProviderContextProvider value={value}>{children}</ToastProviderContextProvider>;
}
