"use client";

import {
  forwardRef,
  useEffect,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useTreeItemContext } from "./context.js";

type TreeGroupNativeProps = NativeDivProps<"children" | "hidden" | "role" | "aria-hidden">;

export interface TreeGroupProps extends TreeGroupNativeProps {
  children?: ReactNode;
  forceMount?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TreeGroup = forwardRef<HTMLElement, TreeGroupProps>(
  function TreeGroup(
    {
      children,
      forceMount = false,
      render,
      asChild,
      "data-slot": dataSlot = "tree-group",
      ...restProps
    },
    ref,
  ) {
    const { expanded, registerGroup } = useTreeItemContext();

    useEffect(() => {
      return registerGroup();
    }, [registerGroup]);

    if (!forceMount && !expanded) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "group",
      hidden: forceMount && !expanded ? true : undefined,
      "aria-hidden": forceMount && !expanded ? "true" : undefined,
      "data-slot": dataSlot,
      "data-state": expanded ? "open" : "closed",
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
