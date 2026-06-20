"use client";

import type { ReactNode } from "react";
import { ModalRoot, type ModalRootProps } from "../modal/index.js";

export interface AlertDialogRootProps extends Omit<ModalRootProps, "closeOnBackdropClick"> {
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
    >
      {children}
    </ModalRoot>
  );
}
