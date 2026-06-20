import { forwardRef, type ReactNode } from "react";
import type { NativeTableRowProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TableRowNativeProps = NativeTableRowProps<"children">;

export interface TableRowProps extends TableRowNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "table-row",
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

    return renderElement(render, "tr", {
      ...behaviorProps,
      children,
    });
  },
);
