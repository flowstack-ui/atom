"use client";

import { createContext, useContext } from "react";
import type { ToastData, ToastState, ToastType } from "./types.js";

export interface ToastProviderContextValue {
  maxVisible: number;
  expandOnHover: boolean;
  closeButton: boolean;
  pauseOnHover: boolean;
  pauseOnFocusLoss: boolean;
}

export interface ToastRootContextValue {
  toast: ToastData | undefined;
  type: ToastType;
  state: ToastState;
  dismissible: boolean;
  closeButton: boolean;
  onDismiss: () => void;
}

export const toastProviderDefaults: ToastProviderContextValue = {
  maxVisible: 3,
  expandOnHover: true,
  closeButton: false,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
};

const ToastProviderContext = createContext<ToastProviderContextValue>(toastProviderDefaults);
ToastProviderContext.displayName = "ToastProviderContext";

const ToastRootContext = createContext<ToastRootContextValue | null>(null);
ToastRootContext.displayName = "ToastRootContext";

export const ToastProviderContextProvider = ToastProviderContext.Provider;
export const ToastRootContextProvider = ToastRootContext.Provider;

export function useToastProviderContext(): ToastProviderContextValue {
  return useContext(ToastProviderContext);
}

export function useToastRootContext(): ToastRootContextValue {
  const context = useContext(ToastRootContext);

  if (!context) {
    throw new Error("Toast compound components must be used within <ToastRoot>");
  }

  return context;
}
