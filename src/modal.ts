"use client";

import {
  ModalClose,
  ModalDescription,
  ModalPortal,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
} from "./primitives/modal/index.js";

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

export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Portal: ModalPortal,
  Title: ModalTitle,
  Description: ModalDescription,
  Close: ModalClose,
} as const;
