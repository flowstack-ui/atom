"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useNavigationMenuContext } from "./context.js";
import {
  getNavigationMenuGeometry,
  getNavigationMenuGeometryStyle,
  type NavigationMenuGeometryStyle,
} from "./geometry.js";

type NavigationMenuIndicatorNativeProps = NativeDivProps<"children">;

const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface NavigationMenuIndicatorProps
  extends NavigationMenuIndicatorNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  forceMount?: boolean;
  className?: string;
  "data-slot"?: string;
}

export const NavigationMenuIndicator = forwardRef<
  HTMLDivElement,
  NavigationMenuIndicatorProps
>(function NavigationMenuIndicator(
  {
    children,
    asChild,
    render,
    forceMount = false,
    className,
    style,
    "data-slot": dataSlot = "navigation-menu-indicator",
    ...restProps
  },
  ref,
) {
  const ctx = useNavigationMenuContext();
  const { getTriggerElement, orientation, rootRef, value } = ctx;
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [geometryStyle, setGeometryStyle] =
    useState<NavigationMenuGeometryStyle | null>(null);

  const measure = useCallback(() => {
    if (!value) {
      setGeometryStyle(null);
      return;
    }

    const indicator = indicatorRef.current;
    const root = indicator?.parentElement ?? rootRef.current;
    const trigger = getTriggerElement(value);

    if (!root || !trigger) {
      setGeometryStyle(null);
      return;
    }

    setGeometryStyle(
      getNavigationMenuGeometryStyle(
        getNavigationMenuGeometry({
          rootRect: root.getBoundingClientRect(),
          triggerRect: trigger.getBoundingClientRect(),
        }),
      ),
    );
  }, [getTriggerElement, rootRef, value]);

  useSafeLayoutEffect(() => {
    measure();

    if (!value) return undefined;

    const indicator = indicatorRef.current;
    const root = indicator?.parentElement ?? rootRef.current;
    const trigger = getTriggerElement(value);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);

    resizeObserver?.observe(root ?? document.documentElement);
    if (trigger) resizeObserver?.observe(trigger);

    window.addEventListener("resize", measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [getTriggerElement, measure, rootRef, value]);

  const composedRef = useMemo(() => composeRefs(indicatorRef, ref), [ref]);
  const isVisible = value !== null;

  if (!forceMount && !isVisible) return null;

  const indicatorStyle: CSSProperties = {
    ...(style as CSSProperties),
    ...(geometryStyle ?? {}),
  };

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref: composedRef,
    "aria-hidden": true,
    "data-slot": dataSlot,
    "data-state": isVisible ? "visible" : "hidden",
    "data-orientation": orientation,
    className,
    style: indicatorStyle,
    children,
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "div", behaviorProps);
});
