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
import { useTabsContext } from "./context.js";
const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
export interface TabsIndicatorProps extends NativeDivProps<"children"> {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}
export const TabsIndicator = forwardRef<HTMLDivElement, TabsIndicatorProps>(
  function TabsIndicator(
    {
      style,
      children,
      render,
      asChild,
      "data-slot": slot = "tabs-indicator",
      ...rest
    },
    ref,
  ) {
    const {
      activeValue,
      getTriggerElement,
      getTriggerValues,
      listRef,
      orientation,
      collectionVersion,
      getId,
      setIndicatorReady,
    } = useTabsContext();
    const ownRef = useRef<HTMLDivElement>(null);
    const composedRef = useMemo(() => composeRefs(ref, ownRef), [ref]);
    const [rect, setRect] = useState<{
      left: number;
      top: number;
      width: number;
      height: number;
    } | null>(null);
    const measured = useRef(false);
    const update = useCallback(() => {
      const trigger = getTriggerElement(activeValue),
        list = listRef.current;
      if (!trigger || !list) {
        setRect(null);
        setIndicatorReady(false);
        return;
      }
      // offset geometry is local CSS space, independent of viewport scroll/scale.
      let left = trigger.offsetLeft,
        top = trigger.offsetTop;
      let parent = trigger.offsetParent as HTMLElement | null;
      while (parent && parent !== list) {
        left += parent.offsetLeft;
        top += parent.offsetTop;
        parent = parent.offsetParent as HTMLElement | null;
      }
      if (parent !== list) {
        const a = trigger.getBoundingClientRect(),
          b = list.getBoundingClientRect();
        const scaleX = b.width / (list.offsetWidth || b.width || 1),
          scaleY = b.height / (list.offsetHeight || b.height || 1);
        left = (a.left - b.left) / scaleX + list.scrollLeft - list.clientLeft;
        top = (a.top - b.top) / scaleY + list.scrollTop - list.clientTop;
      }
      const next = {
        left,
        top,
        width: trigger.offsetWidth,
        height: trigger.offsetHeight,
      };
      setRect((previous) =>
        previous &&
        Object.keys(next).every(
          (key) =>
            previous[key as keyof typeof next] ===
            next[key as keyof typeof next],
        )
          ? previous
          : next,
      );
      setIndicatorReady(true);
    }, [activeValue, getTriggerElement, listRef, setIndicatorReady]);
    useSafeLayoutEffect(() => {
      update();
    }, [update, collectionVersion, orientation]);
    useEffect(() => {
      const list = listRef.current,
        view = list?.ownerDocument.defaultView;
      if (!list || !view) return;
      const observer = view.ResizeObserver
        ? new view.ResizeObserver(update)
        : null;
      observer?.observe(list);
      getTriggerValues().forEach((key) => {
        const node = getTriggerElement(key);
        if (node) observer?.observe(node);
      });
      const mutation = new view.MutationObserver(update);
      mutation.observe(list, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      list.addEventListener("scroll", update, { passive: true });
      view.addEventListener("resize", update);
      return () => {
        observer?.disconnect();
        mutation.disconnect();
        list.removeEventListener("scroll", update);
        view.removeEventListener("resize", update);
      };
    }, [
      update,
      collectionVersion,
      getTriggerValues,
      getTriggerElement,
      listRef,
    ]);
    useEffect(() => {
      if (rect) measured.current = true;
    }, [rect]);
    useEffect(() => () => setIndicatorReady(false), [setIndicatorReady]);
    const props = {
      ...rest,
      ref: composedRef,
      id: getId("indicator"),
      "aria-hidden": true,
      "data-slot": slot,
      "data-orientation": orientation,
      "data-ready": rect ? "" : undefined,
      "data-animate": rect && measured.current ? "" : undefined,
      style: {
        ...style,
        visibility: rect ? undefined : "hidden",
        "--tabs-indicator-left": `${rect?.left ?? 0}px`,
        "--tabs-indicator-top": `${rect?.top ?? 0}px`,
        "--tabs-indicator-width": `${rect?.width ?? 0}px`,
        "--tabs-indicator-height": `${rect?.height ?? 0}px`,
      } as CSSProperties,
    };
    return asChild
      ? cloneAndMerge(children, props)
      : renderElement(render, "div", { ...props, children });
  },
);
