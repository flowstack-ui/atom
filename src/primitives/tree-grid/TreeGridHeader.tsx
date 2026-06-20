import { forwardRef, type ReactNode } from "react";
import type { NativeTableHeaderProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TreeGridHeaderNativeProps = NativeTableHeaderProps<"children" | "role">;

export interface TreeGridHeaderProps extends TreeGridHeaderNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TreeGridHeader = forwardRef<HTMLTableSectionElement, TreeGridHeaderProps>(
  function TreeGridHeader(
    { children, render, asChild, "data-slot": dataSlot = "tree-grid-header", ...restProps },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "rowgroup",
      "data-slot": dataSlot,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "thead", { ...behaviorProps, children });
  },
);
