"use client";
import * as React from "react";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { usePresence } from "../../hooks/usePresence.js";
import { FOCUSABLE_SELECTOR } from "../../hooks/focus.js";
import { useTabsContext } from "./context.js";

export interface TabsContentProps extends NativeDivProps<"children" | "role"> {
  children?: ReactNode;
  value: string;
  /** Legacy eager-retention switch. Explicit lifecycle props take precedence. */
  keepMounted?: boolean;
  focusable?: boolean;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  hideMode?: "display-none" | "activity";
  onExitComplete?: () => void;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent(
    {
      children,
      value,
      keepMounted,
      focusable,
      lazyMount: lazyProp,
      unmountOnExit: unmountProp,
      hideMode,
      onExitComplete,
      render,
      asChild,
      "data-slot": slot = "tabs-content",
      tabIndex,
      ...rest
    },
    ref,
  ) {
    const api = useTabsContext();
    const active = api.value === value;
    const explicit =
      lazyProp !== undefined ||
      unmountProp !== undefined ||
      api.lazyMount !== undefined ||
      api.unmountOnExit !== undefined;
    const lazy = lazyProp ?? api.lazyMount ?? (explicit ? false : !keepMounted);
    const unmount =
      unmountProp ?? api.unmountOnExit ?? (explicit ? false : !keepMounted);
    const [visited, setVisited] = useState(active);
    const [hasFocusable, setHasFocusable] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);
    const presence = usePresence({
      present: active,
      onExitComplete: onExitComplete ?? api.onExitComplete,
    });
    const composedRef = useMemo(
      () => composeRefs(nodeRef, ref, presence.ref),
      [ref, presence.ref],
    );
    useEffect(() => {
      if (active) setVisited(true);
    }, [active]);
    useEffect(() => {
      const node = nodeRef.current;
      if (!node || !active) return;
      const update = () =>
        setHasFocusable(
          Array.from(
            node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
          ).some(
            (child) =>
              !child.closest("[hidden],[inert]") && child.tabIndex >= 0,
          ),
        );
      update();
      const Observer = node.ownerDocument.defaultView?.MutationObserver;
      const observer = Observer ? new Observer(update) : null;
      observer?.observe(node, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["disabled", "tabindex", "hidden", "inert"],
      });
      return () => observer?.disconnect();
    }, [active]);
    useEffect(() => {
      const node = nodeRef.current;
      if (!active && node?.contains(node.ownerDocument.activeElement))
        api.focus(api.value);
    }, [active, api.value, api.focus]);
    const visible = active || presence.isPresent;
    if (!visible && (unmount || (lazy && !visited))) return null;
    const props = {
      ...rest,
      ref: composedRef,
      role: "tabpanel",
      id: api.getId("content", value),
      "aria-labelledby": api.getId("trigger", value),
      tabIndex:
        tabIndex ??
        (focusable === false
          ? undefined
          : focusable === true || !hasFocusable
            ? 0
            : undefined),
      "data-slot": slot,
      "data-state": active ? "active" : "inactive",
      "data-presence": active ? "open" : "closed",
      "data-orientation": api.orientation,
      hidden: !visible || undefined,
      "aria-hidden": !active || undefined,
      inert: !active
        ? parseInt(React.version, 10) >= 19
          ? true
          : ""
        : undefined,
    };
    const element = asChild
      ? cloneAndMerge(children, props)
      : renderElement(render, "div", { ...props, children });
    const Activity = (
      React as unknown as {
        Activity?: React.ComponentType<{
          mode: "visible" | "hidden";
          children: ReactNode;
        }>;
      }
    ).Activity;
    return (hideMode ?? api.hideMode) === "activity" && Activity ? (
      <Activity mode={visible ? "visible" : "hidden"}>{element}</Activity>
    ) : (
      element
    );
  },
);
