"use client";

import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, version, type ReactNode } from "react";
import { usePresence } from "../../hooks/usePresence.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useMeasuredContentHeight } from "../../utils/useMeasuredContentHeight.js";
import { useNavListContext, useNavListSectionContext } from "./context.js";

const useSafeLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
export interface NavListSectionContentProps extends NativeDivProps<"children" | "hidden"> {
  children?: ReactNode;
  /** Keep closed content mounted, hidden and inert. */
  forceMount?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const NavListSectionContent = forwardRef<HTMLDivElement, NavListSectionContentProps>(
  function NavListSectionContent({ children, forceMount = false, render, asChild, "data-slot": dataSlot = "nav-list-section-content", ...restProps }, ref) {
    const { orientation } = useNavListContext();
    const { isOpen, collapsible, contentId, hasLabel, labelId, triggerId } = useNavListSectionContext();
    const contentRef = useRef<HTMLDivElement>(null);
    const presence = usePresence({ present: isOpen });
    const composedRef = useMemo(() => composeRefs(contentRef, presence.ref, ref), [presence.ref, ref]);
    const initialOpen = useRef(isOpen);
    const transitioned = useRef(false);
    if (initialOpen.current !== isOpen) transitioned.current = true;
    const isMounted = forceMount || isOpen || presence.isPresent;
    useMeasuredContentHeight(contentRef, isMounted || isOpen, children);
    useSafeLayoutEffect(() => {
      const node = contentRef.current;
      if (!isOpen && node?.contains(node.ownerDocument.activeElement)) {
        node.ownerDocument.getElementById(triggerId)?.focus({ preventScroll: true });
      }
    }, [isOpen, triggerId]);
    if (!isMounted) return null;
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: contentId,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      "data-state": isOpen ? "open" : "closed",
      ...(initialOpen.current && !transitioned.current ? { "data-initial-open": "" } : {}),
      ...(collapsible ? { "data-collapsible": "" } : {}),
      "aria-labelledby": hasLabel ? labelId : collapsible ? triggerId : undefined,
      "aria-hidden": !isOpen ? true : undefined,
      inert: !isOpen ? (Number.parseInt(version, 10) >= 19 ? true : "") : undefined,
      hidden: !isOpen && !presence.isPresent ? true : undefined,
    };
    return asChild ? cloneAndMerge(children, behaviorProps) : renderElement(render, "div", { ...behaviorProps, children });
  },
);
