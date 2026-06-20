"use client";

import { forwardRef, useCallback, useId, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  AccordionItemContextProvider,
  type AccordionItemContextValue,
  useAccordionContext,
} from "./context.js";

type AccordionItemNativeProps = NativeDivProps<"children" | "value">;

export interface AccordionItemProps extends AccordionItemNativeProps {
  /** Unique value identifying this item. */
  value: string;
  /** Disable this item. */
  disabled?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Content. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem(
    {
      value,
      disabled: itemDisabled = false,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "accordion-item",
      ...restProps
    },
    ref,
  ) {
    const group = useAccordionContext();
    const disabled = group.disabled || itemDisabled;
    const isOpen = group.value.includes(value);
    const idPrefix = useId();
    const contentId = `${idPrefix}-content`;
    const triggerId = `${idPrefix}-trigger`;

    const onToggle = useCallback(() => {
      if (!disabled) group.onToggle(value);
    }, [disabled, group.onToggle, value]);

    const itemContext: AccordionItemContextValue = {
      value,
      isOpen,
      onToggle,
      contentId,
      triggerId,
      disabled,
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-state": isOpen ? "open" : "closed",
      ...(disabled ? { "data-disabled": "" } : {}),
      className,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <AccordionItemContextProvider value={itemContext}>
        {element}
      </AccordionItemContextProvider>
    );
  },
);
