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
import { useScrollLock } from "../../hooks/useScrollLock.js";
import { Portal } from "../../utils/Portal.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { getTypeaheadMatch } from "../../utils/typeahead.js";
import { useDirection } from "../direction/index.js";
import { setModalLayerContent } from "../modal/layer.js";
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
    side = "bottom",
    align = "start",
    sideOffset = 4,
    loop: loopProp,
    className,
    ariaLabel,
    anchorPoint,
    asChild = false,
    render,
    onInteractOutside,
    onKeyDownCapture,
    style,
    "data-slot": dataSlot = "menu-content",
    ...restProps
  },
  ref,
) {
  const ctx = useMenuContext();
  const portalContext = useMenuPortalContext();
  const dir = useDirection();
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
  const internalRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
  const [isPositioned, setIsPositioned] = useState(false);
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

  const focusItem = useCallback((value: string) => {
    onHighlight(value);
    const item = getItemElement(value);
    item?.focus({ preventScroll: true });
    item?.scrollIntoView({ block: "nearest" });
  }, [getItemElement, onHighlight]);

  useEffect(() => {
    if (!isPresent) return undefined;
    setIsPositioned(false);
    const raf = requestAnimationFrame(() => {
      setIsPositioned(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [isPresent]);

  useEffect(() => {
    if (!isOpen || !isPresent) {
      hasAppliedInitialHighlightRef.current = false;
      return undefined;
    }

    if (highlightedValue) {
      hasAppliedInitialHighlightRef.current = true;
      return undefined;
    }

    if (hasAppliedInitialHighlightRef.current || initialHighlight === null) return undefined;

    const raf = requestAnimationFrame(() => {
      const values = getItemValues();
      if (values.length > 0) {
        hasAppliedInitialHighlightRef.current = true;
        focusItem(initialHighlight === "last" ? values[values.length - 1] : values[0]);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [focusItem, getItemValues, highlightedValue, initialHighlight, isOpen, isPresent]);

  useEffect(() => {
    if (!isOpen || !highlightedValue) return;
    const el = getItemElement(highlightedValue);
    el?.scrollIntoView({ block: "nearest" });
  }, [getItemElement, highlightedValue, isOpen]);

  const clickAwayRefs = useMemo(
    () => [internalRef, triggerRef],
    [triggerRef],
  );
  useOutsideInteraction({
    refs: clickAwayRefs,
    onInteractOutside: (event) => {
      onInteractOutside?.(event);
      if (!event.defaultPrevented) {
        onClose(modal ? "programmatic" : "interactOutside");
      }
    },
    enabled: isOpen,
    ignore: (target) => openSubMenuId !== null && isMenuSubContent(target),
  });

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
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
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
    ],
  );

  const referenceElement = anchorPoint ? null : triggerRef.current;
  const { refs, floatingStyles, placement, middlewareData } = useFloating({
    elements: { reference: referenceElement },
    placement: toPlacement(side, align),
    middleware: [
      offset(sideOffset),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      sizeMiddleware({
        padding: 8,
        apply({ availableHeight, availableWidth, elements, rects }) {
          Object.assign(elements.floating.style, {
            "--atom-menu-available-width": `${availableWidth}px`,
            "--atom-menu-available-height": `${availableHeight}px`,
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

  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, internalRef, contentRef, presenceRef, ref),
    [contentRef, presenceRef, ref, refs.setFloating],
  );

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      composedRef(node);
      setModalLayerContent(modalLayer, node);
    },
    [composedRef, modalLayer],
  );

  useEffect(() => {
    if (!anchorPoint) return;
    refs.setReference({
      getBoundingClientRect: () => ({
        x: anchorPoint.x,
        y: anchorPoint.y,
        width: 0,
        height: 0,
        top: anchorPoint.y,
        right: anchorPoint.x,
        bottom: anchorPoint.y,
        left: anchorPoint.x,
      }),
    });
  }, [anchorPoint, refs]);

  const dataState = isOpen ? "open" : "closed";
  const actualSide = sideFromPlacement(placement);
  const actualAlign = alignFromPlacement(placement);
  const arrowData = middlewareData.arrow;
  const contentContextValue = useMemo<MenuContentContextValue>(() => ({
    arrowRef,
    side: actualSide,
    align: actualAlign,
    arrowX: arrowData?.x,
    arrowY: arrowData?.y,
  }), [actualAlign, actualSide, arrowData?.x, arrowData?.y]);
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
    "aria-labelledby": !ariaLabel && triggerRef.current ? triggerId : undefined,
    tabIndex: -1,
    "data-slot": dataSlot,
    "data-state": dataState,
    "data-side": actualSide,
    "data-align": actualAlign,
    ...(isPositioned ? { "data-positioned": "" } : {}),
    className,
    style: { ...style, ...floatingStyles, "--atom-menu-transform-origin": transformOrigin } as CSSProperties,
    onKeyDown: composeEventHandlers(restProps.onKeyDown, handleKeyDown),
  };
  const contentElement = asChild
    ? cloneAndMerge(children, behaviorProps)
    : renderElement(render, "div", { ...behaviorProps, children });

  if (!isPresent) return null;

  return (
    <Portal container={portalContext?.container} disabled={portalContext !== null}>
      <MenuContentContextProvider value={contentContextValue}>
        <MenuPortalContextProvider value={null}>{contentElement}</MenuPortalContextProvider>
      </MenuContentContextProvider>
    </Portal>
  );
});

function isMenuSubContent(target: Node): boolean {
  return target instanceof Element && target.closest("[data-menu-sub-content]") !== null;
}
