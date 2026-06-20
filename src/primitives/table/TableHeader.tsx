import { forwardRef, type ReactNode } from "react";
import type { NativeTableHeaderProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TableHeaderNativeProps = NativeTableHeaderProps<"children">;

export interface TableHeaderProps extends TableHeaderNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "table-header",
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

    return renderElement(render, "thead", {
      ...behaviorProps,
      children,
    });
  },
);
