"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type MutableRefObject,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useMenuContext } from "../menu/index.js";
import { useMenubarContext, useMenubarMenuContext } from "./context.js";

type MenubarTriggerNativeProps = NativeButtonProps<"children" | "disabled" | "type">;

const useSafeLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface MenubarTriggerProps extends MenubarTriggerNativeProps {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const MenubarTrigger = forwardRef<
  HTMLButtonElement,
  MenubarTriggerProps
>(function MenubarTrigger(
  {
    children,
    disabled = false,
    className,
    onClick,
    onPointerEnter,
    onFocus,
    onKeyDown,
    ...restProps
  },
  ref,
) {
  const barCtx = useMenubarContext();
  const menubarMenuCtx = useMenubarMenuContext();
  const menuCtx = useMenuContext();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const composedRef = useMemo(
    () => composeRefs(buttonRef, ref),
    [ref],
  );

  const { menuValue } = menubarMenuCtx;
  const isOpen = barCtx.openValue === menuValue;
  const { registerTrigger, unregisterTrigger } = barCtx;

  useSafeLayoutEffect(() => {
    const el = buttonRef.current;
    if (!el || disabled) return;
    registerTrigger(menuValue, el);
    return () => unregisterTrigger(menuValue);
  }, [disabled, menuValue, registerTrigger, unregisterTrigger]);

  useSafeLayoutEffect(() => {
    (menuCtx.triggerRef as MutableRefObject<HTMLElement | null>).current =
      buttonRef.current;
  }, [menuCtx.triggerRef]);

  const triggerValues = barCtx.getTriggerValues();
  const isFocused =
    barCtx.focusedValue === menuValue ||
    (barCtx.focusedValue === null && triggerValues[0] === menuValue);

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    if (disabled) return;
    if (isOpen) {
      barCtx.onMenuClose();
    } else {
      barCtx.onMenuOpen(menuValue);
    }
  }, [barCtx, disabled, isOpen, menuValue]);

  const handlePointerEnter: PointerEventHandler<HTMLButtonElement> = useCallback(() => {
    if (disabled) return;
    if (barCtx.isAnyOpen && barCtx.openValue !== menuValue) {
      barCtx.onMenuOpen(menuValue);
      buttonRef.current?.focus();
    }
  }, [barCtx, disabled, menuValue]);

  const handleFocus: FocusEventHandler<HTMLButtonElement> = useCallback(() => {
    barCtx.onFocus(menuValue);
  }, [barCtx, menuValue]);

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (disabled) return;

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          menuCtx.onInitialHighlight("first");
          barCtx.onMenuOpen(menuValue);
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          menuCtx.onInitialHighlight("last");
          barCtx.onMenuOpen(menuValue);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          barCtx.focusAdjacentTrigger(menuValue, "next");
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          barCtx.focusAdjacentTrigger(menuValue, "prev");
          break;
        }
        case "Home": {
          event.preventDefault();
          const values = barCtx.getTriggerValues();
          if (values.length > 0) {
            const firstEl = barCtx.getTriggerElement(values[0]);
            firstEl?.focus();
            barCtx.onFocus(values[0]);
            if (barCtx.isAnyOpen) barCtx.onMenuOpen(values[0]);
          }
          break;
        }
        case "End": {
          event.preventDefault();
          const values = barCtx.getTriggerValues();
          if (values.length > 0) {
            const lastEl = barCtx.getTriggerElement(values[values.length - 1]);
            lastEl?.focus();
            barCtx.onFocus(values[values.length - 1]);
            if (barCtx.isAnyOpen) {
              barCtx.onMenuOpen(values[values.length - 1]);
            }
          }
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          if (isOpen) {
            barCtx.onMenuClose();
          } else {
            barCtx.onMenuOpen(menuValue);
          }
          break;
        }
      }
    },
    [barCtx, disabled, isOpen, menuCtx, menuValue],
  );

  return (
    <button
      {...restProps}
      ref={composedRef}
      type="button"
      role="menuitem"
      id={menuCtx.triggerId}
      data-slot="menubar-trigger"
      data-state={isOpen ? "open" : "closed"}
      data-disabled={disabled ? "" : undefined}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={menuCtx.menuId}
      disabled={disabled}
      tabIndex={isFocused ? 0 : -1}
      className={className}
      onClick={composeEventHandlers(onClick, handleClick)}
      onPointerEnter={composeEventHandlers(onPointerEnter, handlePointerEnter)}
      onFocus={composeEventHandlers(onFocus, handleFocus)}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
    >
      {children}
    </button>
  );
});
