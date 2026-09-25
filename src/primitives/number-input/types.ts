import type { ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import type { RenderProp } from "../../utils/slot.js";
import type { ValidationBehavior } from "../form/validation.js";
import type { NumberInputContextValue } from "./context.js";
export interface NumberInputValueChangeDetails { value: string; valueAsNumber: number }
export interface NumberInputFocusChangeDetails extends NumberInputValueChangeDetails { focused: boolean }
export interface NumberInputValueInvalidDetails extends NumberInputValueChangeDetails { reason: "rangeUnderflow" | "rangeOverflow" }
export interface NumberInputIds { root?: string; input?: string; label?: string; incrementTrigger?: string; decrementTrigger?: string; scrubber?: string }
export interface NumberInputTranslations { incrementLabel?: string; decrementLabel?: string; valueText?: (value: string) => string }
type Formatting = { formatOptions?: Intl.NumberFormatOptions; formatter?: never; parser?: never }
  | { formatOptions?: never; formatter?: (value: string) => string; parser?: (value: string) => string };
type ValueMode = { valueMode?: "number"; value?: number | null; defaultValue?: number; onValueChange?: (value: number | null) => void }
  | { valueMode: "string"; value?: string; defaultValue?: string; onValueChange?: (details: NumberInputValueChangeDetails) => void };
export interface NumberInputOptionsBase {
  min?: number; max?: number; step?: number; largeStep?: number; smallStep?: number;
  precision?: number; clampOnBlur?: boolean; allowOverflow?: boolean;
  allowMouseWheel?: boolean; spinOnPress?: boolean; focusInputOnChange?: boolean;
  locale?: string; dir?: "ltr" | "rtl"; inputMode?: "text" | "tel" | "numeric" | "decimal";
  pattern?: string; ids?: NumberInputIds; translations?: NumberInputTranslations;
  onValueCommit?: (details: NumberInputValueChangeDetails) => void;
  onFocusChange?: (details: NumberInputFocusChangeDetails) => void;
  onValueInvalid?: (details: NumberInputValueInvalidDetails) => void;
  disabled?: boolean; readOnly?: boolean; required?: boolean; invalid?: boolean;
  validationBehavior?: ValidationBehavior; placeholder?: string; name?: string; form?: string;
  id?: string; inputClassName?: string;
  "aria-label"?: string; "aria-describedby"?: string;
  "aria-valuetext"?: string | ((value: number) => string);
}
export type UseNumberInputOptions = NumberInputOptionsBase & Formatting & ValueMode;
export type NumberInputRenderState = NumberInputContextValue;
export type NumberInputRootProps = Omit<NativeDivProps, "children" | "defaultValue" | "onChange" | "aria-valuetext" | "inputMode" | "dir"> & UseNumberInputOptions & {
  children?: ReactNode | ((state: NumberInputRenderState) => ReactNode);
  asChild?: boolean; render?: RenderProp; "data-slot"?: string;
};
