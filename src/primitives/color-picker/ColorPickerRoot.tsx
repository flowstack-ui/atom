"use client";

import { forwardRef, useCallback, useId, useMemo, useRef, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useFieldContext } from "../field/context.js";
import { PopoverRoot } from "../popover/index.js";
import type { PopoverCloseReason } from "../popover/context.js";
import { ColorPickerContextProvider, type ColorPickerContextValue } from "./context.js";
import { COLOR_PICKER_DEFAULT_VALUE, normalizeColorPickerValue } from "./utils.js";

type RootNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange">;

export interface ColorPickerRootProps extends RootNativeProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason?: PopoverCloseReason) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  inputId?: string;
  "data-slot"?: string;
}

export const ColorPickerRoot = forwardRef<HTMLDivElement, ColorPickerRootProps>(
  function ColorPickerRoot(
    {
      children,
      value,
      defaultValue = COLOR_PICKER_DEFAULT_VALUE,
      onValueChange,
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      readOnly,
      invalid,
      required,
      name,
      form,
      inputId: inputIdProp,
      "data-slot": dataSlot = "color-picker",
      ...restProps
    },
    ref,
  ) {
    const field = useFieldContext();
    const generatedInputId = useId();
    const inputId = inputIdProp ?? field?.controlId ?? generatedInputId;
    const isDisabled = disabled ?? field?.disabled ?? false;
    const isReadOnly = readOnly ?? field?.readOnly ?? false;
    const isInvalid = invalid ?? field?.invalid ?? false;
    const isRequired = required ?? field?.required ?? false;
    const normalizedDefault = normalizeColorPickerValue(defaultValue) ?? COLOR_PICKER_DEFAULT_VALUE;
    const normalizedControlled = value === undefined ? undefined : normalizeColorPickerValue(value) ?? COLOR_PICKER_DEFAULT_VALUE;
    const [resolvedValue, setResolvedValue] = useControllableState({
      value: normalizedControlled,
      defaultValue: normalizedDefault,
      onChange: onValueChange,
    });
    const rootRef = useRef<HTMLDivElement | null>(null);
    const composedRef = useMemo(() => composeRefs(rootRef, ref), [ref]);
    const reset = useCallback(() => setResolvedValue(normalizedDefault), [normalizedDefault, setResolvedValue]);
    useFormReset(rootRef, form, value !== undefined, reset);
    const setValue = useCallback((nextValue: string) => {
      const normalized = normalizeColorPickerValue(nextValue);
      if (!normalized || isDisabled || isReadOnly) return;
      setResolvedValue(normalized);
    }, [isDisabled, isReadOnly, setResolvedValue]);
    const contextValue = useMemo<ColorPickerContextValue>(() => ({
      value: resolvedValue,
      setValue,
      disabled: isDisabled,
      readOnly: isReadOnly,
      invalid: isInvalid,
      required: isRequired,
      inputId,
      name,
      form,
    }), [form, inputId, isDisabled, isInvalid, isReadOnly, isRequired, name, resolvedValue, setValue]);

    return (
      <PopoverRoot
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        disabled={isDisabled}
      >
        <ColorPickerContextProvider value={contextValue}>
          <div
            {...restProps}
            ref={composedRef}
            data-slot={dataSlot}
            data-disabled={isDisabled ? "" : undefined}
            data-readonly={isReadOnly ? "" : undefined}
            data-invalid={isInvalid ? "" : undefined}
            data-required={isRequired ? "" : undefined}
          >
            {children}
          </div>
        </ColorPickerContextProvider>
      </PopoverRoot>
    );
  },
);
