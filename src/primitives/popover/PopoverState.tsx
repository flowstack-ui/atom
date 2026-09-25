"use client";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { usePopoverContext } from "./context.js";

export interface PopoverState {
  open: boolean;
  triggerValue: string | undefined;
  setOpen: (open: boolean) => void;
  setTriggerValue: (value: string | undefined) => void;
  reposition: () => void;
}
export function usePopoverState(): PopoverState {
  const api = usePopoverContext();
  return {
    open: api.isOpen, triggerValue: api.triggerValue,
    setOpen: open => open ? api.onOpen() : api.onClose(),
    setTriggerValue: api.setTriggerValue, reposition: api.reposition,
  };
}
export interface PopoverStateProps { children: (state: PopoverState) => ReactNode }
export function PopoverState({ children }: PopoverStateProps) { return children(usePopoverState()); }
export interface PopoverIndicatorProps extends HTMLAttributes<HTMLSpanElement> { "data-slot"?: string }
export const PopoverIndicator = forwardRef<HTMLSpanElement, PopoverIndicatorProps>(function PopoverIndicator(props, ref) {
  const { isOpen } = usePopoverContext();
  return <span {...props} ref={ref} data-slot={props["data-slot"] ?? "popover-indicator"} data-state={isOpen ? "open" : "closed"} aria-hidden="true" />;
});
