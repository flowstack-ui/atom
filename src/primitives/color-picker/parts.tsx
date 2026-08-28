"use client";

import {
  forwardRef,
  useEffect,
  useState,
  type ChangeEventHandler,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps, NativeDivProps, NativeInputProps, NativeLabelProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import { PopoverContent, PopoverTrigger } from "../popover/index.js";
import type { PopoverContentProps, PopoverTriggerProps } from "../popover/index.js";
import { useColorPickerContext } from "./context.js";
import { normalizeColorPickerValue } from "./utils.js";

export type ColorPickerControlProps = NativeDivProps<never> & { "data-slot"?: string };
export const ColorPickerControl = forwardRef<HTMLDivElement, ColorPickerControlProps>(
  function ColorPickerControl({ "data-slot": dataSlot = "color-picker-control", ...props }, ref) {
    return <div {...props} ref={ref} data-slot={dataSlot} />;
  },
);

export type ColorPickerLabelProps = NativeLabelProps<never> & { "data-slot"?: string };
export const ColorPickerLabel = forwardRef<HTMLLabelElement, ColorPickerLabelProps>(
  function ColorPickerLabel({ htmlFor, "data-slot": dataSlot = "color-picker-label", ...props }, ref) {
    const context = useColorPickerContext();
    return <label {...props} ref={ref} htmlFor={htmlFor ?? context.inputId} data-slot={dataSlot} />;
  },
);

type TextInputNativeProps = NativeInputProps<"defaultValue" | "disabled" | "onChange" | "readOnly" | "required" | "type" | "value">;
export interface ColorPickerInputProps extends TextInputNativeProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  "data-slot"?: string;
}
export const ColorPickerInput = forwardRef<HTMLInputElement, ColorPickerInputProps>(
  function ColorPickerInput({ id, onChange, onBlur, onKeyDown, "data-slot": dataSlot = "color-picker-input", ...props }, ref) {
    const context = useColorPickerContext();
    const [draft, setDraft] = useState(context.value);
    useEffect(() => setDraft(context.value), [context.value]);
    const commit = () => {
      const normalized = normalizeColorPickerValue(draft);
      if (normalized) context.setValue(normalized);
      else setDraft(context.value);
    };
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      setDraft(event.currentTarget.value);
      const normalized = normalizeColorPickerValue(event.currentTarget.value);
      if (normalized) context.setValue(normalized);
    };
    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (event.key === "Enter") commit();
      if (event.key === "Escape") setDraft(context.value);
    };
    return <input {...props} ref={ref} id={id ?? context.inputId} type="text" value={draft}
      disabled={context.disabled || undefined} readOnly={context.readOnly || undefined}
      required={context.required || undefined} aria-invalid={context.invalid || undefined}
      data-slot={dataSlot} data-invalid={context.invalid ? "" : undefined}
      onChange={composeEventHandlers(onChange, handleChange)}
      onBlur={composeEventHandlers(onBlur, commit)}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)} />;
  },
);

type NativePickerProps = NativeInputProps<"defaultValue" | "disabled" | "onChange" | "readOnly" | "required" | "type" | "value">;
export interface ColorPickerNativeInputProps extends NativePickerProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  "data-slot"?: string;
}
export const ColorPickerNativeInput = forwardRef<HTMLInputElement, ColorPickerNativeInputProps>(
  function ColorPickerNativeInput({ onChange, "data-slot": dataSlot = "color-picker-native-input", ...props }, ref) {
    const context = useColorPickerContext();
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => context.setValue(event.currentTarget.value);
    return <input {...props} ref={ref} type="color" value={context.value}
      disabled={context.disabled || context.readOnly || undefined}
      aria-label={props["aria-label"] ?? "Open native color chooser"}
      data-slot={dataSlot} onChange={composeEventHandlers(onChange, handleChange)} />;
  },
);

export type ColorPickerHiddenInputProps = NativeInputProps<"defaultValue" | "disabled" | "readOnly" | "required" | "type" | "value"> & { "data-slot"?: string };
export const ColorPickerHiddenInput = forwardRef<HTMLInputElement, ColorPickerHiddenInputProps>(
  function ColorPickerHiddenInput({ name, form, "data-slot": dataSlot = "color-picker-hidden-input", ...props }, ref) {
    const context = useColorPickerContext();
    return <input {...props} ref={ref} type="hidden" value={context.value}
      name={name ?? context.name} form={form ?? context.form}
      disabled={context.disabled || undefined} data-slot={dataSlot} />;
  },
);

export interface ColorPickerTriggerProps extends PopoverTriggerProps {}
export const ColorPickerTrigger = forwardRef<HTMLElement, ColorPickerTriggerProps>(
  function ColorPickerTrigger({ "data-slot": dataSlot = "color-picker-trigger", ...props }, ref) {
    const context = useColorPickerContext();
    return <PopoverTrigger {...props} ref={ref} aria-disabled={context.disabled || undefined} data-slot={dataSlot} />;
  },
);

export interface ColorPickerContentProps extends PopoverContentProps {}
export const ColorPickerContent = forwardRef<HTMLDivElement, ColorPickerContentProps>(
  function ColorPickerContent({ "data-slot": dataSlot = "color-picker-content", ...props }, ref) {
    return <PopoverContent {...props} ref={ref} data-slot={dataSlot} />;
  },
);

type SwatchTriggerNativeProps = NativeButtonProps<"value">;
export interface ColorPickerSwatchTriggerProps extends SwatchTriggerNativeProps {
  value: string;
  children?: ReactNode;
  "data-slot"?: string;
}
export const ColorPickerSwatchTrigger = forwardRef<HTMLButtonElement, ColorPickerSwatchTriggerProps>(
  function ColorPickerSwatchTrigger({ value, onClick, type = "button", "aria-label": ariaLabel, "data-slot": dataSlot = "color-picker-swatch-trigger", ...props }, ref) {
    const context = useColorPickerContext();
    const normalized = normalizeColorPickerValue(value);
    const selected = normalized === context.value;
    return <button {...props} ref={ref} type={type} value={normalized ?? value}
      aria-label={ariaLabel ?? `Select ${normalized ?? value}`}
      aria-pressed={selected} aria-disabled={context.readOnly || !normalized || undefined}
      disabled={context.disabled || undefined}
      data-slot={dataSlot} data-selected={selected ? "" : undefined}
      onClick={composeEventHandlers(onClick, () => normalized && context.setValue(normalized))} />;
  },
);
