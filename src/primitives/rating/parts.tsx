"use client";

import { forwardRef, useEffect, useRef, type HTMLAttributes, type InputHTMLAttributes } from "react";
import { cloneAndMerge, renderElement, composeEventHandlers, type RenderProp } from "../../utils/slot.js";
import { useRatingContext } from "./context.js";

export interface RatingLabelProps extends HTMLAttributes<HTMLSpanElement> { asChild?: boolean; render?: RenderProp }
export const RatingLabel = forwardRef<HTMLSpanElement, RatingLabelProps>(function RatingLabel({ asChild, render, children, onClick, id, ...props }, ref) {
  const context = useRatingContext();
  const resolvedId = id ?? context.labelId;
  useEffect(() => {
    context.setRegisteredLabel(resolvedId);
    return () => context.setRegisteredLabel(undefined);
  }, [context.setRegisteredLabel, resolvedId]);
  const behavior = { ...props, ref, id: resolvedId, "data-slot": "rating-label", onClick: composeEventHandlers(onClick, () => {
    if (!context.disabled) context.rootRef.current?.focus();
  }) };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "span", { ...behavior, children });
});

export interface RatingControlProps extends HTMLAttributes<HTMLDivElement> { asChild?: boolean; render?: RenderProp }
export const RatingControl = forwardRef<HTMLDivElement, RatingControlProps>(function RatingControl({ asChild, render, children, ...props }, ref) {
  const context = useRatingContext();
  const behavior = { ...props, ref, id: props.id ?? context.controlId, "data-slot": "rating-control", dir: context.dir };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "div", { ...behavior, children });
});

export interface RatingHiddenInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "disabled" | "name" | "form" | "required"> {}
export const RatingHiddenInput = forwardRef<HTMLInputElement, RatingHiddenInputProps>(function RatingHiddenInput(props, ref) {
  const context = useRatingContext();
  const identity = useRef(Symbol("rating-input"));
  if (context.inputMode !== "manual") throw new Error('Rating.HiddenInput requires inputMode="manual"');
  useEffect(() => {
    if (context.hiddenInputOwner.current && context.hiddenInputOwner.current !== identity.current) {
      throw new Error("Rating accepts only one HiddenInput");
    }
    context.hiddenInputOwner.current = identity.current;
    return () => { context.hiddenInputOwner.current = null; };
  }, [context.hiddenInputOwner]);
  return <input {...props} ref={ref} id={props.id ?? context.input.id} type="hidden" name={context.input.name}
    form={context.input.form} value={context.input.formValue ?? String(context.value)} disabled={context.disabled} />;
});

Object.assign(RatingLabel, { [Symbol.for("flowstack.rating.part")]: "label" });
Object.assign(RatingHiddenInput, { [Symbol.for("flowstack.rating.part")]: "input" });
