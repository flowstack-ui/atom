import { forwardRef, type ReactNode } from "react";
import type {
  NativeTableColumnProps,
  NativeTableColumnWidth,
} from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TableColumnNativeProps = NativeTableColumnProps<"width">;

export interface TableColumnProps extends TableColumnNativeProps {
  /** Native presentational width hint in CSS pixels or as a percentage. */
  htmlWidth?: NativeTableColumnWidth;
  /** Single table-compatible child used only with asChild. */
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TableColumn = forwardRef<HTMLTableColElement, TableColumnProps>(
  function TableColumn(
    {
      htmlWidth,
      children,
      render,
      asChild,
      "data-slot": dataSlot = "table-column",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      width: htmlWidth,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "col", behaviorProps);
  },
);
