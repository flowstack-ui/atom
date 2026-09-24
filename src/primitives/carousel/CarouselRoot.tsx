"use client";
import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  CarouselContextProvider,
  type CarouselContextValue,
} from "./context.js";
import { useCarousel, type UseCarouselProps } from "./useCarousel.js";
import { getCarouselControllerOwner, type CarouselController } from "./controller.js";
export type CarouselRootProps = NativeDivProps<
  "children" | "defaultValue" | "dir" | "onChange"
> &
  UseCarouselProps & {
    render?: RenderProp;
    asChild?: boolean;
    children?: ReactNode;
    "data-slot"?: string;
  };
export interface CarouselRootProviderProps
  extends NativeDivProps<"children" | "defaultValue" | "dir" | "onChange"> {
  value: CarouselController;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}
export const CarouselRootProvider = forwardRef<
  HTMLDivElement,
  CarouselRootProviderProps
>(function CarouselRootProvider(
  {
    value: controller,
    render,
    asChild,
    children,
    style,
    onFocusCapture,
    onMouseEnter,
    onMouseLeave,
    onPointerDownCapture,
    onPointerUpCapture,
    onPointerCancelCapture,
    role = "group",
    "aria-label": label = "Featured content",
    "aria-roledescription": description = "carousel",
    "data-slot": slot = "carousel-root",
    ...props
  },
  ref,
) {
  const api = getCarouselControllerOwner(controller);
  const behavior = {
    ...props,
    ref,
    id: props.id ?? api.ids?.root,
    role,
    dir: api.dir,
    "aria-label": label,
    "aria-roledescription": description,
    "data-slot": slot,
    "data-state": api.isPlaying
      ? "playing"
      : api.autoPlay
        ? "paused"
        : "stopped",
    "data-direction": api.dir,
    "data-orientation": api.orientation,
    "data-initialized": api.initialized ? "" : undefined,
    "data-auto-size": api.autoSize ? "" : undefined,
    "data-snap-type": api.snapType,
    "data-dragging": api.isDragging ? "" : undefined,
    "data-touch-navigation": api.touchNavigation ? "visible" : undefined,
    "data-value": api.activeValue || undefined,
    "data-page": api.page,
    style: { ...style, ...api.rootStyle },
    onFocusCapture: composeEventHandlers(onFocusCapture, (event) =>
      api.onRootFocus(event.target as Element),
    ),
    onMouseEnter: composeEventHandlers(onMouseEnter, () =>
      api.onRootHover(true),
    ),
    onMouseLeave: composeEventHandlers(onMouseLeave, () =>
      api.onRootHover(false),
    ),
    onPointerDownCapture: composeEventHandlers(onPointerDownCapture, (event) =>
      api.onRootPointerDown(event.target as Element),
    ),
    onPointerUpCapture: composeEventHandlers(onPointerUpCapture, (event) =>
      api.onRootPointerUp(event.pointerType),
    ),
    onPointerCancelCapture: composeEventHandlers(
      onPointerCancelCapture,
      (event) => api.onRootPointerUp(event.pointerType),
    ),
  };
  return (
    <CarouselContextProvider value={api}>
      {asChild
        ? cloneAndMerge(children, behavior)
        : renderElement(render, "div", { ...behavior, children })}
    </CarouselContextProvider>
  );
});
export const CarouselRoot = forwardRef<HTMLDivElement, CarouselRootProps>(
  function CarouselRoot(
    {
      value,
      defaultValue,
      onValueChange,
      page,
      defaultPage,
      onPageChange,
      autoPlay,
      defaultAutoPlay,
      interval,
      onAutoPlayChange,
      onAutoplayStatusChange,
      onDragStatusChange,
      loop,
      dir,
      orientation,
      slidesPerPage,
      slidesPerMove,
      autoSize,
      snapType,
      inViewThreshold,
      allowMouseDrag,
      slideCount,
      translations,
      ids,
      previousAriaLabel,
      nextAriaLabel,
      startAriaLabel,
      stopAriaLabel,
      ...props
    },
    ref,
  ) {
    const api = useCarousel({
      value,
      defaultValue,
      onValueChange,
      page,
      defaultPage,
      onPageChange,
      autoPlay,
      defaultAutoPlay,
      interval,
      onAutoPlayChange,
      onAutoplayStatusChange,
      onDragStatusChange,
      loop,
      dir,
      orientation,
      slidesPerPage,
      slidesPerMove,
      autoSize,
      snapType,
      inViewThreshold,
      allowMouseDrag,
      slideCount,
      translations,
      ids,
      previousAriaLabel,
      nextAriaLabel,
      startAriaLabel,
      stopAriaLabel,
    } as UseCarouselProps);
    return <CarouselRootProvider {...props} value={api} ref={ref} />;
  },
);
