"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type ChangeEventHandler,
  type FocusEventHandler,
} from "react";
import { useFormControlProxy, formControlProxyStyle } from "../../hooks/useFormControlProxy.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import type { NativeInputProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useSwitchInternalContext } from "./context.js";
import { useSwitchPartId } from "./usePartId.js";

type SwitchHiddenInputNativeProps = NativeInputProps<
  | "children"
  | "checked"
  | "defaultChecked"
  | "disabled"
  | "form"
  | "name"
  | "required"
  | "style"
  | "tabIndex"
  | "type"
  | "value"
>;

export interface SwitchHiddenInputProps extends SwitchHiddenInputNativeProps {
  "data-slot"?: string;
}

export const SwitchHiddenInput = forwardRef<HTMLInputElement, SwitchHiddenInputProps>(
  function SwitchHiddenInput(
    {
      "data-slot": dataSlot = "switch-input",
      onChange,
      onFocus,
      onInput,
      onInvalid,
      ...restProps
    },
    ref,
  ) {
    const context = useSwitchInternalContext();
    useSwitchPartId("input", restProps.id);
    const registerPart = context.registerPart;
    const unregisterRef = useRef<(() => void) | null>(null);
    const registeredNodeRef = useRef<HTMLInputElement | null>(null);
    const registrationRef = useCallback((node: HTMLInputElement | null) => {
      if (registeredNodeRef.current === node) return;
      unregisterRef.current?.();
      registeredNodeRef.current = node;
      unregisterRef.current = node && registerPart
        ? registerPart("input")
        : null;
    }, [registerPart]);
    const composedRef = useMemo(
      () => composeRefs(context.inputRef, registrationRef, ref),
      [context.inputRef, ref, registrationRef],
    );
    useFormControlProxy(
      context.inputRef ?? { current: null },
      context.controlRef ?? { current: null },
    );
    useFormReset(
      context.inputRef ?? { current: null },
      context.form,
      context.controlled ?? true,
      context.reset ?? (() => undefined),
    );
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      if (!context.disabled && !context.readOnly) {
        context.setChecked(event.currentTarget.checked);
      }
      context.validationProps?.onChange();
    };
    const handleFocus: FocusEventHandler<HTMLInputElement> = () => {
      context.controlRef?.current?.focus();
    };

    return (
      <input
        {...restProps}
        {...context.validationProps}
        ref={composedRef}
        id={restProps.id ?? context.inputId}
        type="checkbox"
        aria-hidden="true"
        tabIndex={-1}
        name={context.name}
        value={context.inputValue ?? "on"}
        form={context.form}
        checked={context.checked}
        disabled={context.disabled}
        required={context.required}
        data-slot={dataSlot}
        onChange={composeEventHandlers(onChange, handleChange)}
        onFocus={composeEventHandlers(onFocus, handleFocus)}
        onInput={composeEventHandlers(onInput, context.validationProps?.onInput ?? (() => undefined))}
        onInvalid={composeEventHandlers(onInvalid, context.validationProps?.onInvalid ?? (() => undefined))}
        style={formControlProxyStyle}
      />
    );
  },
);
