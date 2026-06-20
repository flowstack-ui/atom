"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size as sizeMiddleware,
  useFloating,
} from "@floating-ui/react";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useComboboxContext } from "./context.js";

type ComboboxContentNativeProps = NativeDivProps<"children" | "role">;

export interface ComboboxContentProps extends ComboboxContentNativeProps {
  children?: ReactNode;
  sideOffset?: number;
  className?: string;
  "data-slot"?: string;
}

function getScrollableComboboxAncestor(
  element: HTMLElement,
  boundary: HTMLElement,
): HTMLElement {
  let current: HTMLElement | null = element.parentElement;

  while (current && boundary.contains(current)) {
    if (current.scrollHeight > current.clientHeight) {
      return current;
    }

    if (current === boundary) break;
    current = current.parentElement;
  }

  return boundary;
}

function scrollComboboxItemIntoView(
  item: HTMLElement,
  boundary: HTMLElement,
): void {
  const scrollParent = getScrollableComboboxAncestor(item, boundary);
  const itemRect = item.getBoundingClientRect();
  const scrollParentRect = scrollParent.getBoundingClientRect();
  const itemTop = itemRect.top - scrollParentRect.top;
  const itemBottom = itemRect.bottom - scrollParentRect.top;

  if (itemTop < 0) {
    scrollParent.scrollTop += itemTop;
  } else if (itemBottom > scrollParent.clientHeight) {
    scrollParent.scrollTop += itemBottom - scrollParent.clientHeight;
  }
}

export const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  function ComboboxContent(
    {
      children,
      sideOffset = 4,
      className,
      style,
      "data-slot": dataSlot = "combobox-content",
      ...restProps
    },
    ref,
  ) {
    const ctx = useComboboxContext();
    const [isPositioned, setIsPositioned] = useState(false);
    const {
      contentRef,
      filteredOptions,
      getItemElement,
      highlightedValue,
      inputRef,
      isOpen,
      loading,
      noOptionsText,
      onClose,
    } = ctx;

    useEscapeKey(() => {
      onClose();
      inputRef.current?.focus({ preventScroll: true });
    }, isOpen);

    useEffect(() => {
      if (!isOpen) {
        setIsPositioned(false);
        return undefined;
      }

      setIsPositioned(false);
      const raf = requestAnimationFrame(() => setIsPositioned(true));
      return () => cancelAnimationFrame(raf);
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) return undefined;

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        const content = contentRef.current;
        const input = inputRef.current;

        if (content && content.contains(target)) return;
        if (input && input.contains(target)) return;

        onClose();
      };

      const raf = requestAnimationFrame(() => {
        document.addEventListener("pointerdown", handlePointerDown);
      });

      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener("pointerdown", handlePointerDown);
      };
    }, [contentRef, inputRef, isOpen, onClose]);

    useEffect(() => {
      if (!isOpen || !highlightedValue) return;
      const item = getItemElement(highlightedValue);
      const content = contentRef.current;
      if (!item || !content) return;

      scrollComboboxItemIntoView(item, content);
    }, [contentRef, getItemElement, highlightedValue, isOpen]);

    const middleware = useMemo(
      () => [
        offset(sideOffset),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        sizeMiddleware({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              minWidth: `${rects.reference.width}px`,
            });
          },
        }),
      ],
      [sideOffset],
    );

    const { refs, floatingStyles } = useFloating({
      elements: { reference: inputRef.current },
      placement: "bottom-start",
      middleware,
      whileElementsMounted: autoUpdate,
      open: isOpen,
    });

    const composedRef = useMemo(
      () => composeRefs(refs.setFloating, contentRef, ref),
      [contentRef, ref, refs.setFloating],
    );

    const hasContent = loading || filteredOptions.length > 0 || noOptionsText;
    if (!isOpen || !hasContent) return null;

    return (
      <div
        {...restProps}
        ref={composedRef}
        data-slot={dataSlot}
        data-state="open"
        {...(isPositioned ? { "data-positioned": "" } : {})}
        className={className}
        style={{
          ...style,
          ...floatingStyles,
        }}
      >
        {children}
      </div>
    );
  },
);
