"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useIsomorphicLayoutEffect as useLayoutEffect } from "../hooks/useIsomorphicLayoutEffect.js";

export interface PortalProps {
  /** Content to render inside the portal. */
  children: ReactNode;
  /** Target DOM element to portal into. */
  container?: HTMLElement | null;
  /** Render children in place instead of portaling. */
  disabled?: boolean;
}

export function Portal({ children, container, disabled }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (disabled) return <>{children}</>;

  const target = container ?? (mounted ? globalThis.document?.body : null);
  if (!target) return null;

  return createPortal(children, target);
}
