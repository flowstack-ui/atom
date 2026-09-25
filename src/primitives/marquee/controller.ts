"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useDirection } from "../direction/index.js";
import { marqueeDirection, marqueeGeometry, normalizeMarqueeNumbers, type MarqueeSide } from "./geometry.js";

export interface MarqueeOptions {
  id?: string; ids?: Partial<Record<"viewport" | "content", string>>;
  dir?: "ltr" | "rtl"; side?: MarqueeSide; reverse?: boolean;
  speed?: number; spacing?: string; delay?: number; loopCount?: number; autoFill?: boolean;
  paused?: boolean; defaultPaused?: boolean; pauseOnInteraction?: boolean;
  translations?: { regionLabel?: string };
  onPauseChange?: (paused: boolean) => void;
  onLoopComplete?: (details: { iteration: number }) => void;
  onComplete?: (details: { iterations: number }) => void;
}
export type MarqueePauseReason = "user" | "hover" | "focus" | "reduced-motion" | "hidden-document" | "completed" | "unavailable";
export interface MarqueeController {
  requestedPaused: boolean; paused: boolean; static: boolean; pauseReasons: readonly MarqueePauseReason[];
  side: MarqueeSide; dir: "ltr" | "rtl"; orientation: "horizontal" | "vertical"; reversed: boolean;
  duration: number; distance: number; copyCount: number; iteration: number; completed: boolean;
  pause: () => void; resume: () => void; togglePause: () => void; restart: () => void;
}
type Geometry = NonNullable<ReturnType<typeof marqueeGeometry>>;
export interface InternalMarquee extends MarqueeController {
  id: string; options: MarqueeOptions; spacing: string; delay: number; remaining: number; generation: number;
  setRoot: (node: HTMLDivElement | null) => void;
  setViewport: (node: HTMLDivElement | null) => void;
  setContent: (node: HTMLDivElement | null) => void;
  setHasReplica: (value: boolean) => void; setInvalidReplica: (value: boolean) => void;
  setHovered: (value: boolean) => void; setFocused: (value: boolean) => void;
  finishIteration: (last: boolean) => void;
}

