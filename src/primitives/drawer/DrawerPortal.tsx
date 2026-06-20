"use client";

import type { ReactNode } from "react";
import { Portal, type PortalProps } from "../../utils/Portal.js";

export interface DrawerPortalProps extends PortalProps {
  /** Drawer portal contents. */
  children: ReactNode;
}

export function DrawerPortal({ children, container, disabled }: DrawerPortalProps) {
  return (
    <Portal container={container} disabled={disabled}>
      {children}
    </Portal>
  );
}
