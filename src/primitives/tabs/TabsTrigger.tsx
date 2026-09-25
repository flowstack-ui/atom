"use client";

import {
  forwardRef,
  cloneElement,
  type ReactElement,
  useEffect,
  useLayoutEffect,
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
import { isTabDisabled } from "./controller.js";

const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type TabsTriggerNativeProps = NativeButtonProps<
  "children" | "disabled" | "role" | "type" | "value"
>;

type TabsTriggerFocusableElement = Pick<HTMLButtonElement, "disabled"> &
  Partial<Pick<HTMLElement, "getAttribute">>;

export function getTabsTriggerTabStopValue(
  registeredValues: string[],
  activeValue: string,
  getTriggerElement: (value: string) => TabsTriggerFocusableElement | null,
): string | undefined {
  if (
    activeValue &&
    (registeredValues.length === 0 ||
      (registeredValues.includes(activeValue) &&
        !getTriggerElement(activeValue)?.disabled &&
        getTriggerElement(activeValue)?.getAttribute?.("aria-disabled") !==
          "true"))
  ) {
    return activeValue;
  }

  return registeredValues.find((registeredValue) => {
    const element = getTriggerElement(registeredValue);
    return (
      element &&
      !element.disabled &&
      element.getAttribute?.("aria-disabled") !== "true"
    );
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
      select,
      getId,
      setFocusedValue,
      hasNavigate,
      activationMode,
      orientation,
      registerTrigger,
      unregisterTrigger,
      getTriggerElement,
    } = useTabsContext();
    const internalRef = useRef<HTMLButtonElement>(null);
    const composedRef = useMemo(() => composeRefs(internalRef, ref), [ref]);
    const isActive = activeValue === value;
    const tabStopValue = getTabsTriggerTabStopValue(
      registeredValues,
      activeValue,
      getTriggerElement,
    );

    // Register before the indicator's layout measurement. A newly selected
    // dynamic tab must not briefly look absent and reset indicator geometry.
    useSafeLayoutEffect(() => {
      const element = internalRef.current;
      if (!element) return undefined;

      registerTrigger(value, element);
      return () => {
        unregisterTrigger(value);
      };
    }, [registerTrigger, unregisterTrigger, value, disabled]);

    const activate: MouseEventHandler<HTMLButtonElement> = (event) => {
      const node = event.currentTarget;
      if (disabled || isTabDisabled(node)) {
        event.preventDefault();
        return;
      }
      if (node.tagName === "A") {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.shiftKey ||
          node.hasAttribute("download") ||
          (node.getAttribute("target") &&
            node.getAttribute("target")?.toLowerCase() !== "_self")
        )
          return;
        if (hasNavigate) event.preventDefault();
      }
      setFocusedValue(value);
      select(value, node);
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      role: "tab",
      id: getId("trigger", value),
      "aria-selected": isActive,
      "aria-controls": getId("content", value),
      "aria-disabled": disabled || undefined,
      tabIndex: !disabled && value === tabStopValue ? 0 : -1,
      ...(disabled ? { href: null } : {}),
      "data-slot": dataSlot,
      "data-state": isActive ? "active" : "inactive",
      ...(disabled && { "data-disabled": "" }),
      "data-orientation": orientation,
      "data-value": value,
      className,
      onClick: composeEventHandlers(onClick, activate),
      onKeyDown: composeEventHandlers(restProps.onKeyDown, (event) => {
        if (
          activationMode === "automatic" &&
          event.key === " " &&
          event.currentTarget.tagName === "A"
        ) {
          event.preventDefault();
          if (!disabled && !isTabDisabled(event.currentTarget))
            event.currentTarget.click();
        }
      }),
      onFocus: composeEventHandlers(restProps.onFocus, () => {
        if (!disabled) setFocusedValue(value);
      }),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "button", { ...behaviorProps, children });
    const native =
      element.type === "button"
        ? {
            type: "button",
            disabled:
              disabled ||
              (element.props as { disabled?: boolean }).disabled ||
              undefined,
          }
        : {};
    return cloneElement(
      element as ReactElement<Record<string, unknown>>,
      native,
    );
  },
);
