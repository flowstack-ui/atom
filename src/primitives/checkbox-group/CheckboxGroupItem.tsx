"use client";

import {
  forwardRef,
  isValidElement,
  type CSSProperties,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { CheckboxContextProvider, type CheckboxDataState } from "../checkbox/index.js";
import type { NativeButtonProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  CheckboxGroupItemContextProvider,
  useCheckboxGroupContext,
  type CheckboxGroupItemContextValue,
  type CheckboxGroupItemPartKind,
} from "./context.js";
import { getCheckboxGroupItemPartPresence } from "./parts.js";

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
    const autoId = useId();
    const providedId = restProps.id;
    const baseId = providedId ?? autoId;
    const labelId = `${baseId}-label`;
    const descriptionId = `${baseId}-description`;
    const relationshipChildren =
      asChild && isValidElement<{ children?: ReactNode }>(children)
        ? children.props.children
        : children;
    const visibleParts = getCheckboxGroupItemPartPresence(relationshipChildren);
    const [partCounts, setPartCounts] = useState({ label: 0, description: 0 });
    const [partRegistryReady, setPartRegistryReady] = useState(false);
    const hasLabel = partRegistryReady ? partCounts.label > 0 : visibleParts.label;
    const hasDescription = partRegistryReady
      ? partCounts.description > 0
      : visibleParts.description;

    useEffect(() => setPartRegistryReady(true), []);

    const registerPart = useCallback((kind: CheckboxGroupItemPartKind) => {
      let registered = true;
      setPartCounts((counts) => ({ ...counts, [kind]: counts[kind] + 1 }));
      return () => {
        if (!registered) return;
        registered = false;
        setPartCounts((counts) => ({
          ...counts,
          [kind]: Math.max(0, counts[kind] - 1),
        }));
      };
    }, []);
    const isChecked = context.isItemChecked(value);
    const isDisabled = disabled || context.disabled;
    const isReadOnly = readOnly || context.readOnly;
    const isInvalid = invalid || context.invalid;
    const isRequired = required || context.required;
    const inputName = name ?? context.name;
    const inputForm = form ?? context.form;
    const dataState: CheckboxDataState = isChecked ? "checked" : "unchecked";
    const itemContextValue = useMemo<CheckboxGroupItemContextValue>(
      () => ({
        labelId,
        descriptionId,
        hasLabel,
        hasDescription,
        registerPart,
      }),
      [descriptionId, hasDescription, hasLabel, labelId, registerPart],
    );

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
      id: baseId,
      type: "button",
      role: "checkbox",
      "aria-checked": isChecked,
      "aria-labelledby": Object.prototype.hasOwnProperty.call(restProps, "aria-labelledby")
        ? restProps["aria-labelledby"]
        : (restProps["aria-label"] === undefined && hasLabel ? labelId : undefined),
      "aria-describedby": Object.prototype.hasOwnProperty.call(restProps, "aria-describedby")
        ? restProps["aria-describedby"]
        : (hasDescription ? descriptionId : undefined),
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
      <CheckboxGroupItemContextProvider value={itemContextValue}>
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
              onChange={() => undefined}
              style={hiddenInputStyle}
            />
          ) : null}
        </CheckboxContextProvider>
      </CheckboxGroupItemContextProvider>
    );
  },
);
