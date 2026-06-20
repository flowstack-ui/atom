"use client";

import {
  forwardRef,
  useMemo,
  type ReactNode,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { usePopoverContext } from "./context.js";

type PopoverAnchorNativeProps = NativeSpanProps<"children">;

export interface PopoverAnchorProps extends PopoverAnchorNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const PopoverAnchor = forwardRef<HTMLElement, PopoverAnchorProps>(
function PopoverAnchor(
  {
    children,
    asChild = false,
    render,
    "data-slot": dataSlot = "popover-anchor",
    style,
    ...restProps
  },
  ref,
) {
  const { anchorRef } = usePopoverContext();
  const composedRef = useMemo(
    () => composeRefs(anchorRef, ref),
    [anchorRef, ref],
  );
  const anchorProps = {
    ...restProps,
    ref: composedRef,
    "data-slot": dataSlot,
    style: asChild || render ? style : { ...style, display: "contents" },
  };

  if (asChild) {
    return cloneAndMerge(children, anchorProps);
  }

  return renderElement(render, "span", {
    ...anchorProps,
    children,
  });
});
