"use client";

import { Portal, type PortalProps } from "../../utils/Portal.js";
import { useHoverCardContext } from "./context.js";

export type HoverCardPortalProps = PortalProps;

export function HoverCardPortal({ children, container, disabled }: HoverCardPortalProps) {
  const { triggerElement } = useHoverCardContext();
  return (
    <Portal container={container ?? triggerElement?.ownerDocument.body} disabled={disabled}>
      {children}
    </Portal>
  );
}
