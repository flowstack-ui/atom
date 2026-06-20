"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import type { NativeLabelProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldContext } from "./context.js";

type FieldLabelNativeProps = NativeLabelProps<"children">;

export interface FieldLabelProps extends FieldLabelNativeProps {
  children: ReactNode;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  requiredIndicator?: ReactNode;
  optionalIndicator?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function renderIndicator(
  indicator: ReactNode,
  slot: string,
  ariaHidden?: boolean,
) {
  if (!indicator) return null;
  if (isValidElement(indicator)) return indicator;

  return (
    <span aria-hidden={ariaHidden} data-slot={slot}>
      {indicator}
    </span>
  );
}

function getAsChildContent(children: ReactNode, indicator: ReactNode) {
  const child = Children.only(children) as ReactElement<{ children?: ReactNode }>;
  return (
    <>
      {child.props.children}
      {indicator}
    </>
  );
}

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  function FieldLabel(
    {
      children,
      required,
      disabled,
      invalid,
      readOnly,
      requiredIndicator = " *",
      optionalIndicator,
      render,
      asChild,
      htmlFor,
      "data-slot": dataSlot = "field-label",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFieldContext();
    const isRequired = required ?? ctx?.required ?? false;
    const isDisabled = disabled ?? ctx?.disabled ?? false;
    const isInvalid = invalid ?? ctx?.invalid ?? false;
    const isReadOnly = readOnly ?? ctx?.readOnly ?? false;
    const renderedRequiredIndicator = renderIndicator(
      requiredIndicator,
      "field-required-indicator",
      true,
    );
    const renderedOptionalIndicator = renderIndicator(
      optionalIndicator,
      "field-optional-indicator",
    );
    const content = (
      <>
        {children}
        {isRequired ? renderedRequiredIndicator : null}
        {!isRequired ? renderedOptionalIndicator : null}
      </>
    );
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: ctx?.labelId ?? restProps.id,
      htmlFor: htmlFor ?? ctx?.controlId,
      "data-slot": dataSlot,
      ...(isDisabled && { "data-disabled": "" }),
      ...(isInvalid && { "data-invalid": "" }),
      ...(isRequired && { "data-required": "" }),
      ...(isReadOnly && { "data-readonly": "" }),
    };

    if (asChild) {
      return cloneAndMerge(children, {
        ...behaviorProps,
        children: getAsChildContent(
          children,
          isRequired ? renderedRequiredIndicator : renderedOptionalIndicator,
        ),
      });
    }

    return renderElement(render, "label", {
      ...behaviorProps,
      children: content,
    });
  },
);
