"use client";

import {
  DrawerClose,
  DrawerContext,
  DrawerPositioner,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./primitives/drawer/index.js";
import {
  ModalRoot,
} from "./primitives/modal/index.js";

export {
  DrawerClose,
  DrawerContext,
  DrawerPositioner,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./primitives/drawer/index.js";
export type {
  DrawerContextProps,
  DrawerContextValue,
  DrawerPositionerProps,
  DrawerCloseProps,
  DrawerContentProps,
  DrawerDescriptionProps,
  DrawerHeadingLevel,
  DrawerOverlayProps,
  DrawerPortalProps,
  DrawerTitleProps,
  DrawerTriggerProps,
} from "./primitives/drawer/index.js";
export {
  ModalContextProvider,
  ModalRoot,
  useModalContent,
  useModalContext,
} from "./primitives/modal/index.js";
export type {
  ModalCloseProps,
  ModalCloseReason,
  ModalContextValue,
  ModalFinalFocusDetails,
  ModalFocusTarget,
  ModalInitialFocusDetails,
  ModalInteractionType,
  ModalDescriptionProps,
  ModalHeadingLevel,
  ModalRootProps,
  ModalTitleProps,
  ModalTriggerProps,
  UseModalContentOptions,
  UseModalContentReturn,
} from "./primitives/modal/index.js";

export const Drawer = {
  Context: DrawerContext,
  Positioner: DrawerPositioner,
  Root: ModalRoot,
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
} as const;
