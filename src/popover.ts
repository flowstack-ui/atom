"use client";

import {
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "./primitives/popover/index.js";

export {
  getPopoverArrowGeometry,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContentContextProvider,
  PopoverContent,
  PopoverContextProvider,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
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
  PopoverContextValue,
  PopoverPortalProps,
  PopoverRootProps,
  PopoverSide,
  PopoverTriggerMode,
  PopoverTriggerProps,
} from "./primitives/popover/index.js";

export const Popover = {
  Root: PopoverRoot,
  Anchor: PopoverAnchor,
  Trigger: PopoverTrigger,
  Portal: PopoverPortal,
  Content: PopoverContent,
  Arrow: PopoverArrow,
  Close: PopoverClose,
} as const;
