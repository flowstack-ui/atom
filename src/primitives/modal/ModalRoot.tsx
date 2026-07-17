"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ModalContextProvider,
  useOptionalModalContext,
  type ModalCloseReason,
  type ModalContextValue,
  type ModalFinalFocusDetails,
  type ModalInitialFocusDetails,
  type ModalInteractionType,
} from "./context.js";
import { getModalPartPresence, type ModalPartKind } from "./parts.js";
import { useCreateFocusScope } from "../../hooks/focus.js";
import {
  activateModalLayer,
  createModalLayer,
  isTopModalLayer,
  registerModalBranch,
  subscribeModalLayer,
} from "./layer.js";

export interface ModalRootProps {
  /** Compound children. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean, reason?: ModalCloseReason) => void;
  /** Close on Escape key press. */
  closeOnEscape?: boolean;
  /** Close when clicking the backdrop. */
  closeOnBackdropClick?: boolean;
  /** Prevent modal from opening. */
  disabled?: boolean;
  /** Keep content DOM mounted when closed. */
  keepMounted?: boolean;
}

export function ModalRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  disabled = false,
  keepMounted = false,
}: ModalRootProps) {
  const parentModal = useOptionalModalContext();
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const modalId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const initialParts = getModalPartPresence(children);
  const [partCounts, setPartCounts] = useState({ title: 0, description: 0 });
  const [partRegistryReady, setPartRegistryReady] = useState(false);
  const pendingOpenRef = useRef<(
    ModalInitialFocusDetails & { expiresAt: number }
  ) | null>(null);
  const pendingCloseRef = useRef<(
    ModalFinalFocusDetails & { expiresAt: number }
  ) | null>(null);
  const initialFocusDetailsRef = useRef<ModalInitialFocusDetails>({
    interactionType: "programmatic",
  });
  const finalFocusDetailsRef = useRef<ModalFinalFocusDetails>({
    interactionType: "programmatic",
  });
  const previousOpenRef = useRef(isOpen);
  const interactionRef = useRef<{
    interactionType: Exclude<ModalInteractionType, "programmatic">;
    target: EventTarget | null;
    expiresAt: number;
  } | null>(null);
  const focusScope = useCreateFocusScope();
  const layer = useMemo(
    () => createModalLayer(parentModal?.layer ?? null),
    [parentModal?.layer],
  );
  const [, setLayerRevision] = useState(0);

  useLayoutEffect(
    () => subscribeModalLayer(layer, () => {
      setLayerRevision((revision) => revision + 1);
    }),
    [layer],
  );

  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    return activateModalLayer(layer, document);
  }, [isOpen, layer]);

  const registerBranch = useCallback(
    (branch: HTMLElement) => {
      const unregisterLayer = registerModalBranch(layer, branch);
      const unregisterFocusScope = focusScope.registerContainer(branch, {
        focusContainment: "owned",
        tabParticipation: "delegate",
        scrollParticipation: "allowed",
        isolation: "owned",
      });
      return () => {
        unregisterFocusScope();
        unregisterLayer();
      };
    },
    [focusScope, layer],
  );

  const isTopLayer = isTopModalLayer(layer);

  if (previousOpenRef.current !== isOpen) {
    if (isOpen) {
      const pending = pendingOpenRef.current;
      initialFocusDetailsRef.current = pending && pending.expiresAt >= Date.now()
        ? { interactionType: pending.interactionType }
        : { interactionType: "programmatic" };
      pendingOpenRef.current = null;
    } else {
      const pending = pendingCloseRef.current;
      finalFocusDetailsRef.current = pending && pending.expiresAt >= Date.now()
        ? { interactionType: pending.interactionType, reason: pending.reason }
        : { interactionType: "programmatic" };
      pendingCloseRef.current = null;
    }
    previousOpenRef.current = isOpen;
  }

  useEffect(() => {
    setPartRegistryReady(true);
  }, []);

  const registerPart = useCallback((kind: ModalPartKind) => {
    let registered = true;
    setPartCounts((counts) => ({ ...counts, [kind]: counts[kind] + 1 }));

    return () => {
      if (!registered) return;
      registered = false;
      setPartCounts((counts) => ({
        ...counts,
        [kind]: Math.max(0, counts[kind] - 1),
      }));
    };
  }, []);

  const setOpen = useCallback(
    (value: boolean, reason?: ModalCloseReason) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value, reason);
    },
    [isControlled, onOpenChange],
  );

  const onOpen = useCallback((interactionType: ModalInteractionType = "programmatic") => {
    if (disabled) return;
    const transaction = { interactionType, expiresAt: Date.now() + 1000 };
    pendingOpenRef.current = transaction;
    setTimeout(() => {
      if (pendingOpenRef.current === transaction) pendingOpenRef.current = null;
    }, 1000);
    setOpen(true);
  }, [disabled, setOpen]);

  const onClose = useCallback(
    (
      reason?: ModalCloseReason,
      interactionType: ModalInteractionType = "programmatic",
    ) => {
      const transaction = {
        interactionType,
        reason,
        expiresAt: Date.now() + 1000,
      };
      pendingCloseRef.current = transaction;
      setTimeout(() => {
        if (pendingCloseRef.current === transaction) pendingCloseRef.current = null;
      }, 1000);
      setOpen(false, reason);
    },
    [setOpen],
  );

  const recordInteraction = useCallback(
    (
      interactionType: Exclude<ModalInteractionType, "programmatic">,
      target: EventTarget | null,
    ) => {
      interactionRef.current = {
        interactionType,
        target,
        expiresAt: Date.now() + 1000,
      };
    },
    [],
  );

  const consumeInteraction = useCallback((target: EventTarget | null) => {
    const interaction = interactionRef.current;
    interactionRef.current = null;
    if (
      !interaction ||
      interaction.target !== target ||
      interaction.expiresAt < Date.now()
    ) {
      return "programmatic";
    }
    return interaction.interactionType;
  }, []);

  const clearInteraction = useCallback((target?: EventTarget | null) => {
    if (target !== undefined && interactionRef.current?.target !== target) return;
    interactionRef.current = null;
  }, []);

  const contextValue: ModalContextValue = useMemo(
    () => ({
      isOpen,
      onOpen,
      onClose,
      initialFocusDetails: initialFocusDetailsRef.current,
      finalFocusDetails: finalFocusDetailsRef.current,
      recordInteraction,
      consumeInteraction,
      clearInteraction,
      layer,
      isTopLayer,
      focusScope,
      registerBranch,
      modalId,
      titleId,
      descriptionId,
      initialTitlePresent: initialParts.title,
      initialDescriptionPresent: initialParts.description,
      titleCount: partCounts.title,
      descriptionCount: partCounts.description,
      partRegistryReady,
      registerPart,
      triggerRef,
      disabled,
      closeOnEscape,
      closeOnBackdropClick,
      keepMounted,
    }),
    [
      isOpen,
      onOpen,
      onClose,
      initialFocusDetailsRef.current,
      finalFocusDetailsRef.current,
      recordInteraction,
      consumeInteraction,
      clearInteraction,
      layer,
      isTopLayer,
      focusScope,
      registerBranch,
      modalId,
      titleId,
      descriptionId,
      initialParts.title,
      initialParts.description,
      partCounts.title,
      partCounts.description,
      partRegistryReady,
      registerPart,
      triggerRef,
      disabled,
      closeOnEscape,
      closeOnBackdropClick,
      keepMounted,
    ],
  );

  return (
    <ModalContextProvider value={contextValue}>
      {children}
    </ModalContextProvider>
  );
}
