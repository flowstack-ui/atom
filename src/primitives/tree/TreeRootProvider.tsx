"use client";
import { forwardRef } from "react";
import { TreeRoot, type TreeRootProps } from "./TreeRoot.js";

export interface TreeRootProviderProps extends Omit<TreeRootProps, "value"> {
  /** Controller returned by useTreeController. Owns selection and expansion state. */
  value: { rootProps: TreeRootProps };
}

export const TreeRootProvider = forwardRef<HTMLElement, TreeRootProviderProps>(
  function TreeRootProvider({ value, ...props }, ref) {
    return <TreeRoot {...value.rootProps} {...props} ref={ref} />;
  },
);
