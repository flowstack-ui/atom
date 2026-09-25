"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { VisuallyHiddenRoot } from "../visually-hidden/index.js";
import { useDirection } from "../direction/index.js";
import { resolveActivation, type DragDropActivation } from "./options.js";
import { useSpatialLayout, spatialDistance, compareDistance } from "./spatial.js";
import { scrollDragAncestors } from "./scroll.js";
import { revealWithin } from "../../utils/revealWithin.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import {
  DragDropContextProvider,
  type DragDropContextValue,
  type DragDropDetails,
  type DragDropInput,
  type DragDropMessages,
  type DragDropOrientation,
  type DragDropPosition,
  type DragDropSourceRegistration,
  type DragDropState,
  type DragDropTargetRegistration,
} from "./context.js";

export interface DragDropRootProps {
  activation?: DragDropActivation;
  /** Scroll eligible ancestors near their edges during pointer dragging. */
  autoScroll?: boolean;
  /** Resolve gaps between linear targets; never accepts points outside their bounds. */
  targetStrategy?: "pointer" | "closest";
  children?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  orientation?: DragDropOrientation;
  instructions: string;
  messages?: DragDropMessages;
  onDragStart?: (details: Pick<DragDropDetails, "activeValue" | "input">) => void;
  onDragMove?: (details: DragDropDetails) => void;
  onDragEnd?: (details: DragDropDetails) => void;
  onDragCancel?: (details: Pick<DragDropDetails, "activeValue" | "input">) => void;
}

const idleState: DragDropState = {
  activeValue: null,
  deltaX: 0,
  deltaY: 0,
  input: null,
  overValue: null,
  position: null,
};

function documentOrder(first: HTMLElement, second: HTMLElement): number {
  if (first === second) return 0;
  const position = first.compareDocumentPosition(second);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
  return 0;
}

function targetRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  // Reorder feedback must not move its own hit zones and cause target jitter.
  const translate = element.hasAttribute("data-reorder-geometry")
    ? element.ownerDocument.defaultView?.getComputedStyle(element).translate : "none";
  const [x, y] = (translate ?? "none").split(" ").map(value => parseFloat(value) || 0);
  return { left: rect.left - x, right: rect.right - x,
    top: rect.top - (y ?? 0), bottom: rect.bottom - (y ?? 0), width: rect.width, height: rect.height };
}

function pointInsideClippingAncestors(element: HTMLElement, point: { x: number; y: number }) {
  const win = element.ownerDocument.defaultView;
  if (!win || point.x < 0 || point.y < 0 || point.x > win.innerWidth || point.y > win.innerHeight) return false;
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const style = win.getComputedStyle(parent);
    const rect = parent.getBoundingClientRect();
    if (/auto|scroll|hidden|clip/.test(style.overflowX) && (point.x < rect.left || point.x > rect.right)) return false;
    if (/auto|scroll|hidden|clip/.test(style.overflowY) && (point.y < rect.top || point.y > rect.bottom)) return false;
  }
  return true;
}

function getHumanPosition(
  state: Pick<DragDropState, "activeValue" | "overValue" | "position">,
  targets: DragDropTargetRegistration[],
) {
  const activeIndex = targets.findIndex((target) => target.value === state.activeValue);
  if (state.position === "on" && state.overValue === state.activeValue && activeIndex >= 0) {
    return { position: activeIndex + 1, total: targets.length };
  }
  const availableTargets = activeIndex >= 0 && state.overValue !== state.activeValue
    ? targets.filter((target) => target.value !== state.activeValue)
    : targets;
  const targetIndex = availableTargets.findIndex((target) => target.value === state.overValue);
  const position = targetIndex + (state.position === "after" ? 2 : 1);
  return {
    position: Math.max(1, Math.min(position, targets.length)),
    total: targets.length,
  };
}

