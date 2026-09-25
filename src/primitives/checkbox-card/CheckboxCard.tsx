"use client";

import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode } from "react";
import { useCheckbox, type CheckboxController, type UseCheckboxProps } from "../checkbox/useCheckbox.js";
import { useOptionalCheckboxGroupContext } from "../checkbox-group/context.js";
import { useFieldContext } from "../field/context.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import type { ValidationBehavior } from "../form/validation.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";

export interface CheckboxCardRootProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "onChange" | "defaultValue" | "defaultChecked">, UseCheckboxProps {
  name?: string;
  value?: string;
  form?: string;
  required?: boolean;
  invalid?: boolean;
  validationBehavior?: ValidationBehavior;
  ids?: Partial<Record<"input" | "label" | "description", string>>;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}
type CardContext = CheckboxController & {
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputId: string; labelId: string; descriptionId: string;
  hasLabel: boolean; hasDescription: boolean;
  register: (part: "label" | "description") => () => void;
  name?: string; value: string; form?: string; required: boolean; invalid: boolean;
  limitDisabled: boolean; describedBy?: string;
  validation: ReturnType<typeof useFormValidation<HTMLInputElement>>;
};
const Context = createContext<CardContext | null>(null);
Context.displayName = "CheckboxCard";
export function useCheckboxCardContext() {
  const value = useContext(Context);
  if (!value) throw new Error("CheckboxCard parts require CheckboxCard.Root.");
  return value;
}
function stateAttributes(ctx: Pick<CardContext, "checked" | "disabled" | "readOnly" | "invalid">) {
  return { "data-state": ctx.checked === "indeterminate" ? "indeterminate" : ctx.checked ? "checked" : "unchecked", "data-disabled": ctx.disabled ? "" : undefined, "data-readonly": ctx.readOnly ? "" : undefined, "data-invalid": ctx.invalid ? "" : undefined };
}
export const CheckboxCardRoot = forwardRef<HTMLLabelElement, CheckboxCardRootProps>(function CheckboxCardRoot({ checked, defaultChecked = false, onCheckedChange, disabled, readOnly, required, invalid, name, value = "on", form, validationBehavior, ids, id, asChild, render, children, ...props }, ref) {
  const field = useFieldContext();
  const group = useOptionalCheckboxGroupContext();
  const generated = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = ids?.input ?? field?.controlId ?? `${id ?? generated}-input`;
  const labelId = ids?.label ?? `${id ?? generated}-label`;
  const descriptionId = ids?.description ?? `${id ?? generated}-description`;
  const groupChecked = group?.isItemChecked(value);
  const limitDisabled = Boolean(group && !groupChecked && group.maxSelectedValues !== undefined && new Set(group.groupValues).size >= group.maxSelectedValues);
  const isDisabled = Boolean(disabled || field?.disabled || group?.disabled || limitDisabled);
  const isReadOnly = Boolean(readOnly || field?.readOnly || group?.readOnly);
  const isRequired = required ?? (group ? false : field?.required ?? false);
  const formId = group?.form ?? form;
  const controller = useCheckbox({ checked: group ? groupChecked : checked, defaultChecked, disabled: isDisabled, readOnly: isReadOnly, onCheckedChange: (next) => {
    if (group && (next === true) !== groupChecked) group.toggleItem(value);
    onCheckedChange?.(next);
  } });
  const validation = useFormValidation({ validityRef: inputRef, ownerRef: inputRef, invalid, inheritedInvalid: Boolean(field?.invalid || group?.invalid), validationBehavior, inheritedValidationBehavior: field?.validationBehavior, form: formId, reportValidity: field?.reportControlValidity });
  const reset = useCallback(() => { controller.setChecked(defaultChecked); validation.clearNativeInvalid(); }, [controller.setChecked, defaultChecked, validation.clearNativeInvalid]);
  useFormReset(inputRef, formId, group !== null || checked !== undefined, reset);
  const [parts, setParts] = useState({ label: 0, description: 0 });
  const register = useCallback((part: "label" | "description") => {
    setParts((current) => ({ ...current, [part]: current[part] + 1 }));
    return () => setParts((current) => ({ ...current, [part]: current[part] - 1 }));
  }, []);
  const registerItem = group?.registerItem;
  const unregisterItem = group?.unregisterItem;
  useEffect(() => {
    if (!registerItem || !inputRef.current) return;
    registerItem(value, inputRef.current);
    return () => unregisterItem?.(value);
  }, [registerItem, unregisterItem, value, isDisabled, isReadOnly]);
  const context = useMemo<CardContext>(() => ({ ...controller, inputRef, inputId, labelId, descriptionId, hasLabel: parts.label > 0, hasDescription: parts.description > 0, register, name: group?.name ?? name, value, form: formId, required: isRequired, invalid: validation.invalid, limitDisabled, describedBy: field?.describedBy, validation }), [controller.checked, controller.setChecked, controller.toggle, controller.disabled, controller.readOnly, inputId, labelId, descriptionId, parts, register, group?.name, name, value, formId, isRequired, validation.invalid, validation.revealNativeInvalid, validation.clearNativeInvalid, validation.validationBehavior, limitDisabled, field?.describedBy]);
  const rootProps = { ...props, ...stateAttributes(context), id, ref, htmlFor: inputId, "data-slot": props["data-slot"] ?? "checkbox-card", "data-required": isRequired ? "" : undefined, onClick: composeEventHandlers(props.onClick, (event: React.MouseEvent<HTMLLabelElement>) => { if (isReadOnly && event.target !== inputRef.current) event.preventDefault(); }) };
  return <Context.Provider value={context}>{asChild ? cloneAndMerge(children, rootProps) : renderElement(render, "label", { ...rootProps, children })}</Context.Provider>;
});

