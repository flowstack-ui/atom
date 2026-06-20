"use client";

import { createContext, useContext, type RefObject } from "react";

export interface TextareaContextValue {
  value: string;
  setValue: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  focused: boolean;
  maxLength: number | undefined;
}

const TextareaContext = createContext<TextareaContextValue | null>(null);
TextareaContext.displayName = "TextareaContext";

export const TextareaContextProvider = TextareaContext.Provider;

export function useTextareaContext(): TextareaContextValue {
  const ctx = useContext(TextareaContext);
  if (!ctx) {
    throw new Error("Textarea compound components must be used within <Textarea.Root>");
  }
  return ctx;
}
