"use client";

import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { StepsFocusProvider, StepsProvider } from "./context.js";
import { useSteps, type UseStepsProps, type UseStepsReturn } from "./controller.js";

const useSafeLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface HostProps extends NativeDivProps<"children" | "onChange" | "dir"> {
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}
export interface StepsRootProps extends HostProps, UseStepsProps {}
export interface StepsRootProviderProps extends HostProps { value: UseStepsReturn }

export const StepsRootProvider = forwardRef<HTMLDivElement, StepsRootProviderProps>(function StepsRootProvider({
  value: api, children, asChild, render, "data-slot": slot = "steps-root", ...props
}, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const removedFocus = useRef(false);
  const mergedRef = useMemo(() => composeRefs(ref, rootRef), [ref]);
  const trackRemoval = useCallback((node: HTMLElement) => {
    if (node.contains(node.ownerDocument.activeElement)) removedFocus.current = true;
  }, []);
  useSafeLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const active = root.ownerDocument.activeElement;
    const panel = active?.closest<HTMLElement>("[data-steps-panel]");
    const hiddenOwned = panel?.hidden && panel.closest("[data-steps-root]") === root;
    const removedOwned = removedFocus.current && (!active || active === root.ownerDocument.body);
    removedFocus.current = false;
    if (hiddenOwned || removedOwned) {
      Array.from(root.querySelectorAll<HTMLElement>("[data-steps-panel]:not([hidden])"))
        .find((candidate) => candidate.closest("[data-steps-root]") === root)?.focus();
    }
  }, [api.step, api.count]);
  const attributes = { ...props, ref: mergedRef, id: api.getId("root"), dir: api.dir,
    "data-slot": slot, "data-steps-root": "", "data-orientation": api.orientation,
    "data-state": api.isCompleted ? "complete" : "active", "data-disabled": api.disabled ? "" : undefined };
  return <StepsProvider.Provider value={api}><StepsFocusProvider.Provider value={trackRemoval}>
    {asChild ? cloneAndMerge(children, attributes) : renderElement(render, "div", { ...attributes, children })}
  </StepsFocusProvider.Provider></StepsProvider.Provider>;
});

export const StepsRoot = forwardRef<HTMLDivElement, StepsRootProps>(function StepsRoot({
  count, step, defaultStep, onStepChange, onStepComplete, linear, disabled,
  isStepValid, isStepSkippable, onStepInvalid, orientation, dir, id, ids, ...props
}, ref) {
  const api = useSteps({ count, step, defaultStep, onStepChange, onStepComplete, linear, disabled,
    isStepValid, isStepSkippable, onStepInvalid, orientation, dir, id, ids });
  return <StepsRootProvider {...props} ref={ref} value={api} />;
});
