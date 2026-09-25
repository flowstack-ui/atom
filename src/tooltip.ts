"use client";

import {
  TooltipArrow,
  TooltipContext,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipRootProvider,
  TooltipTrigger,
} from "./primitives/tooltip/index.js";

export {
  getTooltipArrowGeometry,
  TooltipContext,
  TooltipArrow,
  TooltipContent,
  TooltipContentContextProvider,
  TooltipContextProvider,
  TooltipPortal,
  TooltipProvider,
  TooltipProviderContextProvider,
  useTooltipContentContext,
  TooltipRoot,
  TooltipRootProvider,
  useTooltip,
  TooltipTrigger,
  useTooltipContext,
  useTooltipProviderContext,
} from "./primitives/tooltip/index.js";
export type {
  TooltipState, TooltipStateProps, TooltipPositioningOptions, TooltipIds, TooltipLifecycleOptions,
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
  TooltipRootProviderProps,
  UseTooltipOptions,
  UseTooltipReturn,
  TooltipSide,
  TooltipTriggerProps,
} from "./primitives/tooltip/index.js";

export const Tooltip = {
  Context: TooltipContext,
  Provider: TooltipProvider,
  Root: TooltipRoot,
  RootProvider: TooltipRootProvider,
  Trigger: TooltipTrigger,
  Portal: TooltipPortal,
  Content: TooltipContent,
  Arrow: TooltipArrow,
} as const;
