"use client";

import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./primitives/dialog/index.js";
import {
  ModalRoot,
} from "./primitives/modal/index.js";

export {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./primitives/dialog/index.js";
export type {
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogHeadingLevel,
  DialogOverlayProps,
  DialogPortalProps,
  DialogTitleProps,
  DialogTriggerProps,
} from "./primitives/dialog/index.js";
export {
  ModalClose,
  ModalContextProvider,
  ModalDescription,
  ModalPortal,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
  useModalContent,
  useModalContext,
} from "./primitives/modal/index.js";
export type {
  ModalCloseProps,
  ModalCloseReason,
  ModalContextValue,
  ModalDescriptionProps,
  ModalHeadingLevel,
  ModalPortalProps,
  ModalRootProps,
  ModalTitleProps,
  ModalTriggerProps,
  UseModalContentOptions,
  UseModalContentReturn,
} from "./primitives/modal/index.js";

export const Dialog = {
  Root: ModalRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
} as const;
