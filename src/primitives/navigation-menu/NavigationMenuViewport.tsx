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
  type KeyboardEvent,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import { FOCUSABLE_SELECTOR } from "../../hooks/focus.js";
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
  getNavigationMenuGeometry,
  getNavigationMenuGeometryStyle,
  getNavigationMenuViewportPosition,
  getNavigationMenuViewportPositionStyle,
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
  /** Minimum distance, in pixels, between the resolved viewport and the visible browser viewport. @default 8 */
  collisionPadding?: number;
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
    collisionPadding = 8,
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
    getControlElement,
    getContentNode,
    getItemValues,
    getNextTriggerValue,
    getTriggerElement,
    idPrefix,
    loop,
    onValueChange,
    orientation,
    previousValue,
    rootRef,
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
    const root = rootRef.current;
    const trigger = value ? getTriggerElement(value) : null;

    if (!value || !activeContent || !root || !trigger) {
      setViewportSizeStyle(null);
      return;
    }

    const contentRect = activeContent.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const visualViewport = window.visualViewport;
    const boundaryRect = {
      left: visualViewport?.offsetLeft ?? 0,
      top: visualViewport?.offsetTop ?? 0,
      width: visualViewport?.width ?? document.documentElement.clientWidth,
      height: visualViewport?.height ?? document.documentElement.clientHeight,
    };
    const viewportWidth = activeContent.scrollWidth || contentRect.width;
    setViewportSizeStyle({
      ...getNavigationMenuViewportSizeStyle(
        viewportWidth,
        activeContent.scrollHeight || contentRect.height,
      ),
      ...getNavigationMenuGeometryStyle(
        getNavigationMenuGeometry({
          rootRect,
          triggerRect,
        }),
      ),
      ...getNavigationMenuViewportPositionStyle(
        getNavigationMenuViewportPosition({
          rootRect,
          triggerRect,
          viewportWidth,
          boundaryRect,
          collisionPadding,
        }),
      ),
    });
  }, [collisionPadding, getTriggerElement, rootRef, value]);

  const activeEntry = value ? getContentNode(value) : null;
  const contentLoop = activeEntry?.loop ?? loop;

  const motionDirection = value
    ? computeMotionDirection(value, previousValue, getItemValues())
    : undefined;

  const contentId = value ? `${idPrefix}-content-${value}` : undefined;

  const handleContentKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const activeContent = activeContentRef.current;
      if (!value || !activeContent) return;

      const focusable = Array.from(
        activeContent.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const activeElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      const currentIndex = activeElement ? focusable.indexOf(activeElement) : -1;

      const focusTarget = (target: HTMLElement | null) => {
        if (!target) return;
        event.preventDefault();
        target.focus({ preventScroll: true });
      };

      const getOrderedTarget = (direction: "next" | "previous") => {
        if (focusable.length === 0) return null;

        if (currentIndex === -1) {
          return direction === "next" ? focusable[0] : focusable[focusable.length - 1];
        }

        const nextIndex = direction === "next"
          ? currentIndex + 1
          : currentIndex - 1;

        if (nextIndex >= 0 && nextIndex < focusable.length) {
          return focusable[nextIndex] ?? null;
        }

        if (!contentLoop) return null;
        return direction === "next"
          ? focusable[0] ?? null
          : focusable[focusable.length - 1] ?? null;
      };

      switch (event.key) {
        case "Tab": {
          if (focusable.length === 0) break;

          const isFirst = currentIndex === 0;
          const isLast = currentIndex === focusable.length - 1;

          if (event.shiftKey && isFirst) {
            event.preventDefault();
            getTriggerElement(value)?.focus({ preventScroll: true });
          } else if (!event.shiftKey && isLast) {
            const nextValue = getNextTriggerValue(value, "next");
            const nextControl = nextValue ? getControlElement(nextValue) : null;

            if (nextControl) {
              event.preventDefault();
              onValueChange(null);
              nextControl.focus({ preventScroll: true });
            }
          }
          break;
        }
        case "Escape": {
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
          const trigger = getTriggerElement(value);
          onValueChange(null);
          trigger?.focus({ preventScroll: true });
          break;
        }
        case "ArrowDown": {
          if (focusable.length === 0) break;
          focusTarget(getOrderedTarget("next"));
          break;
        }
        case "ArrowUp": {
          if (focusable.length === 0) break;
          focusTarget(getOrderedTarget("previous"));
          break;
        }
        case "Home": {
          if (focusable.length === 0) break;
          focusTarget(focusable[0] ?? null);
          break;
        }
        case "End": {
          if (focusable.length === 0) break;
          focusTarget(focusable[focusable.length - 1] ?? null);
          break;
        }
      }
    },
    [
      getControlElement,
      getNextTriggerValue,
      getTriggerElement,
      contentLoop,
      onValueChange,
      value,
    ],
  );

  useSafeLayoutEffect(() => {
    measure();

    if (!value) return undefined;

    const activeContent = activeContentRef.current;
    const root = rootRef.current;
    const trigger = getTriggerElement(value);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);

    if (activeContent) resizeObserver?.observe(activeContent);
    if (root) resizeObserver?.observe(root);
    if (trigger) resizeObserver?.observe(trigger);

    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [getTriggerElement, measure, rootRef, value]);

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
        onKeyDown: composeEventHandlers(
          activeEntry.props?.onKeyDown,
          handleContentKeyDown,
        ),
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
