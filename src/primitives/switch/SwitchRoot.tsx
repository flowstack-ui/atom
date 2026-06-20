"use client";

import {
  forwardRef,
  type CSSProperties,
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
import { SwitchContextProvider } from "./context.js";

type SwitchRootNativeProps = NativeButtonProps<
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

export interface SwitchRootProps extends SwitchRootNativeProps {
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /** Fires when checked state changes. */
  onCheckedChange?: (checked: boolean) => void;
  /** Disables interaction. */
  disabled?: boolean;
  /** Read-only mode: focusable but not toggleable. */
  readOnly?: boolean;
  /** Marks the switch as invalid. */
  invalid?: boolean;
  /** Form field name. When provided, Atom renders a hidden checkbox input for form submission. */
  name?: string;
  /** Submitted form value when checked. */
  value?: string;
  /** Associates the hidden input with a form by ID. */
  form?: string;
  /** Marks the hidden input as required for native form validation. */
  required?: boolean;
  /** Accessible label. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Track and thumb rendered by the styled layer. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const SwitchRoot = forwardRef<HTMLButtonElement, SwitchRootProps>(
  function SwitchRoot(
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
      "data-slot": dataSlot = "switch",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const [isChecked, setIsChecked] = useControllableState({
      value: checked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });

    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      if (disabled || readOnly) return;
      setIsChecked((currentChecked) => !currentChecked);
    };

    const contextValue = useMemo(
      () => ({
        checked: isChecked,
        disabled,
        readOnly,
        invalid,
        required: Boolean(required),
      }),
      [disabled, invalid, isChecked, readOnly, required],
    );

    // Native props pass through first; Atom-owned behavior props below stay authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      role: "switch",
      "aria-checked": isChecked,
      ...(ariaLabel !== undefined && { "aria-label": ariaLabel }),
      "aria-required": required || undefined,
      tabIndex: disabled ? undefined : 0,
      ...(disabled && { disabled: true, "data-disabled": "" }),
      ...(readOnly && { "aria-readonly": true, "data-readonly": "" }),
      ...(invalid && { "aria-invalid": true, "data-invalid": "" }),
      ...(required && { "data-required": "" }),
      "data-state": isChecked ? "checked" : "unchecked",
      "data-slot": dataSlot,
      onClick: composeEventHandlers(onClick, handleClick),
      className,
    };

    const rootElement = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "button", { ...behaviorProps, children });

    return (
      <SwitchContextProvider value={contextValue}>
        {rootElement}
        {name !== undefined ? (
          <input
            type="checkbox"
            aria-hidden="true"
            tabIndex={-1}
            name={name}
            value={value}
            form={form}
            checked={isChecked}
            disabled={disabled}
            required={required}
            readOnly
            style={hiddenInputStyle}
          />
        ) : null}
      </SwitchContextProvider>
    );
  },
);
