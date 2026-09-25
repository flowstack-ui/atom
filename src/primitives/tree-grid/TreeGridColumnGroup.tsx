import { forwardRef, type ReactNode } from "react";
import type { NativeTableColumnGroupProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type TreeGridColumnGroupNativeProps = NativeTableColumnGroupProps<"children">;

export interface TreeGridColumnGroupProps extends TreeGridColumnGroupNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TreeGridColumnGroup = forwardRef<HTMLTableColElement, TreeGridColumnGroupProps>(
  function TreeGridColumnGroup({ children, render, asChild, "data-slot": dataSlot = "tree-grid-column-group", ...restProps }, ref) {
    const behaviorProps: Record<string, unknown> = { ...restProps, ref, "data-slot": dataSlot };
    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "colgroup", { ...behaviorProps, children });
  },
);
