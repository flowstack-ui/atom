"use client";

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./primitives/alert-dialog/index.js";

export {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  useAlertDialogContext,
} from "./primitives/alert-dialog/index.js";
export type {
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogCloseReason,
  AlertDialogContentProps,
  AlertDialogContextValue,
  AlertDialogDescriptionProps,
  AlertDialogHeadingLevel,
  AlertDialogOverlayProps,
  AlertDialogPortalProps,
  AlertDialogRootProps,
  AlertDialogTitleProps,
  AlertDialogTriggerProps,
} from "./primitives/alert-dialog/index.js";

export const AlertDialog = {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Portal: AlertDialogPortal,
  Overlay: AlertDialogOverlay,
  Content: AlertDialogContent,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Cancel: AlertDialogCancel,
  Action: AlertDialogAction,
} as const;
