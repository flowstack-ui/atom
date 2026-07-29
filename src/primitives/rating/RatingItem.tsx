"use client";

import {
  forwardRef,
  useCallback,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useRatingContext } from "./context.js";
import { snapRatingPointerValue } from "./utils.js";

type RatingItemNativeProps = NativeSpanProps<
  | "children"
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
  | "onLostPointerCapture"
>;

export interface RatingItemProps extends RatingItemNativeProps {
  /** Upper-bound value represented by this item. */
  value: number;
  /** Override the rendered item element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Decorative rating item content. */
  children?: ReactNode;
  /** Consumer pointer-down handler composed before Atom pointer behavior. */
  onPointerDown?: PointerEventHandler<HTMLSpanElement>;
  /** Consumer pointer-move handler composed before Atom pointer behavior. */
  onPointerMove?: PointerEventHandler<HTMLSpanElement>;
  /** Consumer pointer-up handler composed before Atom pointer behavior. */
  onPointerUp?: PointerEventHandler<HTMLSpanElement>;
  /** Consumer pointer-cancel handler composed before Atom pointer behavior. */
  onPointerCancel?: PointerEventHandler<HTMLSpanElement>;
  /** Consumer lost-pointer-capture handler composed before Atom cancellation behavior. */
  onLostPointerCapture?: PointerEventHandler<HTMLSpanElement>;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const RatingItem = forwardRef<HTMLSpanElement, RatingItemProps>(
  function RatingItem(
    {
      value,
      render,
      asChild,
      children,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
      style,
      "data-slot": dataSlot = "rating-item",
      ...restProps
    },
    ref,
  ) {
    const {
      disabled,
      beginPointerInteraction,
      cancelPointerInteraction,
      dir,
      endPointerInteraction,
      getItemState,
      invalid,
      min,
      movePointerInteraction,
      readOnly,
      step,
    } = useRatingContext();
    const state = getItemState(value);

    const getPointerValue = useCallback(
      (event: { currentTarget: EventTarget & HTMLElement; clientX: number }) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const lowerBound = Math.max(min, value - 1);
        const percent =
          rect.width > 0
            ? dir === "rtl"
              ? (rect.right - event.clientX) / rect.width
              : (event.clientX - rect.left) / rect.width
            : 1;
        const rawValue = lowerBound + Math.min(Math.max(percent, 0), 1) * (value - lowerBound);
        return snapRatingPointerValue(rawValue, step, min);
      },
      [dir, min, step, value],
    );

    const handlePointerDown = useCallback<PointerEventHandler<HTMLSpanElement>>(
      (event) => {
        if (disabled || readOnly) return;
        const pointerValue = getPointerValue(event);
        if (!beginPointerInteraction(event.pointerId, pointerValue)) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
      },
      [beginPointerInteraction, disabled, getPointerValue, readOnly],
    );

    const handlePointerMove = useCallback<PointerEventHandler<HTMLSpanElement>>(
      (event) => {
        if (disabled || readOnly || event.buttons !== 1) return;
        movePointerInteraction(event.pointerId, getPointerValue(event));
      },
      [disabled, getPointerValue, movePointerInteraction, readOnly],
    );

    const handlePointerUp = useCallback<PointerEventHandler<HTMLSpanElement>>(
      (event) => {
        endPointerInteraction(event.pointerId, value);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      },
      [endPointerInteraction, value],
    );

    const handlePointerCancel = useCallback<PointerEventHandler<HTMLSpanElement>>(
      (event) => {
        cancelPointerInteraction(event.pointerId);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      },
      [cancelPointerInteraction],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-hidden": true,
      "data-slot": dataSlot,
      "data-value": value,
      "data-fill": state.fill,
      "data-state": state.dataState,
      ...(disabled && { "data-disabled": "" }),
      ...(readOnly && { "data-readonly": "" }),
      ...(invalid && { "data-invalid": "" }),
      style: {
        ...style,
        touchAction: "pan-y",
      },
      onPointerDown: composeEventHandlers(onPointerDown, handlePointerDown),
      onPointerMove: composeEventHandlers(onPointerMove, handlePointerMove),
      onPointerUp: composeEventHandlers(onPointerUp, handlePointerUp),
      onPointerCancel: composeEventHandlers(onPointerCancel, handlePointerCancel),
      onLostPointerCapture: composeEventHandlers(
        onLostPointerCapture,
        handlePointerCancel,
      ),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "span", {
      ...behaviorProps,
      children,
    });
  },
);
