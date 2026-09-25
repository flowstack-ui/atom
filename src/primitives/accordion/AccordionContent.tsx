"use client";
import * as React from "react";
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { usePresence } from "../../hooks/usePresence.js";
import { useMeasuredContentHeight } from "../../utils/useMeasuredContentHeight.js";
import { useAccordionContext, useAccordionItemContext } from "./context.js";

export interface AccordionContentProps extends NativeDivProps<"children" | "role"> {
  children?: ReactNode;
  /** Compatibility override; prefer Root lazyMount/unmountOnExit. */
  keepMounted?: boolean;
  landmark?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}
const useSafeLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(function AccordionContent(
  { children, keepMounted, landmark = true, render, asChild, "data-slot": slot = "accordion-content", ...props }, ref,
) {
  const item = useAccordionItemContext();
  const group = useAccordionContext();
  const { isOpen } = item;
  const localRef = useRef<HTMLDivElement | null>(null);
  const presence = usePresence({ present: isOpen, onExitComplete: () => group.onExitComplete?.(item.value) });
  const composedRef = useMemo(() => composeRefs(localRef, presence.ref, ref), [presence.ref, ref]);
  const [everOpened, setEverOpened] = useState(isOpen);
  const initiallyOpen = useRef(isOpen);
  const transitioned = useRef(false);
  if (initiallyOpen.current !== isOpen) transitioned.current = true;
  const lazy = keepMounted === undefined ? group.lazyMount : !keepMounted;
  const unmount = keepMounted === undefined ? group.unmountOnExit : !keepMounted;
  const visible = isOpen || presence.isPresent;
  const mounted = visible || (!unmount && everOpened) || (!lazy && !everOpened);
  useEffect(() => { if (isOpen) setEverOpened(true); }, [isOpen]);
  useSafeLayoutEffect(() => {
    const node = localRef.current;
    if (!isOpen && node?.contains(node.ownerDocument.activeElement)) group.getTriggerElement(item.value)?.focus({ preventScroll: true });
  }, [isOpen, group.getTriggerElement, item.value]);
  useMeasuredContentHeight(localRef, mounted || isOpen, children);
  if (!mounted) return null;
  const behavior: Record<string, unknown> = {
    ...props, ref: composedRef, id: item.contentId,
    "data-slot": slot, "data-state": isOpen ? "open" : "closed",
    "data-orientation": group.orientation,
    "data-initial-open": initiallyOpen.current && !transitioned.current ? "" : undefined,
    role: landmark ? "region" : undefined,
    "aria-labelledby": landmark && !props["aria-label"] ? item.triggerId : props["aria-labelledby"],
    "aria-hidden": !isOpen || undefined,
    inert: !isOpen ? (Number.parseInt(React.version, 10) >= 19 ? true : "") : undefined,
    hidden: !visible || undefined,
  };
  const output = asChild ? cloneAndMerge(children, behavior) : renderElement(render, "div", { ...behavior, children });
  const Activity = (React as typeof React & { Activity?: React.ElementType }).Activity;
  return group.hideMode === "activity" && Activity ? <Activity mode={visible ? "visible" : "hidden"}>{output}</Activity> : output;
});
