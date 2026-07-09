"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Placement,
} from "@floating-ui/react";
import {
  useFocusOnMount,
  useFocusRestore,
  useFocusScopeContainer,
} from "../../hooks/focus.js";
import { useClickAway } from "../../hooks/useClickAway.js";
import { usePresence } from "../../hooks/usePresence.js";
import { useScrollLock } from "../../hooks/useScrollLock.js";
import { Portal } from "../../utils/Portal.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { getTypeaheadMatch } from "../../utils/typeahead.js";
import { useDirection } from "../direction/index.js";
import { getMenuSubmenuOpenKey, useMenuContext } from "./context.js";

export type MenuSide = "top" | "right" | "bottom" | "left";
export type MenuAlign = "start" | "center" | "end";

type MenuContentNativeProps = NativeDivProps<"children" | "role">;

export interface MenuContentProps extends MenuContentNativeProps {
  children: ReactNode;
  side?: MenuSide;
  align?: MenuAlign;
  sideOffset?: number;
  loop?: boolean;
  className?: string;
  ariaLabel?: string;
  anchorPoint?: { x: number; y: number } | null;
  onKeyDownCapture?: KeyboardEventHandler<HTMLDivElement>;
  "data-slot"?: string;
}

function toPlacement(side: MenuSide, align: MenuAlign): Placement {
  if (align === "center") return side;
  return `${side}-${align === "start" ? "start" : "end"}`;
}

function sideFromPlacement(placement: Placement): MenuSide {
  return placement.split("-")[0] as MenuSide;
}

function alignFromPlacement(placement: Placement): MenuAlign {
  const parts = placement.split("-");
  if (parts.length === 1) return "center";
  return parts[1] as MenuAlign;
}

