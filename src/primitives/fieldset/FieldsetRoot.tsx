"use client";

import {
  useCallback,
  useEffect,
  forwardRef,
  isValidElement,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEventHandler,
  type InputEventHandler,
  type ReactNode,
} from "react";
import type { NativeFieldsetProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  FieldsetContextProvider,
  type FieldsetContextValue,
} from "./context.js";
import { getFieldsetPartPresence, type FieldsetPartKind } from "./parts.js";
import { useOptionalFormContext } from "../form/context.js";
import {
  isNativeValidityElement,
  runValidationCapture,
  type ValidationBehavior,
} from "../form/validation.js";

type FieldsetRootNativeProps = NativeFieldsetProps<"children" | "disabled">;

export interface FieldsetRootProps extends FieldsetRootNativeProps {
  children: ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  validationBehavior?: ValidationBehavior;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FieldsetRoot = forwardRef<HTMLFieldSetElement, FieldsetRootProps>(
  function FieldsetRoot(
    {
      children,
      disabled = false,
      invalid = false,
      required = false,
      validationBehavior,
      render,
      asChild,
      id: providedId,
      "data-slot": dataSlot = "fieldset",
      ...restProps
    },
    ref,
  ) {
    const formContext = useOptionalFormContext();
    const formReportValidity = formContext?.reportControlValidity;
    const validationId = useId();
    const rootRef = useRef<HTMLFieldSetElement>(null);
    const autoId = useId();
    const baseId = providedId ?? autoId;
    const legendId = `${baseId}-legend`;
    const descriptionId = `${baseId}-description`;
    const errorId = `${baseId}-error`;
    const relationshipChildren =
      asChild && isValidElement<{ children?: ReactNode }>(children)
        ? children.props.children
        : children;
    const presenterParts = getFieldsetPartPresence(relationshipChildren, false);
    const resolvedValidationBehavior =
      validationBehavior ??
      formContext?.validationBehavior ??
      (presenterParts.errorPresenter ? "inline" : undefined);
    const [invalidControlIds, setInvalidControlIds] = useState<Set<string>>(
      () => new Set(),
    );
    const [invalidNativeElements, setInvalidNativeElements] = useState<Set<Element>>(
      () => new Set(),
    );
    const effectiveInvalid =
      invalid || invalidControlIds.size > 0 || invalidNativeElements.size > 0;
    const visibleParts = getFieldsetPartPresence(
      relationshipChildren,
      effectiveInvalid,
    );
    const [partCounts, setPartCounts] = useState({ legend: 0, description: 0, error: 0 });
    const [partRegistryReady, setPartRegistryReady] = useState(false);
    const hasLegend = partRegistryReady ? partCounts.legend > 0 : visibleParts.legend;
    const hasDescription = partRegistryReady
      ? partCounts.description > 0
      : visibleParts.description;
    const hasError = partRegistryReady ? partCounts.error > 0 : visibleParts.error;

    useEffect(() => setPartRegistryReady(true), []);

    const registerPart = useCallback((kind: FieldsetPartKind) => {
      let registered = true;
      setPartCounts((counts) => ({ ...counts, [kind]: counts[kind] + 1 }));
      return () => {
        if (!registered) return;
        registered = false;
        setPartCounts((counts) => ({
          ...counts,
          [kind]: Math.max(0, counts[kind] - 1),
        }));
      };
    }, []);
    const reportControlValidity = useCallback((id: string, isInvalid: boolean) => {
      setInvalidControlIds((current) => {
        const next = new Set(current);
        if (isInvalid) next.add(id);
        else next.delete(id);
        return next.size === current.size && [...next].every((value) => current.has(value))
          ? current
          : next;
      });
    }, []);
    useEffect(() => {
      formReportValidity?.(validationId, effectiveInvalid);
      return () => formReportValidity?.(validationId, false);
    }, [effectiveInvalid, formReportValidity, validationId]);

    useEffect(() => {
      const form = rootRef.current?.form;
      if (!form) return undefined;
      const clearNativeInvalid = () => {
        setInvalidNativeElements(new Set());
      };
      form.addEventListener("reset", clearNativeInvalid);
      return () => form.removeEventListener("reset", clearNativeInvalid);
    }, []);
    const describedBy = [
      hasDescription ? descriptionId : null,
      hasError ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    const contextValue = useMemo<FieldsetContextValue>(
      () => ({
        invalid: effectiveInvalid,
        disabled,
        required,
        legendId,
        descriptionId,
        errorId,
        describedBy,
        hasDescription,
        hasError,
        hasLegend,
        registerPart,
        validationBehavior: resolvedValidationBehavior,
        reportControlValidity,
      }),
      [
        describedBy,
        descriptionId,
        disabled,
        errorId,
        hasDescription,
        hasError,
        effectiveInvalid,
        legendId,
        required,
        hasLegend,
        registerPart,
        reportControlValidity,
        resolvedValidationBehavior,
      ],
    );

    const {
      onInvalidCapture,
      onInputCapture,
      ...fieldsetProps
    } = restProps;
    const handleInvalidCapture: FormEventHandler<HTMLFieldSetElement> = (event) => {
      onInvalidCapture?.(event);
      runValidationCapture(event, resolvedValidationBehavior, (target) => {
        setInvalidNativeElements((current) => {
          if (current.has(target)) return current;
          return new Set(current).add(target);
        });
      });
    };
    const handleInputCapture: InputEventHandler<HTMLFieldSetElement> = (event) => {
      onInputCapture?.(event);
      const target = event.target;
      if (!isNativeValidityElement(target) || !target.validity.valid) return;
      setInvalidNativeElements((current) => {
        if (!current.has(target)) return current;
        const next = new Set(current);
        next.delete(target);
        return next;
      });
    };

    const hasExplicitDescription = Object.prototype.hasOwnProperty.call(
      fieldsetProps,
      "aria-describedby",
    );
    const resolvedAriaDescribedBy = hasExplicitDescription
      ? restProps["aria-describedby"]
      : describedBy;

    const behaviorProps: Record<string, unknown> = {
      ...fieldsetProps,
      ref: composeRefs(rootRef, ref),
      id: providedId,
      disabled: disabled || undefined,
      "aria-describedby": resolvedAriaDescribedBy,
      "aria-invalid": effectiveInvalid || undefined,
      "data-slot": dataSlot,
      "data-atom-validation-scope": "",
      "data-atom-validation-behavior": resolvedValidationBehavior ?? "native",
      ...(effectiveInvalid && { "data-invalid": "" }),
      ...(disabled && { "data-disabled": "" }),
      ...(required && { "data-required": "" }),
      onInvalidCapture: handleInvalidCapture,
      onInputCapture: handleInputCapture,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "fieldset", {
          ...behaviorProps,
          children,
        });

    return (
      <FieldsetContextProvider value={contextValue}>
        {element}
      </FieldsetContextProvider>
    );
  },
);
