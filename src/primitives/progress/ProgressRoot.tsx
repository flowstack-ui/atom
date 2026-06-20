"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { ProgressContextProvider } from "./context.js";
import { getProgressState } from "./utils.js";

type ProgressRootNativeProps = NativeDivProps<
  | "children"
  | "role"
  | "aria-valuemin"
  | "aria-valuemax"
  | "aria-valuenow"
  | "aria-valuetext"
>;

export interface ProgressRootProps extends ProgressRootNativeProps {
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Progress parts or custom render content. */
  children?: ReactNode;
  /** Current progress value. `null` or `undefined` means indeterminate. */
  value?: number | null;
  /** Minimum progress value. @default 0 */
  min?: number;
  /** Maximum progress value. @default 100 */
  max?: number;
  /** Human-readable value text for assistive technologies. */
  "aria-valuetext"?: string;
  /** Generate human-readable value text for assistive technologies. */
  getValueLabel?: (value: number, min: number, max: number) => string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const ProgressRoot = forwardRef<HTMLDivElement, ProgressRootProps>(
  function ProgressRoot(
    {
      render,
      asChild,
      children,
      value,
      min = 0,
      max = 100,
      "aria-valuetext": ariaValueText,
      getValueLabel,
      "data-slot": dataSlot = "progress",
      ...restProps
    },
    ref,
  ) {
    const state = useMemo(
      () => getProgressState({ value, min, max }),
      [max, min, value],
    );
    const resolvedValueText =
      ariaValueText ??
      (state.value === null ? undefined : getValueLabel?.(state.value, state.min, state.max));

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role: "progressbar",
      "aria-valuemin": state.min,
      "aria-valuemax": state.max,
      ...(state.value !== null && { "aria-valuenow": state.value }),
      ...(resolvedValueText && { "aria-valuetext": resolvedValueText }),
      "data-state": state.dataState,
      "data-slot": dataSlot,
      "data-min": state.min,
      "data-max": state.max,
      ...(state.value !== null && { "data-value": state.value }),
      ...(state.percent !== null && { "data-percent": state.percent }),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <ProgressContextProvider value={state}>
        {element}
      </ProgressContextProvider>
    );
  },
);
