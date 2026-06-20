"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  normalizeFeedPosition,
  normalizeFeedSetSize,
  type FeedSetSize,
  useFeedContext,
} from "./context.js";

type FeedItemNativeProps = Omit<
  ComponentPropsWithoutRef<"article">,
  "children" | "role" | "aria-posinset" | "aria-setsize"
>;

export interface FeedItemProps extends FeedItemNativeProps {
  /** Feed item content. Prefer a heading inside each article for a useful accessible name. */
  children?: ReactNode;
  /** One-based item position in the full feed. */
  position?: number;
  /** Zero-based item index convenience. Ignored when `position` is provided. */
  index?: number;
  /** Total number of feed items when known. Overrides `Feed.Root` `setSize`. */
  setSize?: FeedSetSize;
  /** Override the rendered item element. */
  render?: RenderProp;
  /** Merge item props onto a single child. The child should render an article-compatible element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const FeedItem = forwardRef<HTMLElement, FeedItemProps>(
  function FeedItem(
    {
      children,
      position,
      index,
      setSize,
      render,
      asChild,
      tabIndex,
      "data-slot": dataSlot = "feed-item",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFeedContext();
    const resolvedPosition = normalizeFeedPosition(
      position ?? (index === undefined ? undefined : index + 1),
    );
    const resolvedSetSize = normalizeFeedSetSize(setSize ?? ctx.setSize);
    const dataSetSize = (setSize ?? ctx.setSize) === "unknown" ? "unknown" : resolvedSetSize;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "article",
      tabIndex: tabIndex ?? 0,
      "aria-posinset": resolvedPosition,
      "aria-setsize": resolvedSetSize,
      "data-slot": dataSlot,
      ...(resolvedPosition !== undefined && { "data-position": resolvedPosition }),
      ...(dataSetSize !== undefined && { "data-setsize": dataSetSize }),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "article", { ...behaviorProps, children });
  },
);
