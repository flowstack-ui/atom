"use client";

import { arrowOffset, autoUpdateWithArrow } from "../../utils/floatingArrowPositioning.js";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import * as React from "react";
import {
  arrow as floatingArrow,
  offset,
  flip, shift, size, hide,
  useFloating,
  type Placement,
} from "@floating-ui/react";
import { useOverlayPresence } from "../../hooks/useOverlayPresence.js";
import { useFocusScopeContainer } from "../../hooks/focus.js";
import { useDirection } from "../direction/index.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  getFloatingAvailableSizeMiddleware,
  getFloatingVisibilityMiddleware,
  resolveFloatingDirection,
} from "../../utils/floatingPlacement.js";
import { cloneAndMerge, renderElement, composeRefs, type RenderProp } from "../../utils/slot.js";
import {
  HoverCardContentContextProvider,
  useHoverCardContext,
  type HoverCardContentContextValue,
} from "./context.js";

export type HoverCardSide = "top" | "right" | "bottom" | "left";
export type HoverCardAlign = "start" | "center" | "end";

type HoverCardContentNativeProps = NativeDivProps<"children">;

export interface HoverCardContentProps extends HoverCardContentNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  side?: HoverCardSide;
  align?: HoverCardAlign;
  sideOffset?: number;
  className?: string;
  ariaLabel?: string;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  "data-slot"?: string;
}

function toPlacement(side: HoverCardSide, align: HoverCardAlign): Placement {
  if (align === "center") return side;
  return `${side}-${align === "start" ? "start" : "end"}`;
}

function sideFromPlacement(placement: Placement): HoverCardSide {
  return placement.split("-")[0] as HoverCardSide;
}

