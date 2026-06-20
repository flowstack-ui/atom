"use client";

import type { ReactNode } from "react";
import { Portal, type PortalProps } from "../../utils/Portal.js";

export interface ComboboxPortalProps extends Omit<PortalProps, "children"> {
  children?: ReactNode;
}

export function ComboboxPortal({
  children,
  container,
  disabled,
}: ComboboxPortalProps) {
  return (
    <Portal container={container} disabled={disabled}>
      {children}
    </Portal>
  );
}
