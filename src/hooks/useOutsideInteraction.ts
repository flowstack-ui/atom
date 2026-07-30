"use client";

import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";
import type {
  OutsideInteractionEvent,
  OutsideInteractionPointerType,
} from "../utils/interactions.js";

const POINTER_MOVEMENT_THRESHOLD = 8;

type OutsideInteractionLayer = {
  id: number;
  refsRef: MutableRefObject<RefObject<HTMLElement | null>[]>;
  ignoreRef: MutableRefObject<((target: Node) => boolean) | undefined>;
  onInteractOutsideRef: MutableRefObject<
    (event: OutsideInteractionEvent) => void
  >;
};

type PointerSession = {
  id: number;
  layerId: number;
  pointerType: OutsideInteractionPointerType;
  startedOutside: boolean;
  x: number;
  y: number;
  moved: boolean;
};

type CompletedPointerSession = {
  completedAt: number;
  layerId: number;
  pointerType: OutsideInteractionPointerType;
  eligible: boolean;
};

const layers: OutsideInteractionLayer[] = [];
let nextLayerId = 0;
let activePointer: PointerSession | null = null;
let completedPointer: CompletedPointerSession | null = null;
let suppressClickUntil = 0;

function getTopLayer(): OutsideInteractionLayer | undefined {
  return layers[layers.length - 1];
}

function isOutside(layer: OutsideInteractionLayer, target: Node): boolean {
  for (const ref of layer.refsRef.current) {
    if (ref.current?.contains(target)) return false;
  }

  return !layer.ignoreRef.current?.(target);
}

function getPointerType(pointerType: string): OutsideInteractionPointerType {
  if (pointerType === "touch" || pointerType === "pen") return pointerType;
  return "mouse";
}

function clearPointerSession(): void {
  activePointer = null;
  completedPointer = null;
}

function cancelPointerSession(): void {
  if (activePointer || completedPointer) suppressClickUntil = Date.now() + 500;
  clearPointerSession();
}

function handlePointerDown(event: PointerEvent): void {
  const layer = getTopLayer();
  completedPointer = null;
  suppressClickUntil = 0;

  if (
    !layer ||
    !event.isPrimary ||
    event.button !== 0 ||
    activePointer !== null
  ) {
    cancelPointerSession();
    return;
  }

  activePointer = {
    id: event.pointerId,
    layerId: layer.id,
    pointerType: getPointerType(event.pointerType),
    startedOutside: isOutside(layer, event.target as Node),
    x: event.clientX,
    y: event.clientY,
    moved: false,
  };
}

function handlePointerMove(event: PointerEvent): void {
  if (!activePointer) return;
  if (event.pointerId !== activePointer.id) {
    cancelPointerSession();
    return;
  }

  if (
    Math.hypot(
      event.clientX - activePointer.x,
      event.clientY - activePointer.y,
    ) > POINTER_MOVEMENT_THRESHOLD
  ) {
    activePointer.moved = true;
  }
}

function handlePointerUp(event: PointerEvent): void {
  const layer = getTopLayer();
  if (!activePointer || event.pointerId !== activePointer.id || !layer) {
    cancelPointerSession();
    return;
  }

  completedPointer = {
    completedAt: Date.now(),
    layerId: activePointer.layerId,
    pointerType: activePointer.pointerType,
    eligible:
      activePointer.layerId === layer.id &&
      activePointer.startedOutside &&
      !activePointer.moved &&
      isOutside(layer, event.target as Node),
  };
  activePointer = null;
}

function createOutsideInteractionEvent(
  originalEvent: MouseEvent,
  pointerType: OutsideInteractionPointerType,
): OutsideInteractionEvent {
  let defaultPrevented = false;

  return {
    originalEvent,
    pointerType,
    target: originalEvent.target as Node,
    get defaultPrevented() {
      return defaultPrevented;
    },
    preventDefault() {
      defaultPrevented = true;
    },
  };
}

function handleClick(event: MouseEvent): void {
  if (Date.now() < suppressClickUntil) {
    suppressClickUntil = 0;
    return;
  }

  const layer = getTopLayer();
  if (!layer) {
    clearPointerSession();
    return;
  }

  const pointerSession = completedPointer &&
    Date.now() - completedPointer.completedAt <= 500
    ? completedPointer
    : null;
  completedPointer = null;

  if (pointerSession) {
    if (
      pointerSession.layerId !== layer.id ||
      !pointerSession.eligible ||
      !isOutside(layer, event.target as Node)
    ) {
      return;
    }
  } else if (!isOutside(layer, event.target as Node)) {
    return;
  }

  const interactionEvent = createOutsideInteractionEvent(
    event,
    pointerSession?.pointerType ?? (event.detail === 0 ? "virtual" : "mouse"),
  );
  layer.onInteractOutsideRef.current(interactionEvent);
}

function addDocumentListeners(): void {
  if (layers.length !== 1) return;
  document.addEventListener("pointerdown", handlePointerDown, true);
  document.addEventListener("pointermove", handlePointerMove, true);
  document.addEventListener("pointerup", handlePointerUp, true);
  document.addEventListener("pointercancel", cancelPointerSession, true);
  document.addEventListener("click", handleClick, true);
  document.addEventListener("scroll", cancelPointerSession, true);
  window.addEventListener("scroll", cancelPointerSession, true);
}

function removeDocumentListeners(): void {
  if (layers.length !== 0) return;
  document.removeEventListener("pointerdown", handlePointerDown, true);
  document.removeEventListener("pointermove", handlePointerMove, true);
  document.removeEventListener("pointerup", handlePointerUp, true);
  document.removeEventListener("pointercancel", cancelPointerSession, true);
  document.removeEventListener("click", handleClick, true);
  document.removeEventListener("scroll", cancelPointerSession, true);
  window.removeEventListener("scroll", cancelPointerSession, true);
  clearPointerSession();
  suppressClickUntil = 0;
}

export interface UseOutsideInteractionOptions {
  refs: RefObject<HTMLElement | null>[];
  onInteractOutside: (event: OutsideInteractionEvent) => void;
  enabled?: boolean;
  ignore?: (target: Node) => boolean;
}

export function useOutsideInteraction({
  refs,
  onInteractOutside,
  enabled = false,
  ignore,
}: UseOutsideInteractionOptions): void {
  const refsRef = useRef(refs);
  refsRef.current = refs;
  const onInteractOutsideRef = useRef(onInteractOutside);
  onInteractOutsideRef.current = onInteractOutside;
  const ignoreRef = useRef(ignore);
  ignoreRef.current = ignore;

  useEffect(() => {
    if (!enabled) return undefined;

    const layer: OutsideInteractionLayer = {
      id: nextLayerId++,
      refsRef,
      ignoreRef,
      onInteractOutsideRef,
    };
    layers.push(layer);
    addDocumentListeners();

    return () => {
      const index = layers.findIndex((item) => item.id === layer.id);
      if (index !== -1) layers.splice(index, 1);
      if (activePointer?.layerId === layer.id) clearPointerSession();
      if (completedPointer?.layerId === layer.id) clearPointerSession();
      removeDocumentListeners();
    };
  }, [enabled]);
}
