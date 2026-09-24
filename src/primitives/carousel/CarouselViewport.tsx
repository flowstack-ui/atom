"use client";
import { forwardRef, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useCarouselContext } from "./context.js";
export interface CarouselViewportProps extends NativeDivProps<"children"> {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}
export const CarouselViewport = forwardRef<
  HTMLDivElement,
  CarouselViewportProps
>(function CarouselViewport(
  {
    children,
    render,
    asChild,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture,
    onClickCapture,
    onDragStart,
    onScroll,
    onWheel,
    onKeyDown,
    "data-slot": slot = "carousel-viewport",
    ...props
  },
  ref,
) {
  const api = useCarouselContext();
  const apiRef = useRef(api);
  apiRef.current = api;
  const inner = useRef<HTMLDivElement>(null);
  const composed = useMemo(
    () => composeRefs(inner, api.setViewportElement, ref),
    [api.setViewportElement, ref],
  );
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    start: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const finish = () => {
    const current = drag.current;
    drag.current = null;
    if (current && inner.current?.hasPointerCapture(current.id))
      inner.current.releasePointerCapture(current.id);
    apiRef.current.setDragging(false);
    if (current?.moved) {
      const currentApi = apiRef.current;
      const pages = currentApi.pageSnapPoints;
      const offset = currentApi.readOffset();
      const nearest = pages.reduce(
        (best, snap, index) =>
          Math.abs(snap.offset - offset) <
          Math.abs((pages[best]?.offset ?? 0) - offset)
            ? index
            : best,
        0,
      );
      currentApi.selectPage(nearest, "scroll");
      clearTimeout(clickTimer.current);
      clickTimer.current = setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }
  };
  useEffect(() => {
    const blur = () => finish();
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("blur", blur);
      clearTimeout(clickTimer.current);
      drag.current = null;
    };
  }, []);
  const behavior = {
    ...props,
    id: props.id ?? api.ids?.viewport,
    ref: composed,
    tabIndex: props.tabIndex ?? 0,
    "aria-atomic": "false" as const,
    "aria-live": api.autoPlay ? ("off" as const) : ("polite" as const),
    "data-slot": slot,
    "data-direction": api.dir,
    "data-orientation": api.orientation,
    "data-dragging": api.isDragging ? "" : undefined,
    "data-mouse-drag": api.allowMouseDrag ? "" : undefined,
    "data-state": api.isPlaying
      ? "playing"
      : api.autoPlay
        ? "paused"
        : "stopped",
    onPointerDown: composeEventHandlers(onPointerDown, (event) => {
      api.clearPendingScrollSelection();
      api.stopAutoPlay();
      if (
        !api.allowMouseDrag ||
        event.pointerType !== "mouse" ||
        event.button !== 0
      )
        return;
      if (
        (event.target as Element).closest(
          "button,a,input,textarea,select,[contenteditable=true]",
        )
      )
        return;
      suppressClick.current = false;
      drag.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        start: api.readOffset(),
        moved: false,
      };
    }),
    onPointerMove: composeEventHandlers(onPointerMove, (event) => {
      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      const delta =
        api.orientation === "vertical"
          ? event.clientY - current.y
          : event.clientX - current.x;
      const cross =
        api.orientation === "vertical"
          ? event.clientX - current.x
          : event.clientY - current.y;
      if (!current.moved) {
        if (Math.abs(cross) > Math.abs(delta) && Math.abs(cross) > 5) {
          drag.current = null;
          return;
        }
        if (Math.abs(delta) < 5) return;
        current.moved = true;
        api.setDragging(true);
        inner.current?.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
      suppressClick.current = true;
      inner.current?.ownerDocument.getSelection()?.removeAllRanges();
      api.writeOffset(
        current.start -
          delta *
            (api.orientation === "horizontal" && api.dir === "rtl" ? -1 : 1),
        true,
      );
      api.onViewportScroll();
    }),
    onPointerUp: composeEventHandlers(onPointerUp, finish),
    onPointerCancel: composeEventHandlers(onPointerCancel, finish),
    onLostPointerCapture: composeEventHandlers(onLostPointerCapture, finish),
    onDragStart: composeEventHandlers(onDragStart, (event) => {
      // Native image dragging cancels the pointer stream needed for carousel dragging.
      if (drag.current) event.preventDefault();
    }),
    onClickCapture: composeEventHandlers(onClickCapture, (event) => {
      if (suppressClick.current) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick.current = false;
      }
    }),
    onScroll: composeEventHandlers(onScroll, api.onViewportScroll),
    onWheel: composeEventHandlers(onWheel, () => {
      api.clearPendingScrollSelection();
      api.stopAutoPlay();
    }),
    onKeyDown: composeEventHandlers(onKeyDown, (event) => {
      if (
        event.target !== event.currentTarget ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      const next =
        api.orientation === "vertical"
          ? "ArrowDown"
          : api.dir === "rtl"
            ? "ArrowLeft"
            : "ArrowRight";
      const previous =
        api.orientation === "vertical"
          ? "ArrowUp"
          : api.dir === "rtl"
            ? "ArrowRight"
            : "ArrowLeft";
      if (event.key === next) {
        event.preventDefault();
        api.goNext();
      } else if (event.key === previous) {
        event.preventDefault();
        api.goPrevious();
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        api.selectPage(
          event.key === "Home" ? 0 : api.pageSnapPoints.length - 1,
        );
      }
    }),
  };
  return asChild
    ? cloneAndMerge(children, behavior)
    : renderElement(render, "div", { ...behavior, children });
});
