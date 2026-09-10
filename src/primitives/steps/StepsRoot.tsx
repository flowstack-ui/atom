"use client";

import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import { StepsProvider, type StepsContextValue, type StepsInvalidDetails, type StepsOrientation } from "./context.js";
import { firstInvalidStep, normalizeStep, normalizeStepsCount } from "./state.js";

export interface StepsRootProps extends NativeDivProps<"children" | "onChange" | "dir"> {
  count: number;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  onStepComplete?: () => void;
  linear?: boolean;
  disabled?: boolean;
  isStepValid?: (index: number) => boolean;
  onStepInvalid?: (details: StepsInvalidDetails) => void;
  orientation?: StepsOrientation;
  dir?: DirectionValue;
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}

export const StepsRoot = forwardRef<HTMLDivElement, StepsRootProps>(function StepsRoot({
  count: countProp, step: stepProp, defaultStep = 0, onStepChange, onStepComplete,
  linear = false, disabled = false, isStepValid, onStepInvalid,
  orientation = "horizontal", dir: dirProp, children, asChild, render,
  "data-slot": slot = "steps-root", ...props
}, ref) {
  const count = normalizeStepsCount(countProp);
  const [value, setValue] = useControllableState({ value: stepProp, defaultValue: normalizeStep(defaultStep, count), onChange: onStepChange });
  const step = normalizeStep(value, count);
  const inheritedDir = useDirection();
  const dir = dirProp ?? inheritedDir;
  const idPrefix = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMemo(() => composeRefs(ref, rootRef), [ref]);
  const isCompleted = step === count;
  const previous = useRef({ step, count, isCompleted });

  const setStep = useCallback((requested: number) => {
    if (disabled || !Number.isFinite(requested)) return;
    const target = normalizeStep(requested, count);
    if (target === step) return;
    const invalid = linear ? firstInvalidStep(step, target, isStepValid) : undefined;
    if (invalid !== undefined) { onStepInvalid?.({ step: invalid, targetStep: target }); return; }
    setValue(target);
  }, [count, disabled, isStepValid, linear, onStepInvalid, setValue, step]);
  const nextStep = useCallback(() => setStep(step + 1), [setStep, step]);
  const prevStep = useCallback(() => setStep(step - 1), [setStep, step]);
  const resetStep = useCallback(() => setStep(0), [setStep]);

  useEffect(() => {
    const changed = previous.current.step !== step || previous.current.count !== count;
    const completedNow = !previous.current.isCompleted && isCompleted;
    previous.current = { step, count, isCompleted };
    if (changed) {
      // Recover only focus that this transition hides; never steal external focus.
      const root = rootRef.current;
      const active = root?.ownerDocument.activeElement;
      const hiddenPanel = active && root?.contains(active) ? active.closest('[data-steps-panel][hidden]') : null;
      if (hiddenPanel) {
        root?.querySelector<HTMLElement>('[data-steps-panel]:not([hidden])')?.focus();
      }
    }
    if (completedNow) onStepComplete?.();
  }, [count, isCompleted, onStepComplete, step]);

  const context = useMemo<StepsContextValue>(() => ({ step, count, isCompleted,
    hasNextStep: step < count, hasPrevStep: step > 0, disabled, orientation, dir,
    idPrefix, setStep, nextStep, prevStep, resetStep,
  }), [step, count, isCompleted, disabled, orientation, dir, idPrefix, setStep, nextStep, prevStep, resetStep]);
  const attributes = { ...props, ref: mergedRef, dir, "data-slot": slot, "data-orientation": orientation,
    "data-state": isCompleted ? "complete" : "active", "data-disabled": disabled ? "" : undefined };
  return <StepsProvider.Provider value={context}>{asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children })}</StepsProvider.Provider>;
});
