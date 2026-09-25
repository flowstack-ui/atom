"use client";

import { forwardRef, useEffect, useRef, type MouseEventHandler, type PointerEventHandler, type ReactNode } from "react";
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
    { children, asChild, render, "data-slot": dataSlot = defaultSlot, onClick, onMouseDown, onPointerDown, onPointerUp, onPointerCancel, onPointerLeave, onLostPointerCapture, tabIndex = -1, ...restProps },
    ref,
  ) {
    const context = useNumberInputContext();
    const atBoundary = direction === 1 ? context.isAtMax : context.isAtMin;
    const actionDisabled = context.disabled || context.readOnly || atBoundary;
    const latest = useRef({ context, actionDisabled });
    latest.current = { context, actionDisabled };
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const repeated = useRef(false);
    const cleanup = useRef<(() => void) | undefined>(undefined);
    const stop = () => {
      clearTimeout(timer.current);
      timer.current = undefined;
      cleanup.current?.();
      cleanup.current = undefined;
    };
    useEffect(() => stop, []);
    useEffect(() => { if (actionDisabled || !context.spinOnPress) stop(); }, [actionDisabled, context.spinOnPress]);
    const handlePointerDown: PointerEventHandler<HTMLButtonElement> = event => {
      stop();
      repeated.current = false;
      if (event.button !== 0 || actionDisabled || !context.spinOnPress) return;
      const view = event.currentTarget.ownerDocument.defaultView;
      if (!view) return;
      view.addEventListener("pointerup", stop);
      view.addEventListener("pointercancel", stop);
      view.addEventListener("blur", stop);
      cleanup.current = () => {
        view.removeEventListener("pointerup", stop);
        view.removeEventListener("pointercancel", stop);
        view.removeEventListener("blur", stop);
      };
      const repeat = () => {
        if (latest.current.actionDisabled || !latest.current.context.spinOnPress) { stop(); return; }
        repeated.current = true;
        latest.current.context.handleStep(direction);
        timer.current = setTimeout(repeat, 60);
      };
      timer.current = setTimeout(repeat, 400);
    };
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (repeated.current && event.detail !== 0) { repeated.current = false; return; }
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
      id: restProps.id ?? (direction === 1 ? context.ids.incrementTrigger : context.ids.decrementTrigger),
      type: "button",
      tabIndex,
      disabled: context.disabled || undefined,
      "aria-disabled": actionDisabled || undefined,
      "aria-controls": context.inputId,
      "aria-label": restProps["aria-label"] ?? (direction === 1 ? context.translations.incrementLabel : context.translations.decrementLabel) ?? defaultLabel,
      "data-slot": dataSlot,
      ...(context.disabled && { "data-disabled": "" }),
      ...(context.readOnly && { "data-readonly": "" }),
      ...(atBoundary && { "data-boundary": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
      onMouseDown: composeEventHandlers(onMouseDown, handleMouseDown),
      onPointerDown: composeEventHandlers(onPointerDown, handlePointerDown),
      onPointerUp: composeEventHandlers(onPointerUp, stop),
      onPointerCancel: composeEventHandlers(onPointerCancel, stop),
      onPointerLeave: composeEventHandlers(onPointerLeave, stop),
      onLostPointerCapture: composeEventHandlers(onLostPointerCapture, stop),
    };
    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "button", { ...behaviorProps, children });
  });
}

export const NumberInputIncrement = createStepButton(1, "number-input-increment", "Increment");
export const NumberInputDecrement = createStepButton(-1, "number-input-decrement", "Decrement");
