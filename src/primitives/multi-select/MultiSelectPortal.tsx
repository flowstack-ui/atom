"use client";

import { useEffect, type ReactNode } from "react";
import { Portal } from "../../utils/Portal.js";
import { useMultiSelectContext } from "./context.js";

export interface MultiSelectPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  disabled?: boolean;
}

export function MultiSelectPortal({ children, container, disabled }: MultiSelectPortalProps) {
  const ctx = useMultiSelectContext();

  useEffect(() => {
    if (disabled) return undefined;

    ctx.setInsidePortal(true);
    return () => ctx.setInsidePortal(false);
  }, [ctx.setInsidePortal, disabled]);

  return (
    <Portal container={container} disabled={disabled}>
      {children}
    </Portal>
  );
}
