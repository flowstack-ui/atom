"use client";

import {
  ScrollAreaRoot,
  ScrollAreaViewport,
} from "./primitives/scroll-area/index.js";

export {
  ScrollAreaContextProvider,
  ScrollAreaRoot,
  ScrollAreaViewport,
  useScrollAreaContext,
} from "./primitives/scroll-area/index.js";
export type {
  ScrollAreaContextValue,
  ScrollAreaOrientation,
  ScrollAreaRootProps,
  ScrollAreaViewportProps,
} from "./primitives/scroll-area/index.js";

export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
} as const;
