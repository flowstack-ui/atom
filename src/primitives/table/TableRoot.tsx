import { forwardRef, type ReactNode } from "react";
import type { NativeTableProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type TableRootNativeProps = NativeTableProps<"children">;

export interface TableRootProps extends TableRootNativeProps {
  /**
   * Table content. Prefer including `Table.Caption` or an explicit
   * `aria-label`/`aria-labelledby` when the table needs an accessible name.
   */
  children?: ReactNode;
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge table props onto a single child. The child should render a table-compatible element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(
  function TableRoot(
    {
      children,
      render,
      asChild,
      "data-slot": dataSlot = "table",
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

    return renderElement(render, "table", {
      ...behaviorProps,
      children,
    });
  },
);
