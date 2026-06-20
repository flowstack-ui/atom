"use client";

import {
  forwardRef,
  type CSSProperties,
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
import { useRadioGroupContext } from "./context.js";

type RadioRootNativeProps = NativeButtonProps<
  "children" | "disabled" | "onChange" | "role" | "type" | "value"
>;

const hiddenInputStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

export interface RadioRootProps extends RadioRootNativeProps {
  /** Radio value, unique within the group. */
  value: string;
  /** Per-item disabled state. */
  disabled?: boolean;
  /** Accessible label when no visible label is provided. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Visual content rendered by the styled layer. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const RadioRoot = forwardRef<HTMLButtonElement, RadioRootProps>(
  function RadioRoot(
    {
      value,
      disabled = false,
      ariaLabel,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "radio",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const context = useRadioGroupContext();
    const internalRef = useRef<HTMLButtonElement>(null);
    const composedRef = useMemo(
      () => composeRefs(internalRef, ref),
      [ref],
    );

    const isChecked = context.activeValue === value;
    const isDisabled = disabled || context.disabled;
    const isInvalid = context.invalid;

    useEffect(() => {
      const element = internalRef.current;
      if (!element) return undefined;

      context.registerRadio(value, element);
      return () => {
        context.unregisterRadio(value);
      };
    }, [context.registerRadio, context.unregisterRadio, value]);

    const values = context.getRadioValues();
    const isFirstFocusable =
      !context.activeValue &&
      values.length > 0 &&
      values.find((registeredValue) => {
        const element = context.getRadioElement(registeredValue);
        return element && !element.disabled;
      }) === value;
    const tabIndex = isChecked || isFirstFocusable ? 0 : -1;

    const select: MouseEventHandler<HTMLButtonElement> = () => {
      if (!isDisabled) {
        context.setActiveValue(value);
      }
    };

    // Native button props pass through first; group state and roving focus stay authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      type: "button",
      role: "radio",
      "aria-checked": isChecked,
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      "aria-disabled": isDisabled || undefined,
      "aria-invalid": isInvalid || undefined,
      tabIndex,
      disabled: isDisabled || undefined,
      "data-state": isChecked ? "checked" : "unchecked",
      "data-slot": dataSlot,
      "data-value": value,
      ...(isDisabled && { "data-disabled": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      className,
      onClick: composeEventHandlers(onClick, select),
    };

    const radioElement = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "button", { ...behaviorProps, children });

    return (
      <>
        {radioElement}
        {context.name !== undefined ? (
          <input
            type="radio"
            aria-hidden="true"
            tabIndex={-1}
            name={context.name}
            value={value}
            form={context.form}
            checked={isChecked}
            required={context.required}
            disabled={isDisabled}
            readOnly
            style={hiddenInputStyle}
          />
        ) : null}
      </>
    );
  },
);
