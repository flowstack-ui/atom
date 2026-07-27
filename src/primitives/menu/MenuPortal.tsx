"use client";

import type { ReactNode } from "react";
import { Portal } from "../../utils/Portal.js";
import { MenuPortalContextProvider } from "./context.js";

export interface MenuPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  disabled?: boolean;
}

export function MenuPortal({ children, container, disabled = false }: MenuPortalProps) {
  return (
    <MenuPortalContextProvider value={{ container, disabled }}>
      <Portal container={container} disabled={disabled}>{children}</Portal>
    </MenuPortalContextProvider>
  );
}
