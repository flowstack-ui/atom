"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type PointerEventHandler,
  type ReactNode,
  type UIEventHandler,
  type WheelEventHandler,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useCarouselContext } from "./context.js";
import { getClosestCarouselValue } from "./utils.js";

type CarouselViewportNativeProps = NativeDivProps<"children">;

export interface CarouselViewportProps extends CarouselViewportNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CarouselViewport = forwardRef<HTMLDivElement, CarouselViewportProps>(
  function CarouselViewport(
    {
      children,
      render,
      asChild,
      className,
      "data-slot": dataSlot = "carousel-viewport",
      onPointerDown,
      onScroll,
      onWheel,
      ...restProps
    },
    ref,
  ) {
    const context = useCarouselContext();
    const internalRef = useRef<HTMLDivElement>(null);
    const scrollEndTimerRef = useRef<number | null>(null);
    const composedRef = useMemo(
      () => composeRefs(internalRef, context.setViewportElement, ref),
      [context.setViewportElement, ref],
    );

    useEffect(() => () => {
      if (scrollEndTimerRef.current !== null) window.clearTimeout(scrollEndTimerRef.current);
    }, []);

    const updateFromScroll = useCallback(() => {
      const viewport = internalRef.current;
      if (!viewport) return;
      const slides = context.getSlideValues().flatMap((value) => {
        const element = context.getSlideElement(value);
        return element ? [{ value, element }] : [];
      });
      const closestValue = getClosestCarouselValue(viewport, slides, context.dir);
      if (closestValue && closestValue !== context.activeValue) {
        context.selectValue(closestValue, "scroll");
      }
    }, [context]);

    const handleScroll: UIEventHandler<HTMLDivElement> = () => {
      if (scrollEndTimerRef.current !== null) window.clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = window.setTimeout(() => {
        scrollEndTimerRef.current = null;
        updateFromScroll();
      }, 120);
    };
    const handlePointerDown: PointerEventHandler<HTMLDivElement> = () => {
      context.stopAutoPlay();
    };
    const handleWheel: WheelEventHandler<HTMLDivElement> = () => {
      context.stopAutoPlay();
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      "aria-atomic": "false",
      "aria-live": context.autoPlay ? "off" : "polite",
      "data-slot": dataSlot,
      "data-state": context.isPlaying
        ? "playing"
        : context.autoPlay ? "paused" : "stopped",
      "data-direction": context.dir,
      className,
      onPointerDown: composeEventHandlers(onPointerDown, handlePointerDown),
      onScroll: composeEventHandlers(onScroll, handleScroll),
      onWheel: composeEventHandlers(onWheel, handleWheel),
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
