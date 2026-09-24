"use client";
import type { ReactNode } from "react";
import { useTooltipContext } from "./context.js";

export interface TooltipState {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerValue: string | undefined;
  setTriggerValue: (value: string | undefined) => void;
}
export interface TooltipStateProps { children: (state: TooltipState) => ReactNode }
export function TooltipContext({ children }: TooltipStateProps) {
  const { open, setOpen, triggerValue, setTriggerValue } = useTooltipContext();
  return children({ open, setOpen, triggerValue, setTriggerValue });
}
