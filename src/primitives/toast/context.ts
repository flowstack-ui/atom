"use client";

import { createContext, useContext } from "react";
import type { ToastData, ToastState, ToastSwipeDirection, ToastType } from "./types.js";

export interface ToastProviderContextValue {
  maxVisible: number;
  expandOnHover: boolean;
  closeButton: boolean;
  pauseOnHover: boolean;
  pauseOnFocusLoss: boolean;
  pauseOnFocus: boolean;
  hotkey: readonly string[];
  label: string;
  swipeDirection?: ToastSwipeDirection;
  swipeThreshold: number;
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
  pauseOnFocus: true,
  hotkey: ["F8"],
  label: "Notifications",
  swipeDirection: undefined,
  swipeThreshold: 50,
};

export interface ToastViewportContextValue {
  restoreFocusAfterDismiss: () => void;
}

const ToastProviderContext = createContext<ToastProviderContextValue>(toastProviderDefaults);
ToastProviderContext.displayName = "ToastProviderContext";

const ToastRootContext = createContext<ToastRootContextValue | null>(null);
ToastRootContext.displayName = "ToastRootContext";
const ToastViewportContext = createContext<ToastViewportContextValue | null>(null);
ToastViewportContext.displayName = "ToastViewportContext";

export const ToastProviderContextProvider = ToastProviderContext.Provider;
export const ToastRootContextProvider = ToastRootContext.Provider;
export const ToastViewportContextProvider = ToastViewportContext.Provider;

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

export function useToastViewportContext(): ToastViewportContextValue | null {
  return useContext(ToastViewportContext);
}
