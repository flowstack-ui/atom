import { forwardRef, type ReactNode } from "react";
import type {
  NativeTableColumnProps,
  NativeTableColumnWidth,
} from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type DataGridColumnNativeProps = NativeTableColumnProps<"width">;

export interface DataGridColumnProps extends DataGridColumnNativeProps {
  /** Native presentational width hint in CSS pixels or as a percentage. */
  htmlWidth?: NativeTableColumnWidth;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const DataGridColumn = forwardRef<HTMLTableColElement, DataGridColumnProps>(
  function DataGridColumn({ htmlWidth, children, render, asChild, "data-slot": dataSlot = "data-grid-column", ...restProps }, ref) {
    const behaviorProps: Record<string, unknown> = { ...restProps, ref, "data-slot": dataSlot, width: htmlWidth };
    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "col", behaviorProps);
  },
);
