"use client";

import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEventHandler,
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
import { useNavigationMenuContext } from "./context.js";
import {
  getNavigationMenuViewportSizeStyle,
  type NavigationMenuGeometryStyle,
} from "./geometry.js";

type NavigationMenuViewportNativeProps = NativeDivProps<"children">;

const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface NavigationMenuViewportProps extends NavigationMenuViewportNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  forceMount?: boolean;
  className?: string;
  "data-slot"?: string;
}

function computeMotionDirection(
  currentValue: string,
  previousValue: string | null,
  itemValues: string[],
): "from-start" | "from-end" | undefined {
  if (previousValue === null) return "from-end";

  const prevIndex = itemValues.indexOf(previousValue);
  const currIndex = itemValues.indexOf(currentValue);

  if (prevIndex === -1 || currIndex === -1) return undefined;

  return currIndex > prevIndex ? "from-end" : "from-start";
}

export const NavigationMenuViewport = forwardRef<
  HTMLDivElement,
  NavigationMenuViewportProps
>(function NavigationMenuViewport(
  {
    children,
    asChild,
    render,
    forceMount = false,
    className,
    style,
    onPointerEnter,
    onPointerLeave,
    "data-slot": dataSlot = "navigation-menu-viewport",
    ...restProps
  },
  ref,
) {
  const ctx = useNavigationMenuContext();
  const {
    cancelCloseTimer,
    getContentNode,
    getItemValues,
    idPrefix,
    orientation,
    previousValue,
    startCloseTimer,
    value,
  } = ctx;
  const internalRef = useRef<HTMLDivElement>(null);
  const activeContentRef = useRef<HTMLDivElement>(null);
  const [viewportSizeStyle, setViewportSizeStyle] =
    useState<NavigationMenuGeometryStyle | null>(null);

  const isOpen = value !== null;
  const composedRef = useMemo(() => composeRefs(internalRef, ref), [ref]);

  const handlePointerEnter: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    cancelCloseTimer();
  }, [cancelCloseTimer]);

  const handlePointerLeave: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    startCloseTimer();
  }, [startCloseTimer]);

  const measure = useCallback(() => {
    const activeContent = activeContentRef.current;

    if (!value || !activeContent) {
      setViewportSizeStyle(null);
      return;
    }

    const contentRect = activeContent.getBoundingClientRect();
    setViewportSizeStyle(
      getNavigationMenuViewportSizeStyle(
        activeContent.scrollWidth || contentRect.width,
        activeContent.scrollHeight || contentRect.height,
      ),
    );
  }, [value]);

  const activeEntry = value ? getContentNode(value) : null;

  const motionDirection = value
    ? computeMotionDirection(value, previousValue, getItemValues())
    : undefined;

  const contentId = value ? `${idPrefix}-content-${value}` : undefined;

  useSafeLayoutEffect(() => {
    measure();

    if (!value) return undefined;

    const activeContent = activeContentRef.current;
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);

    if (activeContent) resizeObserver?.observe(activeContent);

    window.addEventListener("resize", measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, value]);

  if (!forceMount && (!isOpen || !activeEntry)) return null;

  const viewportStyle: CSSProperties = {
    ...(style as CSSProperties),
    ...(viewportSizeStyle ?? {}),
  };

  const contentProps: Record<string, unknown> | null = activeEntry
    ? {
        ...activeEntry.props,
        ref: activeContentRef,
        id: contentId,
        tabIndex: -1,
        "data-slot": activeEntry.dataSlot,
        "data-state": "open",
        "data-motion": motionDirection,
        className: activeEntry.className,
      }
    : null;

  const activeContentElement = activeEntry && contentProps
    ? activeEntry.asChild
      ? cloneAndMerge(activeEntry.node, contentProps)
      : renderElement(activeEntry.render, "div", {
          ...contentProps,
          children: activeEntry.node,
        })
    : null;
  const activeContent = activeContentElement && value
    ? <Fragment key={value}>{activeContentElement}</Fragment>
    : null;

  const viewportProps: Record<string, unknown> = {
    ...restProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-state": isOpen ? "open" : "closed",
    "data-orientation": orientation,
    className,
    style: viewportStyle,
    onPointerEnter: composeEventHandlers(onPointerEnter, handlePointerEnter),
    onPointerLeave: composeEventHandlers(onPointerLeave, handlePointerLeave),
  };

  if (asChild) {
    return cloneAndMerge(children, { ...viewportProps, children: activeContent });
  }

  return renderElement(render, "div", {
    ...viewportProps,
    children: activeContent,
  });
});
