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

type CheckboxGroupItemLabelNativeProps = NativeSpanProps<"children">;

export interface CheckboxGroupItemLabelProps
  extends CheckboxGroupItemLabelNativeProps {
  children: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const CheckboxGroupItemLabel = forwardRef<
  HTMLSpanElement,
  CheckboxGroupItemLabelProps
>(function CheckboxGroupItemLabel(
  {
    children,
    render,
    asChild,
    "data-slot": dataSlot = "checkbox-group-item-label",
    ...restProps
  },
  ref,
) {
  const context = useCheckboxGroupItemContext();
  const unregisterRef = useRef<(() => void) | null>(null);
  const registrationRef = useCallback(
    (node: HTMLSpanElement | null) => {
      unregisterRef.current?.();
      unregisterRef.current = node ? context.registerPart("label") : null;
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
    id: context.labelId,
    "data-slot": dataSlot,
  };

  if (asChild) return cloneAndMerge(children, behaviorProps);
  return renderElement(render, "span", { ...behaviorProps, children });
});

markCheckboxGroupItemPart(CheckboxGroupItemLabel, "label");
