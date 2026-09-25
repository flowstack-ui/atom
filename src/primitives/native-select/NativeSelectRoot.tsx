"use client";

import { forwardRef, useMemo, useRef, type SelectHTMLAttributes } from "react";
import { composeRefs } from "../../utils/slot.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import { useFieldContext } from "../field/context.js";
import type { ValidationBehavior } from "../form/validation.js";

export interface NativeSelectRootProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  validationBehavior?: ValidationBehavior;
  "data-slot"?: string;
}

/** Native selection and uncontrolled reset stay browser-owned. */
export const NativeSelectRoot = forwardRef<HTMLSelectElement, NativeSelectRootProps>(
  function NativeSelectRoot({
    invalid, validationBehavior, disabled, required, id,
    "aria-describedby": describedBy, "aria-invalid": ariaInvalid,
    "data-slot": slot = "native-select", onChange, onInput, onInvalid,
    ...props
  }, ref) {
    const field = useFieldContext();
    const controlRef = useRef<HTMLSelectElement>(null);
    const mergedRef = useMemo(() => composeRefs(controlRef, ref), [ref]);
    const validation = useFormValidation({
      validityRef: controlRef, ownerRef: controlRef, invalid,
      inheritedInvalid: invalid === undefined ? field?.invalid : false, validationBehavior,
      inheritedValidationBehavior: field?.validationBehavior,
      form: props.form, reportValidity: field?.reportControlValidity,
    });
    const isDisabled = disabled ?? field?.disabled ?? false;
    const isRequired = required ?? field?.required ?? false;
    return <select
      {...props}
      ref={mergedRef}
      id={id ?? field?.controlId}
      disabled={isDisabled}
      required={isRequired}
      aria-describedby={describedBy ?? field?.describedBy}
      aria-invalid={validation.invalid || ariaInvalid || undefined}
      data-slot={slot}
      data-disabled={isDisabled ? "" : undefined}
      data-required={isRequired ? "" : undefined}
      data-invalid={validation.invalid ? "" : undefined}
      data-atom-validation-owner=""
      data-atom-validation-behavior={validation.validationBehavior}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) validation.validationProps.onChange();
      }}
      onInput={(event) => {
        onInput?.(event);
        if (!event.defaultPrevented) validation.validationProps.onInput();
      }}
      onInvalid={(event) => {
        onInvalid?.(event);
        validation.validationProps.onInvalid(event);
      }}
    />;
  },
);
