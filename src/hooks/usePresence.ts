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

function parseTimeValue(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  if (trimmed.endsWith("ms")) return Number.parseFloat(trimmed) || 0;
  if (trimmed.endsWith("s")) return (Number.parseFloat(trimmed) || 0) * 1000;
  return 0;
}

function parseTimeList(value: string): number[] {
  return value.split(",").map(parseTimeValue);
}

function maxMotionTime(durations: number[], delays: number[]): number {
  let max = 0;
  for (let index = 0; index < durations.length; index += 1) {
    const delay = delays[index] ?? delays[delays.length - 1] ?? 0;
    max = Math.max(max, durations[index] + delay);
  }
  return max;
}

function getMotionTimeout(node: HTMLElement): number {
  const styles = getComputedStyle(node);
  return Math.max(
    maxMotionTime(
      parseTimeList(styles.transitionDuration),
      parseTimeList(styles.transitionDelay),
    ),
    maxMotionTime(
      parseTimeList(styles.animationDuration),
      parseTimeList(styles.animationDelay),
    ),
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

    const motionTimeout = node ? getMotionTimeout(node) : 0;

    if (!node || !hasActiveMotion(node) || motionTimeout === 0) {
      const frame = requestAnimationFrame(() => {
        setIsPresent(false);
        onExitCompleteRef.current?.();
      });
      return () => cancelAnimationFrame(frame);
    }

    let done = false;
    const handleEnd = () => {
      if (done) return;
      done = true;
      setIsPresent(false);
      onExitCompleteRef.current?.();
    };
    const fallback = window.setTimeout(handleEnd, motionTimeout + 50);

    node.addEventListener("transitionend", handleEnd, { once: true });
    node.addEventListener("animationend", handleEnd, { once: true });

    return () => {
      window.clearTimeout(fallback);
      node.removeEventListener("transitionend", handleEnd);
      node.removeEventListener("animationend", handleEnd);
    };
  }, [isPresent, present]);

  const ref = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  return { isPresent, ref };
}
