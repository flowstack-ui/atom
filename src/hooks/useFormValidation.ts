"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { useOptionalFormContext } from "../primitives/form/context.js";
import {
  scheduleFirstInvalidFocus,
  type NativeValidityElement,
  type ValidationBehavior,
} from "../primitives/form/validation.js";

export interface UseFormValidationOptions<T extends NativeValidityElement> {
  validityRef: RefObject<T | null>;
  ownerRef: RefObject<HTMLElement | null>;
  invalid?: boolean;
  inheritedInvalid?: boolean;
  validationBehavior?: ValidationBehavior;
  inheritedValidationBehavior?: ValidationBehavior;
  form?: string;
  reportValidity?: (id: string, invalid: boolean) => void;
}

export interface FormValidationResult<T extends NativeValidityElement> {
  invalid: boolean;
  validationBehavior: ValidationBehavior;
  validationProps: {
    "data-atom-validation-owner": "";
    "data-atom-validation-behavior": ValidationBehavior;
    onInvalid: (event: FormEvent<T>) => void;
    onInput: () => void;
    onChange: () => void;
  };
  clearNativeInvalid: () => void;
}

export function useFormValidation<T extends NativeValidityElement>({
  validityRef,
  ownerRef,
  invalid = false,
  inheritedInvalid = false,
  validationBehavior,
  inheritedValidationBehavior,
  form: formId,
  reportValidity,
}: UseFormValidationOptions<T>): FormValidationResult<T> {
  const formContext = useOptionalFormContext();
  const formReportValidity = formContext?.reportControlValidity;
  const validationId = useId();
  const attemptedRef = useRef(false);
  const [nativeInvalid, setNativeInvalid] = useState(false);
  const resolvedBehavior =
    validationBehavior ??
    inheritedValidationBehavior ??
    formContext?.validationBehavior ??
    "native";
  const locallyInvalid = invalid || nativeInvalid;

  const syncNativeValidity = useCallback(() => {
    if (!attemptedRef.current) return;
    const validityOwner = validityRef.current;
    if (!validityOwner) return;
    setNativeInvalid(!validityOwner.validity.valid);
  }, [validityRef]);

  const clearNativeInvalid = useCallback(() => {
    attemptedRef.current = false;
    setNativeInvalid(false);
  }, []);

  const handleInvalid = useCallback(
    (event: FormEvent<T>) => {
      attemptedRef.current = true;
      setNativeInvalid(true);

      if (resolvedBehavior === "inline") {
        event.preventDefault();
        const validityOwner = validityRef.current;
        const visibleOwner = ownerRef.current;
        if (validityOwner && visibleOwner) {
          scheduleFirstInvalidFocus(validityOwner, visibleOwner);
        }
      }
    },
    [ownerRef, resolvedBehavior, validityRef],
  );

  useEffect(syncNativeValidity);

  useEffect(() => {
    const validityOwner = validityRef.current;
    const associatedForm = formId
      ? validityOwner?.ownerDocument.getElementById(formId)
      : validityOwner?.form;
    if (!associatedForm || associatedForm.tagName !== "FORM") return undefined;

    associatedForm.addEventListener("reset", clearNativeInvalid);
    return () => associatedForm.removeEventListener("reset", clearNativeInvalid);
  }, [clearNativeInvalid, formId, validityRef]);

  useEffect(() => {
    reportValidity?.(validationId, locallyInvalid);
    if (!reportValidity) {
      formReportValidity?.(validationId, locallyInvalid);
    }
  }, [formReportValidity, locallyInvalid, reportValidity, validationId]);

  useEffect(
    () => () => {
      reportValidity?.(validationId, false);
      if (!reportValidity) {
        formReportValidity?.(validationId, false);
      }
    },
    [formReportValidity, reportValidity, validationId],
  );

  return {
    invalid: locallyInvalid || inheritedInvalid,
    validationBehavior: resolvedBehavior,
    validationProps: {
      "data-atom-validation-owner": "",
      "data-atom-validation-behavior": resolvedBehavior,
      onInvalid: handleInvalid,
      onInput: syncNativeValidity,
      onChange: syncNativeValidity,
    },
    clearNativeInvalid,
  };
}
