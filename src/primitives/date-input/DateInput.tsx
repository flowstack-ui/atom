"use client";
import * as engine from "@zag-js/date-input";
import { mergeProps, normalizeProps, useMachine, type PropTypes } from "@zag-js/react";
import { createContext, forwardRef, useContext, useEffect, useId, useRef, useMemo, type HTMLAttributes, type ReactNode, type InputHTMLAttributes, type ButtonHTMLAttributes, type LabelHTMLAttributes } from "react";
import { toZoned, type DateValue } from "@internationalized/date";
import { useDirection } from "../direction/index.js";
import { useFieldContext } from "../field/context.js";
import { useFieldsetContext } from "../fieldset/context.js";
import { useNativeDateDisabled } from "../calendar/useNativeDateDisabled.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { composeRefs, cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { scheduleFirstInvalidFocus } from "../form/validation.js";
import { selectionArray, selectionValue, validDateSelection, type DateSelectionProps, type DateSelectionValue } from "../calendar/value.js";

export interface DateInputOptions extends Pick<engine.Props, "locale" | "timeZone" | "min" | "max" | "disabled" | "readOnly" | "required" | "invalid" | "isDateUnavailable" | "createCalendar" | "hourCycle" | "hideTimeZone" | "granularity" | "shouldForceLeadingZeros" | "getRootNode" | "formatter" | "format" | "placeholderValue" | "defaultPlaceholderValue" | "onPlaceholderChange" | "translations" | "ids"> {
  referenceDate: DateValue;
  name?: string;
  form?: string;
  invalidMessage?: string;
  segmentLabels?: Partial<Record<engine.EditableSegmentType, string>>;
  onDateFocusChange?: (details: { focused: boolean }) => void;
}
type InputSelection = Exclude<DateSelectionProps, { selectionMode: "multiple" }>;
export type DateInputRootProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "dir"> & { dir?: "ltr" | "rtl" } & DateInputOptions & InputSelection;
interface ContextValue {
  api: engine.Api<PropTypes>;
  options: DateInputOptions;
  mode: "single" | "range";
  setValue: (value: DateSelectionValue) => void;
  initial: DateSelectionValue;
  controlled: boolean;
  explicitInvalid?: boolean;
}
const Context = createContext<ContextValue | null>(null);
Context.displayName = "DateInputContext";
function useRoot() {
  const context = useContext(Context);
  if (!context) throw new Error("DateInput parts require DateInput.Root");
  return context;
}
export type DateInputContextValue = Pick<engine.Api<PropTypes>, "value" | "getSegments" | "focus" | "clearValue" | "setValue" | "placeholderValue">;
export function useDateInputContext(): DateInputContextValue {
  const { value, getSegments, focus, clearValue, setValue, placeholderValue } = useRoot().api;
  return { value, getSegments, focus, clearValue, setValue, placeholderValue };
}
export function useDateInput(props: DateInputRootProps) {
  const { referenceDate, selectionMode = "single", value, defaultValue, onValueChange, children, id, dir,
    name, form, invalidMessage = "Enter a valid date", segmentLabels, onDateFocusChange, ...rest } = props;
  const generatedId = useId();
  const direction = useDirection();
  const field = useFieldContext();
  const fieldset = useFieldsetContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const nativeDisabled = useNativeDateDisabled(rootRef);
  const [options, native] = engine.splitProps(rest);
  const initial = useRef<DateSelectionValue>(defaultValue ?? selectionValue(selectionMode, []));
  const [selected, setSelected] = useControllableState<DateSelectionValue>({ value, defaultValue: initial.current,
    onChange: onValueChange as ((value: DateSelectionValue) => void) | undefined });
  const resolved = { ...options, referenceDate, name, form, invalidMessage, segmentLabels,
    locale: options.locale ?? "en-US", disabled: !!(nativeDisabled ?? fieldset?.disabled) || (options.disabled ?? field?.disabled),
    readOnly: options.readOnly ?? field?.readOnly, required: options.required ?? field?.required ?? fieldset?.required,
    invalid: options.invalid ?? field?.invalid ?? fieldset?.invalid };
  const service = useMachine(engine.machine, { ...options, min: undefined, max: undefined,
    onFocusChange: onDateFocusChange,
    disabled: resolved.disabled, readOnly: resolved.readOnly, required: resolved.required, invalid: resolved.invalid,
    id: id ?? generatedId, dir: dir ?? direction, selectionMode, defaultPlaceholderValue: options.defaultPlaceholderValue ?? referenceDate,
    value: selectionArray(selectionMode, selected),
    onValueChange: details => setSelected(selectionValue(selectionMode, details.value.map((date, index) => {
      const previous = selectionArray(selectionMode, selected)[index] ?? referenceDate;
      return "timeZone" in previous && !("timeZone" in date) ? toZoned(date, previous.timeZone) : date;
    }))),
  });
  const connected = engine.connect(service, normalizeProps);
  const api = { ...connected, value: selectionArray(selectionMode, selected) };
  const context: ContextValue = { api, options: resolved, mode: selectionMode, setValue: setSelected, initial: initial.current, controlled: value !== undefined, explicitInvalid: props.invalid };
  const rootProps: HTMLAttributes<HTMLDivElement> = mergeProps(api.getRootProps(), native);
  return { value: api.value, getSegments: api.getSegments, focus: api.focus, clearValue: api.clearValue, setValue: api.setValue, placeholderValue: api.placeholderValue,
    /** @internal */ _context: context, /** @internal */ _rootProps: rootProps, /** @internal */ _children: children, /** @internal */ _rootRef: rootRef };
}
export type UseDateInputReturn = ReturnType<typeof useDateInput>;
export const DateInputRootProvider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { value: UseDateInputReturn }>(function DateInputRootProvider({ value, children, ...props }, ref) {
  const composedRef = useMemo(() => composeRefs(value._rootRef, ref), [value._rootRef, ref]);
  return <Context.Provider value={value._context}>
    <div {...mergeProps(value._rootProps, props)} data-slot="date-input" ref={composedRef}>{children ?? value._children}</div>
  </Context.Provider>;
});
export const DateInputRoot = forwardRef<HTMLDivElement, DateInputRootProps>(function DateInputRoot(props, ref) {
  const value = useDateInput(props);
  return <DateInputRootProvider value={value} ref={ref} />;
});

