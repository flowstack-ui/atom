"use client";

import { forwardRef, type MouseEventHandler, type ReactNode } from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { cloneAndMerge, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { useNumberInputContext } from "./context.js";

type StepButtonNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

export interface NumberInputStepButtonProps extends StepButtonNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export interface NumberInputIncrementProps extends NumberInputStepButtonProps {}
export interface NumberInputDecrementProps extends NumberInputStepButtonProps {}

function createStepButton(direction: 1 | -1, defaultSlot: string, defaultLabel: string) {
  return forwardRef<HTMLButtonElement, NumberInputStepButtonProps>(function NumberInputStepButton(
    { children, asChild, render, "data-slot": dataSlot = defaultSlot, onClick, onMouseDown, tabIndex = -1, ...restProps },
    ref,
  ) {
    const context = useNumberInputContext();
    const atBoundary = direction === 1 ? context.isAtMax : context.isAtMin;
    const actionDisabled = context.disabled || context.readOnly || atBoundary;
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (actionDisabled) {
        event.preventDefault();
        return;
      }
      context.handleStep(direction);
    };
    const handleMouseDown: MouseEventHandler<HTMLButtonElement> = (event) => {
      event.preventDefault();
    };
    const behaviorProps = {
      ...restProps,
      ref,
      type: "button",
      tabIndex,
      disabled: context.disabled || undefined,
      "aria-disabled": actionDisabled || undefined,
      "aria-controls": context.inputId,
      "aria-label": restProps["aria-label"] ?? defaultLabel,
      "data-slot": dataSlot,
      ...(context.disabled && { "data-disabled": "" }),
      ...(context.readOnly && { "data-readonly": "" }),
      ...(atBoundary && { "data-boundary": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
      onMouseDown: composeEventHandlers(onMouseDown, handleMouseDown),
    };
    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "button", { ...behaviorProps, children });
  });
}

export const NumberInputIncrement = createStepButton(1, "number-input-increment", "Increment");
export const NumberInputDecrement = createStepButton(-1, "number-input-decrement", "Decrement");
