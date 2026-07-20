"use client";

import {
  forwardRef,
  type CSSProperties,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { SwitchContextProvider } from "./context.js";
import { useFieldContext } from "../field/context.js";

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
      disabled,
      readOnly,
      invalid,
      name,
      value = "on",
      form,
      required,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "switch",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const field = useFieldContext();
    const isDisabled = disabled ?? field?.disabled ?? false;
    const isReadOnly = readOnly ?? field?.readOnly ?? false;
    const isInvalid = invalid ?? field?.invalid ?? false;
    const isRequired = required ?? field?.required ?? false;
    const inputRef = useRef<HTMLInputElement>(null);
    const [isChecked, setIsChecked] = useControllableState({
      value: checked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });

    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      if (isDisabled || isReadOnly) return;
      setIsChecked((currentChecked) => !currentChecked);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
      if (event.currentTarget instanceof HTMLButtonElement) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      if (isDisabled || isReadOnly) return;
      setIsChecked((currentChecked) => !currentChecked);
    };
    const reset = useCallback(() => setIsChecked(defaultChecked), [defaultChecked, setIsChecked]);
    useFormReset(inputRef, form, checked !== undefined, reset);

    const contextValue = useMemo(
      () => ({
        checked: isChecked,
        disabled: isDisabled,
        readOnly: isReadOnly,
        invalid: isInvalid,
        required: isRequired,
      }),
      [isDisabled, isInvalid, isChecked, isReadOnly, isRequired],
    );

    // Native props pass through first; Atom-owned behavior props below stay authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: restProps.id ?? field?.controlId,
      type: "button",
      role: "switch",
      "aria-checked": isChecked,
      "aria-describedby": Object.prototype.hasOwnProperty.call(restProps, "aria-describedby")
        ? restProps["aria-describedby"]
        : field?.describedBy,
      "aria-required": restProps["aria-required"] ?? (isRequired || undefined),
      tabIndex: isDisabled ? undefined : 0,
      ...(isDisabled && { disabled: true, "data-disabled": "" }),
      ...(isReadOnly && { "aria-readonly": true, "data-readonly": "" }),
      ...(isInvalid && { "aria-invalid": true, "data-invalid": "" }),
      ...(isRequired && { "data-required": "" }),
      "data-state": isChecked ? "checked" : "unchecked",
      "data-slot": dataSlot,
      onClick: composeEventHandlers(onClick, handleClick),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
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
            ref={inputRef}
            type="checkbox"
            aria-hidden="true"
            tabIndex={-1}
            name={name}
            value={value}
            form={form}
            checked={isChecked}
            disabled={isDisabled}
            required={isRequired}
            readOnly
            style={hiddenInputStyle}
          />
        ) : null}
      </SwitchContextProvider>
    );
  },
);
