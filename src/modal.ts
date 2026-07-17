"use client";

import {
  ModalBranch,
  ModalClose,
  ModalDescription,
  ModalPortal,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
} from "./primitives/modal/index.js";

export {
  ModalBranch,
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
  ModalBranchProps,
  ModalCloseProps,
  ModalCloseReason,
  ModalContextValue,
  ModalFinalFocusDetails,
  ModalFocusTarget,
  ModalInitialFocusDetails,
  ModalInteractionType,
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
  Branch: ModalBranch,
  Title: ModalTitle,
  Description: ModalDescription,
  Close: ModalClose,
} as const;
