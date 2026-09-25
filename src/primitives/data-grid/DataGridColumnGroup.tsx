import { forwardRef, type ReactNode } from "react";
import type { NativeTableColumnGroupProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type DataGridColumnGroupNativeProps = NativeTableColumnGroupProps<"children">;

export interface DataGridColumnGroupProps extends DataGridColumnGroupNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const DataGridColumnGroup = forwardRef<HTMLTableColElement, DataGridColumnGroupProps>(
  function DataGridColumnGroup({ children, render, asChild, "data-slot": dataSlot = "data-grid-column-group", ...restProps }, ref) {
    const behaviorProps: Record<string, unknown> = { ...restProps, ref, "data-slot": dataSlot };
    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "colgroup", { ...behaviorProps, children });
  },
);
