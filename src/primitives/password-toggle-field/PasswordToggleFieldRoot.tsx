"use client";

import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFieldContext } from "../field/context.js";
import { useOptionalFormContext } from "../form/context.js";
import type { ValidationBehavior } from "../form/validation.js";
import {
  PasswordToggleFieldContextProvider,
  type PasswordToggleFieldContextValue,
} from "./context.js";

export interface PasswordToggleFieldRootProps {
  children: ReactNode;
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  validationBehavior?: ValidationBehavior;
}

export function PasswordToggleFieldRoot({
  children,
  visible: controlledVisible,
  defaultVisible = false,
  onVisibleChange,
  disabled,
  readOnly,
  invalid,
  required,
  validationBehavior,
}: PasswordToggleFieldRootProps) {
  const field = useFieldContext();
  const formContext = useOptionalFormContext();
  const validationId = useId();
  const isDisabled = disabled ?? field?.disabled ?? false;
  const isReadOnly = readOnly ?? field?.readOnly ?? false;
  const isRequired = required ?? field?.required ?? false;
  const [invalidControlIds, setInvalidControlIds] = useState<Set<string>>(
    () => new Set(),
  );
  const locallyInvalid = Boolean(invalid) || invalidControlIds.size > 0;
  const isInvalid = locallyInvalid || (field?.invalid ?? false);
  const resolvedValidationBehavior =
    validationBehavior ?? field?.validationBehavior ?? formContext?.validationBehavior;
  const [visible, setResolvedVisible] = useControllableState<boolean>({
    value: controlledVisible,
    defaultValue: defaultVisible,
    onChange: onVisibleChange,
  });

  const setVisible = useCallback(
    (next: boolean) => {
      if (isDisabled) return;
      setResolvedVisible(next);
    },
    [isDisabled, setResolvedVisible],
  );

  const onToggle = useCallback(() => {
    if (isDisabled) return;
    setResolvedVisible((currentVisible) => !currentVisible);
  }, [isDisabled, setResolvedVisible]);

  const reportControlValidity = useCallback((id: string, nextInvalid: boolean) => {
    setInvalidControlIds((current) => {
      const next = new Set(current);
      if (nextInvalid) next.add(id);
      else next.delete(id);
      return next.size === current.size && [...next].every((value) => current.has(value))
        ? current
        : next;
    });
  }, []);
  const parentReportValidity =
    field?.reportControlValidity ?? formContext?.reportControlValidity;

  useEffect(() => {
    parentReportValidity?.(validationId, locallyInvalid);
    return () => parentReportValidity?.(validationId, false);
  }, [locallyInvalid, parentReportValidity, validationId]);

  const contextValue = useMemo<PasswordToggleFieldContextValue>(
    () => ({
      visible,
      onVisibleChange: setVisible,
      onToggle,
      disabled: isDisabled,
      readOnly: isReadOnly,
      invalid: isInvalid,
      required: isRequired,
      validationBehavior: resolvedValidationBehavior,
      reportControlValidity,
    }),
    [
      isDisabled,
      isInvalid,
      isReadOnly,
      isRequired,
      onToggle,
      reportControlValidity,
      resolvedValidationBehavior,
      setVisible,
      visible,
    ],
  );

  return (
    <PasswordToggleFieldContextProvider value={contextValue}>
      {children}
    </PasswordToggleFieldContextProvider>
  );
}