export function DragDropRoot({
  activation: activationOptions,
  autoScroll = true,
  targetStrategy = "pointer",
  children,
  disabled = false,
  readOnly = false,
  orientation = "vertical",
  instructions,
  messages,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: DragDropRootProps) {
  const dir = useDirection();
  const layout = useSpatialLayout();
  const activation = useMemo(() => resolveActivation(activationOptions),
    [activationOptions?.distance, activationOptions?.touchDelay, activationOptions?.touchTolerance]);
  const instructionsId = useId();
  const sourcesRef = useRef(new Map<string, DragDropSourceRegistration>());
  const targetsRef = useRef(new Map<string, DragDropTargetRegistration>());
  const originRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef({ x: 0, y: 0 });
  const [state, setState] = useState<DragDropState>(idleState);
  const stateRef = useRef(state);
  const [announcement, setAnnouncement] = useState("");

  const updateState = useCallback((next: DragDropState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const orderedTargets = useCallback(() => {
    return [...targetsRef.current.values()]
      .filter((target) => !target.disabled && target.element.isConnected)
      .sort((first, second) => documentOrder(first.element, second.element));
  }, []);

  const labelFor = useCallback((value: string) => {
    return sourcesRef.current.get(value)?.label ?? value;
  }, []);

  const announceMove = useCallback((next: DragDropState) => {
    if (!next.activeValue || !next.overValue || !next.position) return;
    const targets = orderedTargets();
    if (!targets.some((target) => target.value === next.overValue)) return;
    const label = labelFor(next.activeValue);
    const target = targets.find((candidate) => candidate.value === next.overValue);
    if (!target) return;
    if (target.mode === "on" && target.value !== next.activeValue) {
      setAnnouncement(messages?.movedOn?.(label, target.label)
        ?? `${label} will move to ${target.label}.`);
      return;
    }
    const human = getHumanPosition(next, targets);
    setAnnouncement(messages?.moved?.(label, human.position, human.total)
      ?? `${label} will move to position ${human.position} of ${human.total}.`);
  }, [labelFor, messages, orderedTargets]);

  const registerSource = useCallback((registration: DragDropSourceRegistration) => {
    sourcesRef.current.set(registration.value, registration);
    return () => {
      if (sourcesRef.current.get(registration.value) === registration) {
        sourcesRef.current.delete(registration.value);
      }
    };
  }, []);

  const registerTarget = useCallback((registration: DragDropTargetRegistration) => {
    targetsRef.current.set(registration.value, registration);
    return () => {
      if (targetsRef.current.get(registration.value) === registration) {
        targetsRef.current.delete(registration.value);
      }
    };
  }, []);

  const begin = useCallback((value: string, input: DragDropInput, point = { x: 0, y: 0 }) => {
    const source = sourcesRef.current.get(value);
    if (disabled || readOnly || !source || source.disabled || stateRef.current.activeValue) return false;
    originRef.current = point;
    pointerRef.current = point;
    const ownTarget = targetsRef.current.get(value);
    const next: DragDropState = {
      sourceRect: (() => {
        const rect = source.element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      })(),
      activeValue: value,
      deltaX: 0,
      deltaY: 0,
      input,
      overValue: ownTarget && !ownTarget.disabled ? value : null,
      position: ownTarget && !ownTarget.disabled ? "on" : null,
    };
    updateState(next);
    setAnnouncement(messages?.grabbed?.(source.label) ?? `${source.label} picked up.`);
    onDragStart?.({ activeValue: value, input });
    return true;
  }, [disabled, messages, onDragStart, readOnly, updateState]);

  const updatePointer = useCallback((point: { x: number; y: number }) => {
    pointerRef.current = point;
    const current = stateRef.current;
    if (current.input !== "pointer" || !current.activeValue) return;
    const activeValue = current.activeValue;
    const targets = orderedTargets().filter(target => pointInsideClippingAncestors(target.element, point));
    const measured = new Map(targets.map(target => [target.element, targetRect(target.element)]));
    const containing = targets.filter((target) => {
      const rect = measured.get(target.element)!;
      return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
    });
    let target = containing.sort((first, second) => {
      const a = measured.get(first.element)!;
      const b = measured.get(second.element)!;
      return a.width * a.height - b.width * b.height;
    })[0];
    if (!target && targetStrategy === "closest" && targets.length) {
      const rects = targets.map(entry => measured.get(entry.element)!);
      const within = point.x >= Math.min(...rects.map(rect => rect.left))
        && point.x <= Math.max(...rects.map(rect => rect.right))
        && point.y >= Math.min(...rects.map(rect => rect.top))
        && point.y <= Math.max(...rects.map(rect => rect.bottom));
      if (within) target = [...targets].sort((a, b) => {
        const first = measured.get(a.element)!, second = measured.get(b.element)!;
        if (layout === "grid") return compareDistance(spatialDistance(first, point), spatialDistance(second, point));
        return orientation === "vertical"
          ? Math.abs(point.y - (first.top + first.height / 2)) - Math.abs(point.y - (second.top + second.height / 2))
          : Math.abs(point.x - (first.left + first.width / 2)) - Math.abs(point.x - (second.left + second.width / 2));
      })[0];
    }
    let position: DragDropPosition | null = null;
    if (target) {
      if (target.mode === "on" || target.value === activeValue) {
        position = "on";
      } else {
        const rect = measured.get(target.element)!;
        position = layout !== "grid" && orientation === "vertical"
          ? point.y < rect.top + rect.height / 2 ? "before" : "after"
          : dir === "rtl"
            ? point.x > rect.left + rect.width / 2 ? "before" : "after"
            : point.x < rect.left + rect.width / 2 ? "before" : "after";
      }
    }
    const next: DragDropState = {
      ...current,
      deltaX: point.x - originRef.current.x,
      deltaY: point.y - originRef.current.y,
      overValue: target?.value ?? null,
      position,
    };
    updateState(next);
    if (next.overValue && next.position) {
      onDragMove?.({
        activeValue,
        input: "pointer",
        overValue: next.overValue,
        position: next.position,
      });
    }
  }, [dir, layout, onDragMove, orderedTargets, orientation, targetStrategy, updateState]);

  const moveKeyboard = useCallback((direction: "end" | "first" | "last" | "start" | "left" | "right" | "up" | "down") => {
    const current = stateRef.current;
    if (current.input !== "keyboard" || !current.activeValue) return;
    const activeValue = current.activeValue;
    const targets = orderedTargets();
    if (targets.length === 0) return;
    const currentValue = current.overValue ?? current.activeValue;
    const currentIndex = targets.findIndex((target) => target.value === currentValue);
    let nextIndex = currentIndex;
    if (direction === "first") nextIndex = 0;
    if (direction === "last") nextIndex = targets.length - 1;
    if (direction === "start") nextIndex = currentIndex < 0 ? targets.length - 1 : Math.max(0, currentIndex - 1);
    if (direction === "end") nextIndex = currentIndex < 0 ? 0 : Math.min(targets.length - 1, currentIndex + 1);
    if (["left", "right", "up", "down"].includes(direction) && currentIndex >= 0) {
      const currentRect = targetRect(targets[currentIndex]!.element);
      const cx = currentRect.left + currentRect.width / 2;
      const cy = currentRect.top + currentRect.height / 2;
      const horizontal = direction === "left" || direction === "right";
      const sign = direction === "left" || direction === "up" ? -1 : 1;
      const candidates = targets.map((entry, index) => ({ index, rect: targetRect(entry.element) }))
        .filter(({ rect, index }) => index !== currentIndex && (horizontal
          ? Math.abs(rect.top - currentRect.top) < Math.min(rect.height, currentRect.height) / 2 && (rect.left + rect.width / 2 - cx) * sign > 1
          : (rect.top + rect.height / 2 - cy) * sign > Math.min(rect.height, currentRect.height) / 2));
      candidates.sort((a, b) => horizontal
        ? Math.abs(a.rect.left + a.rect.width / 2 - cx) - Math.abs(b.rect.left + b.rect.width / 2 - cx)
        : compareDistance([Math.abs(a.rect.top - currentRect.top), Math.abs(a.rect.left + a.rect.width / 2 - cx)], [Math.abs(b.rect.top - currentRect.top), Math.abs(b.rect.left + b.rect.width / 2 - cx)]));
      nextIndex = candidates[0]?.index ?? currentIndex;
    }
    const target = targets[nextIndex];
    if (!target) return;
    revealWithin(target.element, target.element.ownerDocument.body);
    const isStart = direction === "start" || direction === "first" || nextIndex < currentIndex;
    const next: DragDropState = {
      ...current,
      overValue: target.value,
      position: target.mode === "on" || target.value === activeValue
        ? "on"
        : isStart ? "before" : "after",
    };
    updateState(next);
    announceMove(next);
    onDragMove?.({
      activeValue,
      input: "keyboard",
      overValue: target.value,
      position: next.position ?? "on",
    });
  }, [announceMove, onDragMove, orderedTargets, updateState]);

  const cancel = useCallback(() => {
    const current = stateRef.current;
    if (!current.activeValue || !current.input) return;
    const label = labelFor(current.activeValue);
    onDragCancel?.({ activeValue: current.activeValue, input: current.input });
    setAnnouncement(messages?.cancelled?.(label) ?? `${label} movement cancelled.`);
    updateState(idleState);
  }, [labelFor, messages, onDragCancel, updateState]);

  const commit = useCallback(() => {
    const current = stateRef.current;
    if (!current.activeValue || !current.input) return;
    const targets = orderedTargets();
    const target = targets.find((candidate) => candidate.value === current.overValue);
    if (!current.overValue || !current.position || !target) {
      cancel();
      return;
    }
    const details: DragDropDetails = {
      activeValue: current.activeValue,
      input: current.input,
      overValue: current.overValue,
      position: current.position,
    };
    const label = labelFor(current.activeValue);
    onDragEnd?.(details);
    if (target.mode === "on" && target.value !== current.activeValue) {
      setAnnouncement(messages?.droppedOn?.(label, target.label)
        ?? `${label} dropped on ${target.label}.`);
      updateState(idleState);
      return;
    }
    const human = getHumanPosition(current, targets);
    setAnnouncement(messages?.dropped?.(label, human.position, human.total)
      ?? `${label} dropped at position ${human.position} of ${human.total}.`);
    updateState(idleState);
  }, [cancel, labelFor, messages, onDragEnd, orderedTargets, updateState]);

  useEffect(() => {
    const value = state.activeValue;
    if (!value) return;
    if (disabled || readOnly) { cancel(); return; }
    const source = sourcesRef.current.get(value);
    const win = source?.element.ownerDocument.defaultView;
    if (!source || source.disabled || !win) { cancel(); return; }
    let frame = 0;
    let previous = win.performance.now();
    const tick = (time: number) => {
      const current = sourcesRef.current.get(value);
      if (!current || current.disabled || !current.element.isConnected) { cancel(); return; }
      if (stateRef.current.activeValue !== value) return;
      if (autoScroll && stateRef.current.input === "pointer"
        && scrollDragAncestors(current.element, pointerRef.current, time - previous)) {
        updatePointer(pointerRef.current);
      }
      previous = time;
      frame = win.requestAnimationFrame(tick);
    };
    const scroll = () => {
      if (stateRef.current.input === "pointer") updatePointer(pointerRef.current);
    };
    frame = win.requestAnimationFrame(tick);
    win.addEventListener("blur", cancel);
    source.element.ownerDocument.addEventListener("scroll", scroll, true);
    return () => {
      win.cancelAnimationFrame(frame);
      win.removeEventListener("blur", cancel);
      source.element.ownerDocument.removeEventListener("scroll", scroll, true);
    };
  }, [autoScroll, cancel, disabled, readOnly, state.activeValue, updatePointer]);

  useDismissableLayer({
    enabled: Boolean(state.activeValue),
    ownerDocument: state.activeValue ? sourcesRef.current.get(state.activeValue)?.element.ownerDocument : null,
    onEscapeKeyDown: event => { event.preventDefault(); event.stopPropagation(); cancel(); },
    onRequestDismiss: cancel,
  });

  const getSourceElement = useCallback((value: string) => sourcesRef.current.get(value)?.element ?? null, []);
  const contextValue = useMemo<DragDropContextValue>(() => ({
    getSourceElement,
    activation,
    state,
    disabled,
    dir,
    readOnly,
    orientation,
    instructionsId,
    registerSource,
    registerTarget,
    begin,
    updatePointer,
    moveKeyboard,
    commit,
    cancel,
  }), [
    getSourceElement,
    activation,
    begin,
    cancel,
    commit,
    disabled,
    dir,
    instructionsId,
    moveKeyboard,
    orientation,
    readOnly,
    registerSource,
    registerTarget,
    state,
    updatePointer,
  ]);

  return (
    <DragDropContextProvider value={contextValue}>
      {children}
      <VisuallyHiddenRoot id={instructionsId}>{instructions}</VisuallyHiddenRoot>
      <VisuallyHiddenRoot aria-live="assertive" aria-atomic="true" data-slot="drag-drop-announcer">
        {announcement}
      </VisuallyHiddenRoot>
    </DragDropContextProvider>
  );
}
