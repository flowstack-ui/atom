"use client";

import type { ReactNode } from "react";
import { ModalRoot, type ModalRootProps } from "../modal/index.js";

export interface AlertDialogRootProps extends Omit<ModalRootProps, "closeOnBackdropClick" | "modal" | "trapFocus" | "preventScroll"> {
  /** Compound children. */
  children: ReactNode;
}

export function AlertDialogRoot({
  children,
  closeOnEscape = true,
  ...props
}: AlertDialogRootProps) {
  return (
    <ModalRoot
      {...props}
      closeOnEscape={closeOnEscape}
      closeOnBackdropClick={false}
      modal
      trapFocus
      preventScroll
    >
      {children}
    </ModalRoot>
  );
}
