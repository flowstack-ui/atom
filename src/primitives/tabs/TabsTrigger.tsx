"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
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
import { useTabsContext } from "./context.js";

type TabsTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "role" | "type" | "value">;

type TabsTriggerFocusableElement = Pick<HTMLButtonElement, "disabled">;

export function getTabsTriggerTabStopValue(
  registeredValues: string[],
  activeValue: string,
  getTriggerElement: (value: string) => TabsTriggerFocusableElement | null,
): string | undefined {
  if (activeValue) {
    return activeValue;
  }

  return registeredValues.find((registeredValue) => {
    const element = getTriggerElement(registeredValue);
    return element && !element.disabled;
  });
}

export interface TabsTriggerProps extends TabsTriggerNativeProps {
  /** Trigger content. */
  children?: ReactNode;
  /** Unique tab value. */
  value: string;
  /** Disable this tab. */
  disabled?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger(
    {
      children,
      value,
      disabled = false,
      render,
      asChild,
      className,
      "data-slot": dataSlot = "tabs-trigger",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const {
      activeValue,
      registeredValues,
      setActiveValue,
      idPrefix,
      orientation,
      registerTrigger,
      unregisterTrigger,
      getTriggerElement,
    } = useTabsContext();
    const internalRef = useRef<HTMLButtonElement>(null);
    const composedRef = useMemo(
      () => composeRefs(internalRef, ref),
      [ref],
    );
    const isActive = activeValue === value;
    const tabStopValue = getTabsTriggerTabStopValue(
      registeredValues,
      activeValue,
      getTriggerElement,
    );

    useEffect(() => {
      const element = internalRef.current;
      if (!element) return undefined;

      registerTrigger(value, element);
      return () => {
        unregisterTrigger(value);
      };
    }, [registerTrigger, unregisterTrigger, value]);

    const activate: MouseEventHandler<HTMLButtonElement> = () => {
      if (!disabled) {
        setActiveValue(value);
      }
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      role: "tab",
      type: "button",
      id: `${idPrefix}-trigger-${value}`,
      "aria-selected": isActive,
      "aria-controls": `${idPrefix}-panel-${value}`,
      "aria-disabled": disabled || undefined,
      tabIndex: value === tabStopValue ? 0 : -1,
      disabled: disabled || undefined,
      "data-slot": dataSlot,
      "data-state": isActive ? "active" : "inactive",
      ...(disabled && { "data-disabled": "" }),
      "data-orientation": orientation,
      "data-value": value,
      className,
      onClick: composeEventHandlers(onClick, activate),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "button", { ...behaviorProps, children });
  },
);
