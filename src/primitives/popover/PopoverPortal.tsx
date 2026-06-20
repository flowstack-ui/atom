"use client";

import { Portal, type PortalProps } from "../../utils/Portal.js";

export type PopoverPortalProps = PortalProps;

export function PopoverPortal({ children, container, disabled }: PopoverPortalProps) {
  return (
    <Portal container={container} disabled={disabled}>
      {children}
    </Portal>
  );
}
