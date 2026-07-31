"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  autoUpdate,
  arrow as floatingArrow,
  flip,
  offset,
  shift,
  size as sizeMiddleware,
  useFloating,
} from "@floating-ui/react";
import { useCollection } from "../../collection.js";
import { useFocusScopeContainer } from "../../hooks/focus.js";
import { useOutsideInteraction } from "../../hooks/useOutsideInteraction.js";
import { usePresence } from "../../hooks/usePresence.js";
import type { OutsideInteractionEvent } from "../../utils/interactions.js";
import { Portal } from "../../utils/Portal.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { getTypeaheadMatch } from "../../utils/typeahead.js";
import {
  getFloatingFallbackPlacements,
  resolveFloatingDirection,
} from "../../utils/floatingPlacement.js";
import { DirectionProvider, useDirection } from "../direction/index.js";
import {
  getMenuSubmenuCloseKey,
  getMenuSubmenuOpenKey,
  MenuContentContextProvider,
  MenuPortalContextProvider,
  MenuContextProvider,
  useMenuSubContext,
  type MenuContextValue,
  type MenuContentContextValue,
  type MenuInitialHighlight,
} from "./context.js";

const menuSubFocusScopeMetadata = {
  focusContainment: "owned",
  tabParticipation: "delegate",
  scrollParticipation: "allowed",
  isolation: "owned",
} as const;

type MenuSubContentNativeProps = NativeDivProps<"children" | "role">;

export interface MenuSubContentProps extends MenuSubContentNativeProps {
  children: ReactNode;
  sideOffset?: number;
  loop?: boolean;
  className?: string;
  ariaLabel?: string;
  asChild?: boolean;
  render?: RenderProp;
  onInteractOutside?: (event: OutsideInteractionEvent) => void;
  "data-slot"?: string;
}

