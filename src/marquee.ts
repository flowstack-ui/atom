"use client";

import { MarqueeRoot, MarqueeRootProvider, MarqueeContext, MarqueeViewport, MarqueeContent, MarqueeItem } from "./primitives/marquee/parts.js";
export { MarqueeRoot, MarqueeRootProvider, MarqueeContext, MarqueeViewport, MarqueeContent, MarqueeItem, useMarqueeContext } from "./primitives/marquee/parts.js";
export type { MarqueeRootProps, MarqueeRootProviderProps, MarqueeContextProps, MarqueeViewportProps, MarqueeContentProps, MarqueeItemProps } from "./primitives/marquee/parts.js";
export { useMarquee } from "./primitives/marquee/controller.js";
export type { MarqueeOptions, MarqueeController, MarqueePauseReason } from "./primitives/marquee/controller.js";
export type { MarqueeSide } from "./primitives/marquee/geometry.js";
export const Marquee = { Root: MarqueeRoot, RootProvider: MarqueeRootProvider, Context: MarqueeContext, Viewport: MarqueeViewport, Content: MarqueeContent, Item: MarqueeItem } as const;
