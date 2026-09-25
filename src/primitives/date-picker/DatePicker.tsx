"use client";
import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState, useMemo, type RefObject, type InputHTMLAttributes, type LabelHTMLAttributes, type HTMLAttributes, type ReactNode, type ButtonHTMLAttributes } from "react";
import { splitProps as splitCalendarProps } from "@zag-js/date-picker";
import { splitProps as splitInputProps } from "@zag-js/date-input";
import { useFormReset } from "../../hooks/useFormReset.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { useFieldContext } from "../field/context.js";
import { useFieldsetContext } from "../fieldset/context.js";
import { useNativeDateDisabled } from "../calendar/useNativeDateDisabled.js";
import { isoDateTextCodec, parseDatePickerDraft, type DatePickerTextCodec, type DatePickerSelectionTextCodec, type DatePickerCodecContext } from "./text-codec.js";
import { CalendarRootProvider, useCalendar, type UseCalendarReturn, type CalendarRootProps, type CalendarOptions } from "../calendar/Calendar.js";
import { DateInputRootProvider, useDateInput, DateInputRoot, DateInputControl, DateInputSegmentGroup, DateInputSegments, DateInputHiddenInput, type UseDateInputReturn, type DateInputOptions, type DateInputRootProps } from "../date-input/DateInput.js";
import { PopoverRoot, PopoverAnchor, PopoverTrigger, PopoverPortal, PopoverContent, type PopoverContentProps } from "../popover/index.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { composeRefs, cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { selectionArray, selectionValue, validDateSelection, type DateSelectionProps, type DateSelectionValue } from "../calendar/value.js";
import { scheduleFirstInvalidFocus } from "../form/validation.js";
const DateInput = { Root: DateInputRoot, Control: DateInputControl, SegmentGroup: DateInputSegmentGroup, Segments: DateInputSegments, HiddenInput: DateInputHiddenInput };
const Popover = { Root: PopoverRoot, Anchor: PopoverAnchor, Trigger: PopoverTrigger, Portal: PopoverPortal, Content: PopoverContent };

