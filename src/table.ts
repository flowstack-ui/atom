import {
  TableBody,
  TableCaption,
  TableCell,
  TableColumn,
  TableColumnGroup,
  TableFooter,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "./primitives/table/index.js";

export {
  TableBody,
  TableCaption,
  TableCell,
  TableColumn,
  TableColumnGroup,
  TableFooter,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "./primitives/table/index.js";
export type {
  TableBodyProps,
  TableCaptionProps,
  TableCellProps,
  TableColumnGroupProps,
  TableColumnProps,
  TableFooterProps,
  TableHeadProps,
  TableHeaderProps,
  TableRootProps,
  TableRowProps,
  TableSortDirection,
} from "./primitives/table/index.js";

export const Table = {
  Root: TableRoot,
  ColumnGroup: TableColumnGroup,
  Column: TableColumn,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
} as const;