export type CheckboxCardRootProviderProps = Omit<CheckboxCardRootProps, "value" | "checked" | "defaultChecked" | "onCheckedChange"> & { value: CheckboxController; inputValue?: string };
export const CheckboxCardRootProvider = forwardRef<HTMLLabelElement, CheckboxCardRootProviderProps>(function CheckboxCardRootProvider({ value, inputValue, disabled, readOnly, ...props }, ref) {
  return <CheckboxCardRoot {...props} ref={ref} value={inputValue} checked={value.checked} onCheckedChange={value.setChecked} disabled={disabled || value.disabled} readOnly={readOnly || value.readOnly} />;
});
export type CheckboxCardHiddenInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "name" | "value" | "disabled" | "required" | "form" | "children" | "id">;
const hiddenStyle: CSSProperties = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", border: 0 };
export const CheckboxCardHiddenInput = forwardRef<HTMLInputElement, CheckboxCardHiddenInputProps>(function CheckboxCardHiddenInput({ onClick, onChange, onBlur, onInput, onInvalid, style, ...props }, ref) {
  const ctx = useCheckboxCardContext();
  const mergedRef = useMemo(() => composeRefs(ctx.inputRef, ref), [ctx.inputRef, ref]);
  useEffect(() => { if (ctx.inputRef.current) ctx.inputRef.current.indeterminate = ctx.checked === "indeterminate"; }, [ctx.checked, ctx.inputRef]);
  return <input {...props} {...stateAttributes(ctx)} {...ctx.validation.validationProps}
    ref={mergedRef} id={ctx.inputId} type="checkbox" name={ctx.name} value={ctx.value}
    form={ctx.form} disabled={ctx.disabled} required={ctx.required} checked={ctx.checked === true}
    aria-checked={ctx.checked === "indeterminate" ? "mixed" : ctx.checked}
    aria-readonly={ctx.readOnly || undefined} aria-invalid={ctx.invalid || undefined}
    aria-labelledby={props["aria-labelledby"] ?? (!props["aria-label"] && ctx.hasLabel ? ctx.labelId : undefined)}
    aria-describedby={props["aria-describedby"] ?? ([ctx.hasDescription ? ctx.descriptionId : undefined, ctx.describedBy].filter(Boolean).join(" ") || undefined)}
    data-limit-disabled={ctx.limitDisabled ? "" : undefined} data-slot="checkbox-card-input"
    style={{ ...style, ...hiddenStyle }} onClick={onClick}
    onChange={composeEventHandlers(onChange, (event) => {
      if (!ctx.disabled && !ctx.readOnly) ctx.setChecked(event.currentTarget.checked);
      else { event.currentTarget.checked = ctx.checked === true; event.currentTarget.indeterminate = ctx.checked === "indeterminate"; }
      ctx.validation.validationProps.onChange();
    })}
    onBlur={composeEventHandlers(onBlur, ctx.validation.revealNativeInvalid)}
    onInput={composeEventHandlers(onInput, ctx.validation.validationProps.onInput)}
    onInvalid={composeEventHandlers(onInvalid, ctx.validation.validationProps.onInvalid)} />;
});
export interface CheckboxCardPartProps extends HTMLAttributes<HTMLSpanElement> { asChild?: boolean; render?: RenderProp; "data-slot"?: string }
function part(name: "control" | "label" | "description" | "indicator") {
  return forwardRef<HTMLSpanElement, CheckboxCardPartProps>(function CheckboxCardPart({ asChild, render, children, ...props }, ref) {
    const ctx = useCheckboxCardContext();
    useEffect(() => name === "label" || name === "description" ? ctx.register(name) : undefined, [ctx.register]);
    const attributes = { ...props, ...stateAttributes(ctx), ref, id: name === "label" ? ctx.labelId : name === "description" ? ctx.descriptionId : props.id, "aria-hidden": name === "indicator" ? true : props["aria-hidden"], "data-slot": props["data-slot"] ?? `checkbox-card-${name}` };
    return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "span", { ...attributes, children });
  });
}
export const CheckboxCardControl = part("control");
export const CheckboxCardLabel = part("label");
export const CheckboxCardDescription = part("description");
export const CheckboxCardIndicator = part("indicator");
export function CheckboxCardContext({ children }: { children: (value: CheckboxController) => ReactNode }) { return children(useCheckboxCardContext()); }
