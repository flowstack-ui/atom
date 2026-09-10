"use client";
import { forwardRef, useContext, useEffect, useId, type HTMLAttributes } from "react";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { NavContext } from "./context.js";
export interface TableOfContentsTitleProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean; render?: RenderProp; "data-slot"?: string;
}
export const TableOfContentsTitle = forwardRef<HTMLParagraphElement, TableOfContentsTitleProps>(function TableOfContentsTitle({
  asChild, render, children, id, "data-slot": slot = "table-of-contents-title", ...rest
}, ref) {
  const generatedId = useId();
  const nav = useContext(NavContext);
  if (!nav) throw new Error("TableOfContents.Title requires Nav.");
  const titleId = id ?? (nav.titleId || `toc-title-${generatedId}`);
  const { setTitleId } = nav;
  useEffect(() => { setTitleId(titleId); return () => setTitleId(""); }, [setTitleId, titleId]);
  const props = { ...rest, id: titleId, ref, "data-slot": slot };
  return asChild ? cloneAndMerge(children, props) : renderElement(render, "p", { ...props, children });
});
