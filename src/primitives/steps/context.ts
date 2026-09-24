"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DirectionValue } from "../direction/index.js";

export type StepsOrientation = "horizontal" | "vertical";
export interface StepsInvalidDetails { step: number; targetStep: number; action: "next" | "set" }
export interface StepsIds {
  root?: string;
  list?: string;
  completedContent?: string;
  trigger?: (index: number) => string;
  title?: (index: number) => string;
  description?: (index: number) => string;
  content?: (index: number) => string;
}
export interface StepsContextValue {
  step: number;
  count: number;
  isCompleted: boolean;
  hasNextStep: boolean;
  hasPrevStep: boolean;
  disabled: boolean;
  orientation: StepsOrientation;
  dir: DirectionValue;
  idPrefix: string;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetStep: () => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  percent: number;
  isStepValid: (index: number) => boolean;
  isStepSkippable: (index: number) => boolean;
  getItemState: (index: number) => StepsItemState;
  getId: (part: keyof StepsIds, index?: number) => string;
}
export interface StepsItemState {
  index: number;
  current: boolean;
  completed: boolean;
  incomplete: boolean;
  first: boolean;
  last: boolean;
  skippable: boolean;
  triggerId: string;
  contentId: string;
  isValid: () => boolean;
}
export const StepsFocusProvider = createContext<((node: HTMLElement) => void) | null>(null);
StepsFocusProvider.displayName = "StepsFocusProvider";
export const StepsProvider = createContext<StepsContextValue | null>(null);
StepsProvider.displayName = "StepsProvider";
export const StepsItemProvider = createContext<StepsItemState | null>(null);
StepsItemProvider.displayName = "StepsItemProvider";

export function useStepsContext(): StepsContextValue {
  const value = useContext(StepsProvider);
  if (!value) throw new Error("Steps parts must be used within Steps.Root.");
  return value;
}
export function useStepsItemContext(): StepsItemState {
  const value = useContext(StepsItemProvider);
  if (!value) throw new Error("Steps item parts must be used within Steps.Item.");
  return value;
}
export interface StepsContextProps { children: (context: StepsContextValue) => ReactNode }
export function StepsContext({ children }: StepsContextProps) { return children(useStepsContext()); }
export interface StepsItemContextProps { children: (context: StepsItemState) => ReactNode }
export function StepsItemContext({ children }: StepsItemContextProps) { return children(useStepsItemContext()); }
