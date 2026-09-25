"use client";
import * as React from "react";
import { useEffect, useMemo, useRef, useState, type KeyboardEventHandler } from "react";
import { usePresence } from "../../hooks/usePresence.js";
import { FOCUSABLE_SELECTOR } from "../../hooks/focus.js";
import { ownsNavigationKey } from "./keyboard.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement } from "../../utils/slot.js";
import { NavigationMenuItemContextProvider, useNavigationMenuContext, type ContentNodeEntry } from "./context.js";

/** Internal shared real host for inline and viewport-managed panels. */
export function NavigationMenuPanel({ entry, value, onKeyDown, motion }: {
  entry: ContentNodeEntry; value: string;
  onKeyDown?: KeyboardEventHandler<HTMLElement>; motion?: string;
}) {
  const ctx = useNavigationMenuContext();
  const open = ctx.value === value;
  const presence = usePresence({ present: open });
  const [visited, setVisited] = useState(open);
  const localRef = useRef<HTMLDivElement>(null);
  const ref = useMemo(() => composeRefs(localRef, entry.ref, presence.ref), [entry.ref, presence.ref]);
  useEffect(() => { if (open) setVisited(true); }, [open]);
  const mounted = open || presence.isPresent || (!ctx.unmountOnExit && visited) || (!ctx.lazyMount && !visited);
  const Activity = (React as unknown as { Activity?: React.ComponentType<{ mode: "visible" | "hidden"; children: React.ReactNode }> }).Activity;
  if (ctx.hideMode === "activity" && !Activity) throw new Error("NavigationMenu hideMode=activity requires React 19.2+; use display-none on earlier runtimes.");
  if (!mounted) return null;
  const inlineKeyDown: KeyboardEventHandler<HTMLElement> = event => {
    if (ownsNavigationKey(event.target, event.key)) return;
    if (event.key === "Escape") {
      entry.onEscapeKeyDown?.(event.nativeEvent);
      if (event.nativeEvent.defaultPrevented) return;
      event.preventDefault(); ctx.onValueChange(null); ctx.getTriggerElement(value)?.focus({ preventScroll: true });
    }
    const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const tree = event.currentTarget.getRootNode() as Document | ShadowRoot;
    const current = nodes.indexOf(tree.activeElement as HTMLElement);
    let index = event.key === "Home" ? 0 : event.key === "End" ? nodes.length - 1
      : event.key === "ArrowDown" ? current + 1 : event.key === "ArrowUp" ? current - 1 : null;
    if (index === null || !nodes.length) return;
    if (entry.loop ?? ctx.loop) index = (index + nodes.length) % nodes.length;
    const node = nodes[index];
    if (node) { event.preventDefault(); node.focus({ preventScroll: true }); }
  };
  const props = { ...entry.props, ref, id: `${ctx.idPrefix}-content-${value}`, tabIndex: -1,
    "data-slot": entry.dataSlot, "data-state": open ? "open" : "closed", "data-value": value,
    "data-orientation": ctx.orientation, "data-motion": motion, className: entry.className,
    hidden: !open && !presence.isPresent, "aria-hidden": !open ? true : undefined,
    inert: !open ? (parseInt(React.version, 10) >= 19 ? true : "") : undefined,
    // Shared panels delegate their pointer boundary to Viewport. Inline
    // panels must own it themselves, including nested independent scopes.
    onPointerEnter: composeEventHandlers(entry.props?.onPointerEnter, (event: React.PointerEvent<HTMLElement>) => {
      if (!ctx.viewport && event.pointerType === "mouse") ctx.cancelCloseTimer();
    }),
    onPointerLeave: composeEventHandlers(entry.props?.onPointerLeave, (event: React.PointerEvent<HTMLElement>) => {
      if (!ctx.viewport && event.pointerType === "mouse") ctx.startCloseTimer();
    }),
    onKeyDown: composeEventHandlers(entry.props?.onKeyDown, onKeyDown ?? inlineKeyDown),
  };
  const output = entry.asChild ? cloneAndMerge(entry.node, props)
    : renderElement(entry.render, "div", { ...props, children: entry.node });
  const content = <NavigationMenuItemContextProvider value={null}>{output}</NavigationMenuItemContextProvider>;
  return ctx.hideMode === "activity" && Activity
    ? <Activity mode={open || presence.isPresent ? "visible" : "hidden"}>{content}</Activity> : content;
}
