"use client";

import { useEffect, useRef } from "react";

export function useEscapeKey(
  handler: (event: KeyboardEvent) => void,
  enabled: boolean,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handlerRef.current(event);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
