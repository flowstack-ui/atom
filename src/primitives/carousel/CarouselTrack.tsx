"use client";

import {
  Children,
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useCarouselContext } from "./context.js";

type CarouselTrackNativeProps = NativeDivProps<"children">;

export interface CarouselTrackProps extends CarouselTrackNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CarouselTrack = forwardRef<HTMLDivElement, CarouselTrackProps>(
  function CarouselTrack(
    {
      children,
      render,
      asChild,
      className,
      "data-slot": dataSlot = "carousel-track",
      ...restProps
    },
    ref,
  ) {
    const context = useCarouselContext();
    const authoredChildren = asChild && isValidElement(children)
      ? (children.props as { children?: ReactNode }).children
      : children;
    const hasLoopBoundaries = context.loop && Children.count(authoredChildren) > 1;
    const trackChildren = hasLoopBoundaries ? (
      <Fragment>
        <span aria-hidden="true" data-position="before" data-slot="carousel-loop-boundary" />
        {authoredChildren}
        <span aria-hidden="true" data-position="after" data-slot="carousel-loop-boundary" />
      </Fragment>
    ) : authoredChildren;
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-direction": context.dir,
      className,
    };

    if (asChild) {
      const child = Children.only(children) as ReactElement;
      return cloneAndMerge(cloneElement(child, undefined, trackChildren), behaviorProps);
    }
    return renderElement(render, "div", { ...behaviorProps, children: trackChildren });
  },
);
