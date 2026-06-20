import { forwardRef, type ReactNode } from "react";
import type { NativeTableHeadProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

export type TableSortDirection = "ascending" | "descending" | "none" | "other";

type TableHeadNativeProps = NativeTableHeadProps<"children" | "aria-sort">;

export interface TableHeadProps extends TableHeadNativeProps {
  /** Header cell content. For sortable headers, place a Button or Pressable inside the header cell. */
  children?: ReactNode;
  /**
   * Accessible sort state for this header cell.
   *
   * This only exposes `aria-sort` and `data-sort`; it does not make the
   * header interactive. Use a nested button/pressable control for sorting
   * activation so keyboard and pointer behavior stays explicit.
   */
  sortDirection?: TableSortDirection;
  /** Override the rendered header cell element. */
  render?: RenderProp;
  /** Merge header props onto a single child. The child should render a `th`-compatible element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  function TableHead(
    {
      children,
      scope = "col",
      sortDirection,
      render,
      asChild,
      "data-slot": dataSlot = "table-head",
      ...restProps
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-sort": sortDirection,
      "data-slot": dataSlot,
      ...(sortDirection !== undefined && { "data-sort": sortDirection }),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "th", {
      ...behaviorProps,
      scope,
      children,
    });
  },
);
