"use client";

import {
  forwardRef,
  type CSSProperties,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  useMemo,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  CheckboxContextProvider,
  type CheckboxCheckedState,
  type CheckboxDataState,
} from "./context.js";

type CheckboxRootNativeProps = NativeButtonProps<
  | "children"
  | "defaultChecked"
  | "disabled"
  | "form"
  | "name"
  | "onChange"
  | "role"
  | "type"
  | "value"
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

export interface CheckboxRootProps extends CheckboxRootNativeProps {
  /** Controlled checked state. Use "indeterminate" for the mixed state. */
  checked?: CheckboxCheckedState;
  /** Uncontrolled initial checked state. Use "indeterminate" for the mixed state. */
  defaultChecked?: CheckboxCheckedState;
  /** Fires when checked state changes. */
  onCheckedChange?: (checked: CheckboxCheckedState) => void;
  /** Disables interaction. */
  disabled?: boolean;
  /** Read-only mode: focusable but not toggleable. */
  readOnly?: boolean;
  /** Marks the checkbox as invalid. */
  invalid?: boolean;
  /** Form field name. When provided, Atom renders a hidden checkbox input for form submission. */
  name?: string;
  /** Submitted form value when checked. */
  value?: string;
  /** Associates the hidden input with a form by ID. */
  form?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Accessible label. */
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

export function getNextCheckboxCheckedState(
  checked: CheckboxCheckedState,
): Exclude<CheckboxCheckedState, "indeterminate"> {
  return checked === "indeterminate" ? true : !checked;
}

export const CheckboxRoot = forwardRef<HTMLButtonElement, CheckboxRootProps>(
  function CheckboxRoot(
    {
      checked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      readOnly = false,
      invalid = false,
      name,
      value = "on",
      form,
      required,
      ariaLabel,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "checkbox",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const [isChecked, setIsChecked] = useControllableState({
      value: checked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });

    const toggle = () => {
      if (disabled || readOnly) return;
      setIsChecked((currentChecked) => getNextCheckboxCheckedState(currentChecked));
    };

    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      toggle();
    };

    const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        toggle();
      }
    };

    const dataState: CheckboxDataState =
      isChecked === "indeterminate"
        ? "indeterminate"
        : isChecked
          ? "checked"
          : "unchecked";
    const ariaChecked: boolean | "mixed" =
      isChecked === "indeterminate" ? "mixed" : isChecked;
    const contextValue = useMemo(
      () => ({ state: dataState, disabled }),
      [dataState, disabled],
    );

    // Native props pass through first; Atom state, ARIA, and handlers remain authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      role: "checkbox",
      "aria-checked": ariaChecked,
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      "aria-required": required || undefined,
      "aria-invalid": invalid || undefined,
      tabIndex: disabled ? undefined : 0,
      disabled: disabled || undefined,
      "data-state": dataState,
      "data-slot": dataSlot,
      ...(disabled && { "data-disabled": "" }),
      ...(readOnly && { "aria-readonly": true, "data-readonly": "" }),
      ...(invalid && { "data-invalid": "" }),
      className,
      onClick: composeEventHandlers(onClick, handleClick),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    const rootElement = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "button", { ...behaviorProps, children });

    return (
      <CheckboxContextProvider value={contextValue}>
        {rootElement}
        {name !== undefined ? (
          <input
            type="checkbox"
            aria-hidden="true"
            tabIndex={-1}
            name={name}
            value={value}
            form={form}
            checked={isChecked === true}
            disabled={disabled}
            required={required}
            readOnly
            style={hiddenInputStyle}
          />
        ) : null}
      </CheckboxContextProvider>
    );
  },
);
