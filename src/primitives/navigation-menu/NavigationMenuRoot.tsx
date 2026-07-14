"use client";

import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEventHandler,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import type { NativeNavProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  NavigationMenuContextProvider,
  type ContentNodeEntry,
  type NavigationMenuContextValue,
  type NavigationMenuControlType,
} from "./context.js";

type NavigationMenuRootNativeProps = NativeNavProps<"children" | "defaultValue" | "dir" | "onChange">;

export interface NavigationMenuRootProps extends NavigationMenuRootNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  delayDuration?: number;
  skipDelayDuration?: number;
  loop?: boolean;
  orientation?: "horizontal" | "vertical";
  dir?: DirectionValue;
  className?: string;
  style?: CSSProperties;
  "data-slot"?: string;
}

export const NavigationMenuRoot = forwardRef<
  HTMLElement,
  NavigationMenuRootProps
>(function NavigationMenuRoot(
  {
    children,
    asChild,
    render,
    value: controlledValue,
    defaultValue,
    onValueChange,
    delayDuration = 200,
    skipDelayDuration = 300,
    loop = true,
    orientation = "horizontal",
    dir: dirProp,
    className,
    style,
    onBlur,
    "data-slot": dataSlot = "navigation-menu",
    ...restProps
  },
  ref,
) {
  const contextDir = useDirection();
  const dir = dirProp ?? contextDir;
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
      getNextControlItem(value, direction)?.value ?? null,
    [getNextControlItem],
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
    }, delayDuration);
  }, [delayDuration, handleValueChange]);

  const cancelCloseTimer = useCallback(() => {
    clearTimeout(closeTimerRef.current);
  }, []);

  const rootRef = useRef<HTMLElement | null>(null);
  const composedRef = useMemo(() => composeRefs(rootRef, ref), [ref]);
  const idPrefix = useId();

  useDismissableLayer({
    enabled: activeValue !== null,
    onEscapeKeyDown: (event) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('[data-slot="navigation-menu-sub"]')
      ) {
        return;
      }

      const trigger = activeValue === null ? null : getTriggerElement(activeValue);
      handleValueChange(null);
      trigger?.focus();
    },
  });

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
      loop,
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
      delayDuration,
      dir,
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
      isSkipDelayActive,
      loop,
      orientation,
      previousValue,
      registerContentNode,
      registerItem,
      registerLink,
      registerTrigger,
      skipDelayDuration,
      startCloseTimer,
      unregisterContentNode,
      unregisterItem,
      unregisterLink,
      unregisterTrigger,
    ],
  );

  const handleBlur: FocusEventHandler<HTMLElement> = useCallback(() => {
    requestAnimationFrame(() => {
      const root = rootRef.current;
      const activeElement = document.activeElement;

      if (!root || !(activeElement instanceof Node)) return;
      if (root.contains(activeElement)) return;

      handleValueChange(null);
    });
  }, [handleValueChange]);

  const behaviorProps = {
    ...navigationProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-orientation": orientation,
    dir,
    "aria-label": ariaLabel,
    className,
    style,
    onBlur: composeEventHandlers(onBlur, handleBlur),
  };

  return (
    <NavigationMenuContextProvider value={contextValue}>
      {asChild
        ? cloneAndMerge(children, behaviorProps)
        : renderElement(render, "nav", {
            ...behaviorProps,
            children,
          })}
    </NavigationMenuContextProvider>
  );
});
