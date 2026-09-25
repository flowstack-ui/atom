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

export function getMotionTimeout(node: HTMLElement): number {
  const view = node.ownerDocument.defaultView;
  if (!view) return 0;
  const styles = view.getComputedStyle(node);
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

    const view = node?.ownerDocument.defaultView ?? window;
    const motionTimeout = node ? getMotionTimeout(node) : 0;

    if (!node || motionTimeout === 0) {
      const schedule = view.requestAnimationFrame?.bind(view) ?? ((fn: FrameRequestCallback) => view.setTimeout(() => fn(Date.now()), 0));
      const cancel = view.cancelAnimationFrame?.bind(view) ?? view.clearTimeout.bind(view);
      const frame = schedule(() => {
        setIsPresent(false);
        onExitCompleteRef.current?.();
      });
      return () => { cancel(frame); isExitingRef.current = false; };
    }

    let done = false;
    const started = Date.now();
    const handleEnd = (event?: Event) => {
      if (event && event.target !== node) return;
      // One element may run multiple animations. The first end is not the
      // end of the owned exit; retain until the longest effect has completed.
      if (event && Date.now() - started + 16 < motionTimeout) return;
      if (done) return;
      done = true;
      setIsPresent(false);
      onExitCompleteRef.current?.();
    };
    const fallback = view.setTimeout(handleEnd, motionTimeout + 50);

    node.addEventListener("transitionend", handleEnd);
    node.addEventListener("animationend", handleEnd);
    const handleCancel = (event: Event) => {
      if (event.target !== node) return;
      // A cancelled effect cannot produce its end event. Wait for other live
      // effects when the rendering engine can enumerate them.
      if (node.getAnimations?.().some(animation => animation.playState === "running" || animation.pending)) return;
      handleEnd();
    };
    node.addEventListener("transitioncancel", handleCancel);
    node.addEventListener("animationcancel", handleCancel);

    return () => {
      view.clearTimeout(fallback);
      isExitingRef.current = false;
      node.removeEventListener("transitionend", handleEnd);
      node.removeEventListener("animationend", handleEnd);
      node.removeEventListener("transitioncancel", handleCancel);
      node.removeEventListener("animationcancel", handleCancel);
    };
  }, [isPresent, present]);

  const ref = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  return { isPresent, ref };
}
