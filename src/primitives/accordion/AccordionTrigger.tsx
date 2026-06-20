"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { isToggleActivationKey } from "../toggle/ToggleRoot.js";
import { useAccordionContext, useAccordionItemContext } from "./context.js";

type AccordionTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "role" | "type">;

export interface AccordionTriggerProps extends AccordionTriggerNativeProps {
  /** Trigger label/content. */
  children?: ReactNode;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    {
      children,
      render,
      asChild,
      className,
      "data-slot": dataSlot = "accordion-trigger",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const group = useAccordionContext();
    const item = useAccordionItemContext();
    const usesNativeButton = !asChild && (render === undefined || render === "button");
    const localRef = useRef<HTMLButtonElement>(null);
    const composedRef = useMemo(
      () => composeRefs(localRef, ref),
      [ref],
    );

    useEffect(() => {
      const element = localRef.current;
      if (!element) return undefined;

      group.registerTrigger(item.value, element, item.disabled);
      return () => {
        group.unregisterTrigger(item.value);
      };
    }, [group.registerTrigger, group.unregisterTrigger, item.disabled, item.value]);

    const focusTrigger = (targetValue: string | null) => {
      if (!targetValue) return;
      group.getTriggerElement(targetValue)?.focus();
    };

    const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
      if (isToggleActivationKey(event.key)) {
        event.preventDefault();
        if (!item.disabled) item.onToggle();
        return;
      }

      const isVertical = group.orientation === "vertical";
      const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
      const previousKey = isVertical ? "ArrowUp" : "ArrowLeft";

      if (event.key === nextKey) {
        event.preventDefault();
        focusTrigger(group.getNextTriggerValue(item.value, "next"));
      } else if (event.key === previousKey) {
        event.preventDefault();
        focusTrigger(group.getNextTriggerValue(item.value, "previous"));
      } else if (event.key === "Home") {
        event.preventDefault();
        focusTrigger(group.getFirstTriggerValue());
      } else if (event.key === "End") {
        event.preventDefault();
        focusTrigger(group.getLastTriggerValue());
      }
    };

    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      if (!item.disabled) item.onToggle();
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      type: usesNativeButton ? "button" : undefined,
      role: usesNativeButton ? undefined : "button",
      id: item.triggerId,
      "data-slot": dataSlot,
      "data-state": item.isOpen ? "open" : "closed",
      ...(item.disabled ? { "data-disabled": "" } : {}),
      "aria-expanded": item.isOpen,
      "aria-controls": item.contentId,
      "aria-disabled": item.disabled || undefined,
      tabIndex: item.disabled ? undefined : 0,
      disabled: usesNativeButton ? item.disabled || undefined : undefined,
      onClick: composeEventHandlers(onClick, handleClick),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      className,
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", { ...behaviorProps, children });
  },
);
