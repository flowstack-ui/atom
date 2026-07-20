"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { NativeFormProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  FormContextProvider,
  type FormContextValue,
} from "./context.js";

type FormRootNativeProps = NativeFormProps<"children" | "onReset" | "onSubmit">;

export interface FormRootProps extends FormRootNativeProps {
  children?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onReset?: (event: FormEvent<HTMLFormElement>) => void;
  preventDefaultOnSubmit?: boolean;
  validateOnSubmit?: (event: FormEvent<HTMLFormElement>) => boolean | Promise<boolean>;
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
    const [invalid, setInvalid] = useState(false);

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
            setInvalid(true);
            return;
          }

          setInvalid(false);

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
        setInvalid(false);
      },
      [onReset],
    );

    const contextValue = useMemo<FormContextValue>(
      () => ({
        submitting,
        submitted,
        invalid,
      }),
      [invalid, submitted, submitting],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      action,
      ref,
      "data-slot": dataSlot,
      ...(submitting && { "data-submitting": "" }),
      ...(submitted && { "data-submitted": "" }),
      ...(invalid && { "data-invalid": "" }),
      onSubmit: handleSubmit,
      onReset: handleReset,
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
