"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import {
  useNavigationMenuContext,
  useOptionalNavigationMenuItemContext,
} from "./context.js";
import type { NativeAnchorProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";

type NavigationMenuLinkNativeProps = NativeAnchorProps<"children" | "href">;

export interface NavigationMenuLinkProps extends NavigationMenuLinkNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  href?: string;
  active?: boolean;
  onSelect?: () => void;
  className?: string;
  "data-slot"?: string;
}

export const NavigationMenuLink = forwardRef<
  HTMLAnchorElement,
  NavigationMenuLinkProps
>(function NavigationMenuLink(
  {
    children,
    asChild,
    render,
    href,
    active = false,
    onSelect,
    className,
    onClick,
    onKeyDown,
    "data-slot": dataSlot = "navigation-menu-link",
    ...restProps
  },
  ref,
) {
  const ctx = useNavigationMenuContext();
  const itemCtx = useOptionalNavigationMenuItemContext();
  const value = itemCtx?.value;
  const internalRef = useRef<HTMLAnchorElement>(null);
  const composedRef = useMemo(() => composeRefs(internalRef, ref), [ref]);
  const {
    dir,
    getFirstTriggerValue,
    getLastTriggerValue,
    getControlElement,
    getNextTriggerValue,
    onValueChange,
    orientation,
    registerLink,
    unregisterLink,
    value: activeValue,
  } = ctx;

  useEffect(() => {
    const element = internalRef.current;
    if (!value || !element) return undefined;

    registerLink(value, element);
    return () => unregisterLink(value);
  }, [registerLink, unregisterLink, value]);

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      onClick?.(event);
      onSelect?.();

      if (activeValue !== null) {
        onValueChange(null);
      }
    },
    [activeValue, onClick, onSelect, onValueChange],
  );

  const focusControl = useCallback(
    (nextValue: string | null) => {
      if (nextValue === null) return;

      const control = getControlElement(nextValue);
      if (!control) return;

      control.focus({ preventScroll: true });

      if (activeValue !== null) {
        onValueChange(null);
      }
    },
    [activeValue, getControlElement, onValueChange],
  );

  const handleKeyDown: KeyboardEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      if (!value) return;

      switch (event.key) {
        case "ArrowRight": {
          if (orientation !== "horizontal") break;
          event.preventDefault();
          focusControl(getNextTriggerValue(value, dir === "rtl" ? "previous" : "next"));
          break;
        }
        case "ArrowLeft": {
          if (orientation !== "horizontal") break;
          event.preventDefault();
          focusControl(getNextTriggerValue(value, dir === "rtl" ? "next" : "previous"));
          break;
        }
        case "ArrowDown": {
          if (orientation !== "vertical") break;
          event.preventDefault();
          focusControl(getNextTriggerValue(value, "next"));
          break;
        }
        case "ArrowUp": {
          if (orientation !== "vertical") break;
          event.preventDefault();
          focusControl(getNextTriggerValue(value, "previous"));
          break;
        }
        case "Home": {
          event.preventDefault();
          focusControl(getFirstTriggerValue());
          break;
        }
        case "End": {
          event.preventDefault();
          focusControl(getLastTriggerValue());
          break;
        }
        case "Escape": {
          if (activeValue === null) break;
          event.preventDefault();
          onValueChange(null);
          internalRef.current?.focus({ preventScroll: true });
          break;
        }
      }
    },
    [
      activeValue,
      dir,
      focusControl,
      getFirstTriggerValue,
      getLastTriggerValue,
      getNextTriggerValue,
      onValueChange,
      orientation,
      value,
    ],
  );

  const behaviorProps: Record<string, unknown> = {
    ...restProps,
    ref: composedRef,
    ...(!asChild && href !== undefined ? { href } : {}),
    "data-slot": dataSlot,
    "data-active": active ? "" : undefined,
    "aria-current": active ? "page" : undefined,
    className,
    onClick: handleClick,
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
  };

  if (asChild) {
    return cloneAndMerge(children, behaviorProps);
  }

  return renderElement(render, "a", { ...behaviorProps, children });
});
