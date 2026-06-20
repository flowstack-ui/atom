"use client";

import type { ReactNode } from "react";
import { Portal, type PortalProps } from "../../utils/Portal.js";

export interface ModalPortalProps extends PortalProps {
  /** Modal portal contents. */
  children: ReactNode;
}

export function ModalPortal({ children, container, disabled }: ModalPortalProps) {
  return (
    <Portal container={container} disabled={disabled}>
      {children}
    </Portal>
  );
}
