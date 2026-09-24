"use client";
import { ScrollAreaRoot, ScrollAreaRootProvider, ScrollAreaViewport, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaCorner, ScrollAreaContext } from "./primitives/scroll-area/index.js";
export * from "./primitives/scroll-area/index.js";
export const ScrollArea = {
  Root: ScrollAreaRoot, RootProvider: ScrollAreaRootProvider, Viewport: ScrollAreaViewport,
  Content: ScrollAreaContent, Scrollbar: ScrollAreaScrollbar, Thumb: ScrollAreaThumb,
  Corner: ScrollAreaCorner, Context: ScrollAreaContext,
} as const;
