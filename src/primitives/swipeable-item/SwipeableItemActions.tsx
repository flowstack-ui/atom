"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
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
import {
  useSwipeableItemContext,
  type SwipeableItemSide,
} from "./context.js";

type SwipeableItemActionsNativeProps = NativeDivProps<"children">;

export interface SwipeableItemActionsProps extends SwipeableItemActionsNativeProps {
  /** Logical side where these actions are revealed. */
  side: SwipeableItemSide;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Action controls. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const SwipeableItemActions = forwardRef<HTMLElement, SwipeableItemActionsProps>(
  function SwipeableItemActions(
    {
      side,
      render,
      asChild,
      children,
      "aria-label": ariaLabel,
      "data-slot": dataSlot = "swipeable-item-actions",
      ...restProps
    },
    ref,
  ) {
    const ctx = useSwipeableItemContext();
    const [actionsElement, setActionsElement] = useState<HTMLElement | null>(null);
    const {
      endActionsRef,
      openSide,
      setActionSize,
      startActionsRef,
    } = ctx;
    const isOpen = openSide === side;
    const state = isOpen ? "open" : "closed";
    const internalRef = side === "start" ? startActionsRef : endActionsRef;

    const setActionsRef = useCallback((node: unknown) => {
      const element = node as HTMLElement | null;
      internalRef.current = element;
      setActionsElement(element);
      if (!element) {
        setActionSize(side, 0);
      }
    }, [internalRef, setActionSize, side]);

    const composedRef = useMemo(
      () => composeRefs(setActionsRef, ref),
      [ref, setActionsRef],
    );

    useEffect(() => {
      if (!actionsElement) return undefined;

      const updateSize = () => {
        setActionSize(side, actionsElement.getBoundingClientRect().width);
      };

      updateSize();

      if (typeof ResizeObserver === "undefined") return undefined;

      const observer = new ResizeObserver(updateSize);
      observer.observe(actionsElement);
      return () => observer.disconnect();
    }, [actionsElement, setActionSize, side]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      "data-slot": dataSlot,
      "data-side": side,
      "data-state": state,
      role: "group",
      "aria-label": ariaLabel ?? `${side} actions`,
      "aria-hidden": isOpen ? undefined : true,
      inert: isOpen ? undefined : true,
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
