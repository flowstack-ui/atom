"use client";

import { arrowOffset, autoUpdateWithArrow } from "../../utils/floatingArrowPositioning.js";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import {
  arrow as floatingArrow,
  flip,
  hide,
  shift,
  size as sizeMiddleware,
  useFloating,
  type Placement,
} from "@floating-ui/react";
import { useFocusScopeContainer } from "../../hooks/focus.js";
import { useOutsideInteraction } from "../../hooks/useOutsideInteraction.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import type { OutsideInteractionEvent } from "../../utils/interactions.js";
import { Portal } from "../../utils/Portal.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
import { useSelectPresence } from "../../hooks/useSelectPresence.js";
import { revealWithin } from "../../utils/revealWithin.js";
import {
  MultiSelectContentContextProvider,
  useMultiSelectContext,
  type MultiSelectContentAlign,
  type MultiSelectContentContextValue,
  type MultiSelectContentSide,
} from "./context.js";
import {
  getNextMultiSelectHighlight,
  getMultiSelectTypeaheadMatch,
} from "./keyboard.js";

const multiSelectFocusScopeMetadata = {
  focusContainment: "owned",
  tabParticipation: "delegate",
  scrollParticipation: "allowed",
  isolation: "owned",
} as const;

function sideFromPlacement(placement: Placement): MultiSelectContentSide {
  return placement.split("-")[0] as MultiSelectContentSide;
}

function alignFromPlacement(placement: Placement): MultiSelectContentAlign {
  return (placement.split("-")[1] as MultiSelectContentAlign | undefined) ?? "center";
}

type MultiSelectListboxNativeProps = NativeDivProps<"children" | "role">;

export interface MultiSelectListboxProps extends MultiSelectListboxNativeProps {
  children: ReactNode;
  className?: string;
  container?: HTMLElement | null;
  disablePortal?: boolean;
  onInteractOutside?: (event: OutsideInteractionEvent) => void;
  "data-slot"?: string;
}

