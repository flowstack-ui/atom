"use client";

import { Fragment, type RefAttributes } from "react";
import { usePaginationContext } from "./context.js";
import {
  PaginationEllipsis,
  type PaginationEllipsisProps,
} from "./PaginationEllipsis.js";
import { PaginationItem, type PaginationItemProps } from "./PaginationItem.js";

export interface PaginationItemsProps {
  /** Props shared by every generated page Item. */
  itemProps?: Omit<PaginationItemProps, "page" | "children" | "aria-label"> &
    RefAttributes<HTMLElement>;
  /** Props shared by every generated Ellipsis. */
  ellipsisProps?: PaginationEllipsisProps & RefAttributes<HTMLSpanElement>;
}

export function PaginationItems({
  itemProps,
  ellipsisProps,
}: PaginationItemsProps) {
  const { items } = usePaginationContext();

  return (
    <Fragment>
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <PaginationEllipsis
            {...ellipsisProps}
            key={`ellipsis-${index}`}
          />
        ) : (
          <PaginationItem {...itemProps} key={item} page={item} />
        ),
      )}
    </Fragment>
  );
}