export function DateInputContext({ children }: { children: (api: DateInputContextValue) => ReactNode }) { return children(useDateInputContext()); }
export const DateInputControl = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DateInputControl(props, ref) {
  return <div {...mergeProps(useRoot().api.getControlProps(), props)} data-slot="date-input-control" ref={ref} />;
});
export const DateInputLabel = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement> & { index?: number }>(function DateInputLabel({ index = 0, onClick, ...props }, ref) {
  const { api, options } = useRoot();
  return <label {...mergeProps(api.getLabelProps({ index }), props)} data-slot="date-input-label" ref={ref} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || options.disabled) return;
    event.preventDefault();
    const groupId = api.getSegmentGroupProps({ index }).id;
    if (groupId) event.currentTarget.ownerDocument.getElementById(groupId)?.querySelector<HTMLElement>('[role="spinbutton"]')?.focus();
  }} />;
});
export const DateInputSegmentGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { index?: number }>(function DateInputSegmentGroup({ index = 0, ...props }, ref) {
  const { api, options, mode } = useRoot();
  const field = useFieldContext();
  const segments = api.getSegments({ index }).filter(segment => segment.isEditable);
  const incomplete = segments.some(segment => segment.isPlaceholder) && segments.some(segment => !segment.isPlaceholder);
  const invalid = incomplete || !validDateSelection(api.value, { ...options, locale: options.locale ?? "en-US", selectionMode: mode });
  return <div {...mergeProps(api.getSegmentGroupProps({ index }), { "aria-describedby": field?.describedBy, ...props,
    "aria-labelledby": props["aria-labelledby"] ?? (props["aria-label"] ? undefined : field?.labelId ?? api.getSegmentGroupProps({ index })["aria-labelledby"]) })}
    aria-invalid={invalid || options.invalid || undefined} data-invalid={invalid || options.invalid ? "" : undefined} data-slot="date-input-segment-group" ref={ref} />;
});
export const DateInputSegment = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement> & engine.SegmentProps>(function DateInputSegment({ segment, index = 0, ...props }, ref) {
  const { api, options } = useRoot();
  const label = options.segmentLabels?.[segment.type as engine.EditableSegmentType];
  return <span {...mergeProps(api.getSegmentProps({ segment, index }), { ...(label ? { "aria-label": label } : {}), ...props })} data-slot="date-input-segment" ref={ref}>{props.children ?? segment.text}</span>;
});
export function DateInputSegments({ index = 0 }: { index?: number }) {
  return useDateInputContext().getSegments({ index }).map((segment, position) => <DateInputSegment key={`${segment.type}-${position}`} segment={segment} index={index} />);
}
export const DateInputClearTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; render?: RenderProp }>(function DateInputClearTrigger({ onClick, asChild, render, children, ...props }, ref) {
  const { api, options } = useRoot();
  const disabled = props.disabled || options.disabled || options.readOnly;
  const behavior = { ...props, type: "button" as const, "data-slot": "date-input-clear-trigger", disabled, ref, onClick: (event: React.MouseEvent<HTMLButtonElement>) => { onClick?.(event); if (!event.defaultPrevented && !disabled) api.clearValue(); } };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "button", { ...behavior, children });
});

