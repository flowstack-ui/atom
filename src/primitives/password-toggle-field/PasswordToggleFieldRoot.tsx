"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
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
}

export function PasswordToggleFieldRoot({
  children,
  visible: controlledVisible,
  defaultVisible = false,
  onVisibleChange,
  disabled = false,
  readOnly = false,
  invalid = false,
  required = false,
}: PasswordToggleFieldRootProps) {
  const [visible, setResolvedVisible] = useControllableState<boolean>({
    value: controlledVisible,
    defaultValue: defaultVisible,
    onChange: onVisibleChange,
  });

  const setVisible = useCallback(
    (next: boolean) => {
      if (disabled) return;
      setResolvedVisible(next);
    },
    [disabled, setResolvedVisible],
  );

  const onToggle = useCallback(() => {
    if (disabled) return;
    setResolvedVisible((currentVisible) => !currentVisible);
  }, [disabled, setResolvedVisible]);

  const contextValue = useMemo<PasswordToggleFieldContextValue>(
    () => ({
      visible,
      onVisibleChange: setVisible,
      onToggle,
      disabled,
      readOnly,
      invalid,
      required,
    }),
    [disabled, invalid, onToggle, readOnly, required, setVisible, visible],
  );

  return (
    <PasswordToggleFieldContextProvider value={contextValue}>
      {children}
    </PasswordToggleFieldContextProvider>
  );
}
