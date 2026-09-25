"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { NativeLabelProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useSwitchInternalContext } from "./context.js";
import { useSwitchPartId } from "./usePartId.js";

type SwitchLabelNativeProps = NativeLabelProps<"children">;

export interface SwitchLabelProps extends SwitchLabelNativeProps {
  render?: RenderProp;
  asChild?: boolean;
  children: ReactNode;
  "data-slot"?: string;
}

export const SwitchLabel = forwardRef<HTMLLabelElement, SwitchLabelProps>(
  function SwitchLabel(
    {
      render,
      asChild,
      children,
      htmlFor,
      "data-slot": dataSlot = "switch-label",
      ...restProps
    },
    ref,
  ) {
    const context = useSwitchInternalContext();
    useSwitchPartId("label", restProps.id);
    const registerPart = context.registerPart;
    const unregisterRef = useRef<(() => void) | null>(null);
    const registeredNodeRef = useRef<HTMLLabelElement | null>(null);
    const registrationRef = useCallback((node: HTMLLabelElement | null) => {
      if (registeredNodeRef.current === node) return;
      unregisterRef.current?.();
      registeredNodeRef.current = node;
      unregisterRef.current = node && registerPart
        ? registerPart("label")
        : null;
    }, [registerPart]);
    const composedRef = useMemo(
      () => composeRefs(registrationRef, ref),
      [ref, registrationRef],
    );
    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: restProps.id ?? context.labelId,
      htmlFor: htmlFor ?? context.controlId,
      "data-slot": dataSlot,
      "data-state": context.checked ? "checked" : "unchecked",
      ...(context.disabled && { "data-disabled": "" }),
      ...(context.readOnly && { "data-readonly": "" }),
      ...(context.invalid && { "data-invalid": "" }),
      ...(context.required && { "data-required": "" }),
    };

    if (asChild) return cloneAndMerge(children, behaviorProps);
    return renderElement(render, "label", { ...behaviorProps, children });
  },
);
