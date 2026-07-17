"use client";

import type { ReactNode } from "react";
import { Portal, type PortalProps } from "../../utils/Portal.js";
import { assertSupportedModalPortalContainer } from "../modal/ModalPortal.js";

export interface DrawerPortalProps extends PortalProps {
  /** Drawer portal contents. */
  children: ReactNode;
}

export function DrawerPortal({ children, container, disabled }: DrawerPortalProps) {
  if (!disabled) assertSupportedModalPortalContainer(container);
  return (
    <Portal container={container} disabled={disabled}>
      {children}
    </Portal>
  );
}
