"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  version,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useTreeItemContext } from "./context.js";
import { usePresence } from "../../hooks/usePresence.js";
import { useMeasuredContentHeight } from "../../utils/useMeasuredContentHeight.js";

type TreeGroupNativeProps = NativeDivProps<"children" | "hidden" | "role" | "aria-hidden">;

export interface TreeGroupProps extends TreeGroupNativeProps {
  children?: ReactNode;
  forceMount?: boolean;
  /** Retain exiting content until its CSS motion completes. */
  animate?: boolean;
  onExitComplete?: () => void;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TreeGroup = forwardRef<HTMLElement, TreeGroupProps>(
  function TreeGroup(
    {
      children,
      forceMount = false,
      animate = false,
      onExitComplete,
      render,
      asChild,
      "data-slot": dataSlot = "tree-group",
      ...restProps
    },
    ref,
  ) {
    const { expanded, registerGroup } = useTreeItemContext();
    const presence = usePresence({ present: expanded, onExitComplete });
    const contentRef = useRef<HTMLDivElement | null>(null);
    const composedRef = useMemo(() => composeRefs(contentRef, presence.ref, ref), [presence.ref, ref]);
    const visible = expanded || (animate && presence.isPresent);
    useMeasuredContentHeight(contentRef, visible, children);

    useEffect(() => {
      return registerGroup();
    }, [registerGroup]);

    if (!forceMount && !visible) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      role: "group",
      hidden: !visible ? true : undefined,
      "aria-hidden": !expanded ? "true" : undefined,
      inert: !expanded ? (parseInt(version, 10) >= 19 ? true : "") : undefined,
      "data-animate": animate ? "" : undefined,
      "data-slot": dataSlot,
      "data-state": expanded ? "open" : "closed",
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
