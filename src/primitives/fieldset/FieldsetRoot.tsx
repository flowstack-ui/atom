"use client";

import {
  useCallback,
  useEffect,
  forwardRef,
  isValidElement,
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
import { getFieldsetPartPresence, type FieldsetPartKind } from "./parts.js";

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
    const legendId = `${baseId}-legend`;
    const descriptionId = `${baseId}-description`;
    const errorId = `${baseId}-error`;
    const relationshipChildren =
      asChild && isValidElement<{ children?: ReactNode }>(children)
        ? children.props.children
        : children;
    const visibleParts = getFieldsetPartPresence(
      relationshipChildren,
      invalid,
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
        legendId,
        descriptionId,
        errorId,
        describedBy,
        hasDescription,
        hasError,
        hasLegend,
        registerPart,
      }),
      [
        describedBy,
        descriptionId,
        disabled,
        errorId,
        hasDescription,
        hasError,
        invalid,
        legendId,
        required,
        hasLegend,
        registerPart,
      ],
    );

    const hasExplicitDescription = Object.prototype.hasOwnProperty.call(
      restProps,
      "aria-describedby",
    );
    const resolvedAriaDescribedBy = hasExplicitDescription
      ? restProps["aria-describedby"]
      : describedBy;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: providedId,
      disabled: disabled || undefined,
      "aria-describedby": resolvedAriaDescribedBy,
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
