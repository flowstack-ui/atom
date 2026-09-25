"use client";

import { arrowOffset, autoUpdateWithArrow } from "../../utils/floatingArrowPositioning.js";
import { useOverlayLayerHost } from "../../hooks/overlayScope.js";
import { normalizeMenuAnchorRect } from "./anchorRect.js";
import { menuInertValue } from "./inert.js";
import { useMenuPositioner } from "./useMenuPositioner.js";

import { revealMenuItem } from "./revealItem.js";

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
  arrow as floatingArrow,
  flip,
  hide,
  offset,
  shift,
  size as sizeMiddleware,
  useFloating,
} from "@floating-ui/react";
import { useCollection } from "../../collection.js";
import { useFocusScopeContainer } from "../../hooks/focus.js";
import { useOutsideInteraction } from "../../hooks/useOutsideInteraction.js";
import { usePresence } from "../../hooks/usePresence.js";
import { useMenuPresence } from "./useMenuPresence.js";
import type { MenuPositioningOptions } from "./options.js";
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
  useMenuPortalContext,
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
  positioning?: MenuPositioningOptions;
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
    sideOffset: sideOffsetProp,
    positioning,
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
  const portalContext = useMenuPortalContext();
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
  const p = positioning ?? subCtx.positioning;
  const sideOffset = sideOffsetProp ?? p?.offset?.mainAxis ?? p?.gutter ?? 4;
  const dir = resolveFloatingDirection(
    dirProp,
    subTriggerRef.current,
    contextDir,
  );
  const internalRef = useRef<HTMLDivElement>(null);
  const { positioner, setPositioner } = useMenuPositioner(internalRef);
  const arrowRef = useRef<SVGSVGElement>(null);
  const { isPresent, ref: presenceRef, shouldRender, skipAnimation, Activity } = useMenuPresence(isOpen, subCtx.lifecycle, internalRef);

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

  const preferredSide = dir === "rtl" ? "left" : "right";
  const collision = { padding: p?.overflowPadding ?? 8, boundary: typeof p?.boundary === "function" ? p.boundary() : p?.boundary };
  const { refs, floatingStyles, placement, middlewareData, isPositioned, update } = useFloating({
    placement: p?.placement ?? `${preferredSide}-start`,
    strategy: p?.strategy ?? parentMenuContext.positioning?.strategy ?? "absolute",
    middleware: [
      p?.offset?.mainAxis !== undefined
        ? offset({ mainAxis: sideOffset, crossAxis: p.offset.crossAxis ?? p.shift ?? 0 })
        : arrowOffset(arrowRef, sideOffset, p?.offset?.crossAxis ?? p?.shift ?? 0),
      p?.flip !== false && flip({
        fallbackPlacements: Array.isArray(p?.flip) ? p.flip : getFloatingFallbackPlacements(preferredSide, "start"),
        ...collision,
      }),
      p?.slide !== false && shift({ ...collision, crossAxis: p?.overlap ?? true }),
      (p?.sizeMiddleware !== false || p?.sameWidth || p?.fitViewport) && sizeMiddleware({
        ...collision,
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
      p?.hideWhenDetached && hide(collision),
      floatingArrow({ element: arrowRef, padding: p?.arrowPadding ?? 8 }),
    ],
    whileElementsMounted: (reference, floating, update) => {
      if (p?.listeners === false) { update(); return () => {}; }
      return autoUpdateWithArrow(arrowRef)(reference, floating, update, { ...(typeof p?.listeners === "object" ? p.listeners : {}), ...(p?.animationFrame === undefined ? {} : { animationFrame: p.animationFrame }) });
    },
    open: isOpen,
  });
  useEffect(() => {
    // A retained host needs a fresh placement after closed state resets it.
    if (isOpen && isPresent) update();
  }, [isOpen, isPresent, update]);

  const focusItem = useCallback((value: string) => {
    setHighlightedValue(value);
    const element = getItemElement(value);
    element?.focus({ preventScroll: true });
    revealMenuItem(element, internalRef.current);
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
    if (!isOpen) {
      setHighlightedValue(null);
      setInitialHighlight("first");
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isPresent || !isPositioned) return undefined;
    // Let the newly registered submenu focus scope settle before moving focus.
    const raf = requestAnimationFrame(() => {
      const values = getItemValues();
      if (values.length > 0) {
        focusItem(initialHighlight === "last" ? values[values.length - 1] : values[0]);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [focusItem, getItemValues, initialHighlight, isPresent, isOpen, isPositioned]);

  useEffect(() => {
    if (!isOpen || !isPositioned || !highlightedValue) return;
    const el = getItemElement(highlightedValue);
    revealMenuItem(el, internalRef.current);
  }, [getItemElement, highlightedValue, isOpen, isPositioned]);

  const clickAwayRefs = useMemo(
    () => [internalRef, subTriggerRef],
    [subTriggerRef],
  );
  useOutsideInteraction({
    refs: clickAwayRefs,
    onInteractOutside: (event) => {
      onInteractOutside?.(event);
      parentMenuContext.outsideEvents?.onInteractOutside?.(event);
      if (event.defaultPrevented) return;
      const isInsideMenuTree = event.target instanceof Element
        && event.target.closest("[role='menu']") !== null;
      if (isInsideMenuTree) onClose();
      else parentMenuContext.onCloseTree("interactOutside");
    },
    enabled: isOpen,
    onPointerDownOutside: parentMenuContext.outsideEvents?.onPointerDownOutside,
    ignore: (target) => Boolean(parentMenuContext.outsideEvents?.persistentElements?.some(get => get()?.contains(target)) || nestedOpenSubMenuId !== null && isMenuSubContent(target)),
  });
  useEffect(() => {
    const host = internalRef.current;
    const doc = host?.ownerDocument;
    const win = doc?.defaultView;
    if (!isOpen || !doc || !win || nestedOpenSubMenuId !== null) return;
    const listener = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (!target || host?.contains(target) || parentMenuContext.contentRef.current?.contains(target) || parentMenuContext.isTriggerTarget?.(target) || isMenuSubContent(target) || parentMenuContext.outsideEvents?.persistentElements?.some(get => get()?.contains(target))) return;
      const outside = new win.FocusEvent("focusoutside", { cancelable: true, relatedTarget: event.relatedTarget });
      parentMenuContext.outsideEvents?.onFocusOutside?.(outside);
      parentMenuContext.outsideEvents?.onInteractOutside?.(outside);
      if (!outside.defaultPrevented && !parentMenuContext.modal) parentMenuContext.onCloseTree("interactOutside");
    };
    doc.addEventListener("focusin", listener);
    return () => doc.removeEventListener("focusin", listener);
  }, [isOpen, nestedOpenSubMenuId, parentMenuContext]);

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
          parentMenuContext.outsideEvents?.onEscapeKeyDown?.(event.nativeEvent);
          if (event.nativeEvent.defaultPrevented) { event.stopPropagation(); return; }
          event.preventDefault();
          event.stopPropagation();
          onClose();
          subTriggerRef.current?.focus({ preventScroll: true });
          break;
        }
        default: {
          if (parentMenuContext.typeahead !== false && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
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
      parentMenuContext.typeahead,
      subTriggerRef,
    ],
  );


  useEffect(() => {
    refs.setPositionReference(p?.getAnchorElement?.() ?? (p?.getAnchorRect ? { contextElement: subTriggerRef.current ?? undefined, getBoundingClientRect: () => normalizeMenuAnchorRect(p.getAnchorRect!()) } : subTriggerRef.current));
  }, [isOpen, refs, subTriggerRef, p]);
  useEffect(() => { p?.onPositioned?.({ placed: isPositioned }); }, [isPositioned, p?.onPositioned]);
  useEffect(() => () => clearTimeout(typeaheadTimeout.current), []);

  const contentLayerRef = useOverlayLayerHost();
  const positionerLayerRef = useOverlayLayerHost();
  const composedRef = useMemo(
    () => composeRefs(internalRef, presenceRef, ref, contentLayerRef),
    [presenceRef, ref, contentLayerRef],
  );
  const positionerRef = useMemo(() => composeRefs(refs.setFloating, setPositioner, positionerLayerRef), [refs.setFloating, setPositioner, positionerLayerRef]);

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      return composedRef(node);
    },
    [composedRef],
  );

  const subMenuContext: MenuContextValue = useMemo(
    () => ({
      typeahead: parentMenuContext.typeahead,
      positioning: p,
      lifecycle: subCtx.lifecycle,
      outsideEvents: parentMenuContext.outsideEvents,
      dispatchSelect: parentMenuContext.dispatchSelect,
      navigate: parentMenuContext.navigate,
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
      parentMenuContext, p, subCtx.lifecycle,
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

  if (!shouldRender) return null;

  const actualSide = placement.split("-")[0] as "top" | "right" | "bottom" | "left";
  const actualAlign = (placement.split("-")[1] ?? "center") as "start" | "center" | "end";
  const arrowData = middlewareData.arrow;
  const contentContextValue: MenuContentContextValue = {
    arrowHost: positioner,
    updatePosition: update,
    arrowVisible: isOpen && isPositioned,
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
    inert: menuInertValue(!isOpen),
    hidden: !isPresent || restProps.hidden,
    "aria-hidden": !isOpen || undefined,
    "data-side": actualSide,
    "data-align": actualAlign,
    ...(isPositioned ? { "data-positioned": "" } : {}),
    className,
    style: {
      ...style,
      position: "relative",
      ...(p?.sameWidth ? { width: floatingSize.triggerWidth } : {}),
      ...(p?.fitViewport ? { maxWidth: floatingSize.availableWidth, maxHeight: floatingSize.availableHeight } : {}),
      ...(middlewareData.hide?.referenceHidden ? { visibility: "hidden" } : {}),
      ...(skipAnimation ? { animation: "none", transition: "none" } : {}),
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
  const positionedContent = <div ref={positionerRef} data-atom-menu-positioner="" hidden={!isPresent} style={{ ...floatingStyles, width: "max-content", visibility: (!isPositioned && isOpen) || middlewareData.hide?.referenceHidden ? "hidden" : undefined, pointerEvents: isOpen ? undefined : "none" }}>{contentElement}</div>;

  return (
    <MenuContextProvider value={subMenuContext}>
      <Portal container={portalContext?.container ?? subTriggerRef.current?.ownerDocument.body} disabled={portalContext !== null}>
        <DirectionProvider dir={dir}>
          <MenuContentContextProvider value={contentContextValue}>
            <MenuPortalContextProvider value={null}>{Activity ? <Activity mode={isPresent ? "visible" : "hidden"}>{positionedContent}</Activity> : positionedContent}</MenuPortalContextProvider>
          </MenuContentContextProvider>
        </DirectionProvider>
      </Portal>
    </MenuContextProvider>
  );
});

function isMenuSubContent(target: Node): boolean {
  return target.nodeType === 1 && (target as Element).closest("[data-menu-sub-content]") !== null;
}
