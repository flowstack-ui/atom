"use client";

import {
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
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
} from "./primitives/hover-card/index.js";

export const HoverCard = {
  Root: HoverCardRoot,
  Trigger: HoverCardTrigger,
  Portal: HoverCardPortal,
  Content: HoverCardContent,
  Arrow: HoverCardArrow,
} as const;
