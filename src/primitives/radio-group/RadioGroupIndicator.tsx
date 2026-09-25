"use client";

import { forwardRef, useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from "react";
import { composeRefs } from "../../utils/slot.js";
import { useRadioGroupContext } from "./context.js";

export interface RadioGroupIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  "data-slot"?: string;
}
type Geometry = { value: string; x: number; y: number; width: number; height: number; disabled: boolean };

/** Decorative measured selection. The styled layer owns positioning and paint. */
export const RadioGroupIndicator = forwardRef<HTMLSpanElement, RadioGroupIndicatorProps>(
  function RadioGroupIndicator({ style, "data-slot": slot = "radio-group-indicator", ...props }, ref) {
    const context = useRadioGroupContext();
    const indicatorRef = useRef<HTMLSpanElement | null>(null);
    const mergedRef = useMemo(() => composeRefs(indicatorRef, ref), [ref]);
    const [geometry, setGeometry] = useState<Geometry>();
    const [positioned, setPositioned] = useState(false);
    // Root's forwarded host ref attaches after descendant layout effects.
    // Measure after the full commit; styled fallback preserves initial paint.
    useEffect(() => {
      const root = context.getRootElement?.();
      const indicator = indicatorRef.current;
      const win = root?.ownerDocument.defaultView;
      if (!root || !indicator || !win) { setGeometry(undefined); return; }
      let frame = 0;
      let disposed = false;
      const update = () => {
        frame = 0;
        if (disposed) return;
        const selected = context.getRadioElement(context.activeValue);
        if (!selected || !root.contains(selected) || !selected.getClientRects().length) {
          setGeometry(undefined);
          return;
        }
        const r = root.getBoundingClientRect();
        const s = selected.getBoundingClientRect();
        // Convert viewport measurements back to the host's CSS coordinate space.
        const scaleX = root.offsetWidth ? r.width / root.offsetWidth : 1;
        const scaleY = root.offsetHeight ? r.height / root.offsetHeight : 1;
        if (!scaleX || !scaleY) { setGeometry(undefined); return; }
        const next: Geometry = {
          value: context.activeValue,
          x: (s.left - r.left) / scaleX - root.clientLeft + root.scrollLeft,
          y: (s.top - r.top) / scaleY - root.clientTop + root.scrollTop,
          width: s.width / scaleX,
          height: s.height / scaleY,
          disabled: selected.hasAttribute("data-disabled"),
        };
        setGeometry(previous => previous && (Object.keys(next) as (keyof Geometry)[]).every(key => previous[key] === next[key]) ? previous : next);
      };
      const schedule = () => { if (!disposed && !frame) frame = win.requestAnimationFrame(update); };
      const resize = typeof win.ResizeObserver === "function" ? new win.ResizeObserver(schedule) : undefined;
      const observeItems = () => {
        resize?.disconnect();
        resize?.observe(root);
        for (const value of context.getRadioValues()) {
          const item = context.getRadioElement(value);
          if (item) resize?.observe(item);
        }
      };
      observeItems();
      update();
      const mutation = new win.MutationObserver(records => {
        if (records.every(record => record.target === indicator || indicator.contains(record.target))) return;
        observeItems();
        schedule();
      });
      mutation.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "style", "dir", "hidden", "data-disabled"] });
      win.addEventListener("resize", schedule);
      root.addEventListener("scroll", schedule, true);
      root.ownerDocument.fonts?.addEventListener("loadingdone", schedule);
      return () => {
        disposed = true;
        if (frame) win.cancelAnimationFrame(frame);
        resize?.disconnect();
        mutation.disconnect();
        win.removeEventListener("resize", schedule);
        root.removeEventListener("scroll", schedule, true);
        root.ownerDocument.fonts?.removeEventListener("loadingdone", schedule);
      };
    }, [context]);
    // Keep the last measured geometry through a selection commit. Clearing it
    // before the passive measurement removes CSS coordinates and interrupts
    // the styled layer's transition. Missing targets still clear in update().
    const ready = geometry !== undefined && Boolean(context.activeValue);
    useEffect(() => {
      if (!ready || positioned) return;
      const win = indicatorRef.current?.ownerDocument.defaultView;
      if (!win) return;
      let second = 0;
      const first = win.requestAnimationFrame(() => {
        second = win.requestAnimationFrame(() => setPositioned(true));
      });
      return () => { win.cancelAnimationFrame(first); win.cancelAnimationFrame(second); };
    }, [ready, positioned]);
    return <span {...props} ref={mergedRef} aria-hidden="true" data-slot={slot} data-ready={ready ? "" : undefined} data-positioned={positioned ? "" : undefined}
      data-disabled={ready && geometry?.disabled ? "" : undefined}
      data-orientation={context.orientation}
      style={{ ...style, ...(ready && geometry ? {
        "--radio-group-indicator-x": `${geometry.x}px`,
        "--radio-group-indicator-y": `${geometry.y}px`,
        "--radio-group-indicator-width": `${geometry.width}px`,
        "--radio-group-indicator-height": `${geometry.height}px`,
      } : {}) } as CSSProperties} />;
  },
);
