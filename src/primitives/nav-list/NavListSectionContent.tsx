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
import { useNavListContext, useNavListSectionContext } from "./context.js";

type NavListSectionContentNativeProps = NativeDivProps<"children" | "hidden">;

export interface NavListSectionContentProps extends NavListSectionContentNativeProps {
  /** Section content. */
  children?: ReactNode;
  /** Keep content mounted while the section is closed. */
  forceMount?: boolean;
  /** Override the rendered content element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const NavListSectionContent = forwardRef<HTMLDivElement, NavListSectionContentProps>(
  function NavListSectionContent(
    {
      children,
      forceMount = false,
      render,
      asChild,
      "data-slot": dataSlot = "nav-list-section-content",
      onAnimationEnd,
      style: styleProp,
      ...restProps
    },
    ref,
  ) {
    const { orientation } = useNavListContext();
    const { isOpen, collapsible, contentId, hasLabel, labelId, triggerId } =
      useNavListSectionContext();
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRef = useMemo(() => composeRefs(contentRef, ref), [ref]);
    const [isMounted, setIsMounted] = useState(isOpen || forceMount);
    const [isAnimating, setIsAnimating] = useState(false);
    const initialOpenRef = useRef(isOpen);
    const hasTransitionedRef = useRef(false);

    if (initialOpenRef.current !== isOpen) {
      hasTransitionedRef.current = true;
    }

    const suppressAnimation = !hasTransitionedRef.current;

    const hasActiveCssAnimation = useCallback((element: HTMLDivElement): boolean => {
      const computed = window.getComputedStyle(element);

      const toMs = (value: string): number => {
        const token = value.trim();
        if (token.endsWith("ms")) return Number.parseFloat(token);
        if (token.endsWith("s")) return Number.parseFloat(token) * 1000;
        const parsed = Number.parseFloat(token);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const animationNames = computed.animationName.split(",").map((name) => name.trim());
      const animationDurations = computed.animationDuration.split(",").map(toMs);

      return (
        animationNames.some((name) => name !== "none") &&
        animationDurations.some((duration) => duration > 0)
      );
    }, []);

    useEffect(() => {
      if (isOpen || forceMount) {
        setIsMounted(true);
      }
    }, [forceMount, isOpen]);

    useMeasuredContentHeight(contentRef, isMounted || isOpen, children);

    const handleAnimationEnd = useCallback(() => {
      setIsAnimating(false);
      if (!isOpen && !forceMount) {
        setIsMounted(false);
      }
    }, [forceMount, isOpen]);

    useEffect(() => {
      if (!isMounted || suppressAnimation) return undefined;

      setIsAnimating(true);

      const frame = requestAnimationFrame(() => {
        const element = contentRef.current;
        if (!element || hasActiveCssAnimation(element)) return;

        setIsAnimating(false);
        if (!isOpen && !forceMount) {
          setIsMounted(false);
        }
      });

      return () => cancelAnimationFrame(frame);
    }, [forceMount, hasActiveCssAnimation, isMounted, isOpen, suppressAnimation]);

    if (!isMounted && !isOpen) return null;

    const style: CSSProperties = {
      ...styleProp,
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: contentId,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      "data-state": isOpen ? "open" : "closed",
      ...(initialOpenRef.current && suppressAnimation ? { "data-initial-open": "" } : {}),
      ...(collapsible ? { "data-collapsible": "" } : {}),
      "aria-labelledby": hasLabel ? labelId : collapsible ? triggerId : undefined,
      hidden: forceMount && !isOpen && !isAnimating ? true : undefined,
      onAnimationEnd: composeEventHandlers(onAnimationEnd, handleAnimationEnd),
      style,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "div", {
      ...behaviorProps,
      children,
    });
  },
);
