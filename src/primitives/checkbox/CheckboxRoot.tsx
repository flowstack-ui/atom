"use client";

import {
  forwardRef,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  type InputHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useCheckbox } from "./useCheckbox.js";
import { checkboxComposedHost } from "./composedHost.js";
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
import {
  CheckboxContextProvider,
  type CheckboxCheckedState,
  type CheckboxDataState,
} from "./context.js";
import { useFieldContext } from "../field/context.js";
import type { ValidationBehavior } from "../form/validation.js";

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

export interface CheckboxRootProps extends CheckboxRootNativeProps {
  /** Ref to the single automatically managed native form input. */
  inputRef?: Ref<HTMLInputElement>;
  /** Native integration props; state, form ownership and proxy visibility remain authoritative. */
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "name" | "value" | "disabled" | "required" | "form" | "tabIndex" | "style" | "children">;
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
  /** Chooses inline Atom presentation or the browser's native validation UI. */
  validationBehavior?: ValidationBehavior;
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
      inputRef: externalInputRef,
      inputProps,
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
      "data-slot": dataSlot = "checkbox",
      onClick,
      onBlur,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const field = useFieldContext();
    const host = checkboxComposedHost(children, render, asChild);
    const isDisabled = Boolean(disabled || field?.disabled || host.disabled);
    const isReadOnly = Boolean(readOnly || field?.readOnly);
    const isRequired = Boolean(required || field?.required);
    const inputRef = useRef<HTMLInputElement>(null);
    const rootRef = useRef<HTMLButtonElement>(null);
    const interactedRef = useRef(false);
    useFormControlProxy(inputRef, rootRef);
    const { checked: isChecked, setChecked: setIsChecked } = useCheckbox({
      checked,
      defaultChecked,
      onCheckedChange,
    });
    const mergedInputRef = useMemo(() => composeRefs(inputRef, externalInputRef), [externalInputRef]);
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

    const toggle = () => {
      if (isDisabled || isReadOnly) return;
      interactedRef.current = true;
      setIsChecked((currentChecked) => getNextCheckboxCheckedState(currentChecked));
    };
    const reset = useCallback(() => {
      interactedRef.current = false;
      validation.clearNativeInvalid();
      setIsChecked(defaultChecked);
    }, [defaultChecked, setIsChecked, validation.clearNativeInvalid]);
    useFormReset(inputRef, form, checked !== undefined, reset);

    useEffect(() => {
      if (interactedRef.current) validation.revealNativeInvalid();
    }, [isChecked, validation.revealNativeInvalid]);

    const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
      toggle();
    };

    const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        toggle();
      }
    };

    const handleBlur: FocusEventHandler<HTMLButtonElement> = () => {
      validation.revealNativeInvalid();
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
      () => ({ state: dataState, disabled: isDisabled }),
      [dataState, isDisabled],
    );

    // Native props pass through first; Atom state, ARIA, and handlers remain authoritative.
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composeRefs(rootRef, ref),
      id: restProps.id ?? field?.controlId,
      type: "button",
      role: "checkbox",
      "aria-checked": ariaChecked,
      "aria-describedby": Object.prototype.hasOwnProperty.call(restProps, "aria-describedby")
        ? restProps["aria-describedby"]
        : field?.describedBy,
      "aria-disabled": isDisabled || undefined,
      "aria-required": restProps["aria-required"] ?? (isRequired || undefined),
      "aria-invalid": restProps["aria-invalid"] ?? (isInvalid || undefined),
      tabIndex: isDisabled ? undefined : 0,
      disabled: isDisabled || undefined,
      "data-state": dataState,
      "data-slot": dataSlot,
      ...(isDisabled && { "data-disabled": "" }),
      ...(isReadOnly && { "aria-readonly": true, "data-readonly": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      ...(isRequired && { "data-required": "" }),
      className,
      onClick: composeEventHandlers(onClick, composeEventHandlers(host.onClick, handleClick)),
      onBlur: composeEventHandlers(onBlur, handleBlur),
      onKeyDown: composeEventHandlers(onKeyDown, composeEventHandlers(host.onKeyDown, handleKeyDown)),
    };

    const rootElement = asChild
      ? cloneAndMerge(host.children, behaviorProps)
      : renderElement(host.render, "button", { ...behaviorProps, children });

    return (
      <CheckboxContextProvider value={contextValue}>
        {name !== undefined || isRequired || externalInputRef !== undefined || inputProps !== undefined ? (
          <input
            {...inputProps}
            ref={mergedInputRef}
            type="checkbox"
            aria-hidden="true"
            tabIndex={-1}
            name={name}
            value={value}
            form={form}
            checked={isChecked === true}
            disabled={isDisabled}
            required={isRequired}
            {...validation.validationProps}
            onFocus={(event) => { inputProps?.onFocus?.(event); rootRef.current?.focus(); }}
            onChange={composeEventHandlers(inputProps?.onChange, (event) => {
              if (!isDisabled && !isReadOnly) setIsChecked(event.currentTarget.checked);
              validation.validationProps.onChange();
            })}
            onInput={composeEventHandlers(inputProps?.onInput, validation.validationProps.onInput)}
            onInvalid={composeEventHandlers(inputProps?.onInvalid, validation.validationProps.onInvalid)}
            style={formControlProxyStyle}
          />
        ) : null}
        {rootElement}
      </CheckboxContextProvider>
    );
  },
);
