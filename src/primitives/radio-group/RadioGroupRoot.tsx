"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { formControlProxyStyle, useFormControlProxy } from "../../hooks/useFormControlProxy.js";
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
import type { ValidationBehavior } from "../form/validation.js";

type RadioGroupRootNativeProps = NativeDivProps<
  "children" | "defaultValue" | "dir" | "form" | "name" | "onChange" | "role"
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
  /** Prevents selection changes while preserving focus and form submission. */
  readOnly?: boolean;
  /** Marks the group as required. */
  required?: boolean;
  /** Marks the group as invalid. */
  invalid?: boolean;
  /** Chooses inline Atom presentation or the browser's native validation UI. */
  validationBehavior?: ValidationBehavior;
  /** Keyboard navigation direction. */
  orientation?: RadioGroupOrientation;
  /** Logical direction used by horizontal arrow navigation. */
  dir?: DirectionValue;
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

export interface RadioGroupController {
  value: string;
  setValue: (value: string) => void;
  reset: () => void;
  options: RadioGroupRootProps;
}

const controllerGuards = new WeakMap<RadioGroupController, Set<() => boolean>>();

export function useRadioGroup(options: RadioGroupRootProps = {}): RadioGroupController {
  const guards = useRef(new Set<() => boolean>());
  const [value, setValue] = useControllableState({ value: options.value, defaultValue: options.defaultValue ?? "", onChange: options.onValueChange });
  const update = useCallback((next: string) => {
    if (!options.disabled && !options.readOnly && [...guards.current].every(guard => guard())) setValue(next);
  }, [options.disabled, options.readOnly, setValue]);
  const reset = useCallback(() => setValue(options.defaultValue ?? ""), [options.defaultValue, setValue]);
  const controller = { value, setValue: update, reset, options };
  controllerGuards.set(controller, guards.current);
  return controller;
}

export interface RadioGroupRootProviderProps extends Omit<RadioGroupRootProps, "value" | "defaultValue" | "onValueChange"> {
  controller: RadioGroupController;
}

export const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRootProps>(function RadioGroupRoot(props, ref) {
  const controller = useRadioGroup(props);
  return <RadioGroupRootProvider {...props} controller={controller} ref={ref} />;
});

