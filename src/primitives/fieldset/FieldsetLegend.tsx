"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import type { NativeLegendProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldsetContext } from "./context.js";

type FieldsetLegendNativeProps = NativeLegendProps<"children">;

export interface FieldsetLegendProps extends FieldsetLegendNativeProps {
  children: ReactNode;
  requiredIndicator?: ReactNode;
  optionalIndicator?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function renderRequiredIndicator(indicator: ReactNode) {
  if (!indicator) return null;
  if (isValidElement(indicator)) return indicator;

  return (
    <span aria-hidden="true" data-slot="fieldset-required-indicator">
      {indicator}
    </span>
  );
}

function renderOptionalIndicator(indicator: ReactNode) {
  if (!indicator) return null;
  if (isValidElement(indicator)) return indicator;

  return (
    <span data-slot="fieldset-optional-indicator">
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

export const FieldsetLegend = forwardRef<HTMLLegendElement, FieldsetLegendProps>(
  function FieldsetLegend(
    {
      children,
      requiredIndicator = " *",
      optionalIndicator,
      render,
      asChild,
      "data-slot": dataSlot = "fieldset-legend",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFieldsetContext();
    const isRequired = ctx?.required ?? false;
    const renderedRequiredIndicator = renderRequiredIndicator(requiredIndicator);
    const renderedOptionalIndicator = renderOptionalIndicator(optionalIndicator);
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
      "data-slot": dataSlot,
      ...(ctx?.disabled && { "data-disabled": "" }),
      ...(isRequired && { "data-required": "" }),
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

    return renderElement(render, "legend", {
      ...behaviorProps,
      children: content,
    });
  },
);
