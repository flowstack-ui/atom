"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useMeasuredContentHeight } from "../../utils/useMeasuredContentHeight.js";
import { useAccordionContext, useAccordionItemContext } from "./context.js";

type AccordionContentNativeProps = NativeDivProps<"children" | "role">;

export interface AccordionContentProps extends AccordionContentNativeProps {
  /** Panel content. */
  children?: ReactNode;
  /** Keep content in DOM when closed. */
  keepMounted?: boolean;
  /** Render Content as a labelled region landmark. */
  landmark?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent(
    {
      children,
      keepMounted = false,
      landmark = true,
      render,
      asChild,
      className,
      "data-slot": dataSlot = "accordion-content",
      onAnimationEnd,
      style: styleProp,
      ...restProps
    },
    ref,
  ) {
    const { isOpen, contentId, triggerId } = useAccordionItemContext();
    const { orientation } = useAccordionContext();
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRef = useMemo(
      () => composeRefs(contentRef, ref),
      [ref],
    );
    const [isMounted, setIsMounted] = useState(isOpen || keepMounted);
    const [isAnimating, setIsAnimating] = useState(false);
    const initialOpenRef = useRef(isOpen);
    const hasTransitionedRef = useRef(false);

    if (initialOpenRef.current !== isOpen) {
      hasTransitionedRef.current = true;
    }

    const suppressAnimation =
      initialOpenRef.current && !hasTransitionedRef.current;

    const hasActiveCssAnimation = useCallback((element: HTMLDivElement): boolean => {
      const computed = window.getComputedStyle(element);

      const toMs = (value: string): number => {
        const token = value.trim();
        if (token.endsWith("ms")) return Number.parseFloat(token);
        if (token.endsWith("s")) return Number.parseFloat(token) * 1000;
        const parsed = Number.parseFloat(token);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const animationNames = computed.animationName
        .split(",")
        .map((name) => name.trim());
      const animationDurations = computed.animationDuration
        .split(",")
        .map(toMs);

      return (
        animationNames.some((name) => name !== "none") &&
        animationDurations.some((duration) => duration > 0)
      );
    }, []);

    useEffect(() => {
      if (isOpen || keepMounted) setIsMounted(true);
    }, [isOpen, keepMounted]);

    useMeasuredContentHeight(contentRef, isMounted || isOpen, children);

    const handleAnimationEnd = useCallback(() => {
      setIsAnimating(false);
      if (!isOpen && !keepMounted) {
        setIsMounted(false);
      }
    }, [isOpen, keepMounted]);

    useEffect(() => {
      if (!isMounted || suppressAnimation) return undefined;

      setIsAnimating(true);

      const frame = requestAnimationFrame(() => {
        const element = contentRef.current;
        if (!element || hasActiveCssAnimation(element)) return;

        setIsAnimating(false);
        if (!isOpen && !keepMounted) {
          setIsMounted(false);
        }
      });

      return () => cancelAnimationFrame(frame);
    }, [hasActiveCssAnimation, isMounted, isOpen, keepMounted, suppressAnimation]);

    if (!isMounted && !isOpen) return null;

    const dataState = isOpen ? "open" : "closed";
    const style: CSSProperties = {
      ...styleProp,
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: contentId,
      "data-slot": dataSlot,
      "data-state": dataState,
      ...(suppressAnimation ? { "data-initial-open": "" } : {}),
      "data-orientation": orientation,
      role: landmark ? "region" : undefined,
      "aria-labelledby": landmark ? triggerId : undefined,
      className,
      hidden: keepMounted && !isOpen && !isAnimating ? true : undefined,
      onAnimationEnd: composeEventHandlers(onAnimationEnd, handleAnimationEnd),
      style,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
