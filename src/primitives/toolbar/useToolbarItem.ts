"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import { useToolbarContext } from "./context.js";

const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface UseToolbarItemReturn {
  /** Ref to attach to the focusable element. */
  itemRef: RefObject<HTMLElement | null>;
  /** Computed tabIndex for roving focus. */
  tabIndex: number;
  /** Call on focus to update active tracking. */
  handleFocus: () => void;
}

export function useToolbarItem(disabled = false): UseToolbarItemReturn {
  const ctx = useToolbarContext();
  const itemRef = useRef<HTMLElement>(null);

  useSafeLayoutEffect(() => {
    const el = itemRef.current;
    if (el && !disabled) {
      ctx.registerItem(el);
      return () => {
        ctx.unregisterItem(el);
      };
    }
    return undefined;
  }, [disabled, ctx.registerItem, ctx.unregisterItem]);

  const el = itemRef.current;
  let tabIndex = -1;

  if (el && !disabled) {
    if (ctx.activeItem) {
      tabIndex = ctx.activeItem === el ? 0 : -1;
    } else {
      const items = ctx.getItems();
      const firstFocusable = items.find(
        (item) =>
          !(item as HTMLButtonElement).disabled &&
          item.getAttribute("aria-disabled") !== "true",
      );
      tabIndex = firstFocusable === el ? 0 : -1;
    }
  }

  const handleFocus = useCallback(() => {
    if (itemRef.current) {
      ctx.setActiveItem(itemRef.current);
    }
  }, [ctx.setActiveItem]);

  return { itemRef, tabIndex, handleFocus };
}
