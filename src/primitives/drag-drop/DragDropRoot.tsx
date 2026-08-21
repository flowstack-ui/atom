"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { VisuallyHiddenRoot } from "../visually-hidden/index.js";
import { useDirection } from "../direction/index.js";
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
  const instructionsId = useId();
  const sourcesRef = useRef(new Map<string, DragDropSourceRegistration>());
  const targetsRef = useRef(new Map<string, DragDropTargetRegistration>());
  const originRef = useRef({ x: 0, y: 0 });
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
    const ownTarget = targetsRef.current.get(value);
    const next: DragDropState = {
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
    const current = stateRef.current;
    if (current.input !== "pointer" || !current.activeValue) return;
    const activeValue = current.activeValue;
    const targets = orderedTargets();
    const containing = targets.filter((target) => {
      const rect = target.element.getBoundingClientRect();
      return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
    });
    const target = containing.sort((first, second) => {
      const a = first.element.getBoundingClientRect();
      const b = second.element.getBoundingClientRect();
      return a.width * a.height - b.width * b.height;
    })[0];
    let position: DragDropPosition | null = null;
    if (target) {
      if (target.mode === "on" || target.value === activeValue) {
        position = "on";
      } else {
        const rect = target.element.getBoundingClientRect();
        position = orientation === "vertical"
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
  }, [dir, onDragMove, orderedTargets, orientation, updateState]);

  const moveKeyboard = useCallback((direction: "end" | "first" | "last" | "start") => {
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
    const target = targets[nextIndex];
    if (!target) return;
    const isStart = direction === "start" || direction === "first";
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

  const contextValue = useMemo<DragDropContextValue>(() => ({
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
