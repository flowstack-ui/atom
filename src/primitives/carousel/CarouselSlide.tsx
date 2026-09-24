"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  version,
  type ReactNode,
  type CSSProperties,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useCarouselContext } from "./context.js";
import { getCarouselSlideId } from "./utils.js";

type CarouselSlideNativeProps = NativeDivProps<"children">;

export interface CarouselSlideProps extends CarouselSlideNativeProps {
  value: string;
  /** Optional server-known position for page-based initial rendering. */
  index?: number;
  label?: string;
  snapAlign?: "start" | "center" | "end";
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide(
    {
      value,
      index,
      label,
      snapAlign = "start",
      children,
      render,
      asChild,
      className,
      style,
      role = "group",
      "aria-label": ariaLabel,
      "aria-roledescription": ariaRoleDescription = "slide",
      "data-slot": dataSlot = "carousel-slide",
      ...restProps
    },
    ref,
  ) {
    const context = useCarouselContext();
    const internalRef = useRef<HTMLDivElement>(null);
    const { idPrefix, registerSlide, unregisterSlide } = context;
    const registered = useRef<{ element: HTMLDivElement; value: string; label: string | undefined; snapAlign: string } | null>(null);
    const composedRef = useMemo(() => composeRefs(internalRef, ref), [ref]);
    useEffect(() => {
      const element = internalRef.current;
      const previous = registered.current;
      if (previous?.element === element && previous.value === value && previous.label === (label ?? ariaLabel) && previous.snapAlign === snapAlign) return;
      if (previous) unregisterSlide(previous.value);
      registered.current = element ? { element, value, label: label ?? ariaLabel, snapAlign } : null;
      if (element) registerSlide(value, element, { label: label ?? ariaLabel, snapAlign });
    });
    useEffect(() => () => {
      if (registered.current) unregisterSlide(registered.current.value);
      registered.current = null;
    }, [unregisterSlide]);
    const initialIndex = context.pageSnapPoints[context.page]?.index ?? context.defaultPage;
    const isActive =
      context.activeValue === value ||
      (!context.initialized &&
        !context.activeValue &&
        index === initialIndex);
    const visible = context.initialized
      ? context.visibleValues.includes(value)
      : isActive ||
        (!context.activeValue &&
          index !== undefined &&
          index >= initialIndex && index < initialIndex + context.slidesPerPage);
    const shift = context.shifts[value] ?? 0;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id:
        restProps.id ??
        context.ids?.item?.(value) ??
        getCarouselSlideId(idPrefix, value),
      role,
      "aria-label": ariaLabel ?? label ?? value,
      "aria-roledescription": ariaRoleDescription,
      "aria-hidden": visible ? undefined : true,
      inert: visible ? undefined : (Number.parseInt(version, 10) >= 19 ? true : ""),
      "data-slot": dataSlot,
      "data-state": isActive ? "active" : "inactive",
      "data-value": value,
      "data-loop-position":
        shift < 0 ? "before" : shift > 0 ? "after" : undefined,
      "data-visible": visible ? "" : undefined,
      "data-in-view": context.inViewValues.includes(value) ? "" : undefined,
      "data-snap-align": snapAlign,
      "data-orientation": context.orientation,
      style: {
        ...style,
        "--atom-carousel-shift": `${shift * (context.orientation === "horizontal" && context.dir === "rtl" ? -1 : 1)}px`,
      } as CSSProperties,
      className,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
