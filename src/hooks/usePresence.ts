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

function parseStringList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseIterationValue(value: string): number {
  const trimmed = value.trim();
  // Infinite animations never emit animationend, so use one cycle as the
  // bounded cleanup fallback rather than retaining a closed layer forever.
  if (trimmed === "infinite") return 1;
  return Math.max(0, Number.parseFloat(trimmed) || 0);
}

function parseIterationList(value: string): number[] {
  return value.split(",").map(parseIterationValue);
}

function getRepeatedValue(
  values: number[],
  index: number,
  fallback: number,
): number {
  if (values.length === 0) return fallback;
  return values[index % values.length] ?? fallback;
}

function maxTransitionTime(styles: CSSStyleDeclaration): number {
  const properties = parseStringList(styles.transitionProperty);
  const durations = parseTimeList(styles.transitionDuration);
  const delays = parseTimeList(styles.transitionDelay);
  const itemCount = properties.length || Math.max(
    durations.length,
    delays.length,
  );
  let max = 0;

  for (let index = 0; index < itemCount; index += 1) {
    if (properties[index] === "none") continue;
    const duration = getRepeatedValue(durations, index, 0);
    const delay = getRepeatedValue(delays, index, 0);
    if (duration > 0) max = Math.max(max, duration + delay);
  }

  return Math.max(0, max);
}

function maxAnimationTime(styles: CSSStyleDeclaration): number {
  const names = parseStringList(styles.animationName);
  const durations = parseTimeList(styles.animationDuration);
  const delays = parseTimeList(styles.animationDelay);
  const iterations = parseIterationList(styles.animationIterationCount);
  const itemCount = names.length || Math.max(
    durations.length,
    delays.length,
    iterations.length,
  );
  let max = 0;

  for (let index = 0; index < itemCount; index += 1) {
    if (names[index] === "none") continue;
    const duration = getRepeatedValue(durations, index, 0);
    const delay = getRepeatedValue(delays, index, 0);
    const iterationCount = getRepeatedValue(iterations, index, 1);
    if (duration > 0 && iterationCount > 0) {
      max = Math.max(max, duration * iterationCount + delay);
    }
  }

  return Math.max(0, max);
}

function getMotionTimeout(node: HTMLElement): number {
  const styles = getComputedStyle(node);
  return Math.max(
    maxTransitionTime(styles),
    maxAnimationTime(styles),
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

    if (!node || motionTimeout === 0) {
      const frame = requestAnimationFrame(() => {
        setIsPresent(false);
        onExitCompleteRef.current?.();
      });
      return () => cancelAnimationFrame(frame);
    }

    let done = false;
    const handleEnd = (event?: Event) => {
      if (event && event.target !== node) return;
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
