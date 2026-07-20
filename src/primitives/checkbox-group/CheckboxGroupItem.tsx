"use client";

import {
  forwardRef,
  type CSSProperties,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  useEffect,
} from "react";
import { CheckboxContextProvider, type CheckboxDataState } from "../checkbox/index.js";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useCheckboxGroupContext } from "./context.js";

type CheckboxGroupItemNativeProps = NativeButtonProps<
  | "children"
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

export interface CheckboxGroupItemProps extends CheckboxGroupItemNativeProps {
  /** Unique value tracked by the checkbox group. */
  value: string;
  /** Item-level disabled override. */
  disabled?: boolean;
  /** Item-level read-only override. */
  readOnly?: boolean;
  /** Item-level invalid override. */
  invalid?: boolean;
  /** Item-level required override for ARIA state. */
  required?: boolean;
  /** Item-level form field name. Defaults to the group name. */
  name?: string;
  /** Associates this item's hidden input with a form by ID. Defaults to the group form. */
  form?: string;
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

export const CheckboxGroupItem = forwardRef<HTMLButtonElement, CheckboxGroupItemProps>(
  function CheckboxGroupItem(
    {
      value,
      disabled = false,
      readOnly = false,
      invalid = false,
      required,
      name,
      form,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "checkbox-group-item",
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const context = useCheckboxGroupContext();
    const isChecked = context.isItemChecked(value);
    const isDisabled = disabled || context.disabled;
    const isReadOnly = readOnly || context.readOnly;
    const isInvalid = invalid || context.invalid;
    const isRequired = required || context.required;
    const inputName = name ?? context.name;
    const inputForm = form ?? context.form;
    const dataState: CheckboxDataState = isChecked ? "checked" : "unchecked";

    useEffect(() => {
      context.registerItem(value);
      return () => {
        context.unregisterItem(value);
      };
    }, [context.registerItem, context.unregisterItem, value]);

    const toggle = () => {
      if (isDisabled || isReadOnly) return;
      context.toggleItem(value);
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

    // Native button props pass through first; group state, ARIA, and handlers stay authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      type: "button",
      role: "checkbox",
      "aria-checked": isChecked,
      "aria-disabled": isDisabled || undefined,
      "aria-required": isRequired || undefined,
      ...(isReadOnly && { "aria-readonly": true }),
      "aria-invalid": isInvalid || undefined,
      tabIndex: isDisabled ? undefined : 0,
      disabled: isDisabled || undefined,
      "data-state": dataState,
      "data-slot": dataSlot,
      "data-value": value,
      ...(isDisabled && { "data-disabled": "" }),
      ...(isReadOnly && { "data-readonly": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      className,
      onClick: composeEventHandlers(onClick, handleClick),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    const itemElement = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "button", { ...behaviorProps, children });

    return (
      <CheckboxContextProvider value={{ state: dataState, disabled: isDisabled }}>
        {itemElement}
        {inputName !== undefined ? (
          <input
            type="checkbox"
            aria-hidden="true"
            tabIndex={-1}
            name={inputName}
            value={value}
            form={inputForm}
            checked={isChecked}
            disabled={isDisabled}
            readOnly
            style={hiddenInputStyle}
          />
        ) : null}
      </CheckboxContextProvider>
    );
  },
);
