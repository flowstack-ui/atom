"use client";

import { useEffect, useRef, type RefObject } from "react";

export interface UseClickAwayOptions {
  refs: RefObject<HTMLElement | null>[];
  onClickAway: () => void;
  enabled?: boolean;
}

export function useClickAway({
  refs,
  onClickAway,
  enabled = false,
}: UseClickAwayOptions): void {
  const handlerRef = useRef(onClickAway);
  handlerRef.current = onClickAway;

  useEffect(() => {
    if (!enabled) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      for (const ref of refs) {
        if (ref.current && ref.current.contains(target)) return;
      }

      handlerRef.current();
    };

    const raf = requestAnimationFrame(() => {
      document.addEventListener("pointerdown", handlePointerDown);
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [enabled, refs]);
}
