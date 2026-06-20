"use client";

import {
  forwardRef,
  useCallback,
  useId,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  TabsContextProvider,
  type TabsActivationMode,
  type TabsContextValue,
  type TabsOrientation,
} from "./context.js";

type TabsRootNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange">;

export interface TabsRootProps extends TabsRootNativeProps {
  /** Controlled active tab value. */
  value?: string;
  /** Uncontrolled initial active tab value. */
  defaultValue?: string;
  /** Callback when active tab changes. */
  onValueChange?: (value: string) => void;
  /** Tab layout orientation. */
  orientation?: TabsOrientation;
  /** Focus activation or explicit activation. */
  activationMode?: TabsActivationMode;
  /** Arrow keys wrap from last to first. */
  loop?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Compound children. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const TabsRoot = forwardRef<HTMLDivElement, TabsRootProps>(
  function TabsRoot(
    {
      value,
      defaultValue = "",
      onValueChange,
      orientation = "horizontal",
      activationMode = "automatic",
      loop = true,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "tabs-root",
      ...restProps
    },
    ref,
  ) {
    const [activeValue, setActiveValue] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const idPrefix = useId();
    const {
      registerItem: registerCollectionTrigger,
      unregisterItem: unregisterCollectionTrigger,
      getItem: getCollectionTrigger,
      getValues: getCollectionTriggerValues,
    } = useCollection<string, HTMLButtonElement>();

    const registerTrigger = useCallback(
      (value: string, element: HTMLButtonElement) => {
        registerCollectionTrigger(value, element);
      },
      [registerCollectionTrigger],
    );

    const unregisterTrigger = useCallback(
      (value: string) => unregisterCollectionTrigger(value),
      [unregisterCollectionTrigger],
    );

    const getTriggerElement = useCallback((value: string): HTMLButtonElement | null => {
      return getCollectionTrigger(value)?.element ?? null;
    }, [getCollectionTrigger]);

    const getTriggerValues = useCallback((): string[] => {
      return getCollectionTriggerValues();
    }, [getCollectionTriggerValues]);

    const contextValue: TabsContextValue = {
      activeValue,
      registeredValues: getTriggerValues(),
      setActiveValue,
      idPrefix,
      orientation,
      activationMode,
      loop,
      registerTrigger,
      unregisterTrigger,
      getTriggerElement,
      getTriggerValues,
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      className,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <TabsContextProvider value={contextValue}>
        {element}
      </TabsContextProvider>
    );
  },
);
