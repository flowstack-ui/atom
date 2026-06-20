"use client";

import { Portal, type PortalProps } from "../../utils/Portal.js";

export type TooltipPortalProps = PortalProps;

export function TooltipPortal({ children, container, disabled }: TooltipPortalProps) {
  return (
    <Portal container={container} disabled={disabled}>
      {children}
    </Portal>
  );
}
