"use client";

import { useCallback, useState } from "react";

export interface UseDisclosureReturn {
  /** Whether the disclosure is currently open. */
  isOpen: boolean;
  /** Open the disclosure. */
  onOpen: () => void;
  /** Close the disclosure. */
  onClose: () => void;
  /** Toggle between open and closed. */
  onToggle: () => void;
}

export function useDisclosure(initialOpen = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, onOpen, onClose, onToggle };
}
