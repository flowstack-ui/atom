"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEventHandler,
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

type SwipeableItemActionsNativeProps = NativeDivProps<"children" | "onClick">;

export interface SwipeableItemActionsProps extends SwipeableItemActionsNativeProps {
  /** Logical side where these actions are revealed. */
  side: SwipeableItemSide;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Action controls. */
  children?: ReactNode;
  /** Close the item after an action panel click. */
  closeOnClick?: boolean;
  /** Consumer click handler. Runs before close-on-click behavior. */
  onClick?: MouseEventHandler<HTMLElement>;
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
      closeOnClick = true,
      onClick,
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
      close,
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

    const handleClick = useCallback<MouseEventHandler<HTMLElement>>((event) => {
      onClick?.(event);
      if (event.defaultPrevented || !closeOnClick) return;

      close();
    }, [close, closeOnClick, onClick]);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      onClick: handleClick,
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
