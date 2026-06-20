import { forwardRef, type ReactNode } from "react";
import type { NativeLabelProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";

type LabelRootNativeProps = NativeLabelProps<"children">;

export interface LabelRootProps extends LabelRootNativeProps {
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Label content. */
  children?: ReactNode;
  /** Mark the associated field as disabled for data attributes. */
  disabled?: boolean;
  /** Mark the associated field as invalid for data attributes. */
  invalid?: boolean;
  /** Mark the associated field as required for data attributes. */
  required?: boolean;
  /** Mark the associated field as read-only for data attributes. */
  readOnly?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const LabelRoot = forwardRef<HTMLLabelElement, LabelRootProps>(
  function LabelRoot(
    {
      render,
      asChild,
      children,
      disabled,
      invalid,
      required,
      readOnly,
      "data-slot": dataSlot = "label",
      ...rest
    },
    ref,
  ) {
    const behaviorProps: Record<string, unknown> = {
      ...rest,
      ref,
      "data-slot": dataSlot,
      ...(disabled && { "data-disabled": "" }),
      ...(invalid && { "data-invalid": "" }),
      ...(required && { "data-required": "" }),
      ...(readOnly && { "data-readonly": "" }),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "label", {
      ...behaviorProps,
      children,
    });
  },
);
