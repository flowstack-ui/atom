"use client";

import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import type { NativeNavProps } from "../../utils/dom.js";
import { composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  NavigationMenuContextProvider,
  type ContentNodeEntry,
  type NavigationMenuContextValue,
} from "./context.js";

type NavigationMenuRootNativeProps = NativeNavProps<"children" | "defaultValue" | "onChange">;

export interface NavigationMenuRootProps extends NavigationMenuRootNativeProps {
  children: ReactNode;
  render?: RenderProp;
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  delayDuration?: number;
  skipDelayDuration?: number;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  className?: string;
  style?: CSSProperties;
}

export const NavigationMenuRoot = forwardRef<
  HTMLElement,
  NavigationMenuRootProps
>(function NavigationMenuRoot(
  {
    children,
    render,
    value: controlledValue,
    defaultValue,
    onValueChange,
    delayDuration = 200,
    skipDelayDuration = 300,
    orientation = "horizontal",
    dir = "ltr",
    className,
    style,
    ...restProps
  },
  ref,
) {
  const {
    "aria-label": ariaLabel = "Main",
    ...navigationProps
  } = restProps;
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null,
  );
  const activeValue = isControlled ? controlledValue : internalValue;

  const [previousValue, setPreviousValue] = useState<string | null>(null);

  const setValue = useCallback(
    (newValue: string | null) => {
      setPreviousValue(activeValue);
      if (!isControlled) setInternalValue(newValue);
      onValueChange?.(newValue);
    },
    [activeValue, isControlled, onValueChange],
  );

  const [isSkipDelayActive, setIsSkipDelayActive] = useState(false);
  const skipDelayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleValueChange = useCallback(
    (newValue: string | null) => {
      setValue(newValue);

      if (newValue === null) {
        clearTimeout(skipDelayTimerRef.current);
        setIsSkipDelayActive(true);
        skipDelayTimerRef.current = setTimeout(() => {
          setIsSkipDelayActive(false);
        }, skipDelayDuration);
      } else {
        clearTimeout(skipDelayTimerRef.current);
      }
    },
    [setValue, skipDelayDuration],
  );

  const registerItem = useCallback((_value: string) => {}, []);
  const unregisterItem = useCallback((_value: string) => {}, []);

  const {
    registerItem: registerTriggerItem,
    unregisterItem: unregisterTriggerItem,
    getItem: getTriggerItem,
    getValues: getTriggerValues,
  } = useCollection<string, HTMLButtonElement>();

  const getItemValues = useCallback(() => getTriggerValues(), [getTriggerValues]);

  const registerTrigger = useCallback(
    (value: string, element: HTMLButtonElement) => {
      registerTriggerItem(value, element);
    },
    [registerTriggerItem],
  );

  const unregisterTrigger = useCallback((value: string) => {
    unregisterTriggerItem(value);
  }, [unregisterTriggerItem]);

  const getTriggerElement = useCallback((value: string) => {
    return getTriggerItem(value)?.element ?? null;
  }, [getTriggerItem]);

  const contentNodeRegistryRef = useRef<Map<string, ContentNodeEntry>>(new Map());

  const registerContentNode = useCallback(
    (value: string, entry: ContentNodeEntry) => {
      contentNodeRegistryRef.current.set(value, entry);
    },
    [],
  );

  const unregisterContentNode = useCallback((value: string) => {
    contentNodeRegistryRef.current.delete(value);
  }, []);

  const getContentNode = useCallback((value: string) => {
    return contentNodeRegistryRef.current.get(value) ?? null;
  }, []);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const startCloseTimer = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      handleValueChange(null);
    }, delayDuration);
  }, [delayDuration, handleValueChange]);

  const cancelCloseTimer = useCallback(() => {
    clearTimeout(closeTimerRef.current);
  }, []);

  const rootRef = useRef<HTMLElement | null>(null);
  const composedRef = useMemo(() => composeRefs(rootRef, ref), [ref]);
  const idPrefix = useId();

  useEscapeKey((event) => {
    if (activeValue !== null) {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('[data-slot="navigation-menu-sub"]')
      ) {
        return;
      }

      const trigger = getTriggerElement(activeValue);
      handleValueChange(null);
      trigger?.focus();
    }
  }, activeValue !== null);

  const contextValue: NavigationMenuContextValue = useMemo(
    () => ({
      value: activeValue,
      onValueChange: handleValueChange,
      previousValue,
      delayDuration,
      skipDelayDuration,
      isSkipDelayActive,
      orientation,
      dir,
      registerItem,
      unregisterItem,
      getItemValues,
      registerTrigger,
      unregisterTrigger,
      getTriggerElement,
      registerContentNode,
      unregisterContentNode,
      getContentNode,
      startCloseTimer,
      cancelCloseTimer,
      rootRef,
      idPrefix,
    }),
    [
      activeValue,
      cancelCloseTimer,
      delayDuration,
      dir,
      getContentNode,
      getItemValues,
      getTriggerElement,
      handleValueChange,
      idPrefix,
      isSkipDelayActive,
      orientation,
      previousValue,
      registerContentNode,
      registerItem,
      registerTrigger,
      skipDelayDuration,
      startCloseTimer,
      unregisterContentNode,
      unregisterItem,
      unregisterTrigger,
    ],
  );

  const behaviorProps = {
    ...navigationProps,
    ref: composedRef,
    "data-slot": "navigation-menu",
    "data-orientation": orientation,
    dir,
    "aria-label": ariaLabel,
    className,
    style,
  };

  return (
    <NavigationMenuContextProvider value={contextValue}>
      {renderElement(render, "nav", {
        ...behaviorProps,
        children,
      })}
    </NavigationMenuContextProvider>
  );
});
