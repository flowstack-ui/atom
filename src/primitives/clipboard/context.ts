"use client";

import { createContext, useContext } from "react";

export type ClipboardStatusValue = "idle" | "copying" | "copied" | "error";

export interface ClipboardStatusDetails {
  status: ClipboardStatusValue;
  error?: unknown;
}

export interface ClipboardContextValue {
  value: string;
  setValue: (value: string) => void;
  status: ClipboardStatusValue;
  disabled: boolean;
  inputId: string;
  labelId: string;
  copy: () => Promise<void>;
}

const ClipboardContext = createContext<ClipboardContextValue | null>(null);
ClipboardContext.displayName = "ClipboardContext";

export const ClipboardContextProvider = ClipboardContext.Provider;

export function useClipboardContext(): ClipboardContextValue {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error("Clipboard compound components must be used within <Clipboard.Root>");
  }
  return context;
}
