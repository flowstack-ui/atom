"use client";

import { type KeyboardEventHandler, type ReactNode, forwardRef } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import type { DirectionValue } from "../direction/index.js";
import { useTabsContext } from "./context.js";

type TabsListNativeProps = NativeDivProps<"children" | "role">;

export function getTabsListNavigationDirection(
  orientation: "horizontal" | "vertical",
  key: string,
  dir: DirectionValue = "ltr",
): 1 | -1 | null {
  if (orientation === "vertical") {
    if (key === "ArrowDown") return 1;
    if (key === "ArrowUp") return -1;
    return null;
  }

  if (key === "ArrowRight") return dir === "rtl" ? -1 : 1;
  if (key === "ArrowLeft") return dir === "rtl" ? 1 : -1;
  return null;
}

export interface TabsListProps extends TabsListNativeProps {
  /** Tab triggers and optional indicator. */
  children?: ReactNode;
  /** Accessible label for the tab list. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList(
    {
      children,
      ariaLabel,
      render,
      asChild,
      className,
      "data-slot": dataSlot = "tabs-list",
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const {
      orientation,
      dir,
      activationMode,
      loop,
      activeValue,
      setActiveValue,
      getTriggerElement,
      getTriggerValues,
    } = useTabsContext();

    function findNextValue(
      values: string[],
      currentIndex: number,
      direction: 1 | -1,
    ): string | null {
      const length = values.length;
      let index = currentIndex + direction;

      for (let i = 0; i < length - 1; i += 1) {
        if (loop) {
          index = ((index % length) + length) % length;
        } else if (index < 0 || index >= length) {
          return null;
        }

        const candidate = values[index];
        const element = getTriggerElement(candidate);
        if (element && !element.disabled) {
          return candidate;
        }

        index += direction;
      }

      return null;
    }

    function focusAndMaybeActivate(value: string) {
      const element = getTriggerElement(value);
      if (!element) return;

      element.focus();
      if (activationMode === "automatic") {
        setActiveValue(value);
      }
    }

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
      const values = getTriggerValues();
      if (values.length === 0) return;

      const focusedElement = document.activeElement as HTMLButtonElement | null;
      const currentValue = focusedElement?.dataset.value;
      const currentIndex = currentValue
        ? values.indexOf(currentValue)
        : values.indexOf(activeValue);

      if (currentIndex === -1) return;

      const navigationDirection = getTabsListNavigationDirection(
        orientation,
        event.key,
        dir,
      );

      if (navigationDirection === 1) {
        event.preventDefault();
        const next = findNextValue(values, currentIndex, 1);
        if (next) focusAndMaybeActivate(next);
      } else if (navigationDirection === -1) {
        event.preventDefault();
        const previous = findNextValue(values, currentIndex, -1);
        if (previous) focusAndMaybeActivate(previous);
      } else if (event.key === "Home") {
        event.preventDefault();
        const first = values.find((value) => {
          const element = getTriggerElement(value);
          return element && !element.disabled;
        });
        if (first) focusAndMaybeActivate(first);
      } else if (event.key === "End") {
        event.preventDefault();
        const last = [...values].reverse().find((value) => {
          const element = getTriggerElement(value);
          return element && !element.disabled;
        });
        if (last) focusAndMaybeActivate(last);
      } else if (
        activationMode === "manual" &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        if (currentValue) {
          setActiveValue(currentValue);
        }
      }
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "tablist",
      "aria-orientation": orientation,
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      "data-slot": dataSlot,
      "data-orientation": orientation,
      className,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "div", { ...behaviorProps, children });
  },
);
