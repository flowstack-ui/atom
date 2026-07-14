"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  NavigationMenuContextProvider,
  useNavigationMenuContext,
  type ContentNodeEntry,
  type NavigationMenuContextValue,
} from "./context.js";

type NavigationMenuSubNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange">;

export interface NavigationMenuSubProps extends NavigationMenuSubNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  "data-slot"?: string;
}

export const NavigationMenuSub = forwardRef<
  HTMLDivElement,
  NavigationMenuSubProps
>(function NavigationMenuSub(
  {
    children,
    asChild,
    render,
    value: controlledValue,
    defaultValue,
    onValueChange,
    orientation,
    className,
    "data-slot": dataSlot = "navigation-menu-sub",
    ...restProps
  },
  ref,
) {
  const parentCtx = useNavigationMenuContext();
  const subOrientation = orientation ?? parentCtx.orientation;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null,
  );
  const activeValue = isControlled ? controlledValue : internalValue;
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [isSkipDelayActive, setIsSkipDelayActive] = useState(false);
  const skipDelayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const setValue = useCallback(
    (newValue: string | null) => {
      setPreviousValue(activeValue);
      if (!isControlled) setInternalValue(newValue);
      onValueChange?.(newValue);
    },
    [activeValue, isControlled, onValueChange],
  );

  const handleValueChange = useCallback(
    (newValue: string | null) => {
      setValue(newValue);

      if (newValue === null) {
        clearTimeout(skipDelayTimerRef.current);
        setIsSkipDelayActive(true);
        skipDelayTimerRef.current = setTimeout(() => {
          setIsSkipDelayActive(false);
        }, parentCtx.skipDelayDuration);
      } else {
        clearTimeout(skipDelayTimerRef.current);
      }
    },
    [parentCtx.skipDelayDuration, setValue],
  );

  const registerItem = useCallback((_value: string) => {}, []);
  const unregisterItem = useCallback((_value: string) => {}, []);

  const {
    registerItem: registerTriggerItem,
    unregisterItem: unregisterTriggerItem,
    getItem: getTriggerItem,
    getNextItem: getNextTriggerItem,
    getFirstItem: getFirstTriggerItem,
    getLastItem: getLastTriggerItem,
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

  const getNextTriggerValue = useCallback(
    (value: string, direction: "next" | "previous") =>
      getNextTriggerItem(value, direction)?.value ?? null,
    [getNextTriggerItem],
  );

  const getFirstTriggerValue = useCallback(
    () => getFirstTriggerItem()?.value ?? null,
    [getFirstTriggerItem],
  );

  const getLastTriggerValue = useCallback(
    () => getLastTriggerItem()?.value ?? null,
    [getLastTriggerItem],
  );

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
    }, parentCtx.delayDuration);
  }, [handleValueChange, parentCtx.delayDuration]);

  const cancelCloseTimer = useCallback(() => {
    clearTimeout(closeTimerRef.current);
  }, []);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useMemo(() => composeRefs(rootRef, ref), [ref]);
  const idPrefix = useId();

  useEffect(() => {
    return () => {
      clearTimeout(skipDelayTimerRef.current);
    };
  }, []);

  useDismissableLayer({
    enabled: activeValue !== null,
    onEscapeKeyDown: (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      handleValueChange(null);
    },
  });

  const contextValue: NavigationMenuContextValue = useMemo(
    () => ({
      value: activeValue,
      onValueChange: handleValueChange,
      previousValue,
      delayDuration: parentCtx.delayDuration,
      skipDelayDuration: parentCtx.skipDelayDuration,
      isSkipDelayActive,
      orientation: subOrientation,
      dir: parentCtx.dir,
      registerItem,
      unregisterItem,
      getItemValues,
      registerTrigger,
      unregisterTrigger,
      getTriggerElement,
      getNextTriggerValue,
      getFirstTriggerValue,
      getLastTriggerValue,
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
      getContentNode,
      getFirstTriggerValue,
      getItemValues,
      getLastTriggerValue,
      getNextTriggerValue,
      getTriggerElement,
      handleValueChange,
      idPrefix,
      parentCtx.delayDuration,
      parentCtx.dir,
      parentCtx.skipDelayDuration,
      isSkipDelayActive,
      previousValue,
      registerContentNode,
      registerItem,
      registerTrigger,
      startCloseTimer,
      subOrientation,
      unregisterContentNode,
      unregisterItem,
      unregisterTrigger,
    ],
  );

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-orientation": subOrientation,
    dir: parentCtx.dir,
    className,
    children,
  };

  return (
    <NavigationMenuContextProvider value={contextValue}>
      {asChild
        ? cloneAndMerge(children, behaviorProps)
        : renderElement(render, "div", behaviorProps)}
    </NavigationMenuContextProvider>
  );
});
