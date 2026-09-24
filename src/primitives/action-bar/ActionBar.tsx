"use client";

import { forwardRef, useMemo, type ReactNode, type HTMLAttributes } from "react";
import { useOverlayLayerHost } from "../../hooks/overlayScope.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { usePopover, PopoverRootProvider, type PopoverRootProps, type UsePopoverReturn } from "../popover/PopoverRoot.js";
import { PopoverContentImpl, type PopoverContentProps } from "../popover/PopoverContent.js";
import { PopoverClose, type PopoverCloseProps } from "../popover/PopoverClose.js";
import { PopoverPortal } from "../popover/PopoverPortal.js";
import { PopoverTitle } from "../popover/PopoverTitle.js";
import { PopoverDescription } from "../popover/PopoverDescription.js";
import { usePopoverContext } from "../popover/context.js";
import { DetachedLayerPolicyContext, type DetachedLayerPolicy } from "../popover/detached-policy.js";
import { ButtonRoot, type ButtonRootProps } from "../button/ButtonRoot.js";

export interface ActionBarRootProps extends Omit<PopoverRootProps, "triggerMode" | "openDelay" | "closeDelay" | "positioning" | "triggerValue" | "defaultTriggerValue" | "onTriggerValueChange"> {}
export type UseActionBarOptions = Omit<ActionBarRootProps, "children">;
export interface UseActionBarReturn {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
}
const controllers = new WeakMap<UseActionBarReturn, { popover: UsePopoverReturn; policy: DetachedLayerPolicy }>();

export function useActionBar(options: UseActionBarOptions = {}): UseActionBarReturn {
  const popover = usePopover(options);
  const { lazyMount = true, unmountOnExit = true, persistentElements } = options;
  // Callbacks belong to the controller's Popover context, not two competing paths.
  const policy = useMemo(() => ({ lazyMount, unmountOnExit, persistentElements }),
    [lazyMount, unmountOnExit, persistentElements]);
  const controller = { open: popover.open, setOpen: popover.setOpen };
  controllers.set(controller, { popover, policy });
  return controller;
}

export type ActionBarRootProviderProps = { value: UseActionBarReturn; children: ReactNode } | ActionBarRootProps;
export function ActionBarRootProvider(props: ActionBarRootProviderProps) {
  if (!("value" in props)) return <ActionBarRoot {...props} />;
  const internal = controllers.get(props.value);
  if (!internal) throw new Error("ActionBar.RootProvider requires the unchanged controller returned by useActionBar.");
  return <DetachedLayerPolicyContext.Provider value={internal.policy}>
    <PopoverRootProvider value={internal.popover}>{props.children}</PopoverRootProvider>
  </DetachedLayerPolicyContext.Provider>;
}

export function ActionBarRoot({ children, ...options }: ActionBarRootProps) {
  const value = useActionBar(options);
  return <ActionBarRootProvider value={value}>{children}</ActionBarRootProvider>;
}

export interface ActionBarContentProps extends Omit<PopoverContentProps, "side" | "align" | "sideOffset"> {
  onFocusOutside?: (event: FocusEvent) => void;
}
export interface ActionBarPositionerProps extends HTMLAttributes<HTMLDivElement> {
  "data-slot"?: string;
  asChild?: boolean;
  render?: RenderProp;
}
export const ActionBarPositioner = forwardRef<HTMLDivElement, ActionBarPositionerProps>(
  function ActionBarPositioner({ "data-slot": slot = "action-bar-positioner", asChild, render, children, ...props }, ref) {
    const host = useOverlayLayerHost();
    const merged = useMemo(() => composeRefs(ref, host), [ref, host]);
    const attributes = { ...props, ref: merged, "data-slot": slot };
    return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children });
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
export const ActionBarPortal = PopoverPortal;
export const ActionBarTitle = PopoverTitle;
export const ActionBarDescription = PopoverDescription;