export type DatePickerRootProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "dir"> & CalendarOptions & Omit<DateInputOptions, "translations" | "ids" | "format"> & DateSelectionProps & {
  dir?: "ltr" | "rtl";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
  startLabel?: string;
  endLabel?: string;
  /** Segmented is the compatible default; TextInput requires text mode. */
  entryMode?: "segmented" | "text" | "none";
  formControl?: "auto" | "manual";
  textCodec?: DatePickerTextCodec;
  selectionTextCodec?: DatePickerSelectionTextCodec;
  openOnInputClick?: boolean;
  /** Forward collision and placement options to the single Popover owner. */
  positioning?: React.ComponentProps<typeof PopoverRoot>["positioning"];
};
interface PickerContext extends Pick<UseCalendarReturn, "focusedValue" | "view" | "visibleRange" | "visibleRangeText" | "setFocusedValue" | "setView"> {
  props: DatePickerRootProps;
  value: DateSelectionValue;
  setValue: (value: DateSelectionValue) => void;
  setOpen: (open: boolean) => void;
  open: boolean;
  clearValue: () => void;
  entryMode: "segmented" | "text" | "none";
  inputStore: UseDateInputReturn;
  drafts: Record<number, string>;
  setDraft: (index: number, text: string) => void;
  commitDraft: (index: number) => boolean;
  commitBoundary: (next: EventTarget | null) => void;
  restoreDraft: (index: number) => void;
  formatInput: (index: number) => string;
  formValues: import("@internationalized/date").DateValue[];
  valid: boolean;
  labelId: string;
  rootRef: RefObject<HTMLDivElement | null>;
  /** @internal */ _contentRef: RefObject<HTMLDivElement | null>;
  /** @internal */ _calendarStore: UseCalendarReturn;
  /** @internal */ _composingRef: RefObject<boolean>;
}
const Context = createContext<PickerContext | null>(null);
Context.displayName = "DatePickerContext";
export function useDatePickerContext() {
  const context = useContext(Context);
  if (!context) throw new Error("DatePicker parts require DatePicker.Root");
  return context;
}
export function useDatePicker(props: DatePickerRootProps): PickerContext & { /** @internal */ _native: HTMLAttributes<HTMLDivElement> } {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);
  const generatedId = useId();
  const field = useFieldContext();
  const fieldset = useFieldsetContext();
  const nativeDisabled = useNativeDateDisabled(rootRef);
  const resolved = { ...props, disabled: !!(nativeDisabled ?? fieldset?.disabled) || (props.disabled ?? field?.disabled), readOnly: props.readOnly ?? field?.readOnly,
    required: props.required ?? field?.required ?? fieldset?.required, invalid: props.invalid ?? field?.invalid ?? fieldset?.invalid };
  const mode = props.selectionMode ?? "single";
  const [value, setSelected] = useControllableState<DateSelectionValue>({ value: props.value,
    defaultValue: props.defaultValue ?? selectionValue(mode, []), onChange: props.onValueChange as ((value: DateSelectionValue) => void) | undefined });
  const [open, setOpen] = useControllableState({ value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange });
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const entryMode = props.entryMode ?? (mode === "multiple" ? "none" : "segmented");
  const selected = selectionArray(mode, value);
  const valueKey = selected.map(date => date.toString()).join(";");
  const [draftValueKey, setDraftValueKey] = useState(valueKey);
  // Discard drafts only for a real external value change, not identity-only renders.
  if (draftValueKey !== valueKey) { setDraftValueKey(valueKey); setDrafts({}); }
  const setValue = (next: DateSelectionValue) => { setDrafts({}); setSelected(next); };
  const [calendarOptions] = splitCalendarProps({ ...resolved, positioning: undefined, value: undefined, defaultValue: undefined, onValueChange: undefined, onOpenChange: undefined });
  // The controller outlives portaled content, retaining navigation and view.
  const calendarStore = useCalendar({ ...calendarOptions, referenceDate: props.referenceDate,
    selectionMode: mode, value, onValueChange(next: DateSelectionValue) {
      setValue(next);
      if (props.closeOnSelect !== false && mode !== "multiple" && selectionArray(mode, next).length === (mode === "range" ? 2 : 1)) setOpen(false);
    },
  } as CalendarRootProps);
  useEffect(() => {
    // A typed/external selection made while closed becomes the next opening's
    // focus target. Do not overwrite explicit focusedValue or live navigation.
    if (!open && props.focusedValue === undefined && selected[0]) calendarStore.setFocusedValue(selected[0]);
  }, [valueKey]);
  const codec = props.textCodec ?? isoDateTextCodec;
  const codecContext = (index: number): DatePickerCodecContext => ({ locale: props.locale ?? "en-US", timeZone: props.timeZone ?? "UTC", referenceDate: props.referenceDate, selectionMode: mode, index });
  const formatInput = (index: number) => mode === "multiple"
    ? props.selectionTextCodec?.format(selected, codecContext(index)) ?? selected.map(date => codec.format(date, codecContext(index))).join("; ")
    : selected[index] ? codec.format(selected[index]!, codecContext(index)) : "";
  const [segmentOptions] = splitInputProps({ ...resolved, value: undefined, defaultValue: undefined, onValueChange: undefined, selectionMode: "single", onFocusChange: undefined, translations: undefined });
  const inputStore = useDateInput({ ...segmentOptions, onDateFocusChange: props.onDateFocusChange, referenceDate: props.referenceDate, selectionMode: mode === "range" ? "range" : "single", value: mode === "multiple" ? null : value, onValueChange: setSelected, translations: undefined, name: undefined } as DateInputRootProps);
  let formValues = selected;
  // External validation paints/submits as invalid, but must not prevent an
  // intrinsically valid edit from reaching the form controller to clear it.
  let valid = true;
  if (entryMode === "text") {
    const indices = mode === "range" ? [0, 1] : [0];
    const values = indices.map(index => {
      const result = parseDatePickerDraft(drafts[index] ?? formatInput(index), codecContext(index), { ...resolved, codec, selectionCodec: props.selectionTextCodec, previous: mode === "multiple" ? selected : selected[index] ? [selected[index]!] : [] });
      valid &&= result.valid;
      return result.values;
    });
    if (mode === "range" && !values[0]?.length && values[1]?.length) valid = false;
    formValues = values.flat();
  } else if (entryMode === "segmented") {
    if (mode === "multiple") throw new Error("Multiple DatePicker does not support segmented entry");
    const groups = (mode === "range" ? [0, 1] : [0]).map(index => inputStore.getSegments({ index }).filter(segment => segment.isEditable));
    const touched = groups.some(group => group.some(segment => !segment.isPlaceholder));
    if (touched && groups.some(group => group.some(segment => segment.isPlaceholder))) valid = false;
  }
  valid &&= validDateSelection(formValues, { ...resolved, locale: props.locale ?? "en-US", selectionMode: mode });
  if (mode === "range" && formValues.length === 1) valid = false;
  const draftValid = valid;
  // Field's aggregate invalid state can originate from this very control.
  // Feeding it back into native validity would prevent a valid edit from ever
  // clearing the report. Explicit picker invalid remains authoritative.
  valid &&= !props.invalid;
  const commitDraft = (_index: number) => {
    if (!draftValid || resolved.disabled || resolved.readOnly || composingRef.current) return false;
    setValue(selectionValue(mode, formValues));
    return true;
  };
  useEffect(() => {
    const element = rootRef.current;
    const form = props.form ? element?.ownerDocument.getElementById(props.form) : element?.closest("form");
    if (!form || form.tagName !== "FORM" || entryMode !== "text") return;
    const submit = (event: Event) => { if (Object.keys(drafts).length && !commitDraft(0)) event.preventDefault(); };
    form.addEventListener("submit", submit);
    return () => form.removeEventListener("submit", submit);
  });
  const { referenceDate, invalidMessage, segmentLabels, closeOnSelect, onOpenChange, defaultOpen, startLabel, endLabel,
    value: suppliedValue, defaultValue, onValueChange, onFocusChange, onViewChange, onVisibleRangeChange,
    entryMode: suppliedEntryMode, formControl, textCodec, selectionTextCodec, openOnInputClick, onDateFocusChange, positioning, ...rest } = props;
  const [, calendarNative] = splitCalendarProps(rest);
  const [, native] = splitInputProps(calendarNative);
  useFormReset(rootRef, props.form, props.value !== undefined, () => {
    setValue(props.defaultValue ?? selectionValue(mode, []));
    if (mode !== "multiple") inputStore.setValue(selectionArray(mode, props.defaultValue));
  });
  return { props: resolved, value, setValue, setOpen, open, clearValue: () => setValue(selectionValue(mode, [])), entryMode, inputStore, drafts,
    setDraft: (index: number, text: string) => setDrafts(previous => ({ ...previous, [index]: text })), commitDraft,
    restoreDraft: (index: number) => setDrafts(previous => { const next = { ...previous }; delete next[index]; return next; }),
    commitBoundary: next => {
      if (entryMode !== "text" || !Object.keys(drafts).length || composingRef.current) return;
      const NodeClass = rootRef.current?.ownerDocument.defaultView?.Node;
      if (NodeClass && next instanceof NodeClass && (rootRef.current?.contains(next) || contentRef.current?.contains(next))) return;
      commitDraft(0);
    },
    formatInput, formValues, valid, labelId: `${props.id ?? generatedId}-label`, rootRef, _contentRef: contentRef, _calendarStore: calendarStore,
    focusedValue: calendarStore.focusedValue, view: calendarStore.view, visibleRange: calendarStore.visibleRange, visibleRangeText: calendarStore.visibleRangeText,
    setFocusedValue: calendarStore.setFocusedValue, setView: calendarStore.setView, _composingRef: composingRef, /** @internal */ _native: native };
}
export type UseDatePickerReturn = ReturnType<typeof useDatePicker>;
export const DatePickerRootProvider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { value: UseDatePickerReturn }>(function DatePickerRootProvider({ value, children, ...props }, ref) {
  const { props: options, rootRef } = value;
  const composedRef = useMemo(() => composeRefs(rootRef, ref), [rootRef, ref]);
  return <Context.Provider value={value}>
    <Popover.Root open={value.open && !options.disabled && !options.readOnly} onOpenChange={value.setOpen} disabled={options.disabled || options.readOnly} positioning={options.positioning}>
      <div {...value._native} {...props} ref={composedRef} id={props.id ?? options.id} dir={props.dir ?? options.dir} data-slot="date-picker" onBlur={event => {
        value._native.onBlur?.(event); props.onBlur?.(event);
        if (!event.defaultPrevented) value.commitBoundary(event.relatedTarget);
      }}>
        {children ?? options.children}
        {options.formControl !== "manual" && <DatePickerFormControl />}
      </div>
    </Popover.Root>
  </Context.Provider>;
});
export const DatePickerRoot = forwardRef<HTMLDivElement, DatePickerRootProps>(function DatePickerRoot(props, ref) {
  const value = useDatePicker(props);
  return <DatePickerRootProvider value={value} ref={ref} />;
});

