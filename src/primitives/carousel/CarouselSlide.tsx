"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
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
  label?: string;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide(
    {
      value,
      label,
      children,
      render,
      asChild,
      className,
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
    const composedRef = useMemo(() => composeRefs(internalRef, ref), [ref]);
    const isActive = context.activeValue === value;
    const { idPrefix, registerSlide, unregisterSlide } = context;

    useEffect(() => {
      const element = internalRef.current;
      if (!element) return undefined;
      registerSlide(value, element, { label: label ?? ariaLabel });
      return () => unregisterSlide(value);
    }, [ariaLabel, label, registerSlide, unregisterSlide, value]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: getCarouselSlideId(idPrefix, value),
      role,
      "aria-label": ariaLabel ?? label ?? value,
      "aria-roledescription": ariaRoleDescription,
      "aria-hidden": isActive ? undefined : true,
      inert: isActive ? undefined : true,
      "data-slot": dataSlot,
      "data-state": isActive ? "active" : "inactive",
      "data-value": value,
      className,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
