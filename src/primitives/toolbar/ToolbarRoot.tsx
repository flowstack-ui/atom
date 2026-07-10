"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/slot.js";
import { useDirection } from "../direction/index.js";
import {
  ToolbarContextProvider,
  type ToolbarContextValue,
  type ToolbarDirection,
  type ToolbarOrientation,
} from "./context.js";

type ToolbarRootNativeProps = NativeDivProps<"children" | "dir" | "role">;

export interface ToolbarRootProps extends ToolbarRootNativeProps {
  /** Toolbar orientation. */
  orientation?: ToolbarOrientation;
  /** Text direction. */
  dir?: ToolbarDirection;
  /** Whether arrow key focus wraps around. */
  loop?: boolean;
  /** Accessible label for the toolbar. */
  ariaLabel?: string;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Toolbar items. */
  children?: ReactNode;
}

function isDisabled(el: HTMLElement): boolean {
  return (
    (el as HTMLButtonElement).disabled === true ||
    el.getAttribute("aria-disabled") === "true"
  );
}

export const ToolbarRoot = forwardRef<HTMLDivElement, ToolbarRootProps>(
  function ToolbarRoot(
    {
      orientation = "horizontal",
      dir: dirProp,
      loop = true,
      ariaLabel,
      className,
      children,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const elementValueRef = useRef<Map<HTMLElement, string>>(new Map());
    const nextValueRef = useRef(0);
    const [activeItem, setActiveItem] = useState<HTMLElement | null>(null);
    const {
      version: registeredVersion,
      registerItem: registerCollectionItem,
      unregisterItem: unregisterCollectionItem,
      getItems: getCollectionItems,
    } = useCollection<string, HTMLElement>();

    const registerItem = useCallback((element: HTMLElement) => {
      let value = elementValueRef.current.get(element);
      if (!value) {
        nextValueRef.current += 1;
        value = `toolbar-item-${nextValueRef.current}`;
        elementValueRef.current.set(element, value);
      }

      registerCollectionItem(value, element);
    }, [registerCollectionItem]);

    const unregisterItem = useCallback((element: HTMLElement) => {
      const value = elementValueRef.current.get(element);
      if (value) {
        unregisterCollectionItem(value);
        elementValueRef.current.delete(element);
      }

      setActiveItem((currentItem) => (currentItem === element ? null : currentItem));
    }, [unregisterCollectionItem]);

    const getItems = useCallback((): HTMLElement[] => {
      return getCollectionItems().map((item) => item.element);
    }, [getCollectionItems]);

    const findNext = useCallback((
      items: HTMLElement[],
      currentIndex: number,
      direction: 1 | -1,
    ): HTMLElement | null => {
      const length = items.length;
      let index = currentIndex + direction;

      for (let i = 0; i < length - 1; i += 1) {
        if (loop) {
          index = ((index % length) + length) % length;
        }

        if (index < 0 || index >= length) {
          return null;
        }

        const candidate = items[index];
        if (candidate && !isDisabled(candidate)) {
          return candidate;
        }

        index += direction;
      }

      return null;
    }, [loop]);

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback((event) => {
      const items = getItems();
      if (items.length === 0) return;

      const focused = document.activeElement as HTMLElement | null;
      const currentIndex = focused ? items.indexOf(focused) : -1;
      if (currentIndex === -1) return;

      const isHorizontal = orientation === "horizontal";
      const isRtl = dir === "rtl";
      let direction: 1 | -1 | null = null;

      if (isHorizontal) {
        if (event.key === "ArrowRight") {
          direction = isRtl ? -1 : 1;
        } else if (event.key === "ArrowLeft") {
          direction = isRtl ? 1 : -1;
        }
      } else if (event.key === "ArrowDown") {
        direction = 1;
      } else if (event.key === "ArrowUp") {
        direction = -1;
      }

      if (direction !== null) {
        event.preventDefault();
        const next = findNext(items, currentIndex, direction);
        if (next) {
          setActiveItem(next);
          next.focus();
        }
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        const first = items.find((el) => !isDisabled(el));
        if (first) {
          setActiveItem(first);
          first.focus();
        }
      } else if (event.key === "End") {
        event.preventDefault();
        const last = [...items].reverse().find((el) => !isDisabled(el));
        if (last) {
          setActiveItem(last);
          last.focus();
        }
      }
    }, [dir, findNext, getItems, orientation]);

    const contextValue: ToolbarContextValue = useMemo(
      () => ({
        orientation,
        dir,
        loop,
        registerItem,
        unregisterItem,
        getItems,
        activeItem,
        setActiveItem,
        registeredVersion,
      }),
      [
        activeItem,
        dir,
        getItems,
        loop,
        orientation,
        registerItem,
        registeredVersion,
        setActiveItem,
        unregisterItem,
      ],
    );

    return (
      <ToolbarContextProvider value={contextValue}>
        <div
          {...restProps}
          ref={ref}
          dir={dir}
          role="toolbar"
          aria-label={ariaLabel}
          aria-orientation={orientation}
          data-slot="toolbar"
          data-orientation={orientation}
          className={className}
          onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
        >
          {children}
        </div>
      </ToolbarContextProvider>
    );
  },
);
