"use client";

import { createContext, useContext, type RefObject } from "react";

export type ModalCloseReason =
  | "actionClick"
  | "backdropClick"
  | "cancelClick"
  | "closeClick"
  | "escapeKeyDown";

export interface ModalContextValue {
  /** Whether the modal is open. */
  isOpen: boolean;
  /** Open the modal. */
  onOpen: () => void;
  /** Close the modal, optionally with a reason. */
  onClose: (reason?: ModalCloseReason) => void;
  /** Unique ID for the modal content element. */
  modalId: string;
  /** Unique ID for the title element. */
  titleId: string;
  /** Unique ID for the description element. */
  descriptionId: string;
  /** Ref to the trigger element for focus restore. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Whether the modal is disabled. */
  disabled: boolean;
  /** Whether Escape closes the modal. */
  closeOnEscape: boolean;
  /** Whether clicking the backdrop closes the modal. */
  closeOnBackdropClick: boolean;
  /** Whether content stays mounted when closed. */
  keepMounted: boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);
ModalContext.displayName = "ModalContext";

export const ModalContextProvider = ModalContext.Provider;

export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("Modal compound components must be used within <ModalRoot>");
  }
  return ctx;
}
