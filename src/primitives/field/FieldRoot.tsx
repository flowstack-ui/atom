"use client";

import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  FieldContextProvider,
  type FieldContextValue,
  type FieldOrientation,
} from "./context.js";

type FieldRootNativeProps = NativeDivProps<"children">;

export interface FieldRootProps extends FieldRootNativeProps {
  children: ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
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
      orientation = "vertical",
      render,
      asChild,
      id: providedId,
      "data-slot": dataSlot = "field",
      ...restProps
    },
    ref,
  ) {
    const autoId = useId();
    const baseId = providedId ?? autoId;
    const controlId = `${baseId}-control`;
    const labelId = `${baseId}-label`;
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

    const contextValue = useMemo<FieldContextValue>(
      () => ({
        invalid,
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
        setHasDescription,
        setHasError,
      }),
      [
        controlId,
        describedBy,
        descriptionId,
        disabled,
        errorId,
        hasDescription,
        hasError,
        invalid,
        labelId,
        readOnly,
        required,
        setHasDescription,
        setHasError,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: providedId,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      ...(invalid && { "data-invalid": "" }),
      ...(disabled && { "data-disabled": "" }),
      ...(required && { "data-required": "" }),
      ...(readOnly && { "data-readonly": "" }),
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
