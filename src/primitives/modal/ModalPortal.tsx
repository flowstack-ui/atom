"use client";

import type { ReactNode } from "react";
import { Portal, type PortalProps } from "../../utils/Portal.js";

export interface ModalPortalProps extends PortalProps {
  /** Modal portal contents. */
  children: ReactNode;
}

export function assertSupportedModalPortalContainer(
  container: HTMLElement | null | undefined,
): void {
  if (container == null) return;
  const ownerDocument = globalThis.document;
  const HTMLElementConstructor = ownerDocument?.defaultView?.HTMLElement;
  if (
    !ownerDocument ||
    !HTMLElementConstructor ||
    !(container instanceof HTMLElementConstructor) ||
    container.ownerDocument !== ownerDocument
  ) {
    throw new TypeError(
      "Modal portal containers must be HTMLElements in the current document.",
    );
  }
}

export function ModalPortal({ children, container, disabled }: ModalPortalProps) {
  if (!disabled) assertSupportedModalPortalContainer(container);
  return (
    <Portal container={container} disabled={disabled}>
      {children}
    </Portal>
  );
}
