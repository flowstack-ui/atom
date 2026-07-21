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
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import {
  TooltipContentContextProvider,
  useTooltipContext,
  type TooltipContentContextValue,
} from "./context.js";

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";

type TooltipContentNativeProps = NativeDivProps<"children" | "role">;

export interface TooltipContentProps extends TooltipContentNativeProps {
  children: ReactNode;
  side?: TooltipSide;
  align?: TooltipAlign;
  sideOffset?: number;
  className?: string;
  ariaLabel?: string;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  "data-slot"?: string;
}

function toPlacement(side: TooltipSide, align: TooltipAlign): Placement {
  if (align === "center") return side;
  return `${side}-${align === "start" ? "start" : "end"}`;
}

function sideFromPlacement(placement: Placement): TooltipSide {
  return placement.split("-")[0] as TooltipSide;
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
function TooltipContent(
  {
    children,
    side = "top",
    align = "center",
    sideOffset = 4,
    className,
    ariaLabel,
    onMouseEnter,
    onMouseLeave,
    "data-slot": dataSlot = "tooltip",
    style,
    ...restProps
  },
  ref,
) {
  const {
    isOpen,
    onClose,
    onContentEnter,
    onContentLeave,
    tooltipId,
    triggerRef,
    variant,
  } = useTooltipContext();
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
      flip({ fallbackAxisSideDirection: "start" }),
      shift({ padding: 8 }),
      floatingArrow({ element: arrowRef, padding: 8 }),
    ],
    [sideOffset],
  );

  const { refs, floatingStyles, placement, middlewareData } = useFloating({
    elements: { reference: referenceElement },
    placement: toPlacement(side, align),
    middleware,
    whileElementsMounted: autoUpdate,
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, presenceRef, ref),
    [presenceRef, ref, refs.setFloating],
  );

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      composedRef(node);
    },
    [composedRef],
  );

  const actualSide = sideFromPlacement(placement);
  const arrowData = middlewareData.arrow;
  const contentContextValue: TooltipContentContextValue = useMemo(
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
    <TooltipContentContextProvider value={contentContextValue}>
      <div
        {...restProps}
        ref={setFloatingRef}
        id={tooltipId}
        role="tooltip"
        data-slot={dataSlot}
        data-state={isOpen ? "open" : "closed"}
        data-side={actualSide}
        data-variant={variant}
        {...(isPositioned ? { "data-positioned": "" } : {})}
        aria-label={ariaLabel}
        className={className}
        style={{
          ...style,
          ...floatingStyles,
        }}
        onMouseEnter={composeEventHandlers(onMouseEnter, onContentEnter)}
        onMouseLeave={composeEventHandlers(onMouseLeave, onContentLeave)}
      >
        {children}
      </div>
    </TooltipContentContextProvider>
  );
});
