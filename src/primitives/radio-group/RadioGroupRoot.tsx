"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  RadioGroupContextProvider,
  type RadioGroupContextValue,
} from "./context.js";
import { useFieldsetContext } from "../fieldset/context.js";

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
      disabled,
      required,
      invalid,
      orientation = "vertical",
      loop = true,
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
    const fieldset = useFieldsetContext();
    const isDisabled = disabled ?? fieldset?.disabled ?? false;
    const isRequired = required ?? fieldset?.required ?? false;
    const isInvalid = invalid ?? fieldset?.invalid ?? false;
    const rootRef = useRef<HTMLDivElement>(null);
    const dir = useDirection();
    const [activeValue, setActiveValue] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const reset = useCallback(() => setActiveValue(defaultValue), [defaultValue, setActiveValue]);
    useFormReset(rootRef, form, value !== undefined, reset);
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
        disabled: isDisabled,
        required: isRequired,
        invalid: isInvalid,
        orientation,
        loop,
        registerRadio,
        unregisterRadio,
        getRadioElement,
        getRadioValues,
      }),
      [
        activeValue,
        isDisabled,
        form,
        getRadioElement,
        getRadioValues,
        isInvalid,
        loop,
        name,
        orientation,
        registerRadio,
        registryVersion,
        isRequired,
        setActiveValue,
        unregisterRadio,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composeRefs(rootRef, ref),
      role: "radiogroup",
      "aria-labelledby": restProps["aria-labelledby"] ??
        (restProps["aria-label"] === undefined && fieldset?.hasLegend
          ? fieldset.legendId
          : undefined),
      "aria-describedby": Object.prototype.hasOwnProperty.call(restProps, "aria-describedby")
        ? restProps["aria-describedby"]
        : fieldset?.describedBy,
      "aria-disabled": restProps["aria-disabled"] ?? (isDisabled || undefined),
      "aria-required": restProps["aria-required"] ?? (isRequired || undefined),
      "aria-invalid": restProps["aria-invalid"] ?? (isInvalid || undefined),
      "aria-orientation": orientation,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      ...(isDisabled && { "data-disabled": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      ...(isRequired && { "data-required": "" }),
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
