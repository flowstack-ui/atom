"use client";
import { forwardRef, type ReactNode } from "react";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { NumberInputContextProvider, type NumberInputContextValue } from "./context.js";
import { NumberInputInput } from "./NumberInputInput.js";
import { useNumberInput } from "./useNumberInput.js";
import type { NumberInputRootProps } from "./types.js";
export type { NumberInputRootProps, NumberInputRenderState } from "./types.js";
export interface NumberInputRootProviderProps extends NativeDivProps<"children"> {
  value: NumberInputContextValue;
  children?: ReactNode | ((state: NumberInputContextValue) => ReactNode);
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}
export const NumberInputRootProvider = forwardRef<HTMLDivElement, NumberInputRootProviderProps>(function NumberInputRootProvider({ value, children, asChild, render, "data-slot": slot = "number-input", ...props }, ref) {
  const automatic = children === undefined || typeof children === "function";
  const hiddenInput = value.name ? <input type="hidden" disabled={value.disabled} name={value.name} form={value.form} value={value.numericValue ?? ""} /> : null;
  const content = <>{automatic ? <NumberInputInput /> : null}{hiddenInput}{typeof children === "function" ? children(value) : children}</>;
  const host = { ...props, ref, id: value.ids.root, dir: value.dir, "data-slot": slot,
    "data-disabled": value.disabled ? "" : undefined, "data-readonly": value.readOnly ? "" : undefined,
    "data-invalid": value.invalid ? "" : undefined, "data-required": value.required ? "" : undefined };
  return <NumberInputContextProvider value={value}>{asChild ? <>{cloneAndMerge(children as ReactNode, host)}{hiddenInput}</> : renderElement(render, "div", { ...host, children: content })}</NumberInputContextProvider>;
});
export const NumberInputRoot = forwardRef<HTMLDivElement, NumberInputRootProps>(function NumberInputRoot(props, ref) {
  const controller = useNumberInput(props);
  // Strip behavior options rather than forwarding unknown DOM attributes.
  const { value, defaultValue, valueMode, onValueChange, min, max, step, largeStep, smallStep, precision,
    clampOnBlur, allowOverflow, allowMouseWheel, spinOnPress, focusInputOnChange, locale, dir, inputMode,
    pattern, ids, translations, onValueCommit, onFocusChange, onValueInvalid, disabled, readOnly, required,
    invalid, validationBehavior, placeholder, name, form, id, inputClassName, formatter, parser, formatOptions,
    "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, "aria-valuetext": ariaValueText, ...host } = props;
  return <NumberInputRootProvider {...host} value={controller} ref={ref} />;
});
