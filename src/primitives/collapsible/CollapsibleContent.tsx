"use client";
import * as React from "react";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useMeasuredContentHeight } from "../../utils/useMeasuredContentHeight.js";
import { useCollapsibleContext } from "./context.js";
const useSafeLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
export interface CollapsibleContentProps
  extends NativeDivProps<"children" | "role"> {
  children?: ReactNode;
  /** @deprecated Use Root lazyMount and unmountOnExit. */
  keepMounted?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}
export const CollapsibleContent = forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(function CollapsibleContent(
  {
    children,
    keepMounted,
    render,
    asChild,
    "data-slot": slot = "collapsible-content",
    style,
    ...props
  },
  ref,
) {
  const api = useCollapsibleContext();
  const {
    open: isOpen,
    visible,
    contentRef,
    registerContent,
    collapsedHeight,
    collapsedWidth,
  } = api;
  const [everOpened, setEverOpened] = useState(isOpen);
  const initialOpen = useRef(isOpen);
  const transitioned = useRef(false);
  if (isOpen !== initialOpen.current) transitioned.current = true;
  const initial = initialOpen.current && !transitioned.current;
  const partial = [collapsedHeight, collapsedWidth].some(
    (value) => value !== undefined && parseFloat(value) > 0,
  );
  const lazy = keepMounted === undefined ? api.lazyMount : !keepMounted;
  const unmount = keepMounted === undefined ? api.unmountOnExit : !keepMounted;
  const isMounted =
    partial || visible || (!unmount && everOpened) || (!lazy && !everOpened);
  const composedRef = useMemo(
    () => composeRefs(registerContent, ref),
    [registerContent, ref],
  );
  useEffect(() => {
    if (isOpen) setEverOpened(true);
  }, [isOpen]);
  useEffect(() => {
    if (keepMounted !== undefined && api.lifecycleExplicit)
      console.warn(
        "Collapsible: do not combine Content keepMounted with Root lifecycle options. Legacy keepMounted takes precedence.",
      );
  }, [keepMounted, api.lifecycleExplicit]);
  useSafeLayoutEffect(() => {
    const node = contentRef.current;
    if (!isOpen && node?.contains(node.ownerDocument.activeElement))
      api.triggerRef.current?.focus({ preventScroll: true });
  }, [isOpen, contentRef, api.triggerRef]);
  useMeasuredContentHeight(contentRef, isMounted || isOpen, children);
  const Activity = (
    React as unknown as {
      Activity?: React.ComponentType<{
        mode: "visible" | "hidden";
        children: ReactNode;
      }>;
    }
  ).Activity;
  // Older runtimes retain hidden state without Activity effect pausing.
  if (!isMounted) return null;
  const variables = {
    "--collapsed-height": collapsedHeight ?? "0px",
    "--collapsed-width": collapsedWidth ?? "0px",
  } as CSSProperties;
  const attributes = {
    ...props,
    ref: composedRef,
    id: api.contentId,
    "data-slot": slot,
    "data-state": isOpen ? "open" : "closed",
    "data-orientation": api.orientation,
    "data-disabled": api.disabled ? "" : undefined,
    "data-initial-open": initial ? "" : undefined,
    "data-has-collapsed-size": partial ? "" : undefined,
    role: "region",
    "aria-labelledby": props["aria-label"]
      ? undefined
      : (props["aria-labelledby"] ?? api.triggerId),
    "aria-hidden": !isOpen ? true : undefined,
      // React 18 forwards unknown attributes as strings; React 19 owns inert
      // as a boolean. Preserve the same SSR attribute on both peer versions.
      inert: !isOpen ? (Number.parseInt(React.version, 10) >= 19 ? true : "") : undefined,
    hidden: !visible && !partial ? true : props.hidden,
    style: {
      ...style,
      ...variables,
      ...(!visible && partial
        ? {
            overflow: "hidden",
            ...(collapsedHeight !== undefined
              ? {
                  height: `min(var(--content-height, ${collapsedHeight}), ${collapsedHeight})`,
                }
              : {}),
            ...(collapsedWidth !== undefined
              ? {
                  width: `min(var(--content-width, ${collapsedWidth}), ${collapsedWidth})`,
                }
              : {}),
          }
        : {}),
    },
  };
  const output = asChild
    ? cloneAndMerge(children, attributes)
    : renderElement(render, "div", { ...attributes, children });
  return api.hideMode === "activity" && Activity ? (
    <Activity mode={visible || partial ? "visible" : "hidden"}>
      {output}
    </Activity>
  ) : (
    output
  );
});
