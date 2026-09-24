"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useFieldContext } from "../field/context.js";
import { useFieldsetContext } from "../fieldset/context.js";
import type { ValidationBehavior } from "../form/validation.js";
import {
  SwitchContextProvider,
  type SwitchInternalContextValue,
  type SwitchPartKind,
} from "./context.js";
import { useSwitch, type SwitchController } from "./useSwitch.js";

type SwitchFieldNativeProps = NativeDivProps<"children" | "defaultChecked" | "onChange">;

export interface SwitchFieldProps extends SwitchFieldNativeProps {
  /** Explicit shared part IDs, available during server rendering. */
  ids?: Partial<Record<SwitchPartKind, string>>;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  form?: string;
  validationBehavior?: ValidationBehavior;
  render?: RenderProp;
  asChild?: boolean;
  children: ReactNode;
  "data-slot"?: string;
}

interface SwitchFieldImplementationProps extends SwitchFieldProps {
  controller?: SwitchController;
}

export const SwitchField = forwardRef<HTMLDivElement, SwitchFieldProps>(
  function SwitchField(props, ref) {
    return <SwitchFieldImplementation {...props} ref={ref} />;
  },
);

export const SwitchFieldImplementation = forwardRef<
  HTMLDivElement,
  SwitchFieldImplementationProps
>(function SwitchFieldImplementation(
  {
    controller,
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    readOnly,
    invalid,
    required,
    name,
    value = "on",
    form,
    validationBehavior,
    render,
    asChild,
    children,
    id: providedId,
    ids,
    "data-slot": dataSlot = "switch-field",
    ...restProps
  },
  ref,
) {
  const field = useFieldContext();
  const fieldset = useFieldsetContext();
  const isDisabled = Boolean(disabled || field?.disabled || fieldset?.disabled || controller?.disabled);
  const isReadOnly = Boolean(readOnly || field?.readOnly || controller?.readOnly);
  const isRequired = Boolean(required || field?.required || fieldset?.required);
  const internalController = useSwitch({
    checked,
    defaultChecked,
    onCheckedChange,
    disabled: isDisabled,
    readOnly: isReadOnly,
  });
  const stateController = controller ?? internalController;
  const controlRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reset = useCallback(() => {
    stateController.reset();
  }, [stateController.reset]);
  const toggle = useCallback(() => {
    if (!isDisabled && !isReadOnly) {
      stateController.setChecked((currentChecked) => !currentChecked);
    }
  }, [isDisabled, isReadOnly, stateController.setChecked]);
  const validation = useFormValidation({
    validityRef: inputRef,
    ownerRef: controlRef,
    invalid,
    inheritedInvalid: field?.invalid ?? fieldset?.invalid,
    validationBehavior,
    inheritedValidationBehavior: field?.validationBehavior ?? fieldset?.validationBehavior,
    form,
    reportValidity: field?.reportControlValidity ?? fieldset?.reportControlValidity,
  });
  const generatedId = useId();
  const baseId = providedId ?? generatedId;
  const [partIds, setPartIds] = useState<Partial<Record<SwitchPartKind, string>>>({});
  const registerPartId = useCallback((kind: SwitchPartKind, id: string) => {
    setPartIds((current) => current[kind] === id ? current : { ...current, [kind]: id });
    return () => setPartIds((current) => {
      if (current[kind] !== id) return current;
      const next = { ...current };
      delete next[kind];
      return next;
    });
  }, []);
  const controlId = partIds.control ?? ids?.control ?? `${baseId}-control`;
  const labelId = partIds.label ?? ids?.label ?? `${baseId}-label`;
  const inputId = partIds.input ?? ids?.input ?? `${baseId}-input`;
  const partCountsRef = useRef<Record<SwitchPartKind, number>>({
    control: 0,
    input: 0,
    label: 0,
  });
  const registerPart = useCallback((kind: SwitchPartKind) => {
    let registered = true;
    partCountsRef.current[kind] += 1;
    return () => {
      if (!registered) return;
      registered = false;
      partCountsRef.current[kind] = Math.max(0, partCountsRef.current[kind] - 1);
    };
  }, []);

  useEffect(() => {
    const isProduction =
      (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
        ?.NODE_ENV === "production";
    if (isProduction) return undefined;
    const timeout = setTimeout(() => {
      const partCounts = partCountsRef.current;
      if (partCounts.control !== 1) {
        console.warn(
          `Switch.Field requires exactly one Switch.Control; received ${partCounts.control}.`,
        );
      }
      if (partCounts.input !== 1) {
        console.warn(
          `Switch.Field requires exactly one Switch.HiddenInput; received ${partCounts.input}.`,
        );
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const contextValue = useMemo<SwitchInternalContextValue>(
    () => ({
      checked: stateController.checked,
      setChecked: stateController.setChecked,
      toggle,
      disabled: isDisabled,
      readOnly: isReadOnly,
      invalid: validation.invalid,
      required: isRequired,
      controlId,
      labelId,
      inputId,
      compound: true,
      name,
      inputValue: value,
      form,
      describedBy: field?.describedBy,
      validationBehavior: validation.validationBehavior,
      controlled: stateController.controlled,
      reset,
      revealNativeInvalid: validation.revealNativeInvalid,
      validationProps: validation.validationProps,
      controlRef,
      inputRef,
      registerPart,
      registerPartId,
    }),
    [
      checked,
      controlId,
      controller,
      field?.describedBy,
      form,
      inputId,
      isDisabled,
      isReadOnly,
      isRequired,
      labelId,
      name,
      registerPart,
      registerPartId,
      reset,
      stateController.checked,
      stateController.controlled,
      stateController.setChecked,
      toggle,
      validation.invalid,
      validation.revealNativeInvalid,
      validation.validationBehavior,
      validation.validationProps,
      value,
    ],
  );
  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref,
    id: providedId,
    "data-slot": dataSlot,
    "data-state": stateController.checked ? "checked" : "unchecked",
    ...(isDisabled && { "data-disabled": "" }),
    ...(isReadOnly && { "data-readonly": "" }),
    ...(isRequired && { "data-required": "" }),
    ...(validation.invalid && { "data-invalid": "" }),
  };
  const element = asChild
    ? cloneAndMerge(children, behaviorProps)
    : renderElement(render, "div", { ...behaviorProps, children });

  return (
    <SwitchContextProvider value={contextValue}>
      {element}
    </SwitchContextProvider>
  );
});