export const DatePickerLabel = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(function DatePickerLabel({ onClick, ...props }, ref) {
  const { labelId, rootRef, props: options } = useDatePickerContext();
  return <label id={labelId} {...props} ref={ref} data-disabled={options.disabled ? "" : undefined} data-slot="date-picker-label" onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || options.disabled) return;
    event.preventDefault();
    rootRef.current?.querySelector<HTMLElement>('[data-slot="date-picker-text-input"], [role="spinbutton"], [aria-haspopup="dialog"]')?.focus();
  }} />;
});

export const DatePickerControl = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DatePickerControl(props, ref) {
  return <Popover.Anchor asChild><div {...props} data-slot="date-picker-control" ref={ref} /></Popover.Anchor>;
});
export const DatePickerInput = forwardRef<HTMLDivElement, Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "dir">>(function DatePickerInput(props, ref) {
  const context = useDatePickerContext();
  const field = useFieldContext();
  const { props: options, value, setValue } = context;
  const { referenceDate, locale, timeZone, min, max, disabled, readOnly, required, invalid, isDateUnavailable, createCalendar,
    hourCycle, hideTimeZone, granularity, shouldForceLeadingZeros, getRootNode, name, form, invalidMessage, segmentLabels, dir } = options;
  const mode = options.selectionMode ?? "single";
  if (mode === "multiple") throw new Error("Multiple DatePicker uses ValueText, not a segmented Input");
  const inputProps = { referenceDate, locale, timeZone, min, max, disabled, readOnly, required, invalid, isDateUnavailable, createCalendar,
    hourCycle, hideTimeZone, granularity, shouldForceLeadingZeros, getRootNode, name, form, invalidMessage, segmentLabels, dir,
    selectionMode: mode, value, onValueChange: setValue } as DateInputRootProps;
  if (context.entryMode !== "segmented") throw new Error("DatePicker.Input requires segmented entryMode");
  return <DateInputRootProvider value={context.inputStore} {...props} ref={ref}>
    <DateInput.Control>
      <DateInput.SegmentGroup aria-label={mode === "range" ? options.startLabel ?? "Start date" : props["aria-label"]} aria-labelledby={mode === "range" ? undefined : props["aria-labelledby"] ?? (props["aria-label"] ? undefined : field?.labelId ?? context.labelId)}><DateInput.Segments /></DateInput.SegmentGroup>
      {mode === "range" && <DateInput.SegmentGroup index={1} aria-label={options.endLabel ?? "End date"}><DateInput.Segments index={1} /></DateInput.SegmentGroup>}
    </DateInput.Control>
  </DateInputRootProvider>;
});
export const DatePickerTrigger = Popover.Trigger;
export const DatePickerPortal = Popover.Portal;
export const DatePickerContent = forwardRef<HTMLDivElement, PopoverContentProps>(function DatePickerContent({ initialFocus, ...props }, ref) {
  const { _contentRef: local } = useDatePickerContext();
  const composedRef = useMemo(() => composeRefs(local, ref), [local, ref]);
  return <Popover.Content {...props} ref={composedRef} initialFocus={initialFocus ?? (() => {
    const selectable = ':is([data-slot="calendar-day"], [data-slot="calendar-period"]):not(:disabled):not([data-disabled]):not([hidden]):not([data-outside-hidden]):not([data-outside-range])';
    return local.current?.querySelector<HTMLElement>(`${selectable}[tabindex="0"]`) ?? local.current?.querySelector<HTMLElement>(selectable) ?? local.current;
  })} />;
});
export const DatePickerCalendar = forwardRef<HTMLDivElement, Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "dir">>(function DatePickerCalendar(props, ref) {
  const context = useDatePickerContext();
  return <CalendarRootProvider value={context._calendarStore} {...props} ref={ref} />;
});
export const DatePickerClearTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; render?: RenderProp }>(function DatePickerClearTrigger({ onClick, asChild, render, children, ...props }, ref) {
  const { props: options, setValue } = useDatePickerContext();
  const disabled = props.disabled || options.disabled || options.readOnly;
  const behavior = { ...props, ref, type: "button" as const, disabled, onClick: (event: React.MouseEvent<HTMLButtonElement>) => { onClick?.(event); if (!event.defaultPrevented && !disabled) setValue(selectionValue(options.selectionMode ?? "single", [])); } };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "button", { ...behavior, children });
});
export function DatePickerContext({ children }: { children: (context: PickerContext) => ReactNode }) { return children(useDatePickerContext()); }
export const DatePickerValueText = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement> & { placeholder?: ReactNode }>(function DatePickerValueText({ placeholder, ...props }, ref) {
  const { value, props: options } = useDatePickerContext();
  const formatter = new Intl.DateTimeFormat(options.locale ?? "en-US", { dateStyle: "medium", timeZone: options.timeZone ?? "UTC" });
  const dates = selectionArray(options.selectionMode ?? "single", value);
  return <span {...props} ref={ref}>{props.children ?? (dates.length ? dates.map(date => formatter.format(date.toDate(options.timeZone ?? "UTC"))).join(", ") : placeholder)}</span>;
});

type DatePickerHiddenInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue">;
const DatePickerFormControl = forwardRef<HTMLInputElement, DatePickerHiddenInputProps>(function DatePickerFormControl(props, forwardedRef) {
  const { props: options, formValues: values, valid, rootRef } = useDatePickerContext();
  const ref = useRef<HTMLInputElement>(null);
  const ownerRef = useRef<HTMLElement>(null);
  const field = useFieldContext();
  const validation = useFormValidation({ validityRef: ref, ownerRef,
    invalid: !valid && !options.disabled && !options.readOnly, inheritedInvalid: field?.invalid,
    validationBehavior: "inline", form: props.form ?? options.form, reportValidity: field?.reportControlValidity });
  useEffect(() => { ownerRef.current = rootRef.current?.querySelector<HTMLElement>('[data-slot="date-picker-text-input"], [role="spinbutton"], [aria-haspopup="dialog"]') ?? null; });
  useEffect(() => { ref.current?.setCustomValidity(valid ? "" : options.invalidMessage ?? "Enter a valid date"); }, [valid, options.invalidMessage]);
  const name = props.name ?? options.name;
  return <>
    <input {...props} ref={composeRefs(ref, forwardedRef)} type="text" value={valid ? values[0]?.toString() ?? "" : ""} onChange={() => {}}
      name={options.selectionMode === "range" && name ? `${name}[start]` : name} form={props.form ?? options.form} disabled={options.disabled} readOnly={options.readOnly} required={options.required}
      tabIndex={-1} aria-hidden="true" data-slot="date-picker-hidden-input" data-atom-validation-owner="" data-atom-validation-behavior="inline"
      style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, border: 0, overflow: "hidden", clipPath: "inset(50%)", ...props.style }}
      onInvalid={event => {
        props.onInvalid?.(event);
        if (event.defaultPrevented) return;
        validation.validationProps.onInvalid(event);
        event.preventDefault();
        const trigger = ownerRef.current;
        if (trigger) scheduleFirstInvalidFocus(event.currentTarget, trigger);
      }} />
    {options.selectionMode === "range" ? <input type="hidden" name={name ? `${name}[end]` : undefined} form={props.form ?? options.form} disabled={options.disabled} value={valid ? values[1]?.toString() ?? "" : ""} />
      : valid && values.slice(1).map((date, index) => <input key={index} type="hidden" name={name} form={props.form ?? options.form} disabled={options.disabled} value={date.toString()} />)}
  </>;
});

