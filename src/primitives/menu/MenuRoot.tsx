"use client";

import {
  useCallback,
  useId,
  useMemo,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import { OverlayScopeProvider, useCreateOverlayScope, type OverlayScope } from "../../hooks/overlayScope.js";
import { useCreateFocusScope } from "../../hooks/focus.js";
import { useOptionalModalContext } from "../modal/context.js";
import { activateModalLayer, createModalLayer } from "../modal/layer.js";
import {
  MenuContextProvider,
  type MenuContextValue,
  type MenuCloseReason,
  type MenuInitialHighlight,
} from "./context.js";
import type { MenuHighlightTarget, MenuHighlightChangeDetails, MenuLifecycleOptions, MenuOutsideEvents, MenuPositioningOptions, MenuSelectionEvent, MenuNavigateDetails } from "./options.js";

export interface MenuRootProps extends MenuLifecycleOptions, MenuOutsideEvents {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  closeOnSelect?: boolean;
  loop?: boolean;
  closeOnEscape?: boolean;
  highlightedValue?: MenuHighlightTarget;
  defaultHighlightedValue?: MenuHighlightTarget;
  onHighlightChange?: (details: MenuHighlightChangeDetails) => void;
  typeahead?: boolean;
  onSelect?: (event: MenuSelectionEvent) => void;
  navigate?: (details: MenuNavigateDetails) => void;
  positioning?: MenuPositioningOptions;
  triggerValue?: string;
  defaultTriggerValue?: string;
  onTriggerValueChange?: (value: string | undefined) => void;
}

export type UseMenuOptions = Omit<MenuRootProps, "children">;
export interface UseMenuReturn {
  readonly open: boolean;
  readonly highlightedValue: MenuHighlightTarget;
  readonly triggerValue: string | undefined;
  readonly setOpen: (open: boolean) => void;
  readonly setHighlightedValue: (value: MenuHighlightTarget) => void;
  readonly setTriggerValue: (value: string | undefined) => void;
  readonly reposition: () => void;
  readonly setAnchorPoint: (point: { x: number; y: number } | null) => void;
}
const controllers = new WeakMap<UseMenuReturn, MenuContextValue>();
const overlayScopes = new WeakMap<UseMenuReturn, OverlayScope>();

export function useMenu({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  closeOnSelect = true,
  loop = true,
  closeOnEscape = true,
  highlightedValue: controlledHighlight,
  defaultHighlightedValue = null,
  onHighlightChange,
  typeahead = true,
  onSelect,
  navigate,
  positioning,
  triggerValue: controlledTriggerValue,
  defaultTriggerValue,
  onTriggerValueChange,
  lazyMount = true, unmountOnExit = true, present, immediate = true,
  skipAnimationOnMount = false, hideMode = "display-none", onExitComplete,
  onInteractOutside, onPointerDownOutside, onFocusOutside, onEscapeKeyDown,
  onRequestDismiss, persistentElements,
}: UseMenuOptions = {}): UseMenuReturn {
  const overlayScope = useCreateOverlayScope(modal);
  const isControlled = controlledOpen !== undefined;
  const parentModal = useOptionalModalContext();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const [internalHighlight, setInternalHighlight] = useState<MenuHighlightTarget>(defaultHighlightedValue);
  const publicHighlightedValue = controlledHighlight !== undefined ? controlledHighlight : internalHighlight;
  const setPublicHighlight = useCallback((value: MenuHighlightTarget) => {
    if (controlledHighlight === undefined) setInternalHighlight(value);
    if (JSON.stringify(value) !== JSON.stringify(publicHighlightedValue)) onHighlightChange?.({ highlightedValue: value });
  }, [controlledHighlight, publicHighlightedValue, onHighlightChange]);
  const [initialHighlight, setInitialHighlight] = useState<MenuInitialHighlight>("first");
  const [openSubMenuId, setOpenSubMenuId] = useState<string | null>(null);
  const labelRegistryRef = useRef<Map<string, string>>(new Map());
  const {
    version: registryVersion,
    registerItem: registerCollectionItem,
    unregisterItem: unregisterCollectionItem,
    getItem: getCollectionItem,
    getItems: getCollectionItems,
  } = useCollection<string, HTMLElement>();
  const idPrefix = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const triggers = useRef(new Map<string, HTMLElement>());
  const [internalTriggerValue, setInternalTriggerValue] = useState(defaultTriggerValue);
  const triggerValue = controlledTriggerValue ?? internalTriggerValue;
  const updateRef = useRef<(() => void) | null>(null);
  const reposition = useCallback(() => updateRef.current?.(), []);
  const [anchorPoint, setAnchorPoint] = useState<{ x: number; y: number } | null>(null);
  const setTriggerValue = useCallback((value: string | undefined) => {
    if (controlledTriggerValue === undefined) setInternalTriggerValue(value);
    if (value !== triggerValue) onTriggerValueChange?.(value);
  }, [controlledTriggerValue, triggerValue, onTriggerValueChange]);
  const registerTrigger = useCallback((value: string, node: HTMLElement | null) => {
    const previous = triggers.current.get(value);
    if (node) triggers.current.set(value, node); else triggers.current.delete(value);
    if (node && (value === triggerValue || (!triggerRef.current && triggerValue === undefined))) triggerRef.current = node;
    if (!node && triggerRef.current === previous) triggerRef.current = null;
  }, [triggerValue]);
  const activateTrigger = useCallback((value: string, node: HTMLElement) => {
    triggerRef.current = node;
    setTriggerValue(value);
    reposition();
  }, [setTriggerValue, reposition]);
  const isTriggerTarget = useCallback((node: Node) => Array.from(triggers.current.values()).some(trigger => trigger.contains(node)), []);
  useLayoutEffect(() => {
    if (triggerValue !== undefined) triggerRef.current = triggers.current.get(triggerValue) ?? null;
    reposition();
  }, [triggerValue, reposition]);
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
  const resolveHighlight = useCallback((target: MenuHighlightTarget) => {
    if (target === null) return null;
    if (typeof target !== "string") return `${target.groupId}:${target.value}`;
    if (getCollectionItem(target)) return target;
    const matches = getCollectionItems().filter(item => item.element.dataset.value === target);
    if (matches.length === 1) return matches[0].value;
    return null;
  }, [getCollectionItem, getCollectionItems]);
  const highlightedValue = resolveHighlight(publicHighlightedValue);
  const highlightedKeyRef = useRef(highlightedValue);
  highlightedKeyRef.current = highlightedValue;
  const mountedRef = useRef(false);
  useLayoutEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const setHighlightedValue = useCallback((key: string | null) => {
    const node = key === null ? undefined : getCollectionItem(key)?.element;
    setPublicHighlight(node?.dataset.menuGroupId ? { value: node.dataset.value!, groupId: node.dataset.menuGroupId } : key);
  }, [getCollectionItem, setPublicHighlight]);
  useLayoutEffect(() => {
    if (typeof publicHighlightedValue === "string" && !highlightedValue && getCollectionItems().filter(item => item.element.dataset.value === publicHighlightedValue).length > 1) {
      console.warn("[Atom Menu] Ambiguous highlightedValue; use { value, groupId } for scoped radio items.");
    }
  }, [publicHighlightedValue, highlightedValue, registryVersion, getCollectionItems]);

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
  }, [setOpen, setHighlightedValue]);

  useLayoutEffect(() => {
    if (isOpen && !previousOpenRef.current) {
      const doc = triggerRef.current?.ownerDocument ?? contentRef.current?.ownerDocument ?? document;
      const ElementClass = doc.defaultView?.HTMLElement;
      focusOriginRef.current = ElementClass && doc.activeElement instanceof ElementClass
        ? doc.activeElement
        : null;
    }

    let cancelRestore: (() => void) | undefined;
    if (!isOpen && previousOpenRef.current) {
      const transaction = pendingCloseRef.current ?? {
        reason: "programmatic" as const,
        focus: null,
      };
      pendingCloseRef.current = null;
      const shouldRestore = transaction.reason !== "interactOutside" && transaction.reason !== "tab";
      const destination = transaction.focus ?? triggerRef.current ?? focusOriginRef.current;
      if (shouldRestore && destination?.isConnected) {
        const doc = destination.ownerDocument;
        const view = doc.defaultView;
        const activeAtClose = doc.activeElement;
        let focusHandedOff = false;
        const onFocusIn = () => { focusHandedOff = true; };
        doc.addEventListener("focusin", onFocusIn, true);
        const frame = view?.requestAnimationFrame(() => {
          doc.removeEventListener("focusin", onFocusIn, true);
          const active = doc.activeElement;
          // Native inert/removal may blur the closing surface to BODY without
          // a focusin event. That fallback is not an intentional focus handoff.
          const browserFallback = active === doc.body || active === doc.documentElement;
          // A newer focus handoff owns focus, even if closing was deferred.
          if (!focusHandedOff && destination.isConnected && (active === activeAtClose || browserFallback)) {
            destination.focus({ preventScroll: true });
          }
        });
        cancelRestore = () => {
          doc.removeEventListener("focusin", onFocusIn, true);
          if (frame !== undefined) view?.cancelAnimationFrame(frame);
        };
      }
    }
    previousOpenRef.current = isOpen;
    return cancelRestore;
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !modal) return undefined;
    return activateModalLayer(modalLayer, triggerRef.current?.ownerDocument ?? contentRef.current?.ownerDocument ?? document);
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
    if (highlightedKeyRef.current === value) queueMicrotask(() => {
      if (!mountedRef.current || getCollectionItem(value)) return;
      if (controlledHighlight === undefined) setInternalHighlight(null);
      if (isOpenRef.current) contentRef.current?.focus({ preventScroll: true });
    });
  }, [unregisterCollectionItem, getCollectionItem, controlledHighlight]);

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
    scope: overlayScope,
    enabled: isOpen,
    ownerDocument: contentRef.current?.ownerDocument,
    elements: [contentRef.current],
    onRequestDismiss: (event) => { onRequestDismiss?.(event); if (!event.defaultPrevented) onClose(); },
    onEscapeKeyDown: (event) => {
      if (openSubMenuId !== null) return;
      onEscapeKeyDown?.(event);
      if (closeOnEscape && !event.defaultPrevented) onClose("escape");
    },
  });

  const contextValue: MenuContextValue = useMemo(
    () => ({
      typeahead, positioning, publicHighlightedValue, controlledHighlight: controlledHighlight !== undefined,
      lifecycle: { lazyMount, unmountOnExit, present, immediate, skipAnimationOnMount, hideMode, onExitComplete },
      outsideEvents: { onInteractOutside, onPointerDownOutside, onFocusOutside, onEscapeKeyDown, persistentElements },
      triggerValue, setTriggerValue, registerTrigger, activateTrigger, isTriggerTarget, updateRef, anchorPoint, setAnchorPoint,
      dispatchSelect: onSelect, navigate,
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
      triggerId: `${idPrefix}-trigger${triggerValue === undefined ? "" : `-${triggerValue}`}`,
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
      onCloseTree: onClose,
      onSubMenuOpen: setOpenSubMenuId,
      onSubMenuClose,
    }),
    [
      typeahead, positioning, publicHighlightedValue, controlledHighlight, lazyMount, unmountOnExit, present, immediate, skipAnimationOnMount, hideMode, onExitComplete,
      onInteractOutside, onPointerDownOutside, onFocusOutside, onEscapeKeyDown, persistentElements, triggerValue, setTriggerValue, registerTrigger, activateTrigger, isTriggerTarget, anchorPoint, onSelect, navigate, setHighlightedValue,
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

  const controller: UseMenuReturn = { open: isOpen, highlightedValue: publicHighlightedValue, triggerValue, setOpen: open => open ? onOpen() : onClose(), setHighlightedValue: setPublicHighlight, setTriggerValue, reposition, setAnchorPoint };
  controllers.set(controller, contextValue);
  overlayScopes.set(controller, overlayScope);
  return controller;
}

export interface MenuRootProviderProps { value: UseMenuReturn; children: ReactNode }
export function MenuRootProvider({ value, children }: MenuRootProviderProps) {
  const context = controllers.get(value);
  if (!context) throw new Error("Menu.RootProvider requires the unchanged controller returned by useMenu.");
  return <OverlayScopeProvider value={overlayScopes.get(value)!}><MenuContextProvider value={context}>{children}</MenuContextProvider></OverlayScopeProvider>;
}
export function MenuRoot({ children, ...options }: MenuRootProps) {
  const value = useMenu(options);
  return <MenuRootProvider value={value}>{children}</MenuRootProvider>;
}
