"use client";

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
import {
  arrow as floatingArrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Placement,
} from "@floating-ui/react";
import { usePresence } from "../../hooks/usePresence.js";
import { useDirection } from "../direction/index.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  getFloatingAvailableSizeMiddleware,
  getFloatingFallbackPlacements,
  resolveFloatingDirection,
} from "../../utils/floatingPlacement.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
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
  } = useHoverCardContext();
  const contextDir = useDirection();
  const arrowRef = useRef<SVGSVGElement>(null);
  const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
  const [isPositioned, setIsPositioned] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isPresent) return undefined;
    setIsPositioned(false);
    const raf = requestAnimationFrame(() => setIsPositioned(true));
    return () => cancelAnimationFrame(raf);
  }, [isPresent]);

  useEffect(() => {
    setReferenceElement(triggerRef.current);
  }, [isOpen, triggerRef]);

  const middleware = useMemo(
    () => [
      offset(sideOffset),
      flip({
        fallbackPlacements: getFloatingFallbackPlacements(side, align),
        fallbackStrategy: "bestFit",
      }),
      shift({ padding: 8 }),
      getFloatingAvailableSizeMiddleware(),
      floatingArrow({ element: arrowRef, padding: 8 }),
    ],
    [align, side, sideOffset],
  );

  const { refs, floatingStyles, placement, middlewareData } = useFloating({
    rootContext: floatingRootContext,
    elements: { reference: referenceElement },
    placement: toPlacement(side, align),
    middleware,
    whileElementsMounted: autoUpdate,
  });

  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, setContentElement, presenceRef, ref),
    [presenceRef, ref, refs.setFloating, setContentElement],
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

  if (!isPresent) return null;

  return (
    <HoverCardContentContextProvider value={contentContextValue}>
      <div
        {...getFloatingProps({ ...restProps, onMouseEnter, onMouseLeave })}
        ref={setFloatingRef}
        id={hoverCardId}
        data-slot={dataSlot}
        data-state={isOpen ? "open" : "closed"}
        data-side={actualSide}
        dir={dirProp ?? resolvedDir}
        {...(isPositioned ? { "data-positioned": "" } : {})}
        aria-label={ariaLabel}
        className={className}
        style={{
          ...style,
          ...floatingStyles,
        }}
      >
        {children}
      </div>
    </HoverCardContentContextProvider>
  );
});
