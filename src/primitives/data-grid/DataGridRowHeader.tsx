"use client";
import { forwardRef } from "react";
import { DataGridCell, type DataGridCellProps } from "./DataGridCell.js";

export type DataGridRowHeaderProps = Omit<DataGridCellProps, "rowHeader">;
export const DataGridRowHeader = forwardRef<HTMLTableCellElement, DataGridRowHeaderProps>(
  function DataGridRowHeader({ "data-slot": slot = "data-grid-row-header", ...props }, ref) {
    return <DataGridCell {...props} rowHeader data-slot={slot} ref={ref} />;
  },
);
