"use client";

import { forwardRef, type ReactNode, type Ref } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { ProgressContextProvider } from "./context.js";
import { useProgress, type UseProgressProps, type ProgressController } from "./useProgress.js";

type ProgressRootNativeProps = NativeDivProps<
  | "children"
  | "defaultValue"
  | "role"
  | "aria-valuemin"
  | "aria-valuemax"
  | "aria-valuenow"
  | "aria-valuetext"
>;

export interface ProgressRootProps extends ProgressRootNativeProps, UseProgressProps {
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

function renderProgressRoot(
  state: ProgressController,
  {
    render, asChild, children, "aria-valuetext": ariaValueText,
    getValueLabel, "data-slot": dataSlot = "progress", ...restProps
  }: Omit<ProgressRootProps, keyof UseProgressProps>,
  ref: Ref<HTMLDivElement>,
) {
  const resolvedValueText = ariaValueText ?? (state.value === null ? undefined : getValueLabel?.(state.value, state.min, state.max));
  const behaviorProps: Record<string, unknown> = {
    ...restProps, ref,
    id: restProps.id ?? state.ids.root,
    role: "progressbar",
    "aria-valuemin": state.min, "aria-valuemax": state.max,
    "aria-valuenow": state.value,
    "aria-valuetext": resolvedValueText,
    "data-state": state.dataState, "data-slot": dataSlot,
    "data-min": state.min, "data-max": state.max,
    "data-value": state.value,
    "data-percent": state.percent,
  };
  const element = asChild ? cloneAndMerge(children, behaviorProps)
    : renderElement(render, "div", { ...behaviorProps, children });
  return <ProgressContextProvider value={state}>{element}</ProgressContextProvider>;
}

export const ProgressRoot = forwardRef<HTMLDivElement, ProgressRootProps>(
  function ProgressRoot(
    {
      value,
      defaultValue,
      onValueChange,
      ids,
      min = 0,
      max = 100,
      ...restProps
    },
    ref,
  ) {
    const state = useProgress({ value, defaultValue, onValueChange, ids, min, max });
    return renderProgressRoot(state, restProps, ref);
  },
);

export interface ProgressRootProviderProps extends Omit<ProgressRootProps, keyof UseProgressProps> {
  value: ProgressController;
}

export const ProgressRootProvider = forwardRef<HTMLDivElement, ProgressRootProviderProps>(
  function ProgressRootProvider({ value, ...props }, ref) {
    return renderProgressRoot(value, props, ref);
  },
);
