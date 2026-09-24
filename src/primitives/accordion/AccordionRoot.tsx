"use client";

import { forwardRef, useCallback, useId, type ReactNode } from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  AccordionContextProvider,
  type AccordionContextValue,
} from "./context.js";

type AccordionRootNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange">;

interface AccordionRootCommonProps extends AccordionRootNativeProps {
  ids?: { root?: string; item?: (value: string) => string; itemTrigger?: (value: string) => string; itemContent?: (value: string) => string };
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  hideMode?: "display-none" | "activity";
  onExitComplete?: (value: string) => void;
  onFocusChange?: (details: { value: string | null }) => void;
  /** Allow all items to close in single mode. */
  collapsible?: boolean;
  /** Disable all items. */
  disabled?: boolean;
  /** Arrow-key navigation direction. */
  orientation?: "vertical" | "horizontal";
  /** Text direction used for horizontal arrow-key navigation. Defaults to DirectionProvider. */
  dir?: DirectionValue;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Content. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export interface AccordionRootSingleProps extends AccordionRootCommonProps {
  /** Accordion selection mode. */
  type?: "single";
  /** Currently expanded item values in controlled mode. */
  value?: string;
  /** Initially expanded item values. */
  defaultValue?: string;
  /** Called when expanded items change. */
  onValueChange?: (value: string) => void;
}

export interface AccordionRootMultipleProps extends AccordionRootCommonProps {
  /** Accordion selection mode. */
  type: "multiple";
  /** Currently expanded item values in controlled mode. */
  value?: string[];
  /** Initially expanded item values. */
  defaultValue?: string[];
  /** Called when expanded items change. */
  onValueChange?: (value: string[]) => void;
}

export type AccordionRootProps =
  | AccordionRootSingleProps
  | AccordionRootMultipleProps;

export type UseAccordionOptions = AccordionRootProps;
export function useAccordion({
      type = "single",
      value,
      defaultValue,
      onValueChange,
      collapsible = true,
      disabled = false,
      orientation = "vertical",
      dir: dirProp,
      ids,
      lazyMount = true,
      unmountOnExit = true,
      hideMode = "display-none",
      onExitComplete,
      onFocusChange,
    }: UseAccordionOptions = {}): AccordionContextValue {
    const generatedId = useId();
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const isMultiple = type === "multiple";
    const normalizedValue: string[] | undefined =
      value === undefined
        ? undefined
        : isMultiple
          ? (value as string[])
          : value === ""
            ? []
            : [value as string];
    const normalizedDefaultValue: string[] =
      defaultValue === undefined
        ? []
        : isMultiple
          ? (defaultValue as string[])
          : defaultValue === ""
            ? []
            : [defaultValue as string];

    const handleExpandedValueChange = useCallback(
      (nextValue: string[]) => {
        if (isMultiple) {
          (onValueChange as AccordionRootMultipleProps["onValueChange"])?.(nextValue);
          return;
        }

        (onValueChange as AccordionRootSingleProps["onValueChange"])?.(
          nextValue[0] ?? "",
        );
      },
      [isMultiple, onValueChange],
    );

    const [expandedValue, setExpandedValue] = useControllableState<string[]>({
      value: normalizedValue,
      defaultValue: normalizedDefaultValue,
      onChange: handleExpandedValueChange,
    });
    const {
      registerItem: registerCollectionTrigger,
      unregisterItem: unregisterCollectionTrigger,
      getItem: getCollectionTrigger,
      getValues: getCollectionTriggerValues,
      getNextItem: getNextCollectionTrigger,
      getFirstItem: getFirstCollectionTrigger,
      getLastItem: getLastCollectionTrigger,
    } = useCollection<string, HTMLButtonElement>();

    const onToggle = useCallback(
      (itemValue: string) => {
        if (disabled) return;

        const isExpanded = expandedValue.includes(itemValue);

        if (isExpanded) {
          if (!collapsible && !isMultiple && expandedValue.length === 1) return;
          setExpandedValue(expandedValue.filter((value) => value !== itemValue));
        } else if (isMultiple) {
          setExpandedValue([...expandedValue, itemValue]);
        } else {
          setExpandedValue([itemValue]);
        }
      },
      [collapsible, disabled, expandedValue, isMultiple, setExpandedValue],
    );

    const registerTrigger = useCallback(
      (itemValue: string, element: HTMLButtonElement, triggerDisabled: boolean) => {
        registerCollectionTrigger(itemValue, element, { disabled: triggerDisabled });
      },
      [registerCollectionTrigger],
    );

    const unregisterTrigger = useCallback(
      (itemValue: string) => unregisterCollectionTrigger(itemValue),
      [unregisterCollectionTrigger],
    );

    const getTriggerValues = useCallback(
      () => getCollectionTriggerValues(),
      [getCollectionTriggerValues],
    );

    const getTriggerElement = useCallback(
      (itemValue: string) => getCollectionTrigger(itemValue)?.element ?? null,
      [getCollectionTrigger],
    );

    const getNextTriggerValue = useCallback(
      (itemValue: string, direction: "next" | "previous") =>
        getNextCollectionTrigger(itemValue, direction)?.value ?? null,
      [getNextCollectionTrigger],
    );

    const getFirstTriggerValue = useCallback(
      () => getFirstCollectionTrigger()?.value ?? null,
      [getFirstCollectionTrigger],
    );

    const getLastTriggerValue = useCallback(
      () => getLastCollectionTrigger()?.value ?? null,
      [getLastCollectionTrigger],
    );

    const contextValue: AccordionContextValue = {
      rootId: ids?.root ?? `${generatedId}-accordion`,
      ids,
      lazyMount,
      unmountOnExit,
      hideMode,
      onExitComplete,
      onFocusChange,
      setValue: (next) => {
        if (disabled) return;
        const normalized = [...new Set(next)];
        if (!collapsible && !isMultiple && expandedValue.length && !normalized.length) return;
        setExpandedValue(isMultiple ? normalized : normalized.slice(0, 1));
      },
      value: expandedValue,
      onToggle,
      multiple: isMultiple,
      collapsible,
      disabled,
      orientation,
      dir,
      registerTrigger,
      unregisterTrigger,
      getTriggerValues,
      getTriggerElement,
      getNextTriggerValue,
      getFirstTriggerValue,
      getLastTriggerValue,
    };

    return contextValue;
}

export type UseAccordionReturn = ReturnType<typeof useAccordion>;
export interface AccordionRootProviderProps extends Omit<AccordionRootCommonProps, "onFocusChange" | "onExitComplete" | "ids" | "lazyMount" | "unmountOnExit" | "hideMode" | "disabled" | "collapsible"> {
  value: UseAccordionReturn;
}
export const AccordionRootProvider = forwardRef<HTMLDivElement, AccordionRootProviderProps>(function AccordionRootProvider({ value: api, render, asChild, children, className, "data-slot": dataSlot = "accordion-root", ...props }, ref) {
    const behaviorProps: Record<string, unknown> = {
      ...props,
      ref,
      id: props.id ?? api.rootId,
      dir: api.dir,
      "data-slot": dataSlot,
      "data-orientation": api.orientation,
      ...(api.disabled ? { "data-disabled": "" } : {}),
      className,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <AccordionContextProvider value={api}>
        {element}
      </AccordionContextProvider>
    );
});

export const AccordionRoot = forwardRef<HTMLDivElement, AccordionRootProps>(function AccordionRoot(props, ref) {
  const api = useAccordion(props);
  const { type, value, defaultValue, onValueChange, collapsible, disabled, orientation, dir, ids, lazyMount, unmountOnExit, hideMode, onExitComplete, onFocusChange, ...host } = props;
  return <AccordionRootProvider {...host} ref={ref} value={api} />;
});
