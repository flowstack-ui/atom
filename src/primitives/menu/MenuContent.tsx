"use client";

import { arrowOffset, autoUpdateWithArrow } from "../../utils/floatingArrowPositioning.js";

import { revealMenuItem } from "./revealItem.js";
import { normalizeMenuAnchorRect } from "./anchorRect.js";
import { menuInertValue } from "./inert.js";
import { useMenuPositioner } from "./useMenuPositioner.js";

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
  type Placement,
} from "@floating-ui/react";
import {
  getTabbableOutsideBoundary,
  useFocusTrap,
  useFocusScopeContainer,
} from "../../hooks/focus.js";
import { useOutsideInteraction } from "../../hooks/useOutsideInteraction.js";
import type { OutsideInteractionEvent } from "../../utils/interactions.js";
import { usePresence } from "../../hooks/usePresence.js";
import { useMenuPresence } from "./useMenuPresence.js";
import type { MenuPositioningOptions } from "./options.js";
import { useScrollLock } from "../../hooks/useScrollLock.js";
import { Portal } from "../../utils/Portal.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { getTypeaheadMatch } from "../../utils/typeahead.js";
import { resolveFloatingDirection } from "../../utils/floatingPlacement.js";
import { DirectionProvider, useDirection } from "../direction/index.js";
import { setModalLayerContent } from "../modal/layer.js";
import { useOverlayLayerHost } from "../../hooks/overlayScope.js";
import { useModalIsolation } from "../modal/useModalIsolation.js";
import {
  getMenuSubmenuOpenKey,
  MenuContentContextProvider,
  MenuPortalContextProvider,
  useMenuContext,
  useMenuPortalContext,
  type MenuContentContextValue,
} from "./context.js";

const menuFocusScopeMetadata = {
  focusContainment: "owned",
  tabParticipation: "delegate",
  scrollParticipation: "allowed",
  isolation: "owned",
} as const;

export type MenuSide = "top" | "right" | "bottom" | "left";
export type MenuAlign = "start" | "center" | "end";

type MenuContentNativeProps = NativeDivProps<"children" | "role">;

export interface MenuContentProps extends MenuContentNativeProps {
  positioning?: MenuPositioningOptions;
  children: ReactNode;
  side?: MenuSide;
  align?: MenuAlign;
  sideOffset?: number;
  loop?: boolean;
  className?: string;
  ariaLabel?: string;
  anchorPoint?: { x: number; y: number } | null;
  asChild?: boolean;
  render?: RenderProp;
  onInteractOutside?: (event: OutsideInteractionEvent) => void;
  onKeyDownCapture?: KeyboardEventHandler<HTMLDivElement>;
  "data-slot"?: string;
}

function toPlacement(side: MenuSide, align: MenuAlign): Placement {
  if (align === "center") return side;
  return `${side}-${align === "start" ? "start" : "end"}`;
}

function sideFromPlacement(placement: Placement): MenuSide {
  return placement.split("-")[0] as MenuSide;
}

function alignFromPlacement(placement: Placement): MenuAlign {
  const parts = placement.split("-");
  if (parts.length === 1) return "center";
  return parts[1] as MenuAlign;
}

