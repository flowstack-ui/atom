"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  type FocusScope,
  focusFirstDescendant,
  useCreateFocusScope,
  useFocusScopeContainer,
  useFocusRestore,
  useFocusTrap,
} from "../../hooks/focus.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { usePresence } from "../../hooks/usePresence.js";
import { useScrollLock } from "../../hooks/useScrollLock.js";
import { useModalContext, type ModalCloseReason } from "./context.js";

export interface UseModalContentOptions {
  /** ARIA role for the content element. */
  role?: "dialog" | "alertdialog";
  /** Fallback accessible label. */
  ariaLabel?: string;
}

export interface UseModalContentReturn {
  /** Whether the content should render. */
  isPresent: boolean;
  /** Whether keep-mounted content is hidden. */
  isHidden: boolean;
  /** Whether the first positioning frame has completed. */
  isPositioned: boolean;
  /** Current data-state value for animation selectors. */
  dataState: "open" | "closed";
  /** Ref for the focus-trapped content wrapper. */
  wrapperRef: RefObject<HTMLDivElement | null>;
  /** Focus scope shared with portalled descendants owned by the modal. */
  focusScope: FocusScope;
  /** Callback ref for the presence-tracked element. */
  presenceRef: (node: HTMLDivElement | null) => void;
  /** ARIA and role props for the content element. */
  contentProps: {
    id: string;
    role: "dialog" | "alertdialog";
    "aria-modal": "true" | undefined;
    "aria-labelledby": string | undefined;
    "aria-describedby": string;
    "aria-label": string | undefined;
    tabIndex: -1;
  };
  /** Close the modal, optionally with a reason. */
  onClose: (reason?: ModalCloseReason) => void;
  /** Whether backdrop click should close the modal. */
  closeOnBackdropClick: boolean;
}

export function useModalContent(
  options: UseModalContentOptions = {},
): UseModalContentReturn {
  const { role = "dialog", ariaLabel } = options;
  const {
    isOpen,
    onClose,
    modalId,
    titleId,
    descriptionId,
    closeOnEscape,
    closeOnBackdropClick,
    keepMounted,
  } = useModalContext();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const focusScope = useCreateFocusScope();
  const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
  const [isPositioned, setIsPositioned] = useState(false);

  useFocusRestore(isOpen);
  useFocusTrap(wrapperRef, isOpen, { scope: focusScope });
  useFocusScopeContainer(wrapperRef, isOpen, focusScope);
  useScrollLock(isOpen, wrapperRef);
  useEscapeKey(() => onClose("escapeKeyDown"), isOpen && closeOnEscape);

  useEffect(() => {
    if (!isPresent) return;
    const container = wrapperRef.current;
    if (!container) return;
    if (container.contains(document.activeElement)) return;
    focusFirstDescendant(container);
  }, [isPresent]);

  useEffect(() => {
    if (!isPresent) return undefined;

    setIsPositioned(false);
    const cleanupRef = { current: 0 };
    const frame = requestAnimationFrame(() => {
      cleanupRef.current = requestAnimationFrame(() => {
        setIsPositioned(true);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(cleanupRef.current);
    };
  }, [isPresent]);

  const isHidden = keepMounted && !isPresent;
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      presenceRef(node);
    },
    [presenceRef],
  );

  return {
    isPresent: isPresent || keepMounted,
    isHidden,
    isPositioned,
    dataState: isOpen && isPositioned ? "open" : "closed",
    wrapperRef,
    focusScope,
    presenceRef: mergedRef,
    contentProps: {
      id: modalId,
      role,
      "aria-modal": isHidden ? undefined : "true",
      "aria-labelledby": ariaLabel ? undefined : titleId,
      "aria-describedby": descriptionId,
      "aria-label": ariaLabel,
      tabIndex: -1,
    },
    onClose,
    closeOnBackdropClick,
  };
}