export const RadioGroupRootProvider = forwardRef<HTMLDivElement, RadioGroupRootProviderProps>(
  function RadioGroupRootProvider(
    providerProps,
    ref,
  ) {
    const { controller } = providerProps;
    const {
      value,
      defaultValue = "",
      onValueChange,
      name,
      form,
      disabled,
      readOnly = false,
      required,
      invalid,
      validationBehavior,
      orientation = "vertical",
      dir: dirProp,
      loop = true,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "radio-group",
      onKeyDown,
      controller: _controller,
      ...restProps
    } = { ...controller.options, ...providerProps };
    const fieldset = useFieldsetContext();
    const isDisabled = Boolean(disabled || fieldset?.disabled);
    useEffect(() => {
      const guards = controllerGuards.get(controller);
      const guard = () => !isDisabled && !readOnly;
      guards?.add(guard);
      return () => { guards?.delete(guard); };
    }, [controller, isDisabled, readOnly]);
    const isRequired = required ?? fieldset?.required ?? false;
    const rootRef = useRef<HTMLDivElement>(null);
    const lastFocusedRadio = useRef<HTMLElement | null>(null);
    const getRootElement = useCallback(() => rootRef.current, []);
    const validationInputRef = useRef<HTMLInputElement>(null);
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const activeValue = controller.value;
    const setActiveValue = useCallback((next: string) => {
      if (!isDisabled && !readOnly) controller.setValue(next);
    }, [controller.setValue, isDisabled, readOnly]);
    const reset = controller.reset;
    const [availabilityVersion, refreshAvailability] = useState(0);
    const [labelId, setLabelId] = useState<string>();
    useEffect(() => {
      const root = rootRef.current;
      const Observer = root?.ownerDocument.defaultView?.MutationObserver;
      if (!root || !Observer) return;
      const observer = new Observer(() => refreshAvailability(version => version + 1));
      observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["disabled", "aria-disabled", "data-disabled"] });
      refreshAvailability(version => version + 1);
      return () => observer.disconnect();
    }, []);
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
    const firstEnabledRadio = getRadioValues()
      .map(getRadioElement)
      .find((element) => element && !isRadioElementDisabled(element)) ?? null;
    const selectedRadio = getRadioElement(activeValue);
    const selectedEligible = !!selectedRadio && !isRadioElementDisabled(selectedRadio);
    const entryValue = selectedEligible ? activeValue : firstEnabledRadio?.dataset.value;
    useEffect(() => {
      const previous = lastFocusedRadio.current;
      const root = rootRef.current;
      if (!previous || !root || (previous.isConnected && !isRadioElementDisabled(previous))) return;
      const active = root.ownerDocument.activeElement;
      // Only recover focus lost by a removed/disabled local item. Never steal it
      // from another control, another group, or an application action.
      if (active !== previous && active !== root.ownerDocument.body) {
        lastFocusedRadio.current = null;
        return;
      }
      if (!isDisabled && firstEnabledRadio) {
        lastFocusedRadio.current = firstEnabledRadio;
        firstEnabledRadio.focus({ preventScroll: true });
      }
    }, [registryVersion, availabilityVersion, firstEnabledRadio, isDisabled]);
    useFormControlProxy(validationInputRef, { current: firstEnabledRadio });
    const validation = useFormValidation({
      validityRef: validationInputRef,
      ownerRef: { current: firstEnabledRadio },
      invalid,
      inheritedInvalid: fieldset?.invalid,
      validationBehavior,
      inheritedValidationBehavior: fieldset?.validationBehavior,
      form,
      reportValidity: fieldset?.reportControlValidity,
    });
    const isInvalid = validation.invalid;

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
      if (isDisabled) return;
      const values = getRadioValues();
      if (values.length === 0) return;

      const focusedElement = rootRef.current?.ownerDocument.activeElement as HTMLElement | null;
      if (!getRadioValues().some(value => getRadioElement(value) === focusedElement)) return;
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
          if (!readOnly) setActiveValue(next);
        }
      } else if (navigationDirection === -1) {
        event.preventDefault();
        const previous = findNextValue(values, currentIndex, -1);
        if (previous) {
          getRadioElement(previous)?.focus();
          if (!readOnly) setActiveValue(previous);
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        const first = values.find((value) => {
          const element = getRadioElement(value);
          return element && !isRadioElementDisabled(element);
        });
        if (first) {
          getRadioElement(first)?.focus();
          if (!readOnly) setActiveValue(first);
        }
      } else if (event.key === "End") {
        event.preventDefault();
        const last = [...values].reverse().find((value) => {
          const element = getRadioElement(value);
          return element && !isRadioElementDisabled(element);
        });
        if (last) {
          getRadioElement(last)?.focus();
          if (!readOnly) setActiveValue(last);
        }
      }
    };

    const contextValue: RadioGroupContextValue = useMemo(
      () => ({
        getRootElement,
        activeValue,
        entryValue,
        labelId,
        setLabelId,
        setActiveValue,
        name,
        form,
        disabled: isDisabled,
        readOnly,
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
        getRootElement,
        activeValue,
        entryValue,
        labelId,
        availabilityVersion,
        isDisabled,
        readOnly,
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
      dir: dirProp,
      ref: composeRefs(rootRef, ref),
      role: "radiogroup",
      "aria-labelledby": restProps["aria-labelledby"] ??
        (restProps["aria-label"] === undefined
          ? (fieldset?.hasLegend ? fieldset.legendId : labelId)
          : undefined),
      "aria-describedby": Object.prototype.hasOwnProperty.call(restProps, "aria-describedby")
        ? restProps["aria-describedby"]
        : fieldset?.describedBy,
      "aria-disabled": restProps["aria-disabled"] ?? (isDisabled || undefined),
      "aria-readonly": restProps["aria-readonly"] ?? (readOnly || undefined),
      "aria-required": restProps["aria-required"] ?? (isRequired || undefined),
      "aria-invalid": restProps["aria-invalid"] ?? (isInvalid || undefined),
      "aria-orientation": orientation,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      ...(isDisabled && { "data-disabled": "" }),
      ...(readOnly && { "data-readonly": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      ...(isRequired && { "data-required": "" }),
      className,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      onFocusCapture: composeEventHandlers(restProps.onFocusCapture, event => {
        const target = event.target as HTMLElement;
        lastFocusedRadio.current = getRadioValues().some(value => getRadioElement(value) === target) ? target : null;
      }),
      onBlurCapture: composeEventHandlers(restProps.onBlurCapture, event => {
        if (event.relatedTarget && !rootRef.current?.contains(event.relatedTarget as Node)) lastFocusedRadio.current = null;
      }),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <RadioGroupContextProvider value={contextValue}>
        {isRequired ? (
          <input
            ref={validationInputRef}
            type="checkbox"
            checked={selectedEligible}
            required
            disabled={isDisabled}
            form={form}
            aria-hidden="true"
            tabIndex={-1}
            onFocus={() => firstEnabledRadio?.focus()}
            {...validation.validationProps}
            style={formControlProxyStyle}
          />
        ) : null}
        {element}
      </RadioGroupContextProvider>
    );
  },
);
