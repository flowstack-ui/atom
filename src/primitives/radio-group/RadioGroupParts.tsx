"use client";

import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type HTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode } from "react";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useRadioGroupContext } from "./context.js";

export interface RadioGroupPartProps extends HTMLAttributes<HTMLSpanElement> { asChild?: boolean; render?: RenderProp; "data-slot"?: string }
export interface RadioGroupItemRootProps extends HTMLAttributes<HTMLDivElement> { value: string; disabled?: boolean; asChild?: boolean; render?: RenderProp; "data-slot"?: string }
interface ItemState {
  value: string; checked: boolean; disabled: boolean; readOnly: boolean; invalid: boolean;
  inputId: string; textId: string; descriptionId: string;
  hasText: boolean; hasDescription: boolean;
  register: (part: "text" | "description") => () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  focused: boolean; focusVisible: boolean; setFocus: (focused: boolean, visible: boolean) => void;
}
const ItemContext = createContext<ItemState | null>(null);
ItemContext.displayName = "RadioGroupItemContext";
export function useRadioGroupItemContext() {
  const context = useContext(ItemContext);
  if (!context) throw new Error("RadioGroup item parts require ItemRoot.");
  return context;
}
function state(item: ItemState) {
  return { "data-state": item.checked ? "checked" : "unchecked", "data-disabled": item.disabled ? "" : undefined, "data-readonly": item.readOnly ? "" : undefined, "data-invalid": item.invalid ? "" : undefined, "data-focus": item.focused ? "" : undefined, "data-focus-visible": item.focusVisible ? "" : undefined };
}
export const RadioGroupItemRoot = forwardRef<HTMLDivElement, RadioGroupItemRootProps>(function RadioGroupItemRoot({ value, disabled = false, asChild, render, children, ...props }, ref) {
  const group = useRadioGroupContext();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [parts, setParts] = useState({ text: 0, description: 0 });
  const register = useCallback((part: "text" | "description") => {
    setParts(current => ({ ...current, [part]: current[part] + 1 }));
    return () => setParts(current => ({ ...current, [part]: current[part] - 1 }));
  }, []);
  const [focus, setFocusState] = useState({ focused: false, focusVisible: false });
  const setFocus = useCallback((focused: boolean, focusVisible: boolean) => setFocusState({ focused, focusVisible }), []);
  const item: ItemState = { value, disabled: disabled || group.disabled, checked: value === group.activeValue, readOnly: group.readOnly, invalid: group.invalid, inputId: `${id}-input`, textId: `${id}-text`, descriptionId: `${id}-description`, hasText: parts.text > 0, hasDescription: parts.description > 0, register, inputRef, ...focus, setFocus };
  const attributes = { ...props, ...state(item), ref, "data-value": value, "data-slot": props["data-slot"] ?? "radio-group-item-root" };
  return <ItemContext.Provider value={item}>{asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children })}</ItemContext.Provider>;
});
export type RadioGroupItemHiddenInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "name" | "value" | "disabled" | "required" | "form" | "children" | "id">;
export const RadioGroupItemHiddenInput = forwardRef<HTMLInputElement, RadioGroupItemHiddenInputProps>(function RadioGroupItemHiddenInput({ style, onChange, onClick, onFocus, onBlur, onKeyDown, ...props }, ref) {
  const item = useRadioGroupItemContext();
  const group = useRadioGroupContext();
  const mergedRef = useMemo(() => composeRefs(item.inputRef, ref), [item.inputRef, ref]);
  useEffect(() => {
    const input = item.inputRef.current;
    if (!input) return;
    group.registerRadio(item.value, input);
    return () => group.unregisterRadio(item.value);
  }, [group.registerRadio, group.unregisterRadio, item.value, item.disabled, item.inputRef]);
  return <input {...props} {...state(item)} id={item.inputId} ref={mergedRef} type="radio" name={group.name} value={item.value} form={group.form} checked={item.checked} disabled={item.disabled}
    aria-invalid={item.invalid || undefined} aria-readonly={item.readOnly || undefined}
    aria-labelledby={props["aria-labelledby"] ?? (!props["aria-label"] && item.hasText ? item.textId : undefined)}
    aria-describedby={[props["aria-describedby"], item.hasDescription ? item.descriptionId : undefined].filter(Boolean).join(" ") || undefined}
    tabIndex={!item.disabled && group.entryValue === item.value ? 0 : -1} data-value={item.value} data-slot="radio-group-item-input"
    style={{ ...style, position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", border: 0 }}
    onClick={composeEventHandlers(onClick, event => { if (item.readOnly) event.preventDefault(); })}
    onChange={event => { onChange?.(event); if (!event.defaultPrevented && !item.readOnly && !item.disabled) group.setActiveValue(item.value); else event.currentTarget.checked = item.checked; }}
    onFocus={composeEventHandlers(onFocus, event => item.setFocus(true, event.currentTarget.matches(":focus-visible")))}
    onBlur={composeEventHandlers(onBlur, () => item.setFocus(false, false))}
    onKeyDown={composeEventHandlers(onKeyDown, event => {
      const crossAxis = group.orientation === "horizontal" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
      if (crossAxis.includes(event.key) || (item.readOnly && event.key === " ")) event.preventDefault();
    })} />;
});
export interface RadioGroupItemTextProps extends LabelHTMLAttributes<HTMLLabelElement> { asChild?: boolean; render?: RenderProp; "data-slot"?: string }
export const RadioGroupItemText = forwardRef<HTMLLabelElement, RadioGroupItemTextProps>(function RadioGroupItemText({ asChild, render, children, ...props }, ref) {
  const item = useRadioGroupItemContext();
  useEffect(() => item.register("text"), [item.register]);
  const attributes = { ...props, ...state(item), id: item.textId, htmlFor: item.inputId, ref, "data-slot": props["data-slot"] ?? "radio-group-item-text" };
  return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "label", { ...attributes, children });
});
function part(name: "control" | "indicator" | "description") {
  return forwardRef<HTMLSpanElement, RadioGroupPartProps>(function RadioGroupPart({ asChild, render, children, ...props }, ref) {
    const item = useRadioGroupItemContext();
    useEffect(() => name === "description" ? item.register("description") : undefined, [item.register]);
    const attributes = { ...props, ...state(item), id: name === "description" ? item.descriptionId : props.id, ref, "aria-hidden": name !== "description" ? true : props["aria-hidden"], "data-slot": props["data-slot"] ?? `radio-group-item-${name}`, onClick: composeEventHandlers(props.onClick, () => {
      if (name === "control" && !item.disabled) { item.inputRef.current?.focus(); if (!item.readOnly) item.inputRef.current?.click(); }
    }) };
    return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "span", { ...attributes, children });
  });
}
export const RadioGroupItemControl = part("control");
export const RadioGroupItemIndicator = part("indicator");
export const RadioGroupItemDescription = part("description");
export const RadioGroupLabel = forwardRef<HTMLSpanElement, RadioGroupPartProps>(function RadioGroupLabel({ asChild, render, children, ...props }, ref) {
  const group = useRadioGroupContext();
  const generated = useId();
  const id = props.id ?? generated;
  useEffect(() => { group.setLabelId?.(id); return () => group.setLabelId?.(undefined); }, [group.setLabelId, id]);
  const attributes = { ...props, id, ref, "data-slot": props["data-slot"] ?? "radio-group-label" };
  return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "span", { ...attributes, children });
});
export function RadioGroupContext({ children }: { children: (value: ReturnType<typeof useRadioGroupContext>) => ReactNode }) { return children(useRadioGroupContext()); }
export function RadioGroupItemContext({ children }: { children: (value: ItemState) => ReactNode }) { return children(useRadioGroupItemContext()); }