export const MenuSubContent = forwardRef<HTMLDivElement, MenuSubContentProps>(
function MenuSubContent(
  {
    children,
    sideOffset = 4,
    loop = true,
    className,
    ariaLabel,
    asChild = false,
    render,
    onInteractOutside,
    onKeyDown,
    style,
    dir: dirProp,
    "data-slot": dataSlot = "menu-sub-content",
    ...restProps
  },
  ref,
) {
  const subCtx = useMenuSubContext();
  if (!subCtx) {
    throw new Error("MenuSubContent must be used within a MenuSubRoot");
  }

  const {
    isOpen,
    onClose,
    subMenuId,
    subTriggerId,
    subTriggerRef,
    parentMenuContext,
  } = subCtx;
  const contextDir = useDirection();
  const dir = resolveFloatingDirection(
    dirProp,
    subTriggerRef.current,
    contextDir,
  );
  const internalRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
  const [isPositioned, setIsPositioned] = useState(false);
  const [floatingSize, setFloatingSize] = useState({
    availableHeight: 0,
    availableWidth: 0,
    triggerHeight: 0,
    triggerWidth: 0,
  });
  const labelRegistryRef = useRef<Map<string, string>>(new Map());
  const {
    registerItem: registerCollectionItem,
    unregisterItem: unregisterCollectionItem,
    getItem: getCollectionItem,
    getItems: getCollectionItems,
  } = useCollection<string, HTMLElement>();
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
  const [initialHighlight, setInitialHighlight] = useState<MenuInitialHighlight>("first");
  const [nestedOpenSubMenuId, setNestedOpenSubMenuId] = useState<string | null>(null);
  const typeaheadBuffer = useRef("");
  const typeaheadTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useFocusScopeContainer(
    internalRef,
    isPresent,
    parentMenuContext.focusScope,
    menuSubFocusScopeMetadata,
  );

  const onNestedSubMenuOpen = useCallback((id: string) => setNestedOpenSubMenuId(id), []);
  const onNestedSubMenuClose = useCallback(() => setNestedOpenSubMenuId(null), []);

  const registerItem = useCallback((value: string, element: HTMLElement) => {
    registerCollectionItem(value, element);
  }, [registerCollectionItem]);

  const unregisterItem = useCallback((value: string) => {
    unregisterCollectionItem(value);
    labelRegistryRef.current.delete(value);
  }, [unregisterCollectionItem]);

  const getItemElement = useCallback((value: string) => {
    return getCollectionItem(value)?.element;
  }, [getCollectionItem]);

  const getItemValues = useCallback(() => {
    return getCollectionItems()
      .filter((item) => item.element.isConnected)
      .map((item) => item.value);
  }, [getCollectionItems]);

  const registerLabel = useCallback((value: string, label: string) => {
    labelRegistryRef.current.set(value, label);
  }, []);

  const getLabel = useCallback((value: string) => {
    return labelRegistryRef.current.get(value);
  }, []);

  const focusItem = useCallback((value: string) => {
    setHighlightedValue(value);
    const element = getItemElement(value);
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ block: "nearest" });
  }, [getItemElement]);

  const onItemSelect = useCallback(
    (value: string, options?: { closeOnSelect?: boolean }) => {
      if (options?.closeOnSelect ?? true) {
        onClose();
        parentMenuContext.onItemSelect(value, { closeOnSelect: true });
      }
    },
    [onClose, parentMenuContext],
  );

  useEffect(() => {
    if (isPresent) {
      setIsPositioned(false);
      const raf = requestAnimationFrame(() => setIsPositioned(true));
      return () => cancelAnimationFrame(raf);
    }
    setIsPositioned(false);
    return undefined;
  }, [isPresent]);

  useEffect(() => {
    if (!isOpen) {
      setIsPositioned(false);
      setHighlightedValue(null);
      setInitialHighlight("first");
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isPresent) return undefined;
    const raf = requestAnimationFrame(() => {
      const values = getItemValues();
      if (values.length > 0) {
        focusItem(initialHighlight === "last" ? values[values.length - 1] : values[0]);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [focusItem, getItemValues, initialHighlight, isPresent]);

  useEffect(() => {
    if (!isOpen || !highlightedValue) return;
    const el = getItemElement(highlightedValue);
    el?.scrollIntoView({ block: "nearest" });
  }, [getItemElement, highlightedValue, isOpen]);

  const clickAwayRefs = useMemo(
    () => [internalRef, subTriggerRef],
    [subTriggerRef],
  );
  useOutsideInteraction({
    refs: clickAwayRefs,
    onInteractOutside: (event) => {
      onInteractOutside?.(event);
      if (event.defaultPrevented) return;
      const isInsideMenuTree = event.target instanceof Element
        && event.target.closest("[role='menu']") !== null;
      if (isInsideMenuTree) onClose();
      else parentMenuContext.onCloseTree("interactOutside");
    },
    enabled: isOpen,
    ignore: (target) => nestedOpenSubMenuId !== null && isMenuSubContent(target),
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const values = getItemValues();
      if (values.length === 0) return;

      const currentIndex = highlightedValue ? values.indexOf(highlightedValue) : -1;

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          event.stopPropagation();
          if (currentIndex < values.length - 1) {
            focusItem(values[currentIndex + 1]);
          } else if (loop) {
            focusItem(values[0]);
          }
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          event.stopPropagation();
          if (currentIndex > 0) {
            focusItem(values[currentIndex - 1]);
          } else if (loop) {
            focusItem(values[values.length - 1]);
          }
          break;
        }
        case getMenuSubmenuCloseKey(dir): {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          subTriggerRef.current?.focus({ preventScroll: true });
          break;
        }
        case getMenuSubmenuOpenKey(dir): {
          event.preventDefault();
          event.stopPropagation();
          if (highlightedValue) {
            const el = getItemElement(highlightedValue);
            if (el?.dataset.slot === "menu-sub-trigger") {
              el.click();
            }
          }
          break;
        }
        case "Home": {
          event.preventDefault();
          event.stopPropagation();
          focusItem(values[0]);
          break;
        }
        case "End": {
          event.preventDefault();
          event.stopPropagation();
          focusItem(values[values.length - 1]);
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          event.stopPropagation();
          if (highlightedValue) {
            const el = getItemElement(highlightedValue);
            el?.click();
          }
          break;
        }
        case "Escape": {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          subTriggerRef.current?.focus({ preventScroll: true });
          break;
        }
        default: {
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            event.stopPropagation();
            typeaheadBuffer.current += event.key.toLowerCase();
            clearTimeout(typeaheadTimeout.current);
            typeaheadTimeout.current = setTimeout(() => {
              typeaheadBuffer.current = "";
            }, 500);
            const match = getTypeaheadMatch(
              values.map((value) => ({ value, label: getLabel(value) ?? value })),
              typeaheadBuffer.current,
              highlightedValue,
            );
            if (match) focusItem(match);
          }
        }
      }
    },
    [
      getItemElement,
      getItemValues,
      getLabel,
      highlightedValue,
      dir,
      focusItem,
      loop,
      onClose,
      parentMenuContext.contentRef,
      subTriggerRef,
    ],
  );

  const preferredSide = dir === "rtl" ? "left" : "right";
  const { refs, floatingStyles, placement, middlewareData } = useFloating({
    placement: `${preferredSide}-start`,
    middleware: [
      offset(sideOffset),
      flip({
        fallbackPlacements: getFloatingFallbackPlacements(preferredSide, "start"),
        padding: 8,
      }),
      shift({ padding: 8, crossAxis: true }),
      sizeMiddleware({
        padding: 8,
        apply({ availableHeight, availableWidth, elements, rects }) {
          const nextSize = {
            availableHeight: Math.max(0, availableHeight),
            availableWidth: Math.max(0, availableWidth),
            triggerHeight: rects.reference.height,
            triggerWidth: rects.reference.width,
          };
          setFloatingSize((current) => (
            current.availableHeight === nextSize.availableHeight
            && current.availableWidth === nextSize.availableWidth
            && current.triggerHeight === nextSize.triggerHeight
            && current.triggerWidth === nextSize.triggerWidth
              ? current
              : nextSize
          ));
          Object.assign(elements.floating.style, {
            "--atom-menu-available-width": `${nextSize.availableWidth}px`,
            "--atom-menu-available-height": `${nextSize.availableHeight}px`,
            "--atom-menu-trigger-width": `${rects.reference.width}px`,
            "--atom-menu-trigger-height": `${rects.reference.height}px`,
          });
        },
      }),
      floatingArrow({ element: arrowRef, padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
    open: isOpen,
  });

  useEffect(() => {
    refs.setReference(subTriggerRef.current);
  }, [isOpen, refs, subTriggerRef]);

  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, internalRef, presenceRef, ref),
    [presenceRef, ref, refs.setFloating],
  );

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      composedRef(node);
    },
    [composedRef],
  );

  const subMenuContext: MenuContextValue = useMemo(
    () => ({
      isOpen,
      onOpen: subCtx.onOpen,
      onClose,
      onToggle: subCtx.onToggle,
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
      menuId: subMenuId,
      triggerId: subTriggerId,
      triggerRef: subTriggerRef,
      contentRef: internalRef,
      ownerBoundaryRef: parentMenuContext.ownerBoundaryRef,
      focusOriginRef: parentMenuContext.focusOriginRef,
      modalLayer: parentMenuContext.modalLayer,
      focusScope: parentMenuContext.focusScope,
      modal: false,
      closeOnSelect: true,
      loop,
      openSubMenuId: nestedOpenSubMenuId,
      onCloseTree: parentMenuContext.onCloseTree,
      onSubMenuOpen: onNestedSubMenuOpen,
      onSubMenuClose: onNestedSubMenuClose,
    }),
    [
      getItemElement,
      getItemValues,
      getLabel,
      highlightedValue,
      initialHighlight,
      isOpen,
      loop,
      nestedOpenSubMenuId,
      onClose,
      onItemSelect,
      onNestedSubMenuClose,
      onNestedSubMenuOpen,
      registerItem,
      registerLabel,
      subCtx.onOpen,
      subCtx.onToggle,
      subMenuId,
      subTriggerId,
      subTriggerRef,
      unregisterItem,
    ],
  );

  if (!isPresent) return null;

  const actualSide = placement.split("-")[0] as "top" | "right" | "bottom" | "left";
  const actualAlign = (placement.split("-")[1] ?? "center") as "start" | "center" | "end";
  const arrowData = middlewareData.arrow;
  const contentContextValue: MenuContentContextValue = {
    arrowRef,
    side: actualSide,
    align: actualAlign,
    arrowX: arrowData?.x,
    arrowY: arrowData?.y,
  };
  const transformOrigin = actualSide === "top"
    ? `${actualAlign} bottom`
    : actualSide === "bottom"
      ? `${actualAlign} top`
      : actualSide === "left"
        ? `right ${actualAlign}`
        : `left ${actualAlign}`;
  const behaviorProps = {
    ...restProps,
    ref: setFloatingRef,
    id: subMenuId,
    role: "menu",
    "aria-orientation": "vertical" as const,
    "aria-label": ariaLabel,
    "aria-labelledby": !ariaLabel ? subTriggerId : undefined,
    dir,
    tabIndex: -1,
    "data-menu-sub-content": "",
    "data-slot": dataSlot,
    "data-state": isOpen ? "open" : "closed",
    "data-side": actualSide,
    "data-align": actualAlign,
    ...(isPositioned ? { "data-positioned": "" } : {}),
    className,
    style: {
      ...style,
      ...floatingStyles,
      "--atom-menu-available-height": `${floatingSize.availableHeight}px`,
      "--atom-menu-available-width": `${floatingSize.availableWidth}px`,
      "--atom-menu-trigger-height": `${floatingSize.triggerHeight}px`,
      "--atom-menu-trigger-width": `${floatingSize.triggerWidth}px`,
      "--atom-menu-transform-origin": transformOrigin,
    } as CSSProperties,
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
  };
  const contentElement = asChild
    ? cloneAndMerge(children, behaviorProps)
    : renderElement(render, "div", { ...behaviorProps, children });

  return (
    <MenuContextProvider value={subMenuContext}>
      <Portal>
        <DirectionProvider dir={dir}>
          <MenuContentContextProvider value={contentContextValue}>
            <MenuPortalContextProvider value={null}>{contentElement}</MenuPortalContextProvider>
          </MenuContentContextProvider>
        </DirectionProvider>
      </Portal>
    </MenuContextProvider>
  );
});

function isMenuSubContent(target: Node): boolean {
  return target instanceof Element && target.closest("[data-menu-sub-content]") !== null;
}
