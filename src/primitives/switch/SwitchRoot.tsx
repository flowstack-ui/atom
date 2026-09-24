"use client";

import {
  forwardRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import {
  formControlProxyStyle,
  useFormControlProxy,
} from "../../hooks/useFormControlProxy.js";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { SwitchContextProvider } from "./context.js";
import { switchComposedHost } from "./composedHost.js";
import { useSwitch } from "./useSwitch.js";
import { useFieldContext } from "../field/context.js";
import type { ValidationBehavior } from "../form/validation.js";

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
  /** Chooses inline Atom presentation or the browser's native validation UI. */
  validationBehavior?: ValidationBehavior;
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
      validationBehavior,
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
    const host = switchComposedHost(children, render, asChild);
    const isDisabled = Boolean(disabled || field?.disabled || host.disabled);
    const isReadOnly = readOnly ?? field?.readOnly ?? false;
    const isRequired = required ?? field?.required ?? false;
    const inputRef = useRef<HTMLInputElement>(null);
    const rootRef = useRef<HTMLButtonElement>(null);
    useFormControlProxy(inputRef, rootRef);
    const controller = useSwitch({
      checked,
      defaultChecked,
      onCheckedChange,
      disabled: isDisabled,
      readOnly: isReadOnly,
    });
    const isChecked = controller.checked;
    const validation = useFormValidation({
      validityRef: inputRef,
      ownerRef: rootRef,
      invalid,
      inheritedInvalid: field?.invalid,
      validationBehavior,
      inheritedValidationBehavior: field?.validationBehavior,
      form,
      reportValidity: field?.reportControlValidity,
    });
    const isInvalid = validation.invalid;

    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      controller.toggle();
    };

    const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
      if (event.currentTarget.tagName === "BUTTON") return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      controller.toggle();
    };
    const reset = useCallback(
      () => controller.setChecked(defaultChecked),
      [controller.setChecked, defaultChecked],
    );
    useFormReset(inputRef, form, checked !== undefined, reset);

    const contextValue = useMemo(
      () => ({
        checked: isChecked,
        setChecked: controller.setChecked,
        toggle: controller.toggle,
        disabled: isDisabled,
        readOnly: isReadOnly,
        invalid: isInvalid,
        required: isRequired,
      }),
      [
        controller.setChecked,
        controller.toggle,
        isDisabled,
        isInvalid,
        isChecked,
        isReadOnly,
        isRequired,
      ],
    );

    // Native props pass through first; Atom-owned behavior props below stay authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composeRefs(rootRef, ref),
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
      onClick: composeEventHandlers(
        onClick,
        composeEventHandlers(host.onClick, handleClick),
      ),
      onKeyDown: composeEventHandlers(
        onKeyDown,
        composeEventHandlers(host.onKeyDown, handleKeyDown),
      ),
      className,
    };

    const rootElement = asChild
      ? cloneAndMerge(host.children, behaviorProps)
      : renderElement(host.render, "button", { ...behaviorProps, children });

    return (
      <SwitchContextProvider value={contextValue}>
        {name !== undefined || isRequired ? (
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
            onFocus={() => rootRef.current?.focus()}
            {...validation.validationProps}
            style={formControlProxyStyle}
          />
        ) : null}
        {rootElement}
      </SwitchContextProvider>
    );
  },
);