export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(
function HoverCardContent(
  {
    children,
    asChild = false, render,
    side = "bottom",
    align = "center",
    sideOffset = 8,
    className,
    ariaLabel,
    dir: dirProp,
    onMouseEnter,
    onMouseLeave,
    "data-slot": dataSlot = "hover-card-content",
    style,
    ...restProps
  },
  ref,
) {
  const {
    isOpen,
    hoverCardId,
    triggerRef,
    setContentElement,
    floatingRootContext,
    getFloatingProps,
    lifecycle, positioning: p, triggerElement: referenceElement, updateRef,
  } = useHoverCardContext();
  const contextDir = useDirection();
  const arrowRef = useRef<SVGSVGElement>(null);
  const presence = useOverlayPresence({ open: isOpen, ...lifecycle });
  const presenceRef = presence.ref;
  useFocusScopeContainer(presence.node, presence.visible, undefined, {
    focusContainment: "owned", tabParticipation: "delegate", scrollParticipation: "allowed", isolation: "owned",
  });

  const middleware = useMemo(
    () => {
      const collision = { boundary: typeof p?.boundary === "function" ? p.boundary() : p?.boundary, padding: p?.overflowPadding ?? 8 };
      return [
      p?.offset !== undefined ? offset(p.offset) : arrowOffset(arrowRef, p?.gutter ?? sideOffset, p?.shift ?? 0),
        ...(p ? [p.flip !== false && flip({ ...collision, fallbackPlacements: Array.isArray(p.flip) ? p.flip : undefined }), p.slide !== false && shift({ ...collision, crossAxis: p.overlap })] : getFloatingVisibilityMiddleware(side, align)),
        p?.sizeMiddleware !== false && getFloatingAvailableSizeMiddleware(),
        (p?.sameWidth || p?.fitViewport) && size({ ...collision, apply({ rects, availableWidth, availableHeight, elements }) {
          elements.floating.style.setProperty("--atom-hover-card-reference-width", `${rects.reference.width}px`);
          elements.floating.style.setProperty("--atom-hover-card-available-width", `${Math.max(0, availableWidth)}px`);
          elements.floating.style.setProperty("--atom-hover-card-available-height", `${Math.max(0, availableHeight)}px`);
        } }),
        p?.hideWhenDetached && hide(collision),
        floatingArrow({ element: arrowRef, padding: p?.arrowPadding ?? 8 }),
      ];
    },
    [p, align, side, sideOffset],
  );

  const { refs, floatingStyles, placement, middlewareData, isPositioned, update } = useFloating({
    rootContext: floatingRootContext,
    elements: { reference: referenceElement },
    placement: p?.placement ?? toPlacement(side, align),
    strategy: p?.strategy ?? "absolute",
    transform: false,
    middleware,
    whileElementsMounted: (reference, floating, update) => {
      if (p?.listeners === false) { update(); return () => {}; }
      return autoUpdateWithArrow(arrowRef)(reference, floating, update, { ...(typeof p?.listeners === "object" ? p.listeners : {}), ...(p?.animationFrame === undefined ? {} : { animationFrame: p.animationFrame }) });
    },
  });
  useEffect(() => {
    refs.setPositionReference(p?.getAnchorElement?.() ?? (p?.getAnchorRect ? {
      contextElement: referenceElement ?? undefined,
      getBoundingClientRect: () => {
        const rect = p.getAnchorRect?.() ?? referenceElement?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
        return { ...rect, top: rect.y, left: rect.x, right: rect.x + rect.width, bottom: rect.y + rect.height };
      },
    } : referenceElement));
  }, [p, referenceElement, refs.setPositionReference]);
  useEffect(() => { updateRef.current = update; return () => { updateRef.current = null; }; }, [update, updateRef]);
  useEffect(() => { p?.onPositioned?.({ placed: isPositioned }); }, [isPositioned, p?.onPositioned]);

  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, setContentElement, presenceRef, presence.node, ref),
    [presenceRef, presence.node, ref, refs.setFloating, setContentElement],
  );

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      composedRef(node);
    },
    [composedRef],
  );

  const actualSide = sideFromPlacement(placement);
  const resolvedDir = resolveFloatingDirection(
    dirProp,
    referenceElement ?? triggerRef.current,
    contextDir,
  );
  const arrowData = middlewareData.arrow;
  const contentContextValue: HoverCardContentContextValue = useMemo(
    () => ({
      arrowRef,
      side: actualSide,
      arrowX: arrowData?.x,
      arrowY: arrowData?.y,
    }),
    [actualSide, arrowData?.x, arrowData?.y],
  );

  if (!presence.mounted) return null;

  const attributes = {
    ...getFloatingProps({ ...restProps, onMouseEnter, onMouseLeave }),
    ref: setFloatingRef, id: restProps.id ?? hoverCardId,
    "data-slot": dataSlot, "data-state": isOpen ? "open" : "closed",
    "data-side": actualSide, "data-placement": placement,
    "data-positioned": isPositioned ? "" : undefined,
    "data-initial-open": presence.skipEntry ? "" : undefined,
    hidden: !presence.visible || restProps.hidden,
    "aria-hidden": !presence.interactive ? true : undefined,
    dir: dirProp ?? resolvedDir, "aria-label": ariaLabel, className,
    style: { ...style, ...floatingStyles,
      ...(p?.sameWidth ? { width: "var(--atom-hover-card-reference-width)" } : {}),
      ...(p?.fitViewport ? { maxWidth: "var(--atom-hover-card-available-width)", maxHeight: "var(--atom-hover-card-available-height)" } : {}),
      ...(!isPositioned || middlewareData.hide?.referenceHidden ? { visibility: "hidden" as const } : {}),
      ...(!presence.visible ? { display: "none" } : {}),
    },
  };
  const panel = asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children });
  const Activity = (React as unknown as { Activity?: React.ComponentType<{ mode: "visible" | "hidden"; children: ReactNode }> }).Activity;

  return (
    <HoverCardContentContextProvider value={contentContextValue}>
      {Activity && lifecycle.hideMode === "activity" ? <Activity mode={presence.visible ? "visible" : "hidden"}>{panel}</Activity> : panel}
    </HoverCardContentContextProvider>
  );
});
