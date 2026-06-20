"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UsePresenceOptions {
  /** Whether the element should be present. */
  present: boolean;
  /** Called after exit completes. */
  onExitComplete?: () => void;
}

export interface UsePresenceResult {
  /** Whether the element should render. */
  isPresent: boolean;
  /** Callback ref to attach to the animated element. */
  ref: (node: HTMLElement | null) => void;
}

function hasActiveMotion(node: HTMLElement): boolean {
  const styles = getComputedStyle(node);
  return (
    (styles.transitionDuration !== "" && styles.transitionDuration !== "0s") ||
    (styles.animationDuration !== "" && styles.animationDuration !== "0s")
  );
}

export function usePresence({
  present,
  onExitComplete,
}: UsePresenceOptions): UsePresenceResult {
  const [isPresent, setIsPresent] = useState(present);
  const nodeRef = useRef<HTMLElement | null>(null);
  const isExitingRef = useRef(false);
  const onExitCompleteRef = useRef(onExitComplete);
  onExitCompleteRef.current = onExitComplete;

  useEffect(() => {
    if (present) {
      isExitingRef.current = false;
      setIsPresent(true);
    }
  }, [present]);

  useEffect(() => {
    if (present || !isPresent || isExitingRef.current) return undefined;

    isExitingRef.current = true;
    const node = nodeRef.current;

    if (!node || !hasActiveMotion(node)) {
      const frame = requestAnimationFrame(() => {
        setIsPresent(false);
        onExitCompleteRef.current?.();
      });
      return () => cancelAnimationFrame(frame);
    }

    const handleEnd = () => {
      setIsPresent(false);
      onExitCompleteRef.current?.();
    };

    node.addEventListener("transitionend", handleEnd, { once: true });
    node.addEventListener("animationend", handleEnd, { once: true });

    return () => {
      node.removeEventListener("transitionend", handleEnd);
      node.removeEventListener("animationend", handleEnd);
    };
  }, [isPresent, present]);

  const ref = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  return { isPresent, ref };
}
