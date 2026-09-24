"use client";

import { Portal, type PortalProps } from "../../utils/Portal.js";
import { usePopoverContext } from "./context.js";

export type PopoverPortalProps = PortalProps;

export function PopoverPortal({ children, container, disabled }: PopoverPortalProps) {
  const { triggerRef } = usePopoverContext();
  return (
    <Portal container={container ?? triggerRef.current?.ownerDocument.body} disabled={disabled}>
      {children}
    </Portal>
  );
}
