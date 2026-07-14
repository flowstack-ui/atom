"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  NavigationMenuContextProvider,
  useNavigationMenuContext,
  type ContentNodeEntry,
  type NavigationMenuContextValue,
  type NavigationMenuControlType,
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
    onBlur,
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
    registerItem: registerControlItem,
    unregisterItem: unregisterControlItem,
    getItem: getControlItem,
    getNextItem: getNextControlItem,
    getFirstItem: getFirstControlItem,
    getLastItem: getLastControlItem,
    getValues: getControlValues,
  } = useCollection<string, HTMLElement, { type: NavigationMenuControlType }>();

  const getItemValues = useCallback(() => getControlValues(), [getControlValues]);

  const registerTrigger = useCallback(
    (value: string, element: HTMLButtonElement) => {
      registerControlItem(value, element, { data: { type: "trigger" } });
    },
    [registerControlItem],
  );

  const unregisterTrigger = useCallback((value: string) => {
    unregisterControlItem(value);
  }, [unregisterControlItem]);

  const registerLink = useCallback(
    (value: string, element: HTMLAnchorElement) => {
      registerControlItem(value, element, { data: { type: "link" } });
    },
    [registerControlItem],
  );

  const unregisterLink = useCallback((value: string) => {
    unregisterControlItem(value);
  }, [unregisterControlItem]);

  const getControlElement = useCallback((value: string) => {
    return getControlItem(value)?.element ?? null;
  }, [getControlItem]);

  const getControlType = useCallback((value: string) => {
    return getControlItem(value)?.data.type ?? null;
  }, [getControlItem]);

  const getTriggerElement = useCallback((value: string) => {
    const item = getControlItem(value);
    if (item?.data.type !== "trigger") return null;
    return item.element as HTMLButtonElement;
  }, [getControlItem]);

  const getNextTriggerValue = useCallback(
    (value: string, direction: "next" | "previous") =>
      getNextControlItem(value, direction, { loop: parentCtx.loop })?.value ?? null,
    [getNextControlItem, parentCtx.loop],
  );

  const getFirstTriggerValue = useCallback(
    () => getFirstControlItem()?.value ?? null,
    [getFirstControlItem],
  );

  const getLastTriggerValue = useCallback(
    () => getLastControlItem()?.value ?? null,
    [getLastControlItem],
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
      const trigger = activeValue === null ? null : getTriggerElement(activeValue);
      handleValueChange(null);
      trigger?.focus({ preventScroll: true });
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
      loop: parentCtx.loop,
      registerItem,
      unregisterItem,
      getItemValues,
      registerTrigger,
      registerLink,
      unregisterTrigger,
      unregisterLink,
      getTriggerElement,
      getControlElement,
      getControlType,
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
      getControlElement,
      getControlType,
      getFirstTriggerValue,
      getItemValues,
      getLastTriggerValue,
      getNextTriggerValue,
      getTriggerElement,
      handleValueChange,
      idPrefix,
      parentCtx.delayDuration,
      parentCtx.dir,
      parentCtx.loop,
      parentCtx.skipDelayDuration,
      isSkipDelayActive,
      previousValue,
      registerContentNode,
      registerItem,
      registerLink,
      registerTrigger,
      startCloseTimer,
      subOrientation,
      unregisterContentNode,
      unregisterItem,
      unregisterLink,
      unregisterTrigger,
    ],
  );

  const handleBlur: FocusEventHandler<HTMLDivElement> = useCallback(() => {
    requestAnimationFrame(() => {
      const root = rootRef.current;
      const activeElement = document.activeElement;

      if (!root || !(activeElement instanceof Node)) return;
      if (root.contains(activeElement)) return;

      handleValueChange(null);
    });
  }, [handleValueChange]);

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-orientation": subOrientation,
    dir: parentCtx.dir,
    className,
    onBlur: composeEventHandlers(onBlur, handleBlur),
  };

  return (
    <NavigationMenuContextProvider value={contextValue}>
      {asChild
        ? cloneAndMerge(children, behaviorProps)
        : renderElement(render, "div", { ...behaviorProps, children })}
    </NavigationMenuContextProvider>
  );
});
