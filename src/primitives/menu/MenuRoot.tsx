"use client";

import {
  useCallback,
  useId,
  useMemo,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import { useCreateFocusScope } from "../../hooks/focus.js";
import { useOptionalModalContext } from "../modal/context.js";
import { activateModalLayer, createModalLayer } from "../modal/layer.js";
import {
  MenuContextProvider,
  type MenuContextValue,
  type MenuCloseReason,
  type MenuInitialHighlight,
} from "./context.js";

export interface MenuRootProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  closeOnSelect?: boolean;
  loop?: boolean;
  closeOnEscape?: boolean;
}

export function MenuRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  closeOnSelect = true,
  loop = true,
  closeOnEscape = true,
}: MenuRootProps) {
  const isControlled = controlledOpen !== undefined;
  const parentModal = useOptionalModalContext();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
  const [initialHighlight, setInitialHighlight] = useState<MenuInitialHighlight>("first");
  const [openSubMenuId, setOpenSubMenuId] = useState<string | null>(null);
  const labelRegistryRef = useRef<Map<string, string>>(new Map());
  const {
    registerItem: registerCollectionItem,
    unregisterItem: unregisterCollectionItem,
    getItem: getCollectionItem,
    getItems: getCollectionItems,
  } = useCollection<string, HTMLElement>();
  const idPrefix = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const ownerBoundaryRef = useRef<HTMLElement | null>(null);
  const focusOriginRef = useRef<HTMLElement | null>(null);
  const pendingCloseRef = useRef<{ reason: MenuCloseReason; focus: HTMLElement | null } | null>(null);
  const previousOpenRef = useRef(false);
  const ownFocusScope = useCreateFocusScope();
  const focusScope = !modal && parentModal ? parentModal.focusScope : ownFocusScope;
  const modalLayer = useMemo(
    () => createModalLayer(parentModal?.layer ?? null),
    [parentModal?.layer],
  );
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback((
    reason: MenuCloseReason = "programmatic",
    finalFocus: HTMLElement | null = null,
  ) => {
    pendingCloseRef.current = { reason, focus: finalFocus };
    setOpen(false);
    setHighlightedValue(null);
    setInitialHighlight("first");
    setOpenSubMenuId(null);
  }, [setOpen]);

  useLayoutEffect(() => {
    if (isOpen && !previousOpenRef.current) {
      focusOriginRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    }

    if (!isOpen && previousOpenRef.current) {
      const transaction = pendingCloseRef.current ?? {
        reason: "programmatic" as const,
        focus: null,
      };
      pendingCloseRef.current = null;
      const shouldRestore = transaction.reason !== "interactOutside" && transaction.reason !== "tab";
      const destination = transaction.focus ?? triggerRef.current ?? focusOriginRef.current;
      if (shouldRestore && destination?.isConnected) {
        requestAnimationFrame(() => destination.focus({ preventScroll: true }));
      }
    }
    previousOpenRef.current = isOpen;
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !modal) return undefined;
    return activateModalLayer(modalLayer, document);
  }, [isOpen, modal, modalLayer]);
  const onToggle = useCallback(() => {
    if (isOpenRef.current) {
      onClose();
    } else {
      onOpen();
    }
  }, [onClose, onOpen]);
  const onSubMenuClose = useCallback(() => setOpenSubMenuId(null), []);

  const registerItem = useCallback((value: string, element: HTMLElement) => {
    registerCollectionItem(value, element);
  }, [registerCollectionItem]);

  const unregisterItem = useCallback((value: string) => {
    unregisterCollectionItem(value);
    labelRegistryRef.current.delete(value);
  }, [unregisterCollectionItem]);

  const getItemElement = useCallback(
    (value: string) => getCollectionItem(value)?.element,
    [getCollectionItem],
  );

  const getItemValues = useCallback(() => {
    return getCollectionItems()
      .filter((item) => item.element.isConnected)
      .map((item) => item.value);
  }, [getCollectionItems]);

  const registerLabel = useCallback((value: string, label: string) => {
    labelRegistryRef.current.set(value, label);
  }, []);

  const getLabel = useCallback(
    (value: string) => labelRegistryRef.current.get(value),
    [],
  );

  const onItemSelect = useCallback(
    (_value: string, options?: { closeOnSelect?: boolean }) => {
      if (options?.closeOnSelect ?? closeOnSelect) onClose("select");
    },
    [closeOnSelect, onClose],
  );

  useDismissableLayer({
    enabled: isOpen && closeOnEscape,
    onEscapeKeyDown: () => {
      if (openSubMenuId !== null) return;
      onClose("escape");
    },
  });

  const contextValue: MenuContextValue = useMemo(
    () => ({
      isOpen,
      onOpen,
      onClose,
      onToggle,
      highlightedValue,
      onHighlight: setHighlightedValue,
      initialHighlight,
      onInitialHighlight: setInitialHighlight,
      registerItem,
      unregisterItem,
      getItemElement,
      getItemValues,
      registerLabel,
      getLabel,
      onItemSelect,
      menuId: `${idPrefix}-menu`,
      triggerId: `${idPrefix}-trigger`,
      triggerRef,
      contentRef,
      ownerBoundaryRef,
      focusOriginRef,
      modalLayer,
      focusScope,
      modal,
      closeOnSelect,
      loop,
      openSubMenuId,
      onSubMenuOpen: setOpenSubMenuId,
      onSubMenuClose,
    }),
    [
      closeOnSelect,
      getItemElement,
      getItemValues,
      getLabel,
      highlightedValue,
      idPrefix,
      initialHighlight,
      isOpen,
      loop,
      modal,
      onClose,
      onItemSelect,
      onOpen,
      onSubMenuClose,
      onToggle,
      openSubMenuId,
      registerItem,
      registerLabel,
      unregisterItem,
    ],
  );

  return (
    <MenuContextProvider value={contextValue}>
      {children}
    </MenuContextProvider>
  );
}
