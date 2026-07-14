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
    getTriggerElement,
    idPrefix,
    onValueChange,
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

  const handleContentKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const activeContent = activeContentRef.current;
      if (!value || !activeContent) return;

      const focusable = Array.from(
        activeContent.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);

      const focusAt = (index: number) => {
        const target = focusable[index];
        if (!target) return;
        event.preventDefault();
        target.focus({ preventScroll: true });
      };

      switch (event.key) {
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
          focusAt(currentIndex === -1 || currentIndex >= focusable.length - 1
            ? 0
            : currentIndex + 1);
          break;
        }
        case "ArrowUp": {
          if (focusable.length === 0) break;
          focusAt(currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1);
          break;
        }
        case "Home": {
          if (focusable.length === 0) break;
          focusAt(0);
          break;
        }
        case "End": {
          if (focusable.length === 0) break;
          focusAt(focusable.length - 1);
          break;
        }
      }
    },
    [getTriggerElement, onValueChange, value],
  );

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
