"use client";

import { Portal, type PortalProps } from "../../utils/Portal.js";

export type HoverCardPortalProps = PortalProps;

export function HoverCardPortal({ children, container, disabled }: HoverCardPortalProps) {
  return (
    <Portal container={container} disabled={disabled}>
      {children}
    </Portal>
  );
}
