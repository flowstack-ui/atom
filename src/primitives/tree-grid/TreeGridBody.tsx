import { forwardRef, type ReactNode } from "react";
import type { NativeTableBodyProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TreeGridBodyNativeProps = NativeTableBodyProps<"children" | "role">;

export interface TreeGridBodyProps extends TreeGridBodyNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TreeGridBody = forwardRef<HTMLTableSectionElement, TreeGridBodyProps>(
  function TreeGridBody(
    { children, render, asChild, "data-slot": dataSlot = "tree-grid-body", ...restProps },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "rowgroup",
      "data-slot": dataSlot,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "tbody", { ...behaviorProps, children });
  },
);