export function useMarquee(options: MarqueeOptions = {}): InternalMarquee {
  const generatedId = useId();
  const inheritedDir = useDirection();
  const dir = options.dir ?? inheritedDir, side = options.side ?? "start";
  const { orientation, reversed } = marqueeDirection(side, dir, options.reverse ?? false);
  const numbers = normalizeMarqueeNumbers(options.speed, options.delay, options.loopCount);
  const callbacks = useRef(options); callbacks.current = options;
  const [requestedPaused, setRequestedPaused] = useControllableState({ value: options.paused, defaultValue: options.defaultPaused ?? false, onChange: options.onPauseChange });
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const [hasReplica, setHasReplica] = useState(false), [invalidReplica, setInvalidReplica] = useState(false);
  const [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(true), [hidden, setHidden] = useState(false);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [generation, setGeneration] = useState(0), [iteration, setIteration] = useState(0), [completed, setCompleted] = useState(false);
  const count = useRef(0), done = useRef(false), runStart = useRef(0);
  const bump = useCallback(() => { runStart.current = count.current; setGeneration(value => value + 1); }, []);
  const restart = useCallback(() => {
    count.current = 0; done.current = false; setIteration(0); setCompleted(false);
    bump();
  }, [bump]);
  const pause = useCallback(() => setRequestedPaused(true), [setRequestedPaused]);
  const resume = useCallback(() => setRequestedPaused(false), [setRequestedPaused]);
  const togglePause = useCallback(() => setRequestedPaused(value => !value), [setRequestedPaused]);
  const unavailable = !geometry || !hasReplica || invalidReplica;
  const isStatic = unavailable || focused || reduced || completed;
  const geometryRef = useRef(geometry); geometryRef.current = geometry;
  const spacing = options.spacing ?? "1rem";

  useEffect(() => {
    const doc = root?.ownerDocument, view = doc?.defaultView;
    if (!doc || !view) return;
    const preference = view.matchMedia?.("(prefers-reduced-motion: reduce)");
    const updatePreference = () => { setReduced(preference?.matches ?? true); bump(); };
    const updateVisibility = () => setHidden(doc.visibilityState === "hidden");
    updatePreference(); updateVisibility();
    preference?.addEventListener("change", updatePreference); doc.addEventListener("visibilitychange", updateVisibility);
    return () => { preference?.removeEventListener("change", updatePreference); doc.removeEventListener("visibilitychange", updateVisibility); };
  }, [root, bump]);

  useEffect(() => { restart(); }, [orientation, reversed, numbers.speed, numbers.delay, numbers.loopCount, spacing, restart]);

  useEffect(() => {
    const view = viewport?.ownerDocument.defaultView;
    if (!view || !viewport || !content) return;
    let frame: number | null = null, disposed = false;
    const commit = (next: Geometry | null) => {
      const old = geometryRef.current;
      if (old?.distance === next?.distance && old?.duration === next?.duration && old?.copyCount === next?.copyCount) return;
      geometryRef.current = next;
      setGeometry(next);
      // Coverage cannot wait for the next loop (or a paused loop indefinitely).
      // Copy-only updates preserve the run; new replicas join its current phase.
      // A changed coordinate system starts a fresh cycle, retaining loop count.
      if (old?.distance !== next?.distance || old?.duration !== next?.duration) bump();
    };
    const measure = () => {
      frame = null; if (disposed) return;
      const styles = view.getComputedStyle(viewport);
      const gap = Number.parseFloat(orientation === "horizontal" ? styles.columnGap : styles.rowGap);
      // Percentage gaps are cyclic for intrinsic tracks and cannot define a
      // deterministic travel distance. Accept only resolved finite lengths.
      const validLength = !spacing.includes("%") && (view.CSS?.supports("gap", spacing) ?? true) && Number.isFinite(gap);
      const extent = orientation === "horizontal" ? content.scrollWidth : content.scrollHeight;
      const available = orientation === "horizontal" ? viewport.clientWidth : viewport.clientHeight;
      commit(validLength ? marqueeGeometry(extent, available, Number.isFinite(gap) ? gap : 0, numbers.speed, options.autoFill ?? false) : null);
    };
    const schedule = () => { if (frame === null) frame = view.requestAnimationFrame(measure); };
    const observer = view.ResizeObserver ? new view.ResizeObserver(schedule) : null;
    observer?.observe(viewport); observer?.observe(content);
    const mutations = new view.MutationObserver(() => { restart(); schedule(); });
    mutations.observe(content, { childList: true, subtree: true, characterData: true });
    view.addEventListener("resize", schedule); content.addEventListener("load", schedule, true);
    viewport.ownerDocument.fonts?.addEventListener("loadingdone", schedule);
    schedule();
    return () => { disposed = true; observer?.disconnect(); mutations.disconnect(); view.removeEventListener("resize", schedule); content.removeEventListener("load", schedule, true); viewport.ownerDocument.fonts?.removeEventListener("loadingdone", schedule); if (frame !== null) view.cancelAnimationFrame(frame); };
  }, [viewport, content, orientation, numbers.speed, options.autoFill, spacing, restart, bump]);

  const finishIteration = useCallback((last: boolean) => {
    if (done.current) return;
    const next = ++count.current; setIteration(next);
    callbacks.current.onLoopComplete?.({ iteration: next });
    if (last) { done.current = true; setCompleted(true); callbacks.current.onComplete?.({ iterations: next }); }
  }, [bump]);
  const changeFocus = useCallback((next: boolean) => { setFocused(next); bump(); }, [bump]);
  const pauseReasons: MarqueePauseReason[] = [];
  if (requestedPaused) pauseReasons.push("user");
  if (hovered && options.pauseOnInteraction) pauseReasons.push("hover");
  if (focused) pauseReasons.push("focus");
  if (reduced) pauseReasons.push("reduced-motion");
  if (hidden) pauseReasons.push("hidden-document");
  if (completed) pauseReasons.push("completed");
  if (unavailable) pauseReasons.push("unavailable");
  return useMemo(() => ({ requestedPaused, paused: pauseReasons.length > 0, static: isStatic, pauseReasons, side, dir, orientation, reversed,
    duration: geometry?.duration ?? 0, distance: geometry?.distance ?? 0, copyCount: isStatic ? 0 : geometry?.copyCount ?? 0,
    iteration, completed, pause, resume, togglePause, restart,
    id: options.id ?? `marquee-${generatedId}`, options, spacing, delay: numbers.delay, remaining: numbers.loopCount ? Math.max(1, numbers.loopCount - runStart.current) : 0,
    generation, setRoot, setViewport, setContent, setHasReplica, setInvalidReplica, setHovered, setFocused: changeFocus, finishIteration,
  }), [requestedPaused, isStatic, side, dir, orientation, reversed, geometry, iteration, completed, pause, resume, togglePause, restart, options, spacing, numbers.delay, numbers.loopCount, generatedId, generation, changeFocus, finishIteration, hovered, focused, reduced, hidden, unavailable]);
}
