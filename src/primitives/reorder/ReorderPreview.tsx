"use client";

import { forwardRef, useEffect, useLayoutEffect, type HTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDragDropContext } from "../drag-drop/context.js";
import { useReorderContext } from "./context.js";

const usePreviewEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

export interface ReorderPreviewProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Passive preview content. Do not mount a second Item or behavior owner. */
  children?: ReactNode | ((value: string) => ReactNode);
  /** Defaults to the source document's body. */
  container?: HTMLElement | null;
  "data-slot"?: string;
}

/** A visual-only duplicate: source remains in the list and retains focus. */
export const ReorderPreview = forwardRef<HTMLDivElement, ReorderPreviewProps>(
  function ReorderPreview({ children, container, style, "data-slot": slot = "reorder-preview", ...props }, ref) {
    const { state, getSourceElement } = useDragDropContext();
    const { getItemLabel } = useReorderContext();
    const source = state.activeValue ? getSourceElement(state.activeValue) : null;
    usePreviewEffect(() => {
      if (!source || state.input !== "pointer") return;
      source.setAttribute("data-previewing", "");
      return () => source.removeAttribute("data-previewing");
    }, [source, state.input]);
    if (state.input !== "pointer" || !state.activeValue || !state.sourceRect || !source) return null;
    const rect = state.sourceRect;
    return createPortal(
      <div {...props} ref={(node) => {
        if (node) node.setAttribute("inert", "");
        if (typeof ref === "function") return ref(node);
        if (ref) ref.current = node;
      }} aria-hidden="true" data-slot={slot} data-state="dragging"
        style={{ ...style, position: "fixed", left: rect.x + state.deltaX,
          top: rect.y + state.deltaY, width: rect.width, height: rect.height,
          boxSizing: "border-box", pointerEvents: "none" }}>
        {typeof children === "function" ? children(state.activeValue) : children ?? getItemLabel(state.activeValue)}
      </div>, container ?? source.ownerDocument.body,
    );
  },
);