/** Auto mode already owns submission. This compatibility mirror remains ref-able but unnamed. */
export const DatePickerHiddenInput = forwardRef<HTMLInputElement, DatePickerHiddenInputProps>(function DatePickerHiddenInput(props, ref) {
  const { props: options, formValues, valid } = useDatePickerContext();
  if (options.formControl === "manual") return <DatePickerFormControl {...props} ref={ref} />;
  return <input {...props} ref={ref} type="hidden" name={undefined} disabled value={valid ? formValues[0]?.toString() ?? "" : ""} data-slot="date-picker-compatibility-input" />;
});

export type DatePickerTextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "name" | "size"> & { index?: 0 | 1 };
export const DatePickerTextInput = forwardRef<HTMLInputElement, DatePickerTextInputProps>(function DatePickerTextInput({ index = 0, onChange, onBlur, onKeyDown, onClick, onCompositionStart, onCompositionEnd, ...props }, ref) {
  const context = useDatePickerContext();
  const { props: options } = context;
  const field = useFieldContext();
  const composing = context._composingRef;
  if (context.entryMode !== "text") throw new Error('DatePicker.TextInput requires entryMode="text"');
  if (index === 1 && options.selectionMode !== "range") throw new Error("TextInput index 1 requires range selection");
  return <input {...props} ref={ref} type="text" name={undefined} data-slot="date-picker-text-input" value={context.drafts[index] ?? context.formatInput(index)}
    form={props.form ?? options.form} disabled={options.disabled || props.disabled} readOnly={options.readOnly || props.readOnly}
    aria-label={props["aria-label"] ?? (options.selectionMode === "range" ? index === 0 ? options.startLabel ?? "Start date" : options.endLabel ?? "End date" : undefined)}
    aria-labelledby={props["aria-labelledby"] ?? (props["aria-label"] || options.selectionMode === "range" ? undefined : field?.labelId ?? context.labelId)}
    aria-describedby={props["aria-describedby"] ?? field?.describedBy} aria-invalid={!context.valid || undefined} aria-required={options.required || undefined}
    placeholder={props.placeholder ?? (options.selectionMode === "multiple" ? "YYYY-MM-DD; YYYY-MM-DD" : "YYYY-MM-DD")}
    onChange={event => { onChange?.(event); if (!event.defaultPrevented && !options.disabled && !options.readOnly) context.setDraft(index, event.currentTarget.value); }}
    onCompositionStart={event => { composing.current = true; onCompositionStart?.(event); }}
    onCompositionEnd={event => { composing.current = false; onCompositionEnd?.(event); }}
    onClick={event => { onClick?.(event); if (!event.defaultPrevented && options.openOnInputClick && !options.disabled && !options.readOnly) context.setOpen(true); }}
    onBlur={event => {
      onBlur?.(event);
    }}
    onKeyDown={event => {
      onKeyDown?.(event);
      if (event.defaultPrevented || composing.current || event.nativeEvent.isComposing) return;
      if (event.key === "Enter" && !context.commitDraft(index)) event.preventDefault();
      if (event.key === "Escape") { if (context.open) context.setOpen(false); else context.restoreDraft(index); event.preventDefault(); }
    }} />;
});

export const DatePickerIndicatorGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DatePickerIndicatorGroup(props, ref) {
  return <div {...props} ref={ref} data-slot="date-picker-indicator-group" />;
});
export const DatePickerPresetTrigger = forwardRef<HTMLButtonElement, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> & { value: DateSelectionValue; asChild?: boolean; render?: RenderProp }>(function DatePickerPresetTrigger({ value, onClick, children, asChild, render, ...props }, ref) {
  const context = useDatePickerContext();
  const mode = context.props.selectionMode ?? "single";
  const valid = validDateSelection(selectionArray(mode, value), { ...context.props, selectionMode: mode, locale: context.props.locale ?? "en-US" });
  const disabled = props.disabled || context.props.disabled || context.props.readOnly || !valid;
  const behavior = { ...props, type: "button" as const, ref, disabled, "data-slot": "date-picker-preset-trigger", onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    context.setValue(value);
    if (context.props.closeOnSelect !== false && mode !== "multiple" && selectionArray(mode, value).length === (mode === "range" ? 2 : 1)) context.setOpen(false);
  } };
  return asChild ? cloneAndMerge(children, behavior) : renderElement(render, "button", { ...behavior, children });
});
