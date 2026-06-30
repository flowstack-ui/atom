"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useMenuContext } from "../menu/index.js";
import { useContextMenuContext } from "./context.js";

type ContextMenuTriggerNativeProps = NativeSpanProps<"children">;

export interface ContextMenuTriggerProps extends ContextMenuTriggerNativeProps {
  children: ReactNode;
  disabled?: boolean;
  asChild?: boolean;
  render?: RenderProp;
}

export const ContextMenuTrigger = forwardRef<
  HTMLElement,
  ContextMenuTriggerProps
>(function ContextMenuTrigger(
  {
    children,
    disabled = false,
    asChild = false,
    render,
    onContextMenu,
    onKeyDown,
    style,
    ...restProps
  },
  ref,
) {
  const ctx = useMenuContext();
  const { setAnchorPoint } = useContextMenuContext();
  const triggerRef = useRef<HTMLElement | null>(null);
  const composedRef = useMemo(
    () => composeRefs(triggerRef, ctx.triggerRef, ref),
    [ctx.triggerRef, ref],
  );

  const handleContextMenu: MouseEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled) return;
      event.preventDefault();
      setAnchorPoint({ x: event.clientX, y: event.clientY });
      ctx.onInitialHighlight(null);
      ctx.onHighlight(null);
      ctx.onOpen();
    },
    [ctx, disabled, setAnchorPoint],
  );

  const handleKeyDown: KeyboardEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (disabled) return;

      if ((event.key === "F10" && event.shiftKey) || event.key === "ContextMenu") {
        event.preventDefault();
        const referenceElement = triggerRef.current?.firstElementChild ?? triggerRef.current;
        const rect = referenceElement?.getBoundingClientRect();
        if (rect) {
          setAnchorPoint({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
        }
        ctx.onInitialHighlight("first");
        ctx.onHighlight(null);
        ctx.onOpen();
      }
    },
    [ctx, disabled, setAnchorPoint],
  );

  const triggerProps = {
    ...restProps,
    ref: composedRef,
    id: ctx.triggerId,
    "data-slot": "context-menu-trigger",
    "data-state": ctx.isOpen ? "open" : "closed",
    "data-disabled": disabled ? "" : undefined,
    onContextMenu: composeEventHandlers(onContextMenu, handleContextMenu),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    style: asChild || render ? style : { ...style, display: "contents" },
  };

  if (asChild) {
    return cloneAndMerge(children, triggerProps);
  }

  return renderElement(render, "span", { ...triggerProps, children });
});
