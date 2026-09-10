"use client";

import { forwardRef, useMemo, type ReactNode, type HTMLAttributes } from "react";
import { useOverlayLayerHost } from "../../hooks/overlayScope.js";
import { composeRefs } from "../../utils/slot.js";
import { PopoverRoot, type PopoverRootProps } from "../popover/PopoverRoot.js";
import { PopoverContentImpl, type PopoverContentProps } from "../popover/PopoverContent.js";
import { PopoverClose, type PopoverCloseProps } from "../popover/PopoverClose.js";
import { PopoverPortal } from "../popover/PopoverPortal.js";
import { PopoverTitle } from "../popover/PopoverTitle.js";
import { PopoverDescription } from "../popover/PopoverDescription.js";
import { usePopoverContext } from "../popover/context.js";
import { DetachedLayerPolicyContext, type DetachedLayerPolicy } from "../popover/detached-policy.js";
import { ButtonRoot, type ButtonRootProps } from "../button/ButtonRoot.js";

export interface ActionBarRootProps extends Omit<PopoverRootProps, "triggerMode" | "openDelay" | "closeDelay">, Partial<DetachedLayerPolicy> {}

export function ActionBarRoot({
  lazyMount = true, unmountOnExit = true, onExitComplete, onEscapeKeyDown,
  persistentElements, ...props
}: ActionBarRootProps) {
  const policy = useMemo(() => ({ lazyMount, unmountOnExit, onExitComplete, onEscapeKeyDown, persistentElements }),
    [lazyMount, unmountOnExit, onExitComplete, onEscapeKeyDown, persistentElements]);
  return <DetachedLayerPolicyContext.Provider value={policy}><PopoverRoot {...props} /></DetachedLayerPolicyContext.Provider>;
}

export interface ActionBarContentProps extends Omit<PopoverContentProps, "side" | "align" | "sideOffset"> {
  onFocusOutside?: (event: FocusEvent) => void;
}
export interface ActionBarPositionerProps extends HTMLAttributes<HTMLDivElement> { "data-slot"?: string }
export const ActionBarPositioner = forwardRef<HTMLDivElement, ActionBarPositionerProps>(
  function ActionBarPositioner({ "data-slot": slot = "action-bar-positioner", ...props }, ref) {
    const host = useOverlayLayerHost();
    const merged = useMemo(() => composeRefs(ref, host), [ref, host]);
    return <div {...props} ref={merged} data-slot={slot} />;
  },
);
export const ActionBarContent = forwardRef<HTMLDivElement, ActionBarContentProps>(
  function ActionBarContent({ initialFocus = false, "data-slot": slot = "action-bar-content", ...props }, ref) {
    return <PopoverContentImpl {...props} initialFocus={initialFocus} data-slot={slot} ref={ref} />;
  },
);
export type ActionBarCloseTriggerProps = PopoverCloseProps;
export const ActionBarCloseTrigger = forwardRef<HTMLButtonElement, ActionBarCloseTriggerProps>(
  function ActionBarCloseTrigger({ "data-slot": slot = "action-bar-close-trigger", ...props }, ref) {
    return <PopoverClose {...props} data-slot={slot} ref={ref} />;
  },
);
export type ActionBarSelectionTriggerProps = ButtonRootProps;
export const ActionBarSelectionTrigger = forwardRef<HTMLButtonElement, ActionBarSelectionTriggerProps>(
  function ActionBarSelectionTrigger({ "data-slot": slot = "action-bar-selection-trigger", ...props }, ref) {
    return <ButtonRoot {...props} data-slot={slot} ref={ref} />;
  },
);
export interface ActionBarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export function ActionBarContext({ children }: { children: (value: ActionBarContextValue) => ReactNode }) {
  const context = usePopoverContext();
  return children({ open: context.isOpen, setOpen: (open) => open ? context.onOpen() : context.onClose() });
}
export const ActionBarRootProvider = ActionBarRoot;
export const ActionBarPortal = PopoverPortal;
export const ActionBarTitle = PopoverTitle;
export const ActionBarDescription = PopoverDescription;
