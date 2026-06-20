"use client";

import {
  forwardRef,
  useCallback,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  ToggleGroupContextProvider,
  type ToggleGroupContextValue,
} from "./context.js";

type ToggleGroupRootNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange" | "role">;

type ToggleGroupOrientation = "horizontal" | "vertical";

export function getToggleGroupNavigationDirection(
  orientation: ToggleGroupOrientation,
  key: string,
): 1 | -1 | null {
  if (orientation === "horizontal") {
    if (key === "ArrowRight") return 1;
    if (key === "ArrowLeft") return -1;
    return null;
  }

  if (key === "ArrowDown") return 1;
  if (key === "ArrowUp") return -1;
  return null;
}

export interface ToggleGroupRootProps extends ToggleGroupRootNativeProps {
  /** Selection mode. */
  type?: "single" | "multiple";
  /** Controlled selected value or values. */
  value?: string | string[];
  /** Uncontrolled initial value or values. */
  defaultValue?: string | string[];
  /** Fires when selection changes. */
  onValueChange?: (value: string | string[]) => void;
  /** Disables all items. */
  disabled?: boolean;
  /** Keyboard navigation orientation. */
  orientation?: ToggleGroupOrientation;
  /** Arrow-key wrapping. */
  loop?: boolean;
  /** Accessible label for the group. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Toggle items. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

function normalizeValue(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export const ToggleGroupRoot = forwardRef<HTMLDivElement, ToggleGroupRootProps>(
  function ToggleGroupRoot(
    {
      type = "single",
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      orientation = "horizontal",
      loop = true,
      ariaLabel,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "toggle-group",
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const [selectedValue, setSelectedValue] = useControllableState({
      value: value === undefined ? undefined : normalizeValue(value),
      defaultValue: normalizeValue(defaultValue),
      onChange: (nextValue) => {
        if (type === "single") {
          onValueChange?.(nextValue[0] ?? "");
        } else {
          onValueChange?.(nextValue);
        }
      },
    });
    const {
      registerItem: registerCollectionItem,
      unregisterItem: unregisterCollectionItem,
      getItem: getCollectionItem,
      getValues: getCollectionValues,
    } = useCollection<string, HTMLButtonElement>();

    const onItemPress = useCallback(
      (itemValue: string) => {
        if (type === "single") {
          const next = selectedValue[0] === itemValue ? [] : [itemValue];
          setSelectedValue(next);
        } else {
          const next = selectedValue.includes(itemValue)
            ? selectedValue.filter((value) => value !== itemValue)
            : [...selectedValue, itemValue];
          setSelectedValue(next);
        }
      },
      [selectedValue, setSelectedValue, type],
    );

    const registerItem = useCallback(
      (itemValue: string, element: HTMLButtonElement) => {
        registerCollectionItem(itemValue, element);
      },
      [registerCollectionItem],
    );

    const unregisterItem = useCallback(
      (itemValue: string) => unregisterCollectionItem(itemValue),
      [unregisterCollectionItem],
    );

    const getItemElement = useCallback((itemValue: string): HTMLButtonElement | null => {
      return getCollectionItem(itemValue)?.element ?? null;
    }, [getCollectionItem]);

    const getItemValues = useCallback((): string[] => {
      return getCollectionValues();
    }, [getCollectionValues]);

    const findNextValue = useCallback(
      (values: string[], currentIndex: number, direction: 1 | -1): string | null => {
        const length = values.length;
        let index = currentIndex + direction;

        for (let i = 0; i < length - 1; i += 1) {
          if (loop) {
            index = ((index % length) + length) % length;
          } else if (index < 0 || index >= length) {
            return null;
          }

          const candidate = values[index];
          const element = getItemElement(candidate);
          if (element && !element.disabled) {
            return candidate;
          }

          index += direction;
        }

        return null;
      },
      [getItemElement, loop],
    );

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
      const values = getItemValues();
      if (values.length === 0) return;

      const focusedElement = document.activeElement as HTMLButtonElement | null;
      const currentValue = focusedElement?.dataset.value;
      const currentIndex = currentValue ? values.indexOf(currentValue) : 0;

      if (currentIndex === -1) return;

      const navigationDirection = getToggleGroupNavigationDirection(orientation, event.key);

      if (navigationDirection === 1) {
        event.preventDefault();
        const next = findNextValue(values, currentIndex, 1);
        if (next) getItemElement(next)?.focus();
      } else if (navigationDirection === -1) {
        event.preventDefault();
        const previous = findNextValue(values, currentIndex, -1);
        if (previous) getItemElement(previous)?.focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        const first = values.find((value) => {
          const element = getItemElement(value);
          return element && !element.disabled;
        });
        if (first) getItemElement(first)?.focus();
      } else if (event.key === "End") {
        event.preventDefault();
        const last = [...values].reverse().find((value) => {
          const element = getItemElement(value);
          return element && !element.disabled;
        });
        if (last) getItemElement(last)?.focus();
      }
    };

    const contextValue: ToggleGroupContextValue = {
      type,
      value: selectedValue,
      registeredValues: getItemValues(),
      onItemPress,
      disabled,
      orientation,
      loop,
      registerItem,
      unregisterItem,
      getItemElement,
      getItemValues,
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "group",
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      "data-slot": dataSlot,
      "data-orientation": orientation,
      ...(disabled && { "data-disabled": "" }),
      className,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <ToggleGroupContextProvider value={contextValue}>
        {element}
      </ToggleGroupContextProvider>
    );
  },
);
