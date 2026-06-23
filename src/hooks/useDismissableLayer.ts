"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

type DismissableLayer = {
  id: number;
  onEscapeKeyDownRef: MutableRefObject<(event: KeyboardEvent) => void>;
};

const layers: DismissableLayer[] = [];
let nextLayerId = 0;
let listenerCount = 0;

function handleDocumentKeyDown(event: KeyboardEvent): void {
  if (event.key !== "Escape") return;

  const topLayer = layers[layers.length - 1];
  topLayer?.onEscapeKeyDownRef.current(event);
}

function addDocumentListener(): void {
  if (listenerCount === 0) {
    document.addEventListener("keydown", handleDocumentKeyDown, true);
  }

  listenerCount += 1;
}

function removeDocumentListener(): void {
  listenerCount -= 1;

  if (listenerCount === 0) {
    document.removeEventListener("keydown", handleDocumentKeyDown, true);
  }
}

export interface UseDismissableLayerOptions {
  /** Whether this layer participates in global dismissal. */
  enabled: boolean;
  /** Called only for the topmost enabled layer when Escape is pressed. */
  onEscapeKeyDown: (event: KeyboardEvent) => void;
}

export function useDismissableLayer({
  enabled,
  onEscapeKeyDown,
}: UseDismissableLayerOptions): void {
  const onEscapeKeyDownRef = useRef(onEscapeKeyDown);
  onEscapeKeyDownRef.current = onEscapeKeyDown;

  useEffect(() => {
    if (!enabled) return undefined;

    const layer: DismissableLayer = {
      id: nextLayerId++,
      onEscapeKeyDownRef,
    };

    layers.push(layer);
    addDocumentListener();

    return () => {
      const index = layers.findIndex((item) => item.id === layer.id);
      if (index !== -1) layers.splice(index, 1);
      removeDocumentListener();
    };
  }, [enabled]);
}
