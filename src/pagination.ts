"use client";

import {
  PaginationEllipsis,
  PaginationItem,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
} from "./primitives/pagination/index.js";

export {
  PaginationContextProvider,
  PaginationEllipsis,
  PaginationItem,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
  clampPaginationPage,
  getPaginationRange,
  usePaginationRange,
  usePaginationContext,
} from "./primitives/pagination/index.js";
export type {
  PaginationContextValue,
  PaginationControlProps,
  PaginationEllipsisProps,
  PaginationItemProps,
  PaginationListProps,
  PaginationRangeItem,
  PaginationRangeOptions,
  PaginationRootProps,
} from "./primitives/pagination/index.js";

export const Pagination = {
  Root: PaginationRoot,
  List: PaginationList,
  Previous: PaginationPrevious,
  Item: PaginationItem,
  Ellipsis: PaginationEllipsis,
  Next: PaginationNext,
} as const;
