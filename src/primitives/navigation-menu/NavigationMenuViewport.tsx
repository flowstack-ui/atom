"use client";
import { ownsNavigationKey } from "./keyboard.js";

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
import { usePresence } from "../../hooks/usePresence.js";
import { NavigationMenuPanel } from "./NavigationMenuPanel.js";
import { getVerticalNavigationGeometry } from "./verticalGeometry.js";
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
  align?: "center" | "start" | "end";
  /** Rectangle used for alignment. The indicator always follows the trigger. */
  anchor?: "trigger" | "navigation";
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
    align = "center",
    anchor = "trigger",
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
  const [viewportSizeStyle, setViewportSizeStyle] =
    useState<NavigationMenuGeometryStyle | null>(null);

  const isOpen = value !== null;
  const presence = usePresence({ present: isOpen });
  const [everOpened, setEverOpened] = useState(isOpen);
  useEffect(() => { if (isOpen) setEverOpened(true); }, [isOpen]);
  const composedRef = useMemo(() => composeRefs(internalRef, ctx.viewportRef, ref, presence.ref), [ref, ctx.viewportRef, presence.ref]);
  const getActiveContent = useCallback(() => {
    const tree = internalRef.current?.getRootNode();
    return value && tree && "getElementById" in tree
      ? (tree as Document | ShadowRoot).getElementById(`${idPrefix}-content-${value}`)
      : null;
  }, [idPrefix, value]);

  const handlePointerEnter: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    cancelCloseTimer();
  }, [cancelCloseTimer]);

  const handlePointerLeave: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    startCloseTimer();
  }, [startCloseTimer]);

  const measure = useCallback(() => {
    const activeContent = getActiveContent();
    const root = rootRef.current;
    const trigger = value ? getTriggerElement(value) : null;

    if (!value || !activeContent || !root || !trigger) {
      return;
    }

    const contentRect = activeContent.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const doc = root.ownerDocument;
    const visualViewport = doc.defaultView?.visualViewport;
    const boundaryRect = {
      left: visualViewport?.offsetLeft ?? 0,
      top: visualViewport?.offsetTop ?? 0,
      width: visualViewport?.width ?? doc.documentElement.clientWidth,
      height: visualViewport?.height ?? doc.documentElement.clientHeight,
    };
    const contentStyle = doc.defaultView?.getComputedStyle(activeContent);
    const viewportStyle = doc.defaultView?.getComputedStyle(internalRef.current!);
    const pixels = (value: string | undefined) => Number.parseFloat(value ?? "") || 0;
    // Computed layout sizes are fractional and independent of enter/exit transforms.
    const contentExtras = (axis: "width" | "height") => contentStyle?.boxSizing === "border-box" ? 0
      : axis === "width"
        ? pixels(contentStyle?.paddingLeft) + pixels(contentStyle?.paddingRight) + pixels(contentStyle?.borderLeftWidth) + pixels(contentStyle?.borderRightWidth)
        : pixels(contentStyle?.paddingTop) + pixels(contentStyle?.paddingBottom) + pixels(contentStyle?.borderTopWidth) + pixels(contentStyle?.borderBottomWidth);
    const viewportWidth = (pixels(contentStyle?.width) + contentExtras("width") || activeContent.offsetWidth || contentRect.width)
      + pixels(viewportStyle?.borderLeftWidth) + pixels(viewportStyle?.borderRightWidth);
    const viewportHeight = (pixels(contentStyle?.height) + contentExtras("height") || activeContent.offsetHeight || contentRect.height)
      + pixels(viewportStyle?.borderTopWidth) + pixels(viewportStyle?.borderBottomWidth);
    const gapValue = viewportStyle?.getPropertyValue("--atom-navigation-menu-viewport-side-offset").trim() ?? "0";
    const gapUnit = gapValue.endsWith("rem") ? Number.parseFloat(doc.defaultView!.getComputedStyle(doc.documentElement).fontSize)
      : gapValue.endsWith("em") ? Number.parseFloat(viewportStyle!.fontSize) : 1;
    const gap = Math.max(0, (Number.parseFloat(gapValue) || 0) * gapUnit);
    const vertical = orientation === "vertical" ? getVerticalNavigationGeometry(rootRect, boundaryRect, viewportWidth, ctx.dir, Math.max(0, collisionPadding), gap) : null;
    if (vertical) ctx.setViewportSide(vertical.side);
    setViewportSizeStyle({
      ...getNavigationMenuViewportSizeStyle(
        viewportWidth,
        viewportHeight,
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
          triggerRect: anchor === "navigation" ? rootRect : triggerRect,
          viewportWidth,
          boundaryRect,
          collisionPadding,
          align,
          dir: ctx.dir,
          orientation,
          viewportHeight,
        }),
      ),
      ...(vertical ? {
        "--atom-navigation-menu-viewport-left": `${vertical.left}px`,
        "--atom-navigation-menu-viewport-available-width": `${vertical.availableWidth}px`,
      } : {}),
    });
  }, [collisionPadding, getTriggerElement, rootRef, value, align, anchor, ctx.dir, orientation, getActiveContent]);

  const activeEntry = value ? getContentNode(value) : null;
  const contentLoop = activeEntry?.loop ?? loop;

  const motionDirection = value
    ? computeMotionDirection(value, previousValue, getItemValues())
    : undefined;

  const contentId = value ? `${idPrefix}-content-${value}` : undefined;

  const handleContentKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (ownsNavigationKey(event.target, event.key)) return;
      const activeContent = getActiveContent();
      if (!value || !activeContent) return;

      const focusable = Array.from(
        activeContent.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const activeTree = activeContent.getRootNode() as Document | ShadowRoot;
      const activeElement = activeTree.activeElement as HTMLElement | null;
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
          activeEntry?.onEscapeKeyDown?.(event.nativeEvent);
          if (event.nativeEvent.defaultPrevented) return;
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
      activeEntry,
      rootRef,
      idPrefix,
      getActiveContent,
    ],
  );

  useSafeLayoutEffect(() => {
    measure();

    if (!value) return undefined;

    const doc = internalRef.current?.ownerDocument;
    const activeContent = getActiveContent();
    const root = rootRef.current;
    const trigger = getTriggerElement(value);
    const ResizeObserverCtor = doc?.defaultView?.ResizeObserver;
    const resizeObserver = ResizeObserverCtor ? new ResizeObserverCtor(measure) : null;

    if (activeContent) resizeObserver?.observe(activeContent);
    if (root) resizeObserver?.observe(root);
    if (trigger) resizeObserver?.observe(trigger);

    const view = doc?.defaultView;
    // Document capture observes ordinary page and nested scrolling; visual
    // viewport events alone only cover viewport pan/zoom. Coalesce each
    // scroll burst and stop observing as soon as this panel closes.
    let scrollFrame: number | undefined;
    const scheduleScrollMeasure = () => {
      if (scrollFrame !== undefined || !view) return;
      scrollFrame = view.requestAnimationFrame(() => {
        scrollFrame = undefined;
        measure();
      });
    };
    const scrollRoots = new Set<EventTarget>();
    if (doc) scrollRoots.add(doc);
    const tree = root?.getRootNode();
    if (tree) scrollRoots.add(tree);
    for (const target of scrollRoots) target.addEventListener("scroll", scheduleScrollMeasure, true);
    // Ancestor callback refs can detach during this child layout effect and
    // reattach later in the same commit. Measure once all hosts have committed.
    const frame = view?.requestAnimationFrame(measure);
    view?.addEventListener("resize", measure);
    view?.visualViewport?.addEventListener("resize", measure);
    view?.visualViewport?.addEventListener("scroll", measure);

    return () => {
      if (frame !== undefined) view?.cancelAnimationFrame(frame);
      if (scrollFrame !== undefined) view?.cancelAnimationFrame(scrollFrame);
      for (const target of scrollRoots) target.removeEventListener("scroll", scheduleScrollMeasure, true);
      resizeObserver?.disconnect();
      view?.removeEventListener("resize", measure);
      view?.visualViewport?.removeEventListener("resize", measure);
      view?.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [getTriggerElement, measure, rootRef, value, getActiveContent]);

  useEffect(() => {
    const node = internalRef.current;
    node?.addEventListener("atom-navigation-menu-reposition", measure);
    return () => node?.removeEventListener("atom-navigation-menu-reposition", measure);
  }, [measure]);

  if (!ctx.viewport) return null;
  if (!(forceMount && !ctx.lifecycleExplicit) && !isOpen && !presence.isPresent &&
      !(!ctx.unmountOnExit && everOpened) && !(!ctx.lazyMount && !everOpened)) return null;

  const viewportStyle: CSSProperties = {
    ...(style as CSSProperties),
    ...(viewportSizeStyle ?? {}),
  };

  const activeContent = ctx.getContentValues().map(panelValue => {
    const entry = getContentNode(panelValue);
    return entry ? <NavigationMenuPanel key={panelValue} value={panelValue} entry={entry}
      onKeyDown={handleContentKeyDown} motion={panelValue === value ? motionDirection
        : value && panelValue === previousValue && motionDirection
          ? motionDirection === "from-end" ? "to-start" : "to-end"
          : undefined} /> : null;
  });

  const viewportProps: Record<string, unknown> = {
    ...restProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-state": isOpen ? "open" : "closed",
    "data-orientation": orientation,
    "data-align": align,
    "data-anchor": anchor,
    "data-side": orientation === "vertical" ? ctx.viewportSide ?? (ctx.dir === "rtl" ? "left" : "right") : undefined,
    hidden: !isOpen && !presence.isPresent,
    "aria-hidden": !isOpen ? true : undefined,
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
