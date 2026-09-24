"use client";

import { arrowOffset, autoUpdateWithArrow } from "../../utils/floatingArrowPositioning.js";

import * as React from "react";
import { forwardRef, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { arrow as floatingArrow, flip, hide, offset, shift, size, useFloating, type Placement } from "@floating-ui/react";
import { usePresence } from "../../hooks/usePresence.js";
import { useDirection } from "../direction/index.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { getFloatingAvailableSizeMiddleware, getFloatingVisibilityMiddleware, resolveFloatingDirection } from "../../utils/floatingPlacement.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { TooltipContentContextProvider, useTooltipContext, type TooltipContentContextValue } from "./context.js";

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";
export interface TooltipContentProps extends NativeDivProps<"children" | "role"> {
  children: ReactNode;
  side?: TooltipSide;
  align?: TooltipAlign;
  sideOffset?: number;
  ariaLabel?: string;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(function TooltipContent(
  { children, side = "top", align = "center", sideOffset = 4, ariaLabel, asChild, render,
    dir: dirProp, onMouseEnter, onMouseLeave, "data-slot": dataSlot = "tooltip", style, ...props }, ref,
) {
  const api = useTooltipContext();
  const { isOpen, triggerRef, triggerValue, positioning: p, lifecycle } = api;
  const contextDir = useDirection();
  const arrowRef = useRef<SVGSVGElement>(null);
  const [scheduledPresent, setScheduledPresent] = useState(isOpen);
  useEffect(() => {
    if (lifecycle.immediate) { setScheduledPresent(isOpen); return; }
    const win = triggerRef.current?.ownerDocument.defaultView;
    if (!win) { setScheduledPresent(isOpen); return; }
    const frame = win.requestAnimationFrame(() => setScheduledPresent(isOpen));
    return () => win.cancelAnimationFrame(frame);
  }, [isOpen, lifecycle.immediate, triggerRef]);
  const desiredPresent = !api.disabled && (lifecycle.present ?? (lifecycle.immediate ? isOpen : scheduledPresent));
  const { isPresent, ref: presenceRef } = usePresence({ present: desiredPresent, onExitComplete: lifecycle.onExitComplete });
  const [everOpened, setEverOpened] = useState(isOpen);
  const initialOpen = useRef(isOpen);
  const transitioned = useRef(false);
  if (initialOpen.current !== isOpen) transitioned.current = true;
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  useEffect(() => { setReferenceElement(triggerRef.current); }, [isOpen, triggerValue, triggerRef]);
  useEffect(() => { if (isOpen) setEverOpened(true); }, [isOpen]);
  const middleware = useMemo(() => {
    const collision = { boundary: typeof p?.boundary === "function" ? p.boundary() : p?.boundary, padding: p?.overflowPadding ?? 8 };
    return [
      p?.offset !== undefined ? offset(p.offset) : arrowOffset(arrowRef, p?.gutter ?? sideOffset, p?.shift ?? 0),
      ...(p ? [p.flip !== false && flip({ ...collision, fallbackPlacements: Array.isArray(p.flip) ? p.flip : undefined }), p.slide !== false && shift({ ...collision, crossAxis: p.overlap })] : getFloatingVisibilityMiddleware(side, align)),
      p?.sizeMiddleware !== false && getFloatingAvailableSizeMiddleware(),
      (p?.sizeMiddleware !== false || p.sameWidth || p.fitViewport) && size({ ...collision, apply({ rects, availableWidth, availableHeight, elements }) {
        const node = elements.floating;
        node.style.setProperty("--atom-tooltip-reference-width", `${rects.reference.width}px`);
        node.style.setProperty("--atom-tooltip-available-width", `${Math.max(0, availableWidth)}px`);
        node.style.setProperty("--atom-tooltip-available-height", `${Math.max(0, availableHeight)}px`);
      } }),
      p?.hideWhenDetached && hide(collision),
      floatingArrow({ element: arrowRef, padding: p?.arrowPadding ?? 8 }),
    ];
  }, [p, sideOffset, side, align]);
  const virtualReference = useMemo(() => p?.getAnchorElement ? p.getAnchorElement() : p?.getAnchorRect ? {
    contextElement: referenceElement ?? undefined,
    getBoundingClientRect: () => {
      const rect = p.getAnchorRect?.() ?? referenceElement?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
      return { ...rect, top: rect.y, left: rect.x, right: rect.x + rect.width, bottom: rect.y + rect.height };
    },
  } : referenceElement, [p, referenceElement]);
  const { refs, floatingStyles, placement, middlewareData, isPositioned } = useFloating({
    elements: { reference: referenceElement },
    placement: p?.placement ?? (align === "center" ? side : `${side}-${align}` as Placement),
    strategy: p?.strategy ?? "absolute", transform: false, middleware, open: isOpen,
    whileElementsMounted: (reference, floating, update) => {
      if (p?.listeners === false) { update(); return () => {}; }
      return autoUpdateWithArrow(arrowRef)(reference, floating, update, { ...(typeof p?.listeners === "object" ? p.listeners : {}), ...(p?.animationFrame === undefined ? {} : { animationFrame: p.animationFrame }) });
    },
  });
  useEffect(() => { refs.setPositionReference(virtualReference); }, [refs.setPositionReference, virtualReference]);
  useEffect(() => { p?.onPositioned?.({ placed: isPositioned }); }, [isPositioned, p?.onPositioned]);
  const composedRef = useMemo(() => composeRefs(refs.setFloating, presenceRef, api.registerContent, ref), [refs.setFloating, presenceRef, api.registerContent, ref]);
  const actualSide = placement.split("-")[0] as TooltipSide;
  const contentContextValue = useMemo<TooltipContentContextValue>(() => ({
    arrowRef, side: actualSide, arrowX: middlewareData.arrow?.x, arrowY: middlewareData.arrow?.y,
  }), [actualSide, middlewareData.arrow?.x, middlewareData.arrow?.y]);
  const Activity = (React as unknown as { Activity?: React.ComponentType<{ mode: "visible" | "hidden"; children: ReactNode }> }).Activity;
  if (lifecycle.hideMode === "activity" && !Activity) throw new Error("Tooltip hideMode=activity requires React 19.2+. Use display-none on earlier React versions.");
  const mounted = isPresent || (!lifecycle.unmountOnExit && everOpened) || (!lifecycle.lazyMount && !everOpened);
  if (!mounted) return null;
  const attributes = {
    ...props, ref: composedRef, id: api.tooltipId, role: "tooltip", "data-slot": dataSlot,
    "data-state": isOpen ? "open" : "closed", "data-side": actualSide, "data-placement": placement,
    "data-variant": api.variant, "data-positioned": isPositioned ? "" : undefined,
    "data-initial-open": initialOpen.current && !transitioned.current && lifecycle.skipAnimationOnMount ? "" : undefined,
    dir: dirProp ?? resolveFloatingDirection(dirProp, referenceElement ?? triggerRef.current, contextDir),
    "aria-label": ariaLabel ?? api.ariaLabel, "aria-hidden": !isOpen ? true : undefined,
    hidden: !isPresent,
    style: { ...style, ...floatingStyles,
      ...(p?.sameWidth ? { width: "var(--atom-tooltip-reference-width)" } : {}),
      ...(p?.fitViewport ? { maxWidth: "var(--atom-tooltip-available-width)", maxHeight: "var(--atom-tooltip-available-height)", overflow: "auto" } : {}),
      ...(middlewareData.hide?.referenceHidden ? { visibility: "hidden" as const } : {}),
      ...(!isPresent ? { display: "none" } : {}),
    },
    onMouseEnter: composeEventHandlers(onMouseEnter, api.onContentEnter),
    onMouseLeave: composeEventHandlers(onMouseLeave, api.onContentLeave),
  };
  const element = asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children });
  return <TooltipContentContextProvider value={contentContextValue}>
    {Activity && lifecycle.hideMode === "activity" ? <Activity mode={isPresent ? "visible" : "hidden"}>{element}</Activity> : element}
  </TooltipContentContextProvider>;
});
