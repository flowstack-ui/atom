"use client";

import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type HTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode } from "react";
import { RadioGroupRoot, type RadioGroupRootProps } from "../radio-group/RadioGroupRoot.js";
import { useRadioGroupContext } from "../radio-group/context.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";

export type RadioCardRootProps = RadioGroupRootProps;
const LabelContext = createContext<{ id: string; register: () => () => void } | null>(null);
LabelContext.displayName = "RadioCardLabelContext";
export const RadioCardRoot = forwardRef<HTMLDivElement, RadioCardRootProps>(function RadioCardRoot(props, ref) {
  const id = useId();
  const [labels, setLabels] = useState(0);
  const register = useCallback(() => { setLabels(n => n + 1); return () => setLabels(n => n - 1); }, []);
  const label = useMemo(() => ({ id: `${props.id ?? id}-label`, register }), [props.id, id, register]);
  return <LabelContext.Provider value={label}><RadioGroupRoot {...props} ref={ref} data-slot={props["data-slot"] ?? "radio-card"} aria-labelledby={props["aria-labelledby"] ?? (!props["aria-label"] && labels > 0 ? label.id : undefined)} /></LabelContext.Provider>;
});
export interface UseRadioCardProps { value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
export function useRadioCard({ value, defaultValue = "", onValueChange }: UseRadioCardProps = {}) {
  const [selected, setValue] = useControllableState({ value, defaultValue, onChange: onValueChange });
  return useMemo(() => ({ value: selected, setValue }), [selected, setValue]);
}
export type RadioCardController = ReturnType<typeof useRadioCard>;
export type RadioCardRootProviderProps = Omit<RadioCardRootProps, "value" | "defaultValue" | "onValueChange"> & { value: RadioCardController };
export const RadioCardRootProvider = forwardRef<HTMLDivElement, RadioCardRootProviderProps>(function RadioCardRootProvider({ value, ...props }, ref) {
  return <RadioCardRoot {...props} ref={ref} value={value.value} onValueChange={value.setValue} />;
});
export interface RadioCardPartProps extends HTMLAttributes<HTMLSpanElement> { asChild?: boolean; render?: RenderProp; "data-slot"?: string }
export const RadioCardLabel = forwardRef<HTMLSpanElement, RadioCardPartProps>(function RadioCardLabel({ asChild, render, children, ...props }, ref) {
  const ctx = useContext(LabelContext);
  if (!ctx) throw new Error("RadioCard.Label requires Root.");
  useEffect(() => ctx.register(), [ctx.register]);
  const attributes = { ...props, id: ctx.id, ref, "data-slot": props["data-slot"] ?? "radio-card-label" };
  return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "span", { ...attributes, children });
});
interface ItemState {
  value: string; checked: boolean; disabled: boolean; readOnly: boolean; invalid: boolean;
  inputId: string; titleId: string; descriptionId: string;
  hasTitle: boolean; hasDescription: boolean;
  registerPart: (part: "title" | "description") => () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  focused: boolean; focusVisible: boolean; setFocus: (focused: boolean, visible: boolean) => void;
}
const ItemContext = createContext<ItemState | null>(null);
ItemContext.displayName = "RadioCardItemContext";
export function useRadioCardItemContext() { const ctx = useContext(ItemContext); if (!ctx) throw new Error("RadioCard part requires Item."); return ctx; }
export const useRadioCardContext = useRadioGroupContext;
function state(ctx: ItemState) { return { "data-state": ctx.checked ? "checked" : "unchecked", "data-disabled": ctx.disabled ? "" : undefined, "data-readonly": ctx.readOnly ? "" : undefined, "data-invalid": ctx.invalid ? "" : undefined, "data-focus": ctx.focused ? "" : undefined, "data-focus-visible": ctx.focusVisible ? "" : undefined }; }
export interface RadioCardItemProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "onChange"> {
  value: string; disabled?: boolean; asChild?: boolean; render?: RenderProp;
  ids?: Partial<Record<"input" | "title" | "description", string>>; "data-slot"?: string;
}
export const RadioCardItem = forwardRef<HTMLLabelElement, RadioCardItemProps>(function RadioCardItem({ value, disabled = false, ids, asChild, render, children, ...props }, ref) {
  const group = useRadioGroupContext();
  const generated = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [parts, setParts] = useState({ title: 0, description: 0 });
  const [focus, setFocusState] = useState({ focused: false, focusVisible: false });
  const setFocus = useCallback((focused: boolean, focusVisible: boolean) => setFocusState({ focused, focusVisible }), []);
  const registerPart = useCallback((part: "title" | "description") => { setParts(p => ({ ...p, [part]: p[part] + 1 })); return () => setParts(p => ({ ...p, [part]: p[part] - 1 })); }, []);
  const ctx: ItemState = { value, checked: group.activeValue === value, disabled: disabled || group.disabled, readOnly: group.readOnly, invalid: group.invalid, inputId: ids?.input ?? `${generated}-input`, titleId: ids?.title ?? `${generated}-title`, descriptionId: ids?.description ?? `${generated}-description`, hasTitle: parts.title > 0, hasDescription: parts.description > 0, registerPart, inputRef, ...focus, setFocus };
  const attributes = { ...props, ...state(ctx), ref, htmlFor: ctx.inputId, "data-value": value, "data-slot": props["data-slot"] ?? "radio-card-item", onClick: composeEventHandlers(props.onClick, (event: React.MouseEvent<HTMLLabelElement>) => { if (ctx.readOnly && event.target !== inputRef.current) event.preventDefault(); }) };
  return <ItemContext.Provider value={ctx}>{asChild ? cloneAndMerge(children, attributes) : renderElement(render, "label", { ...attributes, children })}</ItemContext.Provider>;
});
export type RadioCardHiddenInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "name" | "value" | "disabled" | "required" | "form" | "children" | "id">;
export const RadioCardHiddenInput = forwardRef<HTMLInputElement, RadioCardHiddenInputProps>(function RadioCardHiddenInput({ style, onChange, onFocus, onBlur, onKeyDown, ...props }, ref) {
  const ctx = useRadioCardItemContext();
  const group = useRadioGroupContext();
  const mergedRef = useMemo(() => composeRefs(ctx.inputRef, ref), [ctx.inputRef, ref]);
  useEffect(() => { if (!ctx.inputRef.current) return; group.registerRadio(ctx.value, ctx.inputRef.current); return () => group.unregisterRadio(ctx.value); }, [group.registerRadio, group.unregisterRadio, ctx.value, ctx.disabled, ctx.inputRef]);
  const enabled = group.getRadioValues().filter(v => !(group.getRadioElement(v) as HTMLInputElement | null)?.disabled);
  const entry = enabled.includes(group.activeValue) ? group.activeValue : enabled[0];
  return <input {...props} {...state(ctx)} ref={mergedRef} id={ctx.inputId} type="radio" name={group.name} value={ctx.value} form={group.form} checked={ctx.checked} disabled={ctx.disabled}
    aria-invalid={ctx.invalid || undefined}
    aria-labelledby={props["aria-labelledby"] ?? (!props["aria-label"] && ctx.hasTitle ? ctx.titleId : undefined)}
    aria-describedby={props["aria-describedby"] ?? (ctx.hasDescription ? ctx.descriptionId : undefined)}
    tabIndex={ctx.disabled ? -1 : ctx.value === entry ? 0 : -1} data-value={ctx.value} data-slot="radio-card-input"
    style={{ ...style, position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", border: 0 }}
    onChange={composeEventHandlers(onChange, e => { if (!ctx.disabled && !ctx.readOnly) group.setActiveValue(ctx.value); else e.currentTarget.checked = ctx.checked; })}
    onFocus={composeEventHandlers(onFocus, e => ctx.setFocus(true, e.currentTarget.matches(":focus-visible")))}
    onBlur={composeEventHandlers(onBlur, () => ctx.setFocus(false, false))}
    onKeyDown={composeEventHandlers(onKeyDown, e => {
      // Let the shared group own matching arrows; suppress native cross-axis changes.
      const crossAxis = group.orientation === "horizontal" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
      if (crossAxis.includes(e.key) || (ctx.readOnly && e.key === " ")) e.preventDefault();
    })} />;
});
function part(name: "control" | "title" | "description" | "indicator") {
  return forwardRef<HTMLSpanElement, RadioCardPartProps>(function RadioCardPart({ asChild, render, children, ...props }, ref) {
    const ctx = useRadioCardItemContext();
    useEffect(() => name === "title" || name === "description" ? ctx.registerPart(name) : undefined, [ctx.registerPart]);
    const attributes = { ...props, ...state(ctx), ref, id: name === "title" ? ctx.titleId : name === "description" ? ctx.descriptionId : props.id, "aria-hidden": name === "indicator" ? true : props["aria-hidden"], "data-slot": props["data-slot"] ?? `radio-card-${name}` };
    return asChild ? cloneAndMerge(children, attributes) : renderElement(render, "span", { ...attributes, children });
  });
}
export const RadioCardControl = part("control");
export const RadioCardTitle = part("title");
export const RadioCardDescription = part("description");
export const RadioCardIndicator = part("indicator");
export function RadioCardContext({ children }: { children: (value: ReturnType<typeof useRadioGroupContext>) => ReactNode }) { return children(useRadioGroupContext()); }
export function RadioCardItemContext({ children }: { children: (value: ReturnType<typeof useRadioCardItemContext>) => ReactNode }) { return children(useRadioCardItemContext()); }