export const MultiSelectListbox = forwardRef<HTMLDivElement, MultiSelectListboxProps>(
function MultiSelectListbox(
  {
    children,
    className,
    container,
    disablePortal = false,
    onInteractOutside,
    onKeyDown,
    style,
    "data-slot": dataSlot = "multi-select-listbox",
    ...restProps
  },
  ref,
) {
  const ctx = useMultiSelectContext();
  const presence = useSelectPresence(ctx.isOpen, ctx.lifecycle);
  const internalRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const typeaheadBufferRef = useRef("");
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useFocusScopeContainer(
    internalRef,
    ctx.isOpen,
    undefined,
    multiSelectFocusScopeMetadata,
  );
  useDismissableLayer({
    enabled: ctx.isOpen,
    ownerDocument: ctx.listboxRef.current?.ownerDocument,
    elements: [ctx.listboxRef.current],
    onEscapeKeyDown: (event) => {
      ctx.outsideEvents.onEscapeKeyDown?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      ctx.onClose();
      ctx.triggerRef.current?.focus({ preventScroll: true });
    },
  });

  useEffect(() => {
    return () => {
      if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current);
    };
  }, []);



  useEffect(() => {
    if (!ctx.isOpen) return;
    const doc = ctx.triggerRef.current?.ownerDocument;
    const win = doc?.defaultView;
    if (!doc || !win) return;
    const onFocus = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (!target || ctx.triggerRef.current?.contains(target) || internalRef.current?.contains(target)) return;
      const notification = new win.FocusEvent("focusoutside", { cancelable: true });
      Object.defineProperty(notification, "target", { value: target });
      ctx.outsideEvents.onFocusOutside?.(notification);
      if (!notification.defaultPrevented) ctx.onClose();
    };
    doc.addEventListener("focusin", onFocus);
    return () => doc.removeEventListener("focusin", onFocus);
  }, [ctx.isOpen, ctx.onClose, ctx.outsideEvents.onFocusOutside, ctx.triggerRef]);

  const clickAwayRefs = useMemo(
    () => [internalRef, ctx.triggerRef],
    [ctx.triggerRef],
  );
  useOutsideInteraction({
    refs: clickAwayRefs,
    onPointerDownOutside: ctx.outsideEvents.onPointerDownOutside,
    onInteractOutside: (event) => {
      onInteractOutside?.(event);
      if (!event.defaultPrevented) ctx.onClose();
    },
    enabled: ctx.isOpen,
  });


  useEffect(() => {
    if (!ctx.isOpen || !ctx.openHighlightIntent || ctx.highlightedValue) return;

    const values = ctx.getEnabledItemValues();
    if (values.length === 0) return;

    const nextHighlight = ctx.openHighlightIntent === "last"
      ? values[values.length - 1]
      : ctx.openHighlightIntent === "first"
        ? values[0]
        : ctx.value.find((value) => values.includes(value))
          ? ctx.value.find((value) => values.includes(value))!
          : values[0];

    ctx.onHighlight(nextHighlight);
    ctx.clearOpenHighlightIntent();
  }, [
    ctx.clearOpenHighlightIntent,
    ctx.getEnabledItemValues,
    ctx.highlightedValue,
    ctx.isOpen,
    ctx.onHighlight,
    ctx.openHighlightIntent,
    ctx.registryVersion,
    ctx.value,
  ]);

  const { refs, floatingStyles, placement, middlewareData, isPositioned } = useFloating({
    elements: { reference: ctx.triggerRef.current },
    placement: ctx.positioning?.placement ?? "bottom-start",
    strategy: ctx.positioning?.strategy ?? "absolute",
    middleware: [
      arrowOffset(arrowRef, ctx.positioning?.gutter ?? 4),
      ctx.positioning?.flip !== false && flip({ padding: ctx.positioning?.overflowPadding ?? 8 }),
      ctx.positioning?.slide !== false && shift({ padding: ctx.positioning?.overflowPadding ?? 8 }),
      ctx.positioning?.hideWhenDetached && hide({ strategy: "referenceHidden" }),
      sizeMiddleware({
        apply({ rects, elements, availableHeight, availableWidth }) {
          Object.assign(elements.floating.style, {
            minWidth: ctx.positioning?.sameWidth === false ? "" : `${rects.reference.width}px`,
            "--anchor-width": `${rects.reference.width}px`,
            "--available-height": `${Math.max(0, availableHeight)}px`,
            "--available-width": `${Math.max(0, availableWidth)}px`,
          });
        },
      }),
      floatingArrow({ element: arrowRef, padding: 8 }),
    ],
    whileElementsMounted: autoUpdateWithArrow(arrowRef),
    open: ctx.isOpen,
  });
  useEffect(() => {
    if (!ctx.isOpen || !isPositioned) return;
    internalRef.current?.focus({ preventScroll: true });
  }, [ctx.isOpen, isPositioned]);
  useEffect(() => {
    if (!ctx.isOpen || !isPositioned || ctx.highlightedValue === null) return;
    if (ctx.scrollToIndexFn) {
      ctx.scrollToIndexFn({ index: ctx.getItemValues().indexOf(ctx.highlightedValue), value: ctx.highlightedValue });
    } else {
      revealWithin(ctx.getItemElement(ctx.highlightedValue), ctx.listboxRef.current);
    }
  }, [ctx.isOpen, isPositioned, ctx.highlightedValue, ctx.getItemElement, ctx.listboxRef, ctx.scrollToIndexFn, ctx.getItemValues]);
  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, internalRef, ctx.listboxRef, presence.ref, ref),
    [ctx.listboxRef, presence.ref, ref, refs.setFloating],
  );
  const actualSide = sideFromPlacement(placement);
  const actualAlign = alignFromPlacement(placement);
  const arrowData = middlewareData.arrow;
  const contentContextValue = useMemo<MultiSelectContentContextValue>(
    () => ({
      arrowRef,
      side: actualSide,
      align: actualAlign,
      arrowX: arrowData?.x,
      arrowY: arrowData?.y,
    }),
    [actualAlign, actualSide, arrowData?.x, arrowData?.y],
  );

  if (!presence.mounted) return null;

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const values = ctx.getEnabledItemValues();
    const current = ctx.highlightedValue ?? values[0] ?? null;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      ctx.onHighlight(getNextMultiSelectHighlight(
        values,
        current,
        event.key === "ArrowDown" ? "next" : "previous",
        ctx.loopFocus,
      ));
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      ctx.onHighlight(event.key === "Home" ? values[0] ?? null : values[values.length - 1] ?? null);
      return;
    }
    if ((event.key === " " || event.key === "Enter") && ctx.highlightedValue) {
      event.preventDefault();
      ctx.onValueChange(ctx.highlightedValue);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      ctx.onClose();
      ctx.triggerRef.current?.focus();
      return;
    }
    if (event.key === "Tab") {
      ctx.onClose();
      return;
    }
    const isAltGr = event.ctrlKey && event.altKey;
    if (event.key.length === 1 && !event.metaKey && (isAltGr || (!event.ctrlKey && !event.altKey))) {
      typeaheadBufferRef.current += event.key;
      if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current);
      typeaheadTimeoutRef.current = setTimeout(() => {
        typeaheadBufferRef.current = "";
        typeaheadTimeoutRef.current = null;
      }, 700);
      const match = getMultiSelectTypeaheadMatch(ctx, typeaheadBufferRef.current, current);
      if (match) {
        event.preventDefault();
        ctx.onHighlight(match);
      }
    }
  };

  const content = (
    <MultiSelectContentContextProvider value={contentContextValue}>
      <div
        {...restProps}
        ref={composedRef}
        id={ctx.listboxId}
        role="listbox"
        tabIndex={0}
        aria-multiselectable="true"
        aria-readonly={ctx.readOnly || undefined}
        aria-required={ctx.required || undefined}
        aria-labelledby={ctx.fieldLabelId}
        aria-describedby={ctx.fieldDescribedBy}
        aria-activedescendant={ctx.highlightedValue ? ctx.getItemId(ctx.highlightedValue) : undefined}
        data-slot={dataSlot}
        data-state={ctx.isOpen ? "open" : "closed"}
        hidden={presence.hidden}
        aria-hidden={!ctx.isOpen || undefined}
        data-side={actualSide}
        data-align={actualAlign}
        {...(isPositioned ? { "data-positioned": "" } : {})}
        className={className}
        style={{
          ...style,
          ...floatingStyles,
          visibility: middlewareData.hide?.referenceHidden ? "hidden" : style?.visibility,
        }}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      >
        {children}
      </div>
    </MultiSelectContentContextProvider>
  );
  return (
    <Portal container={container ?? ctx.triggerRef.current?.ownerDocument.body} disabled={disablePortal || ctx.isInsidePortal}>
      {content}
    </Portal>
  );
});

export const MultiSelectContent = MultiSelectListbox;
export type MultiSelectContentProps = MultiSelectListboxProps;
