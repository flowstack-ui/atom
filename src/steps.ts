"use client";

import { StepsRoot, StepsList, StepsItem, StepsTrigger, StepsIndicator, StepsTitle, StepsDescription, StepsSeparator, StepsContent, StepsCompletedContent, StepsNextTrigger, StepsPrevTrigger, StepsContext, StepsItemContext } from "./primitives/steps/index.js";
export * from "./primitives/steps/index.js";
export const Steps = { Root: StepsRoot, List: StepsList, Item: StepsItem, Trigger: StepsTrigger,
  Indicator: StepsIndicator, Title: StepsTitle, Description: StepsDescription, Separator: StepsSeparator,
  Content: StepsContent, CompletedContent: StepsCompletedContent, NextTrigger: StepsNextTrigger,
  PrevTrigger: StepsPrevTrigger, Context: StepsContext, ItemContext: StepsItemContext } as const;
