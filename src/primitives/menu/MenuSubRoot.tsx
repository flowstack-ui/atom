"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import type { MenuLifecycleOptions, MenuPositioningOptions } from "./options.js";
import {
  MenuSubContextProvider,
  useMenuContext,
  type MenuSubContextValue,
} from "./context.js";

export interface MenuSubRootProps extends MenuLifecycleOptions {
  positioning?: MenuPositioningOptions;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MenuSubRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  positioning,
  ...lifecycle
}: MenuSubRootProps) {
  const parentMenuContext = useMenuContext();
  const subMenuId = useId();
  const subTriggerId = `${subMenuId}-trigger`;
  const subTriggerRef = useRef<HTMLElement | null>(null);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled
    ? controlledOpen
    : parentMenuContext.openSubMenuId === subMenuId;

  const onOpen = useCallback(() => {
    if (!isControlled) parentMenuContext.onSubMenuOpen(subMenuId);
    onOpenChange?.(true);
  }, [isControlled, onOpenChange, parentMenuContext, subMenuId]);

  const onClose = useCallback(() => {
    if (!isControlled) parentMenuContext.onSubMenuClose();
    onOpenChange?.(false);
  }, [isControlled, onOpenChange, parentMenuContext]);

  const onToggle = useCallback(() => {
    if (isOpen) onClose();
    else onOpen();
  }, [isOpen, onClose, onOpen]);

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    if (defaultOpen && !isControlled) parentMenuContext.onSubMenuOpen(subMenuId);
  }, [defaultOpen, isControlled, parentMenuContext, subMenuId]);

  const contextValue: MenuSubContextValue = {
    isOpen: isOpen && parentMenuContext.isOpen,
    positioning,
    lifecycle: { ...parentMenuContext.lifecycle, onExitComplete: undefined, ...lifecycle },
    onOpen,
    onClose,
    onToggle,
    subMenuId,
    subTriggerId,
    subTriggerRef,
    parentMenuContext,
  };

  return (
    <MenuSubContextProvider value={contextValue}>
      {children}
    </MenuSubContextProvider>
  );
}
