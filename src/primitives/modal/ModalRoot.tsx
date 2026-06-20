"use client";

import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ModalContextProvider,
  type ModalCloseReason,
  type ModalContextValue,
} from "./context.js";

export interface ModalRootProps {
  /** Compound children. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean, reason?: ModalCloseReason) => void;
  /** Close on Escape key press. */
  closeOnEscape?: boolean;
  /** Close when clicking the backdrop. */
  closeOnBackdropClick?: boolean;
  /** Prevent modal from opening. */
  disabled?: boolean;
  /** Keep content DOM mounted when closed. */
  keepMounted?: boolean;
}

export function ModalRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  disabled = false,
  keepMounted = false,
}: ModalRootProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const modalId = useId();
  const titleId = useId();
  const descriptionId = useId();

  const setOpen = useCallback(
    (value: boolean, reason?: ModalCloseReason) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value, reason);
    },
    [isControlled, onOpenChange],
  );

  const onOpen = useCallback(() => {
    if (!disabled) setOpen(true);
  }, [disabled, setOpen]);

  const onClose = useCallback(
    (reason?: ModalCloseReason) => {
      setOpen(false, reason);
    },
    [setOpen],
  );

  const contextValue: ModalContextValue = useMemo(
    () => ({
      isOpen,
      onOpen,
      onClose,
      modalId,
      titleId,
      descriptionId,
      triggerRef,
      disabled,
      closeOnEscape,
      closeOnBackdropClick,
      keepMounted,
    }),
    [
      isOpen,
      onOpen,
      onClose,
      modalId,
      titleId,
      descriptionId,
      triggerRef,
      disabled,
      closeOnEscape,
      closeOnBackdropClick,
      keepMounted,
    ],
  );

  return (
    <ModalContextProvider value={contextValue}>
      {children}
    </ModalContextProvider>
  );
}
