import { forwardRef, type ReactNode } from "react";
import type { NativeTableCellProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TableCellNativeProps = NativeTableCellProps<"children">;

export interface TableCellProps extends TableCellNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "table-cell",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "td", {
      ...behaviorProps,
      children,
    });
  },
);
