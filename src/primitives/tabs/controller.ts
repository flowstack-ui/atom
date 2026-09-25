"use client";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import type {
  TabsActivationMode,
  TabsContextValue,
  TabsOrientation,
} from "./context.js";

export interface TabsIds {
  root?: string;
  list?: string;
  indicator?: string;
  trigger?: (value: string) => string;
  content?: (value: string) => string;
}
export interface UseTabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  dir?: DirectionValue;
  activationMode?: TabsActivationMode;
  loop?: boolean;
  loopFocus?: boolean;
  deselectable?: boolean;
  composite?: boolean;
  onFocusChange?: (details: { focusedValue: string }) => void;
  navigate?: (details: {
    value: string;
    node: HTMLAnchorElement;
    href: string;
  }) => void;
  id?: string;
  ids?: TabsIds;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  hideMode?: "display-none" | "activity";
  onExitComplete?: () => void;
}
export type UseTabsReturn = TabsContextValue;
export function isTabDisabled(element: HTMLElement | null): boolean {
  return (
    !element ||
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true"
  );
}
export function useTabs(options: UseTabsProps = {}): UseTabsReturn {
  const generatedId = useId();
  const idPrefix = options.id ?? generatedId;
  const direction = useDirection();
  const [value, setValue] = useControllableState({
    value: options.value,
    defaultValue: options.defaultValue ?? "",
    onChange: options.onValueChange,
  });
  const [focusedValue, updateFocus] = useState("");
  const focusValueRef = useRef("");
  const [indicatorReady, setIndicatorReady] = useState(false);
  const listRef = useRef<HTMLElement | null>(null);
  const collection = useCollection<string, HTMLButtonElement>();
  const current = useRef(options);
  current.current = options;
  const getTriggerElement = useCallback(
    (key: string) => collection.getItem(key)?.element ?? null,
    [collection.getItem],
  );
  const registerTrigger = useCallback(
    (key: string, node: HTMLButtonElement) =>
      collection.registerItem(key, node),
    [collection.registerItem],
  );
  const getId = useCallback(
    (part: "root" | "list" | "trigger" | "content" | "indicator", key = "") => {
      const override = current.current.ids?.[part];
      if (typeof override === "function") return override(key);
      if (override) return override;
      if (part === "root") return idPrefix;
      // Code-point encoding prevents whitespace and escape-looking value collisions.
      const safe = /^[a-zA-Z0-9_-]+$/.test(key)
        ? key
        : `~${Array.from(key, (char) => char.codePointAt(0)!.toString(16)).join("-")}`;
      return `${idPrefix}-${part === "content" ? "panel" : part}${part === "trigger" || part === "content" ? `-${safe}` : ""}`;
    },
    [idPrefix],
  );
  const setFocusedValue = useCallback((next: string) => {
    if (focusValueRef.current === next) return;
    focusValueRef.current = next;
    updateFocus(next);
    current.current.onFocusChange?.({ focusedValue: next });
  }, []);
  const focus = useCallback(
    (key: string) => {
      const node = getTriggerElement(key);
      if (!node || isTabDisabled(node)) return;
      node.focus({ preventScroll: true });
      const list = listRef.current;
      if (list) {
        const target = node.getBoundingClientRect(),
          viewport = list.getBoundingClientRect();
        if (target.left < viewport.left)
          list.scrollLeft += target.left - viewport.left;
        else if (target.right > viewport.right)
          list.scrollLeft += target.right - viewport.right;
        if (target.top < viewport.top)
          list.scrollTop += target.top - viewport.top;
        else if (target.bottom > viewport.bottom)
          list.scrollTop += target.bottom - viewport.bottom;
      }
      setFocusedValue(key);
    },
    [getTriggerElement, setFocusedValue],
  );
  const select = useCallback(
    (key: string, node?: HTMLElement) => {
      const target = node ?? getTriggerElement(key);
      if (target && isTabDisabled(target)) return;
      setValue(current.current.deselectable && key === value ? "" : key);
      if (target?.tagName === "A" && current.current.navigate) {
        const anchor = target as HTMLAnchorElement;
        current.current.navigate({
          value: key,
          node: anchor,
          href: anchor.href,
        });
      }
    },
    [getTriggerElement, setValue, value],
  );
  return useMemo(
    () => ({
      value,
      activeValue: value,
      setValue,
      setActiveValue: setValue,
      clearValue: () => setValue(""),
      focusedValue,
      setFocusedValue,
      focus,
      select,
      idPrefix,
      getId,
      listRef,
      indicatorReady,
      setIndicatorReady,
      collectionVersion: collection.version,
      registeredValues: collection.getValues(),
      registerTrigger,
      unregisterTrigger: collection.unregisterItem,
      getTriggerElement,
      getTriggerValues: collection.getValues,
      orientation: options.orientation ?? "horizontal",
      dir: options.dir ?? direction,
      activationMode: options.activationMode ?? "automatic",
      loop: options.loopFocus ?? options.loop ?? true,
      composite: options.composite ?? true,
      hasNavigate: Boolean(options.navigate),
      lazyMount: options.lazyMount,
      unmountOnExit: options.unmountOnExit,
      hideMode: options.hideMode ?? "display-none",
      onExitComplete: options.onExitComplete,
    }),
    [
      value,
      setValue,
      focusedValue,
      setFocusedValue,
      focus,
      select,
      idPrefix,
      getId,
      indicatorReady,
      collection.version,
      collection.getValues,
      collection.unregisterItem,
      registerTrigger,
      getTriggerElement,
      options.orientation,
      options.dir,
      direction,
      options.activationMode,
      options.loopFocus,
      options.loop,
      options.composite,
      options.navigate,
      options.lazyMount,
      options.unmountOnExit,
      options.hideMode,
      options.onExitComplete,
    ],
  );
}
