"use client";

import {
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverPortal,
  PopoverRoot,
  PopoverRootProvider,
  PopoverState,
  PopoverIndicator,
  PopoverTrigger,
  PopoverTitle,
} from "./primitives/popover/index.js";

export {
  getPopoverArrowGeometry,
  markPopoverPart,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContentContextProvider,
  PopoverContent,
  PopoverContextProvider,
  PopoverDescription,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  PopoverTitle,
  usePopoverContentContext,
  usePopoverContext,
} from "./primitives/popover/index.js";
export type {
  PopoverAlign,
  PopoverAnchorProps,
  PopoverArrowGeometry,
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverContentContextValue,
  PopoverContentProps,
  PopoverCloseReason,
  PopoverContextValue,
  PopoverDescriptionProps,
  PopoverFinalFocusDetails,
  PopoverFocusTarget,
  PopoverHeadingLevel,
  PopoverInitialFocusDetails,
  PopoverInteractionType,
  PopoverOpenReason,
  PopoverPortalProps,
  PopoverRootProps,
  PopoverSide,
  PopoverTriggerMode,
  PopoverTriggerProps,
  PopoverTitleProps,
} from "./primitives/popover/index.js";

export type {
  OutsideInteractionEvent,
  OutsideInteractionPointerType,
} from "./utils/interactions.js";

export const Popover = {
  RootProvider: PopoverRootProvider,
  State: PopoverState,
  Indicator: PopoverIndicator,
  Root: PopoverRoot,
  Anchor: PopoverAnchor,
  Trigger: PopoverTrigger,
  Portal: PopoverPortal,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
  Arrow: PopoverArrow,
} as const;

export { usePopover, usePopoverState, PopoverRootProvider, PopoverState, PopoverIndicator } from "./primitives/popover/index.js";
export type { UsePopoverOptions, UsePopoverReturn, PopoverRootProviderProps, PopoverStateProps, PopoverIndicatorProps, PopoverPositioningOptions, PopoverIds, PopoverLifecycleOptions, PopoverOutsideEvents } from "./primitives/popover/index.js";
