"use client";

import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "./primitives/tooltip/index.js";

export {
  getTooltipArrowGeometry,
  TooltipArrow,
  TooltipContent,
  TooltipContentContextProvider,
  TooltipContextProvider,
  TooltipPortal,
  TooltipProvider,
  TooltipProviderContextProvider,
  useTooltipContentContext,
  TooltipRoot,
  TooltipTrigger,
  useTooltipContext,
  useTooltipProviderContext,
} from "./primitives/tooltip/index.js";
export type {
  TooltipAlign,
  TooltipArrowGeometry,
  TooltipArrowProps,
  TooltipContentContextValue,
  TooltipContentProps,
  TooltipContextValue,
  TooltipPortalProps,
  TooltipProviderContextValue,
  TooltipProviderProps,
  TooltipRootProps,
  TooltipSide,
  TooltipTriggerProps,
} from "./primitives/tooltip/index.js";

export const Tooltip = {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Portal: TooltipPortal,
  Content: TooltipContent,
  Arrow: TooltipArrow,
} as const;