export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(
function MenuContent(
  {
    children,
    side = "bottom",
    align = "start",
    sideOffset = 4,
    loop: loopProp,
    className,
    ariaLabel,
    anchorPoint,
    onKeyDownCapture,
    style,
    "data-slot": dataSlot = "menu-content",
    ...restProps
  },
  ref,
) {
  const ctx = useMenuContext();
  const dir = useDirection();
  const loop = loopProp ?? ctx.loop;
  const {
    contentRef,
    getItemElement,
    getItemValues,
    getLabel,
    highlightedValue,
    initialHighlight,
    isOpen,
    menuId,
    modal,
    onClose,
    onHighlight,
    openSubMenuId,
    triggerId,
    triggerRef,
  } = ctx;
  const internalRef = useRef<HTMLDivElement>(null);
  const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
  const [isPositioned, setIsPositioned] = useState(false);
  const hasAppliedInitialHighlightRef = useRef(false);
  const typeaheadBuffer = useRef("");
  const typeaheadTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useFocusRestore(isOpen, () => triggerRef.current);
  useFocusScopeContainer(internalRef, isPresent);
  useFocusOnMount(internalRef, isPresent);
  useScrollLock(isOpen && modal);

  useEffect(() => {
    if (!isPresent) return undefined;
    setIsPositioned(false);
    const raf = requestAnimationFrame(() => {
      setIsPositioned(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [isPresent]);

  useEffect(() => {
    if (!isOpen || !isPresent) {
      hasAppliedInitialHighlightRef.current = false;
      return undefined;
    }

    if (highlightedValue) {
      hasAppliedInitialHighlightRef.current = true;
      return undefined;
    }

    if (hasAppliedInitialHighlightRef.current || initialHighlight === null) return undefined;

    const raf = requestAnimationFrame(() => {
      const values = getItemValues();
      if (values.length > 0) {
        hasAppliedInitialHighlightRef.current = true;
        onHighlight(initialHighlight === "last" ? values[values.length - 1] : values[0]);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [getItemValues, highlightedValue, initialHighlight, isOpen, isPresent, onHighlight]);

  useEffect(() => {
    if (!isOpen || !highlightedValue) return;
    const el = getItemElement(highlightedValue);
    el?.scrollIntoView({ block: "nearest" });
  }, [getItemElement, highlightedValue, isOpen]);

  const clickAwayRefs = useMemo(
    () => [internalRef, triggerRef],
    [triggerRef],
  );
  useClickAway({
    refs: clickAwayRefs,
    onClickAway: onClose,
    enabled: isOpen,
    ignore: (target) => openSubMenuId !== null && isMenuSubContent(target),
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (onKeyDownCapture) {
        onKeyDownCapture(event);
        if (event.defaultPrevented) return;
      }

      const values = getItemValues();
      if (values.length === 0) return;

      const currentIndex = highlightedValue
        ? values.indexOf(highlightedValue)
        : -1;

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          if (currentIndex < values.length - 1) {
            onHighlight(values[currentIndex + 1]);
          } else if (loop) {
            onHighlight(values[0]);
          }
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          if (currentIndex > 0) {
            onHighlight(values[currentIndex - 1]);
          } else if (loop) {
            onHighlight(values[values.length - 1]);
          }
          break;
        }
        case "Home": {
          event.preventDefault();
          onHighlight(values[0]);
          break;
        }
        case "End": {
          event.preventDefault();
          onHighlight(values[values.length - 1]);
          break;
        }
        case getMenuSubmenuOpenKey(dir): {
          event.preventDefault();
          if (highlightedValue) {
            const el = getItemElement(highlightedValue);
            if (el?.dataset.slot === "menu-sub-trigger") {
              el.click();
            }
          }
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          if (highlightedValue) {
            const el = getItemElement(highlightedValue);
            el?.click();
          }
          break;
        }
        case "Tab": {
          event.preventDefault();
          onClose();
          triggerRef.current?.focus();
          break;
        }
        default: {
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            typeaheadBuffer.current += event.key.toLowerCase();

            clearTimeout(typeaheadTimeout.current);
            typeaheadTimeout.current = setTimeout(() => {
              typeaheadBuffer.current = "";
            }, 500);

            const match = getTypeaheadMatch(
              values.map((value) => ({ value, label: getLabel(value) ?? value })),
              typeaheadBuffer.current,
              highlightedValue,
            );

            if (match) onHighlight(match);
          }
        }
      }
    },
    [
      getItemElement,
      getItemValues,
      getLabel,
      highlightedValue,
      dir,
      loop,
      onClose,
      onHighlight,
      onKeyDownCapture,
      triggerRef,
    ],
  );

  const referenceElement = anchorPoint ? null : triggerRef.current;
  const { refs, floatingStyles, placement } = useFloating({
    elements: { reference: referenceElement },
    placement: toPlacement(side, align),
    middleware: [offset(sideOffset), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    open: isOpen,
  });

  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, internalRef, contentRef, presenceRef, ref),
    [contentRef, presenceRef, ref, refs.setFloating],
  );

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      composedRef(node);
    },
    [composedRef],
  );

  useEffect(() => {
    if (!anchorPoint) return;
    refs.setReference({
      getBoundingClientRect: () => ({
        x: anchorPoint.x,
        y: anchorPoint.y,
        width: 0,
        height: 0,
        top: anchorPoint.y,
        right: anchorPoint.x,
        bottom: anchorPoint.y,
        left: anchorPoint.x,
      }),
    });
  }, [anchorPoint, refs]);

  if (!isPresent) return null;

  const dataState = isOpen ? "open" : "closed";

  return (
    <Portal>
      <div
        {...restProps}
        ref={setFloatingRef}
        id={menuId}
        role="menu"
        aria-orientation="vertical"
        aria-label={ariaLabel}
        aria-labelledby={!ariaLabel && triggerRef.current ? triggerId : undefined}
        tabIndex={-1}
        data-slot={dataSlot}
        data-state={dataState}
        data-side={sideFromPlacement(placement)}
        data-align={alignFromPlacement(placement)}
        {...(isPositioned ? { "data-positioned": "" } : {})}
        className={className}
        style={{
          ...style,
          ...floatingStyles,
        }}
        onKeyDown={composeEventHandlers(restProps.onKeyDown, handleKeyDown)}
      >
        {children}
      </div>
    </Portal>
  );
});

function isMenuSubContent(target: Node): boolean {
  return target instanceof Element && target.closest("[data-menu-sub-content]") !== null;
}
