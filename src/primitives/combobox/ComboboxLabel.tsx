"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeLabelProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useComboboxContext, useComboboxGroupContext } from "./context.js";

type ComboboxLabelNativeProps = NativeLabelProps<"children">;

export interface ComboboxLabelProps extends ComboboxLabelNativeProps {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const ComboboxLabel = forwardRef<HTMLElement, ComboboxLabelProps>(
  function ComboboxLabel(
    {
      children,
      asChild = false,
      render,
      "data-slot": dataSlot = "combobox-label",
      ...restProps
    },
    ref,
  ) {
    const ctx = useComboboxContext();
    const groupCtx = useComboboxGroupContext();
    const isGroupLabel = groupCtx !== null;

    const labelProps = {
      ...restProps,
      ref,
      id: restProps.id ?? groupCtx?.labelId,
      htmlFor: isGroupLabel ? undefined : restProps.htmlFor ?? ctx.inputId,
      "data-slot": dataSlot,
    };

    if (asChild) return cloneAndMerge(children, labelProps);

    return renderElement(render, isGroupLabel ? "div" : "label", {
      ...labelProps,
      children,
    });
  },
);
