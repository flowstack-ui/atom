"use client";

import {
  forwardRef,
  Children,
  useCallback,
  useEffect,
  isValidElement,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  size as sizeMiddleware,
  useFloating,
  type Placement,
} from "@floating-ui/react";
import { useOutsideInteraction } from "../../hooks/useOutsideInteraction.js";
import { usePresence } from "../../hooks/usePresence.js";
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
  placement?: Placement;
  strategy?: "absolute" | "fixed";
  hideWhenDetached?: boolean;
  sameWidth?: boolean;
  forceMount?: boolean;
  onExitComplete?: () => void;
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
      placement = "bottom-start",
      strategy = "absolute",
      hideWhenDetached = false,
      sameWidth = true,
      forceMount = false,
      onExitComplete,
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
    const presence = usePresence({ present: ctx.isOpen, onExitComplete });
    const unregisterBranch = useRef<(() => void) | null>(null);
    const branchRef = useCallback((node: HTMLElement | null) => {
      unregisterBranch.current?.();
      unregisterBranch.current = node && modal ? modal.registerBranch(node) : null;
    }, [modal?.registerBranch]);
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
      if (!isOpen || highlightedValue === null) return;
      const item = getItemElement(highlightedValue);
      const content = contentRef.current;
      if (ctx.scrollToIndexFn) {
        ctx.scrollToIndexFn({ index: filteredOptions.findIndex(option => option.value === highlightedValue), value: highlightedValue });
        return;
      }
      if (!item || !content) return;

      scrollComboboxItemIntoView(item, content);
    }, [contentRef, getItemElement, highlightedValue, isOpen, ctx.scrollToIndexFn, filteredOptions]);

    const middleware = useMemo(
      () => [
        offset(sideOffset),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        ...(hideWhenDetached ? [hide({ strategy: "referenceHidden" })] : []),
        sizeMiddleware({
          apply({ rects, elements, availableHeight, availableWidth }) {
            Object.assign(elements.floating.style, {
              minWidth: sameWidth ? `${Math.min(rects.reference.width, availableWidth)}px` : "",
              "--available-height": `${Math.max(0, availableHeight)}px`,
              "--available-width": `${Math.max(0, availableWidth)}px`,
            });
          },
        }),
      ],
      [sideOffset, hideWhenDetached, sameWidth],
    );

    const { refs, floatingStyles, middlewareData, placement: resolvedPlacement, isPositioned } = useFloating({
      elements: { reference: controlRef.current ?? inputRef.current },
      placement,
      strategy,
      middleware,
      whileElementsMounted: observeComboboxPosition,
      open: isOpen,
    });

    const composedRef = useMemo(
      () => composeRefs(refs.setFloating, contentRef, branchRef, presence.ref, ref),
      [contentRef, ref, refs.setFloating, branchRef, presence.ref],
    );

    const hasContent = loading || filteredOptions.length > 0 || noOptionsText;
    if ((!presence.isPresent && !forceMount) || !hasContent) return null;

    return (
      <div
        {...restProps}
        ref={composedRef}
        data-slot={dataSlot}
        data-state={isOpen ? "open" : "closed"}
        data-placement={resolvedPlacement}
        data-side={resolvedPlacement.split("-")[0]}
        aria-hidden={!isOpen || undefined}
        inert={!isOpen || undefined}
        {...(isPositioned ? { "data-positioned": "" } : {})}
        className={className}
        style={{
          ...style,
          ...floatingStyles,
          visibility: (isOpen && !isPositioned) || middlewareData.hide?.referenceHidden ? "hidden" : style?.visibility,
          pointerEvents: isOpen ? style?.pointerEvents : "none",
        }}
      >
        {children}
      </div>
    );
  },
);
