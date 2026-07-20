"use client";

import {
  useCallback,
  useEffect,
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
import { getFieldPartPresence, type FieldPartKind } from "./parts.js";

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
    const visibleParts = getFieldPartPresence(children, invalid);
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
        registerPart,
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
        registerPart,
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
