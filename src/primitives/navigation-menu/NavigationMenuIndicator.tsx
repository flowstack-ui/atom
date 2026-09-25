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
import { usePresence } from "../../hooks/usePresence.js";
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
  const { getTriggerElement, getViewportNode, orientation, rootRef, value } = ctx;
  const indicatorRef = useRef<HTMLDivElement>(null);
  const isVisible = value !== null;
  const presence = usePresence({ present: isVisible });
  const [geometryStyle, setGeometryStyle] =
    useState<NavigationMenuGeometryStyle | null>(null);

  const measure = useCallback(() => {
    if (!value) {
      // Closing artwork retains its last measured position through exit.
      return;
    }

    const indicator = indicatorRef.current;
    const root = (indicator?.offsetParent as HTMLElement | null) ?? rootRef.current;
    const trigger = getTriggerElement(value);

    if (!root || !trigger) {
      setGeometryStyle(null);
      return;
    }

    const viewport = getViewportNode();
    setGeometryStyle(
      {
      ...getNavigationMenuGeometryStyle(
        getNavigationMenuGeometry({
          rootRect: root.getBoundingClientRect(),
          triggerRect: trigger.getBoundingClientRect(),
        }),
      ),
      // Expose layout bounds, not animated visual bounds. The styled arrow
      // can stay inside a collision-shifted/end-aligned shared viewport.
      ...(viewport ? {
        "--atom-navigation-menu-viewport-start": `${viewport.offsetLeft}px`,
        "--atom-navigation-menu-viewport-end": `${viewport.offsetLeft + viewport.offsetWidth}px`,
      } : {}),
      },
    );
  }, [getTriggerElement, getViewportNode, rootRef, value]);

  useSafeLayoutEffect(() => {
    measure();

    if (!value) return undefined;

    const indicator = indicatorRef.current;
    const root = (indicator?.offsetParent as HTMLElement | null) ?? rootRef.current;
    const trigger = getTriggerElement(value);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);

    resizeObserver?.observe(root ?? document.documentElement);
    if (trigger) resizeObserver?.observe(trigger);
    const viewport = getViewportNode();
    if (viewport) resizeObserver?.observe(viewport);
    const positionObserver = viewport && typeof MutationObserver !== "undefined"
      ? new MutationObserver(measure) : null;
    if (viewport) positionObserver?.observe(viewport, { attributes: true, attributeFilter: ["style"] });

    window.addEventListener("resize", measure);

    return () => {
      resizeObserver?.disconnect();
      positionObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [getTriggerElement, getViewportNode, measure, rootRef, value]);

  const composedRef = useMemo(() => composeRefs(indicatorRef, ref, presence.ref), [ref, presence.ref]);

  if (!forceMount && !isVisible && !presence.isPresent) return null;

  const indicatorStyle: CSSProperties = {
    ...(style as CSSProperties),
    ...(geometryStyle ?? {}),
  };

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref: composedRef,
    "aria-hidden": true,
    hidden: !isVisible && !presence.isPresent,
    "data-slot": dataSlot,
    "data-state": isVisible ? "visible" : "hidden",
    "data-orientation": orientation,
    "data-side": orientation === "vertical" ? ctx.viewportSide ?? (ctx.dir === "rtl" ? "left" : "right") : undefined,
    className,
    style: indicatorStyle,
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "div", { ...behaviorProps, children });
});
