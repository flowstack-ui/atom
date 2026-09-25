"use client";

import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import type { StepsContextValue, StepsIds, StepsInvalidDetails, StepsOrientation } from "./context.js";
import { normalizeStep, normalizeStepsCount } from "./state.js";

export interface UseStepsProps {
  count: number;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  onStepComplete?: () => void;
  linear?: boolean;
  disabled?: boolean;
  isStepValid?: (index: number) => boolean;
  isStepSkippable?: (index: number) => boolean;
  onStepInvalid?: (details: StepsInvalidDetails) => void;
  orientation?: StepsOrientation;
  dir?: DirectionValue;
  id?: string;
  ids?: StepsIds;
}
export type UseStepsReturn = StepsContextValue;

export function useSteps({ count: countProp, step: stepProp, defaultStep = 0,
  onStepChange, onStepComplete, linear = false, disabled = false,
  isStepValid: valid, isStepSkippable: skippable, onStepInvalid,
  orientation = "horizontal", dir: dirProp, id, ids }: UseStepsProps): UseStepsReturn {
  const count = normalizeStepsCount(countProp);
  const [value, setValue] = useControllableState({ value: stepProp, defaultValue: normalizeStep(defaultStep, count), onChange: onStepChange });
  const step = normalizeStep(value, count);
  const inheritedDir = useDirection();
  const dir = dirProp ?? inheritedDir;
  const generatedId = useId();
  const idPrefix = ids?.root ?? id ?? generatedId;
  const isCompleted = step === count;
  const wasCompleted = useRef(isCompleted);
  useEffect(() => {
    const completedNow = !wasCompleted.current && isCompleted;
    wasCompleted.current = isCompleted;
    if (completedNow) onStepComplete?.();
  }, [isCompleted, onStepComplete]);
  const getId = useCallback((part: keyof StepsIds, index?: number) => {
    const supplied = ids?.[part];
    return typeof supplied === "function" ? supplied(index!) : supplied ?? (part === "root" ? idPrefix : `${idPrefix}-${part}${index === undefined ? "" : `-${index}`}`);
  }, [idPrefix, ids]);
  const isStepValid = useCallback((index: number) => valid?.(index) ?? true, [valid]);
  const isStepSkippable = useCallback((index: number) => skippable?.(index) ?? false, [skippable]);
  const navigate = useCallback((requested: number, action: StepsInvalidDetails["action"]) => {
    if (disabled || !Number.isFinite(requested)) return;
    const target = normalizeStep(requested, count);
    if (target === step) return;
    if (target > step) {
      const end = linear ? target : step + 1;
      for (let index = step; index < end; index++) {
        if (!isStepSkippable(index) && !isStepValid(index)) {
          onStepInvalid?.({ step: index, targetStep: target, action });
          return;
        }
      }
    }
    setValue(target);
  }, [count, disabled, isStepSkippable, isStepValid, linear, onStepInvalid, setValue, step]);
  const setStep = useCallback((target: number) => navigate(target, "set"), [navigate]);
  const nextStep = useCallback(() => {
    let target = step + 1;
    while (target < count && isStepSkippable(target)) target++;
    navigate(target, "next");
  }, [count, isStepSkippable, navigate, step]);
  const prevStep = useCallback(() => {
    let target = step - 1;
    while (target > 0 && isStepSkippable(target)) target--;
    navigate(target, "set");
  }, [isStepSkippable, navigate, step]);
  const resetStep = useCallback(() => navigate(0, "set"), [navigate]);
  const getItemState = useCallback((index: number) => ({ index, current: index === step,
    completed: index < step, incomplete: index > step, first: index === 0, last: index === count - 1,
    skippable: isStepSkippable(index), triggerId: getId("trigger", index), contentId: getId("content", index),
    isValid: () => isStepValid(index),
  }), [count, getId, isStepSkippable, isStepValid, step]);
  return useMemo(() => ({ step, count, isCompleted, hasNextStep: step < count, hasPrevStep: step > 0,
    disabled, orientation, dir, idPrefix, setStep, nextStep, prevStep, resetStep,
    goToNextStep: nextStep, goToPrevStep: prevStep, percent: count === 0 ? 100 : step / count * 100,
    isStepValid, isStepSkippable, getItemState, getId,
  }), [step, count, isCompleted, disabled, orientation, dir, idPrefix, setStep, nextStep, prevStep, resetStep, isStepValid, isStepSkippable, getItemState, getId]);
}
