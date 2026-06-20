import { forwardRef, type ReactNode } from "react";
import type { NativeTableFooterProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TreeGridFooterNativeProps = NativeTableFooterProps<"children" | "role">;

export interface TreeGridFooterProps extends TreeGridFooterNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TreeGridFooter = forwardRef<HTMLTableSectionElement, TreeGridFooterProps>(
  function TreeGridFooter(
    { children, render, asChild, "data-slot": dataSlot = "tree-grid-footer", ...restProps },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "rowgroup",
      "data-slot": dataSlot,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "tfoot", { ...behaviorProps, children });
  },
);
