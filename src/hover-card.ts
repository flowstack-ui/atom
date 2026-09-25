"use client";

import {
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardRootProvider, HoverCardContext,
} from "./primitives/hover-card/index.js";

export {
  getHoverCardArrowGeometry,
  HoverCardArrow,
  HoverCardContextProvider,
  HoverCardContentContextProvider,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
  useHoverCardContentContext,
  useHoverCardContext,
  useHoverCard, HoverCardRootProvider, HoverCardContext,
} from "./primitives/hover-card/index.js";
export type {
  HoverCardAlign,
  HoverCardArrowGeometry,
  HoverCardArrowProps,
  HoverCardContentContextValue,
  HoverCardContentProps,
  HoverCardContextValue,
  HoverCardPortalProps,
  HoverCardRootProps,
  HoverCardSide,
  HoverCardTriggerProps,
  HoverCardRootProviderProps, HoverCardContextProps, UseHoverCardOptions, UseHoverCardReturn,
  HoverCardIds, HoverCardLifecycleOptions, HoverCardOutsideEvents, HoverCardPositioningOptions,
} from "./primitives/hover-card/index.js";

export const HoverCard = {
  Root: HoverCardRoot,
  RootProvider: HoverCardRootProvider,
  Context: HoverCardContext,
  Trigger: HoverCardTrigger,
  Portal: HoverCardPortal,
  Content: HoverCardContent,
  Arrow: HoverCardArrow,
} as const;
