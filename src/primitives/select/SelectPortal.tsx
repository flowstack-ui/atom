"use client";

import { useEffect, type ReactNode } from "react";
import { Portal } from "../../utils/Portal.js";
import { useSelectContext } from "./context.js";

export interface SelectPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  disabled?: boolean;
}

export function SelectPortal({ children, container, disabled }: SelectPortalProps) {
  const ctx = useSelectContext();

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
