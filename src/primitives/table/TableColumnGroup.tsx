import { forwardRef, type ReactNode } from "react";
import type { NativeTableColumnGroupProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TableColumnGroupNativeProps = NativeTableColumnGroupProps<"children">;

export interface TableColumnGroupProps extends TableColumnGroupNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TableColumnGroup = forwardRef<HTMLTableColElement, TableColumnGroupProps>(
  function TableColumnGroup(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "table-column-group",
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

    return renderElement(render, "colgroup", {
      ...behaviorProps,
      children,
    });
  },
);
