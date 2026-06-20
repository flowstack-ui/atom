import { forwardRef, type ReactNode } from "react";
import type { NativeTableBodyProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TableBodyNativeProps = NativeTableBodyProps<"children">;

export interface TableBodyProps extends TableBodyNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "table-body",
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

    return renderElement(render, "tbody", {
      ...behaviorProps,
      children,
    });
  },
);