export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(
function MenuContent(
  {
    children,
    side: sideProp,
    align: alignProp,
    sideOffset: sideOffsetProp,
    positioning,
    loop: loopProp,
    className,
    ariaLabel,
    anchorPoint,
    asChild = false,
    render,
    onInteractOutside,
    onKeyDownCapture,
    style,
    dir: dirProp,
    "data-slot": dataSlot = "menu-content",
    ...restProps
  },
  ref,
) {
  const ctx = useMenuContext();
  const p = positioning ?? ctx.positioning;
  const side = sideProp ?? (p?.placement?.split("-")[0] as MenuSide | undefined) ?? "bottom";
  const align = alignProp ?? (p?.placement ? (p.placement.split("-")[1] as MenuAlign | undefined) ?? "center" : "start");
  const sideOffset = sideOffsetProp ?? p?.offset?.mainAxis ?? p?.gutter ?? 4;
  const portalContext = useMenuPortalContext();
  const contextDir = useDirection();
  const loop = loopProp ?? ctx.loop;
  const {
    contentRef,
    getItemElement,
    getItemValues,
    getLabel,
    highlightedValue,
    initialHighlight,
    isOpen,
    menuId,
    modal,
    modalLayer,
    focusScope,
    onClose,
    onHighlight,
    openSubMenuId,
    triggerId,
    triggerRef,
    ownerBoundaryRef,
    focusOriginRef,
  } = ctx;
  const dir = resolveFloatingDirection(
    dirProp,
    triggerRef.current,
    contextDir,
  );
  const internalRef = useRef<HTMLDivElement>(null);
  const { positioner, setPositioner } = useMenuPositioner(internalRef);
  const arrowRef = useRef<SVGSVGElement>(null);
  const { isPresent, ref: presenceRef, shouldRender, skipAnimation, Activity } = useMenuPresence(isOpen, ctx.lifecycle, internalRef);

  const [floatingSize, setFloatingSize] = useState({
    availableHeight: 0,
    availableWidth: 0,
    triggerHeight: 0,
    triggerWidth: 0,
  });
  const hasAppliedInitialHighlightRef = useRef(false);
  const typeaheadBuffer = useRef("");
  const typeaheadTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useFocusScopeContainer(
    internalRef,
    isPresent,
    focusScope,
    menuFocusScopeMetadata,
  );
  useModalIsolation(modalLayer, focusScope, isOpen && modal);
  useFocusTrap(internalRef, isOpen && modal, { scope: focusScope });
  useScrollLock(isOpen && modal, internalRef);

  const referenceElement = triggerRef.current;
  const collision = { padding: p?.overflowPadding ?? 8, boundary: typeof p?.boundary === "function" ? p.boundary() : p?.boundary };
  const { refs, floatingStyles, placement, middlewareData, isPositioned, update } = useFloating({
    elements: { reference: referenceElement },
    placement: toPlacement(side, align),
    strategy: p?.strategy ?? "absolute",
    middleware: [
      p?.offset?.mainAxis !== undefined
        ? offset({ mainAxis: sideOffset, crossAxis: p.offset.crossAxis ?? p.shift ?? 0 })
        : arrowOffset(arrowRef, sideOffset, p?.offset?.crossAxis ?? p?.shift ?? 0),
      p?.flip !== false && flip({ ...collision, fallbackPlacements: Array.isArray(p?.flip) ? p.flip : undefined }),
      p?.slide !== false && shift({ ...collision, crossAxis: p?.overlap }),
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
  useEffect(() => { if (ctx.updateRef) ctx.updateRef.current = update; return () => { if (ctx.updateRef?.current === update) ctx.updateRef.current = null; }; }, [ctx.updateRef, update]);
  useEffect(() => { p?.onPositioned?.({ placed: isPositioned }); }, [isPositioned, p?.onPositioned]);
  useEffect(() => () => clearTimeout(typeaheadTimeout.current), []);


  const focusItem = useCallback((value: string) => {
    onHighlight(value);
    if (ctx.controlledHighlight) return;
    const item = getItemElement(value);
    item?.focus({ preventScroll: true });
    revealMenuItem(item, internalRef.current);
  }, [getItemElement, onHighlight, ctx.controlledHighlight]);


  useEffect(() => {
    if (!isOpen || !isPresent) {
      hasAppliedInitialHighlightRef.current = false;
      return undefined;
    }

    if (highlightedValue) {
      hasAppliedInitialHighlightRef.current = true;
      return undefined;
    }

    if (!isPositioned && (triggerRef.current || anchorPoint)) return undefined;
    if (hasAppliedInitialHighlightRef.current) return undefined;
    if (initialHighlight === null || (ctx.controlledHighlight && ctx.publicHighlightedValue === null)) {
      internalRef.current?.focus({ preventScroll: true });
      hasAppliedInitialHighlightRef.current = true;
      return undefined;
    }

    const values = getItemValues();
    if (values.length > 0) {
      hasAppliedInitialHighlightRef.current = true;
      focusItem(initialHighlight === "last" ? values[values.length - 1] : values[0]);
    }
    return undefined;
  }, [focusItem, getItemValues, highlightedValue, initialHighlight, isOpen, isPresent, isPositioned, triggerRef, anchorPoint]);

  useEffect(() => {
    if (!isOpen || !isPositioned || !highlightedValue) return;
    const el = getItemElement(highlightedValue);
    if (el?.isConnected && el.ownerDocument.activeElement !== el) el.focus({ preventScroll: true });
    revealMenuItem(el, internalRef.current);
  }, [getItemElement, highlightedValue, isOpen, isPositioned]);

  useEffect(() => {
    const host = internalRef.current;
    if (!isOpen || highlightedValue !== null || !host) return;
    const active = host.ownerDocument.activeElement;
    if (getItemValues().some(value => getItemElement(value) === active)) {
      host.focus({ preventScroll: true });
    }
  }, [getItemElement, getItemValues, highlightedValue, isOpen]);

  const clickAwayRefs = useMemo(
    () => [internalRef, triggerRef],
    [triggerRef],
  );
  useOutsideInteraction({
    refs: clickAwayRefs,
    onInteractOutside: (event) => {
      onInteractOutside?.(event);
      if (onInteractOutside !== ctx.outsideEvents?.onInteractOutside) ctx.outsideEvents?.onInteractOutside?.(event);
      if (!event.defaultPrevented) {
        onClose(modal ? "programmatic" : "interactOutside");
      }
    },
    enabled: isOpen,
    onPointerDownOutside: ctx.outsideEvents?.onPointerDownOutside,
    ignore: (target) => Boolean(ctx.isTriggerTarget?.(target) || ctx.outsideEvents?.persistentElements?.some(get => get()?.contains(target)) || openSubMenuId !== null && isMenuSubContent(target)),
  });
  useEffect(() => {
    const host = internalRef.current;
    const doc = host?.ownerDocument;
    const win = doc?.defaultView;
    if (!isOpen || !doc || !win || openSubMenuId !== null) return;
    const listener = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (!target || host?.contains(target) || ctx.isTriggerTarget?.(target) || isMenuSubContent(target) || ctx.outsideEvents?.persistentElements?.some(get => get()?.contains(target))) return;
      const outside = new win.FocusEvent("focusoutside", { cancelable: true, relatedTarget: event.relatedTarget });
      ctx.outsideEvents?.onFocusOutside?.(outside);
      ctx.outsideEvents?.onInteractOutside?.(outside);
      if (!outside.defaultPrevented && !modal) onClose("interactOutside");
    };
    doc.addEventListener("focusin", listener);
    return () => doc.removeEventListener("focusin", listener);
  }, [isOpen, openSubMenuId, ctx.outsideEvents, ctx.isTriggerTarget, modal, onClose]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (onKeyDownCapture) {
        onKeyDownCapture(event);
        if (event.defaultPrevented) return;
      }

      const values = getItemValues();
      if (values.length === 0) return;

      const currentIndex = highlightedValue
        ? values.indexOf(highlightedValue)
        : -1;

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          if (currentIndex < values.length - 1) {
            focusItem(values[currentIndex + 1]);
          } else if (loop) {
            focusItem(values[0]);
          }
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          if (currentIndex > 0) {
            focusItem(values[currentIndex - 1]);
          } else if (loop) {
            focusItem(values[values.length - 1]);
          }
          break;
        }
        case "Home": {
          event.preventDefault();
          focusItem(values[0]);
          break;
        }
        case "End": {
          event.preventDefault();
          focusItem(values[values.length - 1]);
          break;
        }
        case getMenuSubmenuOpenKey(dir): {
          event.preventDefault();
          if (highlightedValue) {
            const el = getItemElement(highlightedValue);
            if (el?.dataset.slot === "menu-sub-trigger") {
              el.click();
            }
          }
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          if (highlightedValue) {
            const el = getItemElement(highlightedValue);
            el?.click();
          }
          break;
        }
        case "Tab": {
          event.preventDefault();
          const boundary = ownerBoundaryRef.current ?? triggerRef.current ?? focusOriginRef.current;
          const direction = event.shiftKey ? "before" : "after";
          onClose("tab");
          requestAnimationFrame(() => {
            const destination = boundary
              ? getTabbableOutsideBoundary(
                  boundary,
                  direction,
                  (element) => Boolean(element.closest("[role='menu']")),
                )
              : null;
            destination?.focus({ preventScroll: true });
          });
          break;
        }
        default: {
          if (ctx.typeahead !== false && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
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
      focusOriginRef,
      loop,
      onClose,
      onKeyDownCapture,
      ownerBoundaryRef,
      triggerRef,
      ctx.typeahead,
    ],
  );


  const contentLayerRef = useOverlayLayerHost();
  const composedRef = useMemo(
    () => composeRefs(internalRef, contentRef, presenceRef, ref, contentLayerRef),
    [contentRef, presenceRef, ref, contentLayerRef],
  );
  const layerHostRef = useOverlayLayerHost();
  const positionerRef = useMemo(() => composeRefs(refs.setFloating, setPositioner, layerHostRef), [refs.setFloating, setPositioner, layerHostRef]);

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      const cleanup = composedRef(node);
      setModalLayerContent(modalLayer, node);
      return cleanup;
    },
    [composedRef, modalLayer],
  );

  useEffect(() => {
    const point = anchorPoint ?? ctx.anchorPoint;
    refs.setPositionReference(point ? {
      getBoundingClientRect: () => ({
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        top: point.y,
        right: point.x,
        bottom: point.y,
        left: point.x,
      }),
    } : p?.getAnchorElement?.() ?? (p?.getAnchorRect ? { contextElement: triggerRef.current ?? undefined, getBoundingClientRect: () => normalizeMenuAnchorRect(p.getAnchorRect!()) } : triggerRef.current));
  }, [anchorPoint, ctx.anchorPoint, ctx.triggerValue, p, refs, triggerRef]);

  const dataState = isOpen ? "open" : "closed";
  const actualSide = sideFromPlacement(placement);
  const actualAlign = alignFromPlacement(placement);
  const arrowData = middlewareData.arrow;
  const contentContextValue = useMemo<MenuContentContextValue>(() => ({
    arrowHost: positioner,
    updatePosition: update,
    arrowVisible: isOpen && isPositioned,
    arrowRef,
    side: actualSide,
    align: actualAlign,
    arrowX: arrowData?.x,
    arrowY: arrowData?.y,
  }), [actualAlign, actualSide, arrowData?.x, arrowData?.y, positioner, isOpen, isPositioned, update]);
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
    id: menuId,
    role: "menu",
    "aria-orientation": "vertical" as const,
    "aria-label": ariaLabel,
    "aria-labelledby": !ariaLabel && triggerRef.current ? triggerRef.current.id || triggerId : undefined,
    dir,
    tabIndex: -1,
    "data-slot": dataSlot,
    "data-state": dataState,
    // Presence may retain an exiting menu; it must no longer receive input
    // or steal focus restored by another overlay.
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
    onKeyDown: composeEventHandlers(restProps.onKeyDown, handleKeyDown),
  };
  const contentElement = asChild
    ? cloneAndMerge(children, behaviorProps)
    : renderElement(render, "div", { ...behaviorProps, children });
  const positionedContent = <div ref={positionerRef} data-atom-menu-positioner="" hidden={!isPresent} style={{ ...floatingStyles, width: "max-content", visibility: (!isPositioned && isOpen) || middlewareData.hide?.referenceHidden ? "hidden" : undefined, pointerEvents: isOpen ? undefined : "none" }}>{contentElement}</div>;

  if (!shouldRender) return null;

  return (
    <Portal container={portalContext?.container ?? triggerRef.current?.ownerDocument.body} disabled={portalContext !== null}>
      <DirectionProvider dir={dir}>
        <MenuContentContextProvider value={contentContextValue}>
          <MenuPortalContextProvider value={null}>{Activity ? <Activity mode={isPresent ? "visible" : "hidden"}>{positionedContent}</Activity> : positionedContent}</MenuPortalContextProvider>
        </MenuContentContextProvider>
      </DirectionProvider>
    </Portal>
  );
});

function isMenuSubContent(target: Node): boolean {
  return target.nodeType === 1 && (target as Element).closest("[data-menu-sub-content]") !== null;
}
