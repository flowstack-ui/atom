"use client";

import { useCallback, useId, useRef, type ReactNode } from "react";
import {
  MenuSubContextProvider,
  useMenuContext,
  type MenuSubContextValue,
} from "./context.js";

export interface MenuSubRootProps {
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
    if (isControlled) onOpenChange?.(true);
    else parentMenuContext.onSubMenuOpen(subMenuId);
  }, [isControlled, onOpenChange, parentMenuContext, subMenuId]);

  const onClose = useCallback(() => {
    if (isControlled) onOpenChange?.(false);
    else parentMenuContext.onSubMenuClose();
  }, [isControlled, onOpenChange, parentMenuContext]);

  const onToggle = useCallback(() => {
    if (isOpen) onClose();
    else onOpen();
  }, [isOpen, onClose, onOpen]);

  const hasInitialized = useRef(false);
  if (!hasInitialized.current && defaultOpen && !isControlled) {
    hasInitialized.current = true;
    queueMicrotask(() => parentMenuContext.onSubMenuOpen(subMenuId));
  }
  if (!hasInitialized.current) hasInitialized.current = true;

  const contextValue: MenuSubContextValue = {
    isOpen,
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
