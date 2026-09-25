"use client";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import {
  createScrollAreaController,
  type ScrollAreaEngine,
} from "./controller.js";
import type { ScrollAreaController, UseScrollAreaProps } from "./types.js";
const engines = new WeakMap<ScrollAreaController, ScrollAreaEngine>();
export function getScrollAreaEngine(value: ScrollAreaController) {
  const engine = engines.get(value);
  if (!engine)
    throw new Error(
      "ScrollArea.RootProvider value must come from useScrollArea.",
    );
  return engine;
}
export function useScrollAreaInternal(
  options: UseScrollAreaProps = {},
  observeNative = true,
): ScrollAreaController {
  const id = useId();
  const ids = {
    root: options.ids?.root ?? `scroll-area-${id}`,
    viewport: options.ids?.viewport ?? `scroll-area-${id}-viewport`,
    content: options.ids?.content ?? `scroll-area-${id}-content`,
    scrollbar: options.ids?.scrollbar ?? `scroll-area-${id}-bar`,
    thumb: options.ids?.thumb ?? `scroll-area-${id}-thumb`,
    corner: options.ids?.corner ?? `scroll-area-${id}-corner`,
  };
  const [engine] = useState(() => {
    const value = createScrollAreaController(
      { ...options, ids },
      observeNative,
    );
    engines.set(value.api, value);
    return value;
  });
  useSyncExternalStore(
    engine.subscribe,
    engine.getSnapshot,
    engine.getServerSnapshot,
  );
  useEffect(() => engine.mount(), [engine]);
  useEffect(() => {
    engine.configure({ orientation: options.orientation, ids });
  }, [
    engine,
    options.orientation,
    ids.root,
    ids.viewport,
    ids.content,
    ids.scrollbar,
    ids.thumb,
    ids.corner,
  ]);
  return engine.api;
}
export function useScrollArea(options: UseScrollAreaProps = {}) {
  return useScrollAreaInternal(options);
}
