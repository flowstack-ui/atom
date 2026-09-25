"use client";

import { Fragment, type RefAttributes, type ReactElement, type ReactNode } from "react";
import { usePaginationContext } from "./context.js";
import {
  PaginationEllipsis,
  type PaginationEllipsisProps,
} from "./PaginationEllipsis.js";
import { PaginationItem, type PaginationItemProps } from "./PaginationItem.js";

export interface PaginationItemsProps {
  /** Custom control host; receives the Item's behavior through asChild. */
  render?: (details: { page: number; isCurrent: boolean }) => ReactElement;
  /** Custom decorative ellipsis content. */
  ellipsis?: ReactNode;
  /** Props shared by every generated page Item. */
  itemProps?: Omit<PaginationItemProps, "page" | "children" | "aria-label"> &
    RefAttributes<HTMLElement>;
  /** Props shared by every generated Ellipsis. */
  ellipsisProps?: PaginationEllipsisProps & RefAttributes<HTMLSpanElement>;
}

export function PaginationItems({
  itemProps,
  ellipsisProps,
  render,
  ellipsis,
}: PaginationItemsProps) {
  const { items, currentPage, ids } = usePaginationContext();

  return (
    <Fragment>
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <PaginationEllipsis
            id={ids?.ellipsis?.(index)}
            {...ellipsisProps}
            key={`ellipsis-${index}`}
          >{ellipsis ?? ellipsisProps?.children}</PaginationEllipsis>
        ) : (
          <PaginationItem {...itemProps} key={item} page={item} asChild={render ? true : itemProps?.asChild}>
            {render?.({ page: item, isCurrent: currentPage === item })}
          </PaginationItem>
        ),
      )}
    </Fragment>
  );
}
