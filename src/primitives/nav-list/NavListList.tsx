"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeListProps, NativeOrderedListProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useNavListContext } from "./context.js";

type NavListListNativeProps =
  & NativeListProps<"children">
  & NativeOrderedListProps<"children">;

export interface NavListListProps extends NavListListNativeProps {
  /** Navigation list items. */
  children?: ReactNode;
  /** Render as an ordered list (`ol`) instead of an unordered list (`ul`). */
  ordered?: boolean;
  /** Override the rendered list element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const NavListList = forwardRef<HTMLUListElement | HTMLOListElement, NavListListProps>(
  function NavListList(
    {
      children,
      ordered = false,
      render,
      asChild,
      "data-slot": dataSlot = "nav-list-list",
      ...restProps
    },
    ref,
  ) {
    const { orientation } = useNavListContext();
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      ...(ordered ? { "data-ordered": "" } : {}),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, ordered ? "ol" : "ul", {
      ...behaviorProps,
      children,
    });
  },
);
