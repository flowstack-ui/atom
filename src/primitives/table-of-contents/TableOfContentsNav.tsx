"use client";
import { forwardRef, useEffect, useMemo, useRef, useState, useId, type HTMLAttributes, type CSSProperties } from "react";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { NavContext, useController } from "./context.js";

export interface TableOfContentsNavProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  render?: RenderProp;
  autoScroll?: boolean;
  getScrollElement?: () => HTMLElement | null;
  "data-slot"?: string;
}
export const TableOfContentsNav = forwardRef<HTMLElement, TableOfContentsNavProps>(function TableOfContentsNav({
  asChild, render, autoScroll = true, getScrollElement, children, style,
  "data-slot": slot = "table-of-contents-nav", ...rest
}, ref) {
  const { activeId } = useController();
  const node = useRef<HTMLElement | null>(null);
  const mergedRef = useMemo(() => composeRefs(node, ref), [ref]);
  const generatedId = useId();
  const [titleId, setTitleId] = useState(`toc-title-${generatedId}`);
  const [geometry, setGeometry] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    const nav = node.current;
    const view = nav?.ownerDocument.defaultView;
    if (!nav || !view) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const link = Array.from(nav.querySelectorAll<HTMLElement>("[data-toc-link]"))
        .find((element) => element.getAttribute("data-toc-link") === activeId);
      if (!link || !link.getClientRects().length) { setGeometry(null); return; }
      const rail = getScrollElement?.();
      const focused = nav.ownerDocument.activeElement;
      if (autoScroll && rail && rail.contains(link) && (!nav.contains(focused) || focused === link)) {
        const rect = link.getBoundingClientRect();
        const boundary = rail.getBoundingClientRect();
        if (rect.top < boundary.top + rail.clientTop) rail.scrollTop += rect.top - boundary.top - rail.clientTop;
        else if (rect.bottom > boundary.top + rail.clientTop + rail.clientHeight) rail.scrollTop += rect.bottom - boundary.top - rail.clientTop - rail.clientHeight;
      }
      if (!nav.querySelector("[data-toc-indicator]")) return;
      const rect = link.getBoundingClientRect();
      const top = rect.top - nav.getBoundingClientRect().top - nav.clientTop + nav.scrollTop;
      setGeometry((previous) => previous?.top === top && previous.height === rect.height ? previous : { top, height: rect.height });
    };
    const schedule = () => { if (!frame) frame = view.requestAnimationFrame(measure); };
    const observer = view.ResizeObserver ? new view.ResizeObserver(schedule) : null;
    observer?.observe(nav);
    nav.querySelectorAll("[data-toc-link]").forEach((link) => observer?.observe(link));
    measure();
    view.addEventListener("resize", schedule);
    return () => { observer?.disconnect(); view.cancelAnimationFrame(frame); view.removeEventListener("resize", schedule); };
  }, [activeId, autoScroll, getScrollElement, children]);
  const props = { ...rest, "data-slot": slot,
    "aria-labelledby": rest["aria-labelledby"] ?? (rest["aria-label"] ? undefined : titleId || undefined),
    "data-indicator-ready": geometry ? "" : undefined,
    style: { "--atom-table-of-contents-indicator-block-start": `${geometry?.top ?? 0}px`,
      "--atom-table-of-contents-indicator-block-size": `${geometry?.height ?? 0}px`, ...style } as CSSProperties,
    ref: mergedRef,
  };
  return <NavContext.Provider value={{ titleId, setTitleId }}>
    {asChild ? cloneAndMerge(children, props) : renderElement(render, "nav", { ...props, children })}
  </NavContext.Provider>;
});
