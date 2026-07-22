"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type FormEvent,
  type FormEventHandler,
  type InputEventHandler,
  type ReactNode,
} from "react";
import type { NativeFormProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  FormContextProvider,
  type FormContextValue,
} from "./context.js";
import {
  isNativeValidityElement,
  runValidationCapture,
  type ValidationBehavior,
} from "./validation.js";

type FormRootNativeProps = NativeFormProps<"children" | "onReset" | "onSubmit">;

export interface FormRootProps extends FormRootNativeProps {
  children?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onReset?: (event: FormEvent<HTMLFormElement>) => void;
  preventDefaultOnSubmit?: boolean;
  validateOnSubmit?: (event: FormEvent<HTMLFormElement>) => boolean | Promise<boolean>;
  validationBehavior?: ValidationBehavior;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function isPromiseLike<T>(value: T | Promise<T>): value is Promise<T> {
  return typeof (value as Promise<T>)?.then === "function";
}

export const FormRoot = forwardRef<HTMLFormElement, FormRootProps>(
  function FormRoot(
    {
      children,
      onSubmit,
      onReset,
      preventDefaultOnSubmit = false,
      validateOnSubmit,
      validationBehavior,
      action,
      render,
      asChild,
      "data-slot": dataSlot = "form",
      ...restProps
    },
    ref,
  ) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [callbackInvalid, setCallbackInvalid] = useState(false);
    const [invalidControlIds, setInvalidControlIds] = useState<Set<string>>(
      () => new Set(),
    );
    const [invalidNativeElements, setInvalidNativeElements] = useState<Set<Element>>(
      () => new Set(),
    );
    const {
      onInvalidCapture,
      onInputCapture,
      ...formProps
    } = restProps;

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

    const handleInvalidCapture: FormEventHandler<HTMLFormElement> = (event) => {
      onInvalidCapture?.(event);
      runValidationCapture(event, validationBehavior, (target) => {
        setInvalidNativeElements((current) => {
          if (current.has(target)) return current;
          return new Set(current).add(target);
        });
      });
    };

    const handleInputCapture: InputEventHandler<HTMLFormElement> = (event) => {
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

    const invalid =
      callbackInvalid || invalidControlIds.size > 0 || invalidNativeElements.size > 0;

    const handleSubmit = useCallback(
      async (event: FormEvent<HTMLFormElement>) => {
        if (
          typeof action === "function" &&
          onSubmit === undefined &&
          validateOnSubmit === undefined &&
          !preventDefaultOnSubmit
        ) {
          return;
        }

        setSubmitting(true);
        setSubmitted(false);

        try {
          const validationResult = validateOnSubmit?.(event);
          if (preventDefaultOnSubmit || isPromiseLike(validationResult)) {
            event.preventDefault();
          }

          const isValid = isPromiseLike(validationResult)
            ? await validationResult
            : validationResult;

          if (isValid === false) {
            event.preventDefault();
            setCallbackInvalid(true);
            return;
          }

          setCallbackInvalid(false);

          const submitResult = onSubmit?.(event);
          if (isPromiseLike(submitResult)) {
            await submitResult;
          }

          setSubmitted(true);
        } catch (error) {
          setSubmitted(false);
          throw error;
        } finally {
          setSubmitting(false);
        }
      },
      [action, onSubmit, preventDefaultOnSubmit, validateOnSubmit],
    );

    const handleReset = useCallback(
      (event: FormEvent<HTMLFormElement>) => {
        onReset?.(event);
        if (event.defaultPrevented) return;

        setSubmitting(false);
        setSubmitted(false);
        setCallbackInvalid(false);
        setInvalidNativeElements(new Set());
      },
      [onReset],
    );

    const contextValue = useMemo<FormContextValue>(
      () => ({
        submitting,
        submitted,
        invalid,
        validationBehavior,
        reportControlValidity,
      }),
      [invalid, reportControlValidity, submitted, submitting, validationBehavior],
    );

    const behaviorProps: Record<string, unknown> = {
      ...formProps,
      action,
      ref,
      "data-slot": dataSlot,
      ...(submitting && { "data-submitting": "" }),
      ...(submitted && { "data-submitted": "" }),
      ...(invalid && { "data-invalid": "" }),
      onSubmit: handleSubmit,
      onReset: handleReset,
      onInvalidCapture: handleInvalidCapture,
      onInputCapture: handleInputCapture,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "form", {
          ...behaviorProps,
          children,
        });

    return (
      <FormContextProvider value={contextValue}>
        {element}
      </FormContextProvider>
    );
  },
);
