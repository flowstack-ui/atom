"use client";

import { forwardRef, useMemo, type ComponentPropsWithoutRef } from "react";
import { cloneAndMerge, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { StepsItemProvider, useStepsContext, useStepsItemContext, type StepsItemState } from "./context.js";

interface CompositionProps { asChild?: boolean; render?: RenderProp; "data-slot"?: string }
type SpanProps = ComponentPropsWithoutRef<"span"> & CompositionProps;
function stateAttributes(state: StepsItemState) {
  return { "data-index": state.index, "data-state": state.current ? "current" : state.completed ? "complete" : "incomplete",
    "data-current": state.current ? "" : undefined, "data-complete": state.completed ? "" : undefined,
    "data-incomplete": state.incomplete ? "" : undefined };
}
export interface StepsListProps extends ComponentPropsWithoutRef<"ol">, CompositionProps {}
export const StepsList = forwardRef<HTMLOListElement, StepsListProps>(function StepsList({ asChild, render, children, "data-slot": slot = "steps-list", ...props }, ref) {
  const { orientation } = useStepsContext();
  const attrs = { ...props, ref, "data-slot": slot, "data-orientation": orientation };
  return asChild ? cloneAndMerge(children, attrs) : renderElement(render, "ol", { ...attrs, children });
});
export interface StepsItemProps extends ComponentPropsWithoutRef<"li">, CompositionProps { index: number }
export const StepsItem = forwardRef<HTMLLIElement, StepsItemProps>(function StepsItem({ index, asChild, render, children, "data-slot": slot = "steps-item", ...props }, ref) {
  const { step, count, orientation } = useStepsContext();
  if (!Number.isInteger(index) || index < 0 || index >= count) throw new Error("Steps.Item index must be an integer within count.");
  const state = useMemo(() => ({ index, current: index === step, completed: index < step, incomplete: index > step }), [index, step]);
  const attrs = { ...props, ref, "data-slot": slot, "data-orientation": orientation, ...stateAttributes(state), "aria-current": state.current ? "step" as const : undefined };
  return <StepsItemProvider.Provider value={state}>{asChild ? cloneAndMerge(children, attrs) : renderElement(render, "li", { ...attrs, children })}</StepsItemProvider.Provider>;
});
export interface StepsIndicatorProps extends SpanProps {}
export const StepsIndicator = forwardRef<HTMLSpanElement, StepsIndicatorProps>(function StepsIndicator({ asChild, render, children, "data-slot": slot = "steps-indicator", ...props }, ref) {
  const state = useStepsItemContext();
  const attrs = { ...props, ref, "data-slot": slot, ...stateAttributes(state), "aria-hidden": true };
  return asChild ? cloneAndMerge(children, attrs) : renderElement(render, "span", { ...attrs, children: children ?? state.index + 1 });
});
export interface StepsTitleProps extends SpanProps {}
export const StepsTitle = forwardRef<HTMLSpanElement, StepsTitleProps>(function StepsTitle({ asChild, render, children, "data-slot": slot = "steps-title", ...props }, ref) {
  const { idPrefix } = useStepsContext();
  const state = useStepsItemContext();
  const attrs = { ...props, ref, id: `${idPrefix}-title-${state.index}`, "data-slot": slot, ...stateAttributes(state) };
  return asChild ? cloneAndMerge(children, attrs) : renderElement(render, "span", { ...attrs, children });
});
export interface StepsDescriptionProps extends SpanProps {}
export const StepsDescription = forwardRef<HTMLSpanElement, StepsDescriptionProps>(function StepsDescription({ asChild, render, children, "data-slot": slot = "steps-description", ...props }, ref) {
  const state = useStepsItemContext();
  const attrs = { ...props, ref, "data-slot": slot, ...stateAttributes(state) };
  return asChild ? cloneAndMerge(children, attrs) : renderElement(render, "span", { ...attrs, children });
});
export interface StepsSeparatorProps extends SpanProps {}
export const StepsSeparator = forwardRef<HTMLSpanElement, StepsSeparatorProps>(function StepsSeparator({ asChild, render, children, "data-slot": slot = "steps-separator", ...props }, ref) {
  const state = useStepsItemContext();
  const { orientation, count } = useStepsContext();
  const attrs = { ...props, ref, "data-slot": slot, ...stateAttributes(state), "data-orientation": orientation, "aria-hidden": true, hidden: state.index === count - 1 || undefined };
  return asChild ? cloneAndMerge(children, attrs) : renderElement(render, "span", { ...attrs, children });
});
export interface StepsTriggerProps extends Omit<ComponentPropsWithoutRef<"button">, "type">, CompositionProps {}
export const StepsTrigger = forwardRef<HTMLButtonElement, StepsTriggerProps>(function StepsTrigger({ asChild, render, children, disabled, onClick, "data-slot": slot = "steps-trigger", ...props }, ref) {
  const state = useStepsItemContext();
  const root = useStepsContext();
  const isDisabled = disabled || root.disabled;
  const attrs = { ...props, ref, "data-slot": slot, ...stateAttributes(state), type: "button", disabled: isDisabled,
    "data-disabled": isDisabled ? "" : undefined,
    onClick: composeEventHandlers(onClick, () => { if (!isDisabled) root.setStep(state.index); }) };
  return asChild ? cloneAndMerge(children, attrs) : renderElement(render, "button", { ...attrs, children });
});

export interface StepsContentProps extends ComponentPropsWithoutRef<"div">, CompositionProps { index: number; keepMounted?: boolean }
export const StepsContent = forwardRef<HTMLDivElement, StepsContentProps>(function StepsContent({ index, keepMounted = true, asChild, render, children, "data-slot": slot = "steps-content", ...props }, ref) {
  const { step, count, idPrefix } = useStepsContext();
  if (!Number.isInteger(index) || index < 0 || index >= count) throw new Error("Steps.Content index must be an integer within count.");
  const active = index === step;
  if (!keepMounted && !active) return null;
  const attrs = { ...props, ref, id: `${idPrefix}-content-${index}`, role: "group", tabIndex: props.tabIndex ?? -1,
    "aria-labelledby": props["aria-label"] ? undefined : props["aria-labelledby"] ?? `${idPrefix}-title-${index}`,
    "data-slot": slot, "data-steps-panel": "", "data-state": active ? "active" : "inactive", hidden: !active || undefined };
  return asChild ? cloneAndMerge(children, attrs) : renderElement(render, "div", { ...attrs, children });
});
export interface StepsCompletedContentProps extends ComponentPropsWithoutRef<"div">, CompositionProps { keepMounted?: boolean }
export const StepsCompletedContent = forwardRef<HTMLDivElement, StepsCompletedContentProps>(function StepsCompletedContent({ keepMounted = true, asChild, render, children, "data-slot": slot = "steps-completed-content", ...props }, ref) {
  const { isCompleted } = useStepsContext();
  if (!keepMounted && !isCompleted) return null;
  const attrs = { ...props, ref, role: "group", tabIndex: props.tabIndex ?? -1, "data-slot": slot, "data-steps-panel": "",
    "data-state": isCompleted ? "active" : "inactive", hidden: !isCompleted || undefined };
  return asChild ? cloneAndMerge(children, attrs) : renderElement(render, "div", { ...attrs, children });
});

export interface StepsNextTriggerProps extends StepsTriggerProps {}
export const StepsNextTrigger = forwardRef<HTMLButtonElement, StepsNextTriggerProps>(function StepsNextTrigger({ asChild, render, children, disabled, onClick, "data-slot": slot = "steps-next-trigger", ...props }, ref) {
  const root = useStepsContext();
  const isDisabled = disabled || root.disabled || !root.hasNextStep;
  const attrs = { ...props, ref, type: "button", disabled: isDisabled, "data-slot": slot,
    "data-disabled": isDisabled ? "" : undefined, onClick: composeEventHandlers(onClick, () => { if (!isDisabled) root.nextStep(); }) };
  return asChild ? cloneAndMerge(children, attrs) : renderElement(render, "button", { ...attrs, children });
});
export interface StepsPrevTriggerProps extends StepsTriggerProps {}
export const StepsPrevTrigger = forwardRef<HTMLButtonElement, StepsPrevTriggerProps>(function StepsPrevTrigger({ asChild, render, children, disabled, onClick, "data-slot": slot = "steps-prev-trigger", ...props }, ref) {
  const root = useStepsContext();
  const isDisabled = disabled || root.disabled || !root.hasPrevStep;
  const attrs = { ...props, ref, type: "button", disabled: isDisabled, "data-slot": slot,
    "data-disabled": isDisabled ? "" : undefined, onClick: composeEventHandlers(onClick, () => { if (!isDisabled) root.prevStep(); }) };
  return asChild ? cloneAndMerge(children, attrs) : renderElement(render, "button", { ...attrs, children });
});
