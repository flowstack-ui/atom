"use client";

import {
  forwardRef,
  Children,
  useCallback,
  useEffect,
  isValidElement,
  useMemo,
  useRef,
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
import { useOutsideInteraction } from "../../hooks/useOutsideInteraction.js";
import type { OutsideInteractionEvent } from "../../utils/interactions.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { ComboboxEmpty } from "./ComboboxEmpty.js";
import { useComboboxContext } from "./context.js";
import { useOptionalModalContext } from "../modal/context.js";

// A wrapping composite reference can resize while size middleware paints the
// popup. Defer observer-triggered writes out of the ResizeObserver delivery cycle.
const observeComboboxPosition: typeof autoUpdate = (reference, floating, update) => {
  const view = floating?.ownerDocument.defaultView;
  if (!view) return autoUpdate(reference, floating, update);
  let frame = 0;
  const dispose = autoUpdate(reference, floating, () => {
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(() => update());
  });
  return () => {
    dispose();
    view.cancelAnimationFrame(frame);
  };
};

type ComboboxContentNativeProps = NativeDivProps<"children" | "role">;

export interface ComboboxContentProps extends ComboboxContentNativeProps {
  children?: ReactNode;
  sideOffset?: number;
  className?: string;
  onInteractOutside?: (event: OutsideInteractionEvent) => void;
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

function hasComboboxEmptyPart(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement(child)) return false;
    if (child.type === ComboboxEmpty) return true;
    const childProps = child.props as { children?: ReactNode };
    return hasComboboxEmptyPart(childProps.children);
  });
}

export const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  function ComboboxContent(
    {
      children,
      sideOffset = 4,
      className,
      onInteractOutside,
      style,
      "data-slot": dataSlot = "combobox-content",
      ...restProps
    },
    ref,
  ) {
    const ctx = useComboboxContext();
    const modal = useOptionalModalContext();
    const unregisterBranch = useRef<(() => void) | null>(null);
    const branchRef = useCallback((node: HTMLElement | null) => {
      unregisterBranch.current?.();
      unregisterBranch.current = node && modal ? modal.registerBranch(node) : null;
    }, [modal?.registerBranch]);
    const [isPositioned, setIsPositioned] = useState(false);
    const {
      contentRef,
      controlRef,
      filteredOptions,
      getItemElement,
      highlightedValue,
      inputRef,
      isOpen,
      loading,
      noOptionsText,
      onClose,
      registerEmpty,
      unregisterEmpty,
    } = ctx;

    const hasEmptyPart = useMemo(() => hasComboboxEmptyPart(children), [children]);

    useEffect(() => {
      if (!hasEmptyPart) return undefined;
      registerEmpty();
      return unregisterEmpty;
    }, [hasEmptyPart, registerEmpty, unregisterEmpty]);

    useDismissableLayer({
      enabled: isOpen,
      ownerDocument: contentRef.current?.ownerDocument,
      getElements: () => [contentRef.current],
      onEscapeKeyDown: () => {
        onClose();
        inputRef.current?.focus({ preventScroll: true });
      },
    });

    useEffect(() => {
      if (!isOpen) {
        setIsPositioned(false);
        return undefined;
      }

      setIsPositioned(false);
      const raf = requestAnimationFrame(() => setIsPositioned(true));
      return () => cancelAnimationFrame(raf);
    }, [isOpen]);

    const clickAwayRefs = useMemo(
      () => [contentRef, controlRef, inputRef],
      [contentRef, controlRef, inputRef],
    );
    useOutsideInteraction({
      refs: clickAwayRefs,
      onInteractOutside: (event) => {
        onInteractOutside?.(event);
        if (!event.defaultPrevented) onClose();
      },
      enabled: isOpen,
    });

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
      elements: { reference: controlRef.current ?? inputRef.current },
      placement: "bottom-start",
      middleware,
      whileElementsMounted: observeComboboxPosition,
      open: isOpen,
    });

    const composedRef = useMemo(
      () => composeRefs(refs.setFloating, contentRef, branchRef, ref),
      [contentRef, ref, refs.setFloating, branchRef],
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
