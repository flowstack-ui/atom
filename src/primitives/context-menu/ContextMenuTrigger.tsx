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
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useMenuContext } from "../menu/index.js";
import { useContextMenuContext } from "./context.js";

type ContextMenuTriggerNativeProps = NativeSpanProps<"children">;

export interface ContextMenuTriggerProps extends ContextMenuTriggerNativeProps {
  children: ReactNode;
  disabled?: boolean;
}

export const ContextMenuTrigger = forwardRef<
  HTMLSpanElement,
  ContextMenuTriggerProps
>(function ContextMenuTrigger(
  {
    children,
    disabled = false,
    onContextMenu,
    onKeyDown,
    style,
    ...restProps
  },
  ref,
) {
  const ctx = useMenuContext();
  const { setAnchorPoint } = useContextMenuContext();
  const spanRef = useRef<HTMLSpanElement>(null);
  const composedRef = useMemo(
    () => composeRefs(spanRef, ctx.triggerRef, ref),
    [ctx.triggerRef, ref],
  );

  const handleContextMenu: MouseEventHandler<HTMLSpanElement> = useCallback(
    (event) => {
      if (disabled) return;
      event.preventDefault();
      setAnchorPoint({ x: event.clientX, y: event.clientY });
      ctx.onHighlight(null);
      ctx.onOpen();
    },
    [ctx, disabled, setAnchorPoint],
  );

  const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = useCallback(
    (event) => {
      if (disabled) return;

      if ((event.key === "F10" && event.shiftKey) || event.key === "ContextMenu") {
        event.preventDefault();
        const referenceElement = spanRef.current?.firstElementChild ?? spanRef.current;
        const rect = referenceElement?.getBoundingClientRect();
        if (rect) {
          setAnchorPoint({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
        }
        ctx.onHighlight(null);
        ctx.onOpen();
      }
    },
    [ctx, disabled, setAnchorPoint],
  );

  return (
    <span
      {...restProps}
      ref={composedRef}
      id={ctx.triggerId}
      data-slot="context-menu-trigger"
      data-state={ctx.isOpen ? "open" : "closed"}
      data-disabled={disabled ? "" : undefined}
      onContextMenu={composeEventHandlers(onContextMenu, handleContextMenu)}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      style={{ ...style, display: "contents" }}
    >
      {children}
    </span>
  );
});
