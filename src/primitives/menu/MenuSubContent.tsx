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
} from "@floating-ui/react";
import { useCollection } from "../../collection.js";
import { useFocusScopeContainer } from "../../hooks/focus.js";
import { useClickAway } from "../../hooks/useClickAway.js";
import { usePresence } from "../../hooks/usePresence.js";
import { Portal } from "../../utils/Portal.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import {
  MenuContextProvider,
  useMenuSubContext,
  type MenuContextValue,
  type MenuInitialHighlight,
} from "./context.js";

type MenuSubContentNativeProps = NativeDivProps<"children" | "role">;

export interface MenuSubContentProps extends MenuSubContentNativeProps {
  children: ReactNode;
  sideOffset?: number;
  loop?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const MenuSubContent = forwardRef<HTMLDivElement, MenuSubContentProps>(
function MenuSubContent(
  {
    children,
    sideOffset = 4,
    loop = true,
    className,
    ariaLabel,
    onKeyDown,
    style,
    ...restProps
  },
  ref,
) {
  const subCtx = useMenuSubContext();
  if (!subCtx) {
    throw new Error("MenuSubContent must be used within a MenuSubRoot");
  }

  const {
    isOpen,
    onClose,
    subMenuId,
    subTriggerId,
    subTriggerRef,
    parentMenuContext,
  } = subCtx;
  const internalRef = useRef<HTMLDivElement>(null);
  const { isPresent, ref: presenceRef } = usePresence({ present: isOpen });
  const [isPositioned, setIsPositioned] = useState(false);
  const labelRegistryRef = useRef<Map<string, string>>(new Map());
  const {
    registerItem: registerCollectionItem,
    unregisterItem: unregisterCollectionItem,
    getItem: getCollectionItem,
    getItems: getCollectionItems,
  } = useCollection<string, HTMLElement>();
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
  const [initialHighlight, setInitialHighlight] = useState<MenuInitialHighlight>("first");
  const [nestedOpenSubMenuId, setNestedOpenSubMenuId] = useState<string | null>(null);
  const typeaheadBuffer = useRef("");
  const typeaheadTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useFocusScopeContainer(internalRef, isPresent);

  const onNestedSubMenuOpen = useCallback((id: string) => setNestedOpenSubMenuId(id), []);
  const onNestedSubMenuClose = useCallback(() => setNestedOpenSubMenuId(null), []);

  const registerItem = useCallback((value: string, element: HTMLElement) => {
    registerCollectionItem(value, element);
  }, [registerCollectionItem]);

  const unregisterItem = useCallback((value: string) => {
    unregisterCollectionItem(value);
    labelRegistryRef.current.delete(value);
  }, [unregisterCollectionItem]);

  const getItemElement = useCallback((value: string) => {
    return getCollectionItem(value)?.element;
  }, [getCollectionItem]);

  const getItemValues = useCallback(() => {
    return getCollectionItems()
      .filter((item) => item.element.isConnected && !item.element.hasAttribute("data-disabled"))
      .map((item) => item.value);
  }, [getCollectionItems]);

  const registerLabel = useCallback((value: string, label: string) => {
    labelRegistryRef.current.set(value, label);
  }, []);

  const getLabel = useCallback((value: string) => {
    return labelRegistryRef.current.get(value);
  }, []);

  const onItemSelect = useCallback(
    (value: string, options?: { closeOnSelect?: boolean }) => {
      if (options?.closeOnSelect ?? true) {
        onClose();
        parentMenuContext.onItemSelect(value, { closeOnSelect: true });
      }
    },
    [onClose, parentMenuContext],
  );

  useEffect(() => {
    if (isPresent) {
      setIsPositioned(false);
      const raf = requestAnimationFrame(() => setIsPositioned(true));
      return () => cancelAnimationFrame(raf);
    }
    setIsPositioned(false);
    return undefined;
  }, [isPresent]);

  useEffect(() => {
    if (!isOpen) {
      setIsPositioned(false);
      setHighlightedValue(null);
      setInitialHighlight("first");
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isPresent) return undefined;
    const raf = requestAnimationFrame(() => {
      const values = getItemValues();
      if (values.length > 0) {
        setHighlightedValue(initialHighlight === "last" ? values[values.length - 1] : values[0]);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [getItemValues, initialHighlight, isPresent]);

  useEffect(() => {
    if (!isPresent) return undefined;
    const raf = requestAnimationFrame(() => {
      internalRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [isPresent]);

  useEffect(() => {
    if (!isOpen || !highlightedValue) return;
    const el = getItemElement(highlightedValue);
    el?.scrollIntoView({ block: "nearest" });
  }, [getItemElement, highlightedValue, isOpen]);

  const clickAwayRefs = useMemo(
    () => [internalRef, subTriggerRef],
    [subTriggerRef],
  );
  useClickAway({
    refs: clickAwayRefs,
    onClickAway: onClose,
    enabled: isOpen,
    ignore: (target) => nestedOpenSubMenuId !== null && isMenuSubContent(target),
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const values = getItemValues();
      if (values.length === 0) return;

      const currentIndex = highlightedValue ? values.indexOf(highlightedValue) : -1;

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          event.stopPropagation();
          if (currentIndex < values.length - 1) {
            setHighlightedValue(values[currentIndex + 1]);
          } else if (loop) {
            setHighlightedValue(values[0]);
          }
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          event.stopPropagation();
          if (currentIndex > 0) {
            setHighlightedValue(values[currentIndex - 1]);
          } else if (loop) {
            setHighlightedValue(values[values.length - 1]);
          }
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          parentMenuContext.contentRef.current?.focus();
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          event.stopPropagation();
          if (highlightedValue) {
            const el = getItemElement(highlightedValue);
            if (el?.dataset.slot === "menu-sub-trigger") {
              el.click();
            }
          }
          break;
        }
        case "Home": {
          event.preventDefault();
          event.stopPropagation();
          setHighlightedValue(values[0]);
          break;
        }
        case "End": {
          event.preventDefault();
          event.stopPropagation();
          setHighlightedValue(values[values.length - 1]);
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          event.stopPropagation();
          if (highlightedValue) {
            const el = getItemElement(highlightedValue);
            el?.click();
          }
          break;
        }
        case "Escape": {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          parentMenuContext.contentRef.current?.focus();
          break;
        }
        default: {
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            event.stopPropagation();
            typeaheadBuffer.current += event.key.toLowerCase();
            clearTimeout(typeaheadTimeout.current);
            typeaheadTimeout.current = setTimeout(() => {
              typeaheadBuffer.current = "";
            }, 500);
            const match = values.find((value) => {
              const label = getLabel(value) ?? value;
              return label.toLowerCase().startsWith(typeaheadBuffer.current);
            });
            if (match) setHighlightedValue(match);
          }
        }
      }
    },
    [
      getItemElement,
      getItemValues,
      getLabel,
      highlightedValue,
      loop,
      onClose,
      parentMenuContext.contentRef,
    ],
  );

  const { refs, floatingStyles, placement } = useFloating({
    placement: "right-start",
    middleware: [offset(sideOffset), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    open: isOpen,
  });

  useEffect(() => {
    refs.setReference(subTriggerRef.current);
  }, [isOpen, refs, subTriggerRef]);

  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, internalRef, presenceRef, ref),
    [presenceRef, ref, refs.setFloating],
  );

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      composedRef(node);
    },
    [composedRef],
  );

  const subMenuContext: MenuContextValue = useMemo(
    () => ({
      isOpen,
      onOpen: subCtx.onOpen,
      onClose,
      onToggle: subCtx.onToggle,
      highlightedValue,
      onHighlight: setHighlightedValue,
      initialHighlight,
      onInitialHighlight: setInitialHighlight,
      registerItem,
      unregisterItem,
      getItemElement,
      getItemValues,
      registerLabel,
      getLabel,
      onItemSelect,
      menuId: subMenuId,
      triggerId: subTriggerId,
      triggerRef: subTriggerRef,
      contentRef: internalRef,
      modal: false,
      closeOnSelect: true,
      loop,
      openSubMenuId: nestedOpenSubMenuId,
      onSubMenuOpen: onNestedSubMenuOpen,
      onSubMenuClose: onNestedSubMenuClose,
    }),
    [
      getItemElement,
      getItemValues,
      getLabel,
      highlightedValue,
      initialHighlight,
      isOpen,
      loop,
      nestedOpenSubMenuId,
      onClose,
      onItemSelect,
      onNestedSubMenuClose,
      onNestedSubMenuOpen,
      registerItem,
      registerLabel,
      subCtx.onOpen,
      subCtx.onToggle,
      subMenuId,
      subTriggerId,
      subTriggerRef,
      unregisterItem,
    ],
  );

  if (!isPresent) return null;

  return (
    <MenuContextProvider value={subMenuContext}>
      <Portal>
        <div
          {...restProps}
          ref={setFloatingRef}
          id={subMenuId}
          role="menu"
          aria-orientation="vertical"
          aria-label={ariaLabel}
          aria-labelledby={!ariaLabel ? subTriggerId : undefined}
          tabIndex={-1}
          data-slot="menu-sub-content"
          data-state={isOpen ? "open" : "closed"}
          data-side={placement.split("-")[0]}
          {...(isPositioned ? { "data-positioned": "" } : {})}
          className={className}
          style={{
            ...style,
            ...floatingStyles,
          }}
          onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
        >
          {children}
        </div>
      </Portal>
    </MenuContextProvider>
  );
});

function isMenuSubContent(target: Node): boolean {
  return target instanceof Element && target.closest('[data-slot="menu-sub-content"]') !== null;
}
