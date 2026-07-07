"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  RadioGroupContextProvider,
  type RadioGroupContextValue,
} from "./context.js";

type RadioGroupRootNativeProps = NativeDivProps<
  "children" | "defaultValue" | "form" | "name" | "onChange" | "role"
>;

type RadioGroupOrientation = "horizontal" | "vertical";

function isRadioElementDisabled(element: HTMLElement): boolean {
  return (
    ("disabled" in element && element.disabled === true) ||
    element.getAttribute("aria-disabled") === "true" ||
    element.hasAttribute("data-disabled")
  );
}

export function getRadioGroupNavigationDirection(
  orientation: RadioGroupOrientation,
  key: string,
  dir: DirectionValue = "ltr",
): 1 | -1 | null {
  if (orientation === "horizontal") {
    if (key === "ArrowRight") return dir === "rtl" ? -1 : 1;
    if (key === "ArrowLeft") return dir === "rtl" ? 1 : -1;
    return null;
  }

  if (key === "ArrowDown") return 1;
  if (key === "ArrowUp") return -1;
  return null;
}

export interface RadioGroupRootProps extends RadioGroupRootNativeProps {
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial selected value. */
  defaultValue?: string;
  /** Fires when selection changes. */
  onValueChange?: (value: string) => void;
  /** Form field name shared across radio items. */
  name?: string;
  /** Associates radio item hidden inputs with a form by ID. */
  form?: string;
  /** Disables all radio items. */
  disabled?: boolean;
  /** Marks the group as required. */
  required?: boolean;
  /** Marks the group as invalid. */
  invalid?: boolean;
  /** Keyboard navigation direction. */
  orientation?: RadioGroupOrientation;
  /** Arrow-key wrapping. */
  loop?: boolean;
  /** Accessible label for the group. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Radio items. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRootProps>(
  function RadioGroupRoot(
    {
      value,
      defaultValue = "",
      onValueChange,
      name,
      form,
      disabled = false,
      required = false,
      invalid = false,
      orientation = "vertical",
      loop = true,
      ariaLabel,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "radio-group",
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const dir = useDirection();
    const [activeValue, setActiveValue] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const {
      version: registryVersion,
      registerItem: registerCollectionRadio,
      unregisterItem: unregisterCollectionRadio,
      getItem: getCollectionRadio,
      getValues: getCollectionRadioValues,
    } = useCollection<string, HTMLElement>();

    const registerRadio = useCallback(
      (value: string, element: HTMLElement) => {
        registerCollectionRadio(value, element);
      },
      [registerCollectionRadio],
    );

    const unregisterRadio = useCallback(
      (value: string) => unregisterCollectionRadio(value),
      [unregisterCollectionRadio],
    );

    const getRadioElement = useCallback((value: string): HTMLElement | null => {
      return getCollectionRadio(value)?.element ?? null;
    }, [getCollectionRadio]);

    const getRadioValues = useCallback((): string[] => {
      return getCollectionRadioValues();
    }, [getCollectionRadioValues]);

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
          const element = getRadioElement(candidate);
          if (element && !isRadioElementDisabled(element)) {
            return candidate;
          }

          index += direction;
        }

        return null;
      },
      [getRadioElement, loop],
    );

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
      const values = getRadioValues();
      if (values.length === 0) return;

      const focusedElement = document.activeElement as HTMLElement | null;
      const currentValue = focusedElement?.dataset.value;
      const currentIndex = currentValue
        ? values.indexOf(currentValue)
        : values.indexOf(activeValue);

      if (currentIndex === -1) return;

      const navigationDirection = getRadioGroupNavigationDirection(orientation, event.key, dir);

      if (navigationDirection === 1) {
        event.preventDefault();
        const next = findNextValue(values, currentIndex, 1);
        if (next) {
          getRadioElement(next)?.focus();
          setActiveValue(next);
        }
      } else if (navigationDirection === -1) {
        event.preventDefault();
        const previous = findNextValue(values, currentIndex, -1);
        if (previous) {
          getRadioElement(previous)?.focus();
          setActiveValue(previous);
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        const first = values.find((value) => {
          const element = getRadioElement(value);
          return element && !isRadioElementDisabled(element);
        });
        if (first) {
          getRadioElement(first)?.focus();
          setActiveValue(first);
        }
      } else if (event.key === "End") {
        event.preventDefault();
        const last = [...values].reverse().find((value) => {
          const element = getRadioElement(value);
          return element && !isRadioElementDisabled(element);
        });
        if (last) {
          getRadioElement(last)?.focus();
          setActiveValue(last);
        }
      }
    };

    const contextValue: RadioGroupContextValue = useMemo(
      () => ({
        activeValue,
        setActiveValue,
        name,
        form,
        disabled,
        required,
        invalid,
        orientation,
        loop,
        registerRadio,
        unregisterRadio,
        getRadioElement,
        getRadioValues,
      }),
      [
        activeValue,
        disabled,
        form,
        getRadioElement,
        getRadioValues,
        invalid,
        loop,
        name,
        orientation,
        registerRadio,
        registryVersion,
        required,
        setActiveValue,
        unregisterRadio,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "radiogroup",
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      "aria-disabled": disabled || undefined,
      "aria-required": required || undefined,
      "aria-invalid": invalid || undefined,
      "aria-orientation": orientation,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      ...(disabled && { "data-disabled": "" }),
      ...(invalid && { "data-invalid": "" }),
      className,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <RadioGroupContextProvider value={contextValue}>
        {element}
      </RadioGroupContextProvider>
    );
  },
);
