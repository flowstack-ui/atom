"use client";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { ControllerContext, useController } from "./context.js";
import { useTableOfContents, type TableOfContentsController } from "./useTableOfContents.js";
import type { TableOfContentsApi, TableOfContentsOptions } from "./types.js";

export interface TableOfContentsRootProps extends HTMLAttributes<HTMLDivElement>, TableOfContentsOptions {
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}
export const TableOfContentsRoot = forwardRef<HTMLDivElement, TableOfContentsRootProps>(function TableOfContentsRoot({
  items, activeId, defaultActiveId, onActiveIdChange, enabled, getTargetRoot, getScrollElement,
  scrollOffset, scrollBehavior, navigation, history, focusTarget, children, asChild, render,
  "data-slot": slot = "table-of-contents", ...rest
}, ref) {
  const controller = useTableOfContents({ items, activeId, defaultActiveId, onActiveIdChange, enabled,
    getTargetRoot, getScrollElement, scrollOffset, scrollBehavior, navigation, history, focusTarget });
  const props = { ...rest, ref, "data-slot": slot };
  return <ControllerContext.Provider value={controller}>
    {asChild ? cloneAndMerge(children, props) : renderElement(render, "div", { ...props, children })}
  </ControllerContext.Provider>;
});
export interface TableOfContentsRootProviderProps { value: TableOfContentsController; children?: ReactNode }
export function TableOfContentsRootProvider({ value, children }: TableOfContentsRootProviderProps) {
  return <ControllerContext.Provider value={value}>{children}</ControllerContext.Provider>;
}
export interface TableOfContentsContextProps { children: (value: TableOfContentsApi) => ReactNode }
export function TableOfContentsContext({ children }: TableOfContentsContextProps) {
  return children(useController());
}