export const DateInputHiddenInput = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue"> & { index?: number }>(function DateInputHiddenInput({ index = 0, name, ...props }, forwardedRef) {
  const { api, options, mode, initial, setValue, controlled, explicitInvalid } = useRoot();
  const ref = useRef<HTMLInputElement>(null);
  const ownerRef = useRef<HTMLElement>(null);
  const field = useFieldContext();
  const segments = api.getSegments({ index }).filter(segment => segment.isEditable);
  const empty = segments.every(segment => segment.isPlaceholder);
  const incomplete = segments.some(segment => segment.isPlaceholder);
  const rangeIncomplete = mode === "range" && [0, 1].some(endpoint =>
    api.getSegments({ index: endpoint }).some(segment => segment.isEditable && !segment.isPlaceholder))
    && [0, 1].some(endpoint => api.getSegments({ index: endpoint }).some(segment => segment.isEditable && segment.isPlaceholder));
  const invalid = explicitInvalid || rangeIncomplete || (!empty && incomplete) || !validDateSelection(api.value, { ...options, locale: options.locale ?? "en-US", selectionMode: mode });
  const text = !invalid && !incomplete ? api.value[index]?.toString() ?? "" : "";
  const validation = useFormValidation({ validityRef: ref, ownerRef, invalid: Boolean(invalid && !options.disabled && !options.readOnly),
    inheritedInvalid: field?.invalid, validationBehavior: "inline", form: props.form ?? options.form, reportValidity: field?.reportControlValidity });
  useEffect(() => {
    const groupId = api.getSegmentGroupProps({ index }).id;
    ownerRef.current = groupId ? ref.current?.ownerDocument.getElementById(groupId)?.querySelector<HTMLElement>('[role="spinbutton"]') ?? null : null;
  });
  useEffect(() => { ref.current?.setCustomValidity(invalid ? options.invalidMessage! : ""); }, [invalid, options.invalidMessage]);
  useFormReset(ref, props.form ?? options.form, controlled || index !== 0, () => {
    setValue(initial);
    api.setValue(selectionArray(mode, initial));
  });
  return <input id={api.getHiddenInputProps({ index }).id} {...props} type="text" ref={composeRefs(ref, forwardedRef)} value={text} onChange={() => {}}
    name={name ?? (options.name ? mode === "range" ? `${options.name}[${index === 0 ? "start" : "end"}]` : options.name : undefined)}
    form={props.form ?? options.form} required={options.required} disabled={options.disabled} readOnly={options.readOnly} tabIndex={-1} aria-hidden="true"
    data-slot="date-input-hidden-input" data-atom-validation-owner="" data-atom-validation-behavior="inline"
    style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, border: 0, overflow: "hidden", clipPath: "inset(50%)", ...props.style }}
    onInvalid={event => {
      props.onInvalid?.(event);
      if (event.defaultPrevented) return;
      validation.validationProps.onInvalid(event);
      event.preventDefault();
      const segment = ref.current?.closest('[data-slot="date-input"]')?.querySelector<HTMLElement>('[data-slot="date-input-segment"][role="spinbutton"]');
      if (segment) scheduleFirstInvalidFocus(event.currentTarget, segment);
    }} />;
});
