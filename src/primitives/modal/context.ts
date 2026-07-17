"use client";

import { createContext, useContext, type RefObject } from "react";
import type { ModalPartKind } from "./parts.js";
import type { FocusScope } from "../../hooks/focus.js";
import type { ModalLayer } from "./layer.js";

export type ModalCloseReason =
  | "actionClick"
  | "backdropClick"
  | "cancelClick"
  | "closeClick"
  | "escapeKeyDown";

export type ModalInteractionType =
  | "keyboard"
  | "mouse"
  | "touch"
  | "pen"
  | "programmatic";

export interface ModalInitialFocusDetails {
  /** Interaction that opened the modal. */
  interactionType: ModalInteractionType;
}

export interface ModalFinalFocusDetails {
  /** Interaction that closed the modal. */
  interactionType: ModalInteractionType;
  /** Atom close reason, when closure came from a Modal-family control. */
  reason?: ModalCloseReason;
}

export interface ModalContextValue {
  /** Whether the modal is open. */
  isOpen: boolean;
  /** Open the modal. */
  onOpen: (interactionType?: ModalInteractionType) => void;
  /** Close the modal, optionally with a reason. */
  onClose: (
    reason?: ModalCloseReason,
    interactionType?: ModalInteractionType,
  ) => void;
  /** Interaction that produced the current opening transition. */
  initialFocusDetails: ModalInitialFocusDetails;
  /** Interaction that produced the current closing transition. */
  finalFocusDetails: ModalFinalFocusDetails;
  /** @internal Records a pending activation interaction for a DOM target. */
  recordInteraction: (
    interactionType: Exclude<ModalInteractionType, "programmatic">,
    target: EventTarget | null,
  ) => void;
  /** @internal Consumes the pending activation interaction for a DOM target. */
  consumeInteraction: (target: EventTarget | null) => ModalInteractionType;
  /** @internal Clears a pending activation interaction. */
  clearInteraction: (target?: EventTarget | null) => void;
  /** @internal Shared layer record for nesting and owned branches. */
  layer: ModalLayer;
  /** Whether this is the active topmost modal layer. */
  isTopLayer: boolean;
  /** @internal Focus scope shared by Content and owned branches. */
  focusScope: FocusScope;
  /** @internal Registers a consumer-owned portalled branch. */
  registerBranch: (branch: HTMLElement) => () => void;
  /** Unique ID for the modal content element. */
  modalId: string;
  /** Unique ID for the title element. */
  titleId: string;
  /** Unique ID for the description element. */
  descriptionId: string;
  /** @internal Whether a Title was statically visible to the root during render. */
  initialTitlePresent: boolean;
  /** @internal Whether a Description was statically visible to the root during render. */
  initialDescriptionPresent: boolean;
  /** @internal Number of committed Title elements. */
  titleCount: number;
  /** @internal Number of committed Description elements. */
  descriptionCount: number;
  /** @internal Whether committed part registration is authoritative. */
  partRegistryReady: boolean;
  /** @internal Registers a committed Title or Description element. */
  registerPart: (kind: ModalPartKind) => () => void;
  /** Ref to the trigger element for focus restore. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Whether the modal is disabled. */
  disabled: boolean;
  /** Whether Escape closes the modal. */
  closeOnEscape: boolean;
  /** Whether clicking the backdrop closes the modal. */
  closeOnBackdropClick: boolean;
  /** Whether content stays mounted when closed. */
  keepMounted: boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);
ModalContext.displayName = "ModalContext";

export const ModalContextProvider = ModalContext.Provider;

export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("Modal compound components must be used within <ModalRoot>");
  }
  return ctx;
}

/** @internal Reads a parent Modal context without requiring one. */
export function useOptionalModalContext(): ModalContextValue | null {
  return useContext(ModalContext);
}
