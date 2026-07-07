"use client";

import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NativeFieldsetProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  FieldsetContextProvider,
  type FieldsetContextValue,
} from "./context.js";

type FieldsetRootNativeProps = NativeFieldsetProps<"children" | "disabled">;

export interface FieldsetRootProps extends FieldsetRootNativeProps {
  children: ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
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
      render,
      asChild,
      id: providedId,
      "data-slot": dataSlot = "fieldset",
      ...restProps
    },
    ref,
  ) {
    const autoId = useId();
    const baseId = providedId ?? autoId;
    const descriptionId = `${baseId}-description`;
    const errorId = `${baseId}-error`;
    const [hasDescription, setHasDescription] = useState(false);
    const [hasError, setHasError] = useState(false);
    const describedBy = [
      hasDescription ? descriptionId : null,
      hasError ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    const contextValue = useMemo<FieldsetContextValue>(
      () => ({
        invalid,
        disabled,
        required,
        descriptionId,
        errorId,
        describedBy,
        hasDescription,
        hasError,
        setHasDescription,
        setHasError,
      }),
      [
        describedBy,
        descriptionId,
        disabled,
        errorId,
        hasDescription,
        hasError,
        invalid,
        required,
        setHasDescription,
        setHasError,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: providedId,
      disabled: disabled || undefined,
      "aria-describedby": describedBy,
      "aria-invalid": invalid || undefined,
      "data-slot": dataSlot,
      ...(invalid && { "data-invalid": "" }),
      ...(disabled && { "data-disabled": "" }),
      ...(required && { "data-required": "" }),
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
