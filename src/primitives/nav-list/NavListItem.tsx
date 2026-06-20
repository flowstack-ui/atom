"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeListItemProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useNavListContext } from "./context.js";

type NavListItemNativeProps = NativeListItemProps<"children">;

export interface NavListItemProps extends NavListItemNativeProps {
  /** Navigation list item content. */
  children?: ReactNode;
  /** Mark the item as unavailable for styled hooks. Pass `disabled` to `NavList.Link` for functional link disabling. */
  disabled?: boolean;
  /** Override the rendered item element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const NavListItem = forwardRef<HTMLLIElement, NavListItemProps>(
  function NavListItem(
    {
      children,
      disabled = false,
      render,
      asChild,
      "data-slot": dataSlot = "nav-list-item",
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
      ...(disabled ? { "data-disabled": "" } : {}),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "li", {
      ...behaviorProps,
      children,
    });
  },
);
