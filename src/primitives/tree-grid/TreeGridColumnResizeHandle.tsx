"use client";

import { forwardRef } from "react";
import { DataGridColumnResizeHandle, type DataGridColumnResizeHandleProps } from "../data-grid/DataGridColumnResizeHandle.js";
import { useTreeGridContext, useTreeGridRowContext } from "./context.js";

export interface TreeGridColumnResizeHandleProps extends DataGridColumnResizeHandleProps {}

/** Reuses the shared headless grid width interaction; the application applies the width. */
export const TreeGridColumnResizeHandle = forwardRef<HTMLDivElement, TreeGridColumnResizeHandleProps>(
  function TreeGridColumnResizeHandle({ disabled, dir, "data-slot": slot = "tree-grid-column-resize-handle", ...props }, ref) {
    const grid = useTreeGridContext();
    const row = useTreeGridRowContext();
    return <DataGridColumnResizeHandle {...props} ref={ref} dir={dir ?? grid.dir}
      disabled={disabled || grid.disabled || grid.readOnly || row?.disabled}
      data-slot={slot} />;
  },
);
