"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  MenubarContextProvider,
  type MenubarContextValue,
} from "./context.js";

type MenubarRootNativeProps = NativeDivProps<"children" | "defaultValue" | "dir" | "onChange" | "role">;

export interface MenubarRootProps extends MenubarRootNativeProps {
  children: ReactNode;
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  loop?: boolean;
  dir?: DirectionValue;
  className?: string;
  "data-slot"?: string;
}

export const MenubarRoot = forwardRef<HTMLDivElement, MenubarRootProps>(
function MenubarRoot(
  {
    children,
    value: controlledValue,
    defaultValue,
    onValueChange,
    loop = true,
    dir: dirProp,
    className,
    "data-slot": dataSlot = "menubar",
    ...restProps
  },
  ref,
) {
  const contextDir = useDirection();
  const dir = dirProp ?? contextDir;
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null,
  );
  const openValue = isControlled ? controlledValue : internalValue;

  const setOpenValue = useCallback(
    (val: string | null) => {
      if (!isControlled) setInternalValue(val);
      onValueChange?.(val);
    },
    [isControlled, onValueChange],
  );

  const onMenuOpen = useCallback(
    (val: string) => setOpenValue(val),
    [setOpenValue],
  );
  const onMenuClose = useCallback(() => setOpenValue(null), [setOpenValue]);

  const {
    version: registryVersion,
    registerItem: registerCollectionTrigger,
    unregisterItem: unregisterCollectionTrigger,
    getItem: getCollectionTrigger,
    getItems: getCollectionTriggers,
  } = useCollection<string, HTMLElement>();

  const registerTrigger = useCallback((value: string, element: HTMLElement) => {
    registerCollectionTrigger(value, element);
  }, [registerCollectionTrigger]);

  const unregisterTrigger = useCallback((value: string) => {
    unregisterCollectionTrigger(value);
    setFocusedValue((currentValue) => (currentValue === value ? null : currentValue));
  }, [unregisterCollectionTrigger]);

  const getTriggerElement = useCallback((value: string) => {
    return getCollectionTrigger(value)?.element;
  }, [getCollectionTrigger]);

  const getTriggerValues = useCallback(() => {
    return getCollectionTriggers()
      .filter((item) => {
        return item.element.isConnected && !item.element.hasAttribute("data-disabled");
      })
      .map((item) => item.value);
  }, [getCollectionTriggers]);

  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  const focusFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (focusFrameRef.current !== null) {
        cancelAnimationFrame(focusFrameRef.current);
      }
    };
  }, []);

  const onFocus = useCallback((value: string) => {
    setFocusedValue(value);
  }, []);

  const focusTrigger = useCallback((value: string) => {
    const applyFocus = () => {
      const element = getTriggerElement(value);
      if (!element) return;

      element.focus({ preventScroll: true });
      setFocusedValue(value);
    };

    applyFocus();

    if (typeof requestAnimationFrame !== "function") return;

    if (focusFrameRef.current !== null) {
      cancelAnimationFrame(focusFrameRef.current);
    }

    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      applyFocus();
    });
  }, [getTriggerElement]);

  const focusAdjacentTrigger = useCallback(
    (currentValue: string, direction: "prev" | "next") => {
      const values = getTriggerValues();
      if (values.length === 0) return;

      const currentIndex = values.indexOf(currentValue);
      if (currentIndex === -1) return;

      let nextIndex: number;
      if (direction === "next") {
        nextIndex =
          currentIndex < values.length - 1
            ? currentIndex + 1
            : loop
              ? 0
              : currentIndex;
      } else {
        nextIndex =
          currentIndex > 0
            ? currentIndex - 1
            : loop
              ? values.length - 1
              : currentIndex;
      }

      const nextValue = values[nextIndex];
      if (getTriggerElement(nextValue)) {
        focusTrigger(nextValue);

        if (openValue !== null) setOpenValue(nextValue);
      }
    },
    [focusTrigger, getTriggerElement, getTriggerValues, loop, openValue, setOpenValue],
  );

  const openAdjacentMenu = useCallback(
    (currentValue: string, direction: "prev" | "next") => {
      const values = getTriggerValues();
      if (values.length === 0) return;

      const currentIndex = values.indexOf(currentValue);
      if (currentIndex === -1) return;

      const nextIndex =
        direction === "next"
          ? currentIndex < values.length - 1
            ? currentIndex + 1
            : loop
              ? 0
              : -1
          : currentIndex > 0
            ? currentIndex - 1
            : loop
              ? values.length - 1
              : -1;

      if (nextIndex === -1) {
        onMenuClose();
        return;
      }

      const nextValue = values[nextIndex];
      focusTrigger(nextValue);
      onMenuOpen(nextValue);
    },
    [focusTrigger, getTriggerValues, loop, onMenuClose, onMenuOpen],
  );

  const contextValue: MenubarContextValue = useMemo(
    () => ({
      openValue,
      onMenuOpen,
      onMenuClose,
      isAnyOpen: openValue !== null,
      registerTrigger,
      unregisterTrigger,
      getTriggerValues,
      getTriggerElement,
      focusAdjacentTrigger,
      openAdjacentMenu,
      focusedValue,
      onFocus,
      loop,
      dir,
    }),
    [
      dir,
      focusAdjacentTrigger,
      focusedValue,
      getTriggerElement,
      getTriggerValues,
      loop,
      onFocus,
      onMenuClose,
      onMenuOpen,
      openAdjacentMenu,
      openValue,
      registerTrigger,
      registryVersion,
      unregisterTrigger,
    ],
  );

  return (
    <MenubarContextProvider value={contextValue}>
      <div
        {...restProps}
        ref={ref}
        role="menubar"
        aria-orientation="horizontal"
        dir={dir}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </div>
    </MenubarContextProvider>
  );
});
