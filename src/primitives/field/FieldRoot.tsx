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
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  FieldContextProvider,
  type FieldContextValue,
  type FieldOrientation,
} from "./context.js";
import { getFieldPartPresence, type FieldPartKind } from "./parts.js";
import { useOptionalFormContext } from "../form/context.js";
import {
  isNativeValidityElement,
  runValidationCapture,
  type ValidationBehavior,
} from "../form/validation.js";

type FieldRootNativeProps = NativeDivProps<"children">;

export interface FieldRootProps extends FieldRootNativeProps {
  children: ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  validationBehavior?: ValidationBehavior;
  orientation?: FieldOrientation;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FieldRoot = forwardRef<HTMLDivElement, FieldRootProps>(
  function FieldRoot(
    {
      children,
      invalid = false,
      disabled = false,
      required = false,
      readOnly = false,
      validationBehavior,
      orientation = "vertical",
      render,
      asChild,
      id: providedId,
      "data-slot": dataSlot = "field",
      ...restProps
    },
    ref,
  ) {
    const formContext = useOptionalFormContext();
    const formReportValidity = formContext?.reportControlValidity;
    const validationId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const autoId = useId();
    const baseId = providedId ?? autoId;
    const controlId = `${baseId}-control`;
    const labelId = `${baseId}-label`;
    const descriptionId = `${baseId}-description`;
    const errorId = `${baseId}-error`;
    const relationshipChildren =
      asChild && isValidElement<{ children?: ReactNode }>(children)
        ? children.props.children
        : children;
    const presenterParts = getFieldPartPresence(relationshipChildren, false);
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
    const visibleParts = getFieldPartPresence(relationshipChildren, effectiveInvalid);
    const [partCounts, setPartCounts] = useState({ description: 0, error: 0 });
    const [partRegistryReady, setPartRegistryReady] = useState(false);
    const hasDescription = partRegistryReady
      ? partCounts.description > 0
      : visibleParts.description;
    const hasError = partRegistryReady ? partCounts.error > 0 : visibleParts.error;

    useEffect(() => setPartRegistryReady(true), []);

    const registerPart = useCallback((kind: FieldPartKind) => {
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
      const form = rootRef.current?.closest("form");
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

    const contextValue = useMemo<FieldContextValue>(
      () => ({
        invalid: effectiveInvalid,
        disabled,
        required,
        readOnly,
        controlId,
        labelId,
        descriptionId,
        errorId,
        describedBy,
        hasDescription,
        hasError,
        registerPart,
        validationBehavior: resolvedValidationBehavior,
        reportControlValidity,
      }),
      [
        controlId,
        describedBy,
        descriptionId,
        disabled,
        errorId,
        hasDescription,
        hasError,
        effectiveInvalid,
        labelId,
        readOnly,
        required,
        registerPart,
        reportControlValidity,
        resolvedValidationBehavior,
      ],
    );

    const {
      onInvalidCapture,
      onInputCapture,
      ...fieldProps
    } = restProps;
    const handleInvalidCapture: FormEventHandler<HTMLDivElement> = (event) => {
      onInvalidCapture?.(event);
      runValidationCapture(event, resolvedValidationBehavior, (target) => {
        setInvalidNativeElements((current) => {
          if (current.has(target)) return current;
          return new Set(current).add(target);
        });
      });
    };
    const handleInputCapture: InputEventHandler<HTMLDivElement> = (event) => {
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

    const behaviorProps: Record<string, unknown> = {
      ...fieldProps,
      ref: composeRefs(rootRef, ref),
      id: providedId,
      "data-slot": dataSlot,
      "data-atom-validation-scope": "",
      "data-atom-validation-behavior": resolvedValidationBehavior ?? "native",
      "data-orientation": orientation,
      ...(effectiveInvalid && { "data-invalid": "" }),
      ...(disabled && { "data-disabled": "" }),
      ...(required && { "data-required": "" }),
      ...(readOnly && { "data-readonly": "" }),
      onInvalidCapture: handleInvalidCapture,
      onInputCapture: handleInputCapture,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", {
          ...behaviorProps,
          children,
        });

    return (
      <FieldContextProvider value={contextValue}>
        {element}
      </FieldContextProvider>
    );
  },
);
