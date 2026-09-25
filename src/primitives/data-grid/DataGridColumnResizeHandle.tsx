"use client";
import { forwardRef, useContext, useEffect, useRef, type HTMLAttributes } from "react";
import { DataGridContext, DataGridRowContext } from "./context.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { composeEventHandlers } from "../../utils/dom.js";
import { useDirection, type DirectionValue } from "../direction/index.js";

export interface DataGridColumnResizeHandleProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  dir?: DirectionValue;
  onValueChange?: (width: number) => void;
  onValueCommit?: (width: number) => void;
  "data-slot"?: string;
}

/** Headless width control; callers apply the value to their own column. */
export const DataGridColumnResizeHandle = forwardRef<HTMLDivElement, DataGridColumnResizeHandleProps>(
  function DataGridColumnResizeHandle({ value, defaultValue = 160, min = 40, max = 1200, step = 10,
    disabled: disabledProp = false, dir: dirProp, onValueChange, onValueCommit, onPointerDown,
    onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, onKeyDown,
    onClick, tabIndex, "data-slot": slot = "data-grid-column-resize-handle", ...props }, ref) {
    const direction = useDirection();
    const grid = useContext(DataGridContext);
    const row = useContext(DataGridRowContext);
    const disabled = disabledProp || grid?.disabled || row?.disabled || false;
    const dir = dirProp ?? grid?.dir ?? direction;
    const lower = Number.isFinite(min) ? Math.max(0, min) : 40;
    const upper = Number.isFinite(max) ? Math.max(lower, max) : Math.max(lower, 1200);
    const increment = Number.isFinite(step) && step > 0 ? step : 10;
    const clamp = (width: number) => Math.max(lower, Math.min(upper, Number.isFinite(width) ? width : lower));
    const [width, setWidth] = useControllableState({ value, defaultValue: clamp(defaultValue), onChange: onValueChange });
    const usedWidth = clamp(width);
    const drag = useRef<{ id: number; x: number; start: number; current: number; node: HTMLDivElement } | null>(null);
    const cancel = () => {
      const current = drag.current;
      if (!current) return;
      drag.current = null;
      setWidth(current.start);
      if (current.node.hasPointerCapture(current.id)) current.node.releasePointerCapture(current.id);
    };
    useEffect(() => { if (disabled) cancel(); }, [disabled]);
    useEffect(() => () => {
      const current = drag.current;
      drag.current = null;
      if (current?.node.hasPointerCapture(current.id)) current.node.releasePointerCapture(current.id);
    }, []);
    return <div {...props} ref={ref} role="separator" aria-orientation="vertical"
      aria-valuemin={lower} aria-valuemax={upper} aria-valuenow={usedWidth}
      aria-disabled={disabled || undefined} data-disabled={disabled ? "" : undefined}
      data-slot={slot} dir={dir} tabIndex={disabled ? -1 : (tabIndex ?? -1)}
      onClick={composeEventHandlers(onClick, event => event.stopPropagation())}
      onPointerDown={composeEventHandlers(onPointerDown, event => {
        if (disabled || event.button !== 0 || drag.current) return;
        event.preventDefault(); event.stopPropagation();
        event.currentTarget.focus({ preventScroll: true });
        drag.current = { id: event.pointerId, x: event.clientX, start: usedWidth, current: usedWidth, node: event.currentTarget };
        event.currentTarget.setPointerCapture(event.pointerId);
      })}
      onPointerMove={composeEventHandlers(onPointerMove, event => {
        const current = drag.current;
        if (!current || current.id !== event.pointerId || disabled) return;
        current.current = clamp(current.start + (event.clientX - current.x) * (dir === "rtl" ? -1 : 1));
        setWidth(current.current);
      })}
      onPointerUp={composeEventHandlers(onPointerUp, event => {
        const current = drag.current;
        if (!current || current.id !== event.pointerId) return;
        drag.current = null;
        if (current.node.hasPointerCapture(current.id)) current.node.releasePointerCapture(current.id);
        onValueCommit?.(current.current);
      })}
      onPointerCancel={composeEventHandlers(onPointerCancel, cancel)}
      onLostPointerCapture={composeEventHandlers(onLostPointerCapture, cancel)}
      onKeyDown={composeEventHandlers(onKeyDown, event => {
        if (event.key === "Escape" && drag.current) { event.preventDefault(); event.stopPropagation(); cancel(); return; }
        if (disabled || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        const next = event.key === "Home" ? lower : event.key === "End" ? upper : clamp(usedWidth +
          (event.key === "ArrowRight" ? 1 : -1) * (dir === "rtl" ? -1 : 1) * increment * (event.shiftKey ? 10 : 1));
        setWidth(next); onValueCommit?.(next);
      })} />;
  },
);
