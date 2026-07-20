"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useCheckboxGroupItemContext } from "./context.js";
import { markCheckboxGroupItemPart } from "./parts.js";

type CheckboxGroupItemDescriptionNativeProps = NativeSpanProps<"children">;

export interface CheckboxGroupItemDescriptionProps
  extends CheckboxGroupItemDescriptionNativeProps {
  children: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CheckboxGroupItemDescription = forwardRef<
  HTMLSpanElement,
  CheckboxGroupItemDescriptionProps
>(function CheckboxGroupItemDescription(
  {
    children,
    render,
    asChild,
    "data-slot": dataSlot = "checkbox-group-item-description",
    ...restProps
  },
  ref,
) {
  const context = useCheckboxGroupItemContext();
  const unregisterRef = useRef<(() => void) | null>(null);
  const registrationRef = useCallback(
    (node: HTMLSpanElement | null) => {
      unregisterRef.current?.();
      unregisterRef.current = node ? context.registerPart("description") : null;
    },
    [context],
  );
  const composedRef = useMemo(
    () => composeRefs(registrationRef, ref),
    [registrationRef, ref],
  );
  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref: composedRef,
    id: context.descriptionId,
    "data-slot": dataSlot,
  };

  if (asChild) return cloneAndMerge(children, behaviorProps);
  return renderElement(render, "span", { ...behaviorProps, children });
});

markCheckboxGroupItemPart(CheckboxGroupItemDescription, "description");
