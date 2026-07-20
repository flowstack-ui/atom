"use client";

import { useEffect, useRef, type RefObject } from "react";

export interface UseClickAwayOptions {
  refs: RefObject<HTMLElement | null>[];
  onClickAway: (event: PointerEvent) => void;
  enabled?: boolean;
  ignore?: (target: Node) => boolean;
}

export function useClickAway({
  refs,
  onClickAway,
  enabled = false,
  ignore,
}: UseClickAwayOptions): void {
  const handlerRef = useRef(onClickAway);
  handlerRef.current = onClickAway;
  const ignoreRef = useRef(ignore);
  ignoreRef.current = ignore;

  useEffect(() => {
    if (!enabled) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      for (const ref of refs) {
        if (ref.current && ref.current.contains(target)) return;
      }
      if (ignoreRef.current?.(target)) return;

      handlerRef.current(event);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [enabled, refs]);
}
