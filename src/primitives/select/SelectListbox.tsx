"use client";

import { arrowOffset, autoUpdateWithArrow } from "../../utils/floatingArrowPositioning.js";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { composeRefs } from "../../utils/slot.js";
import { useSelectPresence } from "../../hooks/useSelectPresence.js";
import { revealWithin } from "../../utils/revealWithin.js";
import {
  SelectContentContextProvider,
  useSelectContext,
  type SelectContentAlign,
  type SelectContentContextValue,
  type SelectContentSide,
} from "./context.js";
import { useDirection } from "../direction/index.js";
import { resolveFloatingDirection } from "../../utils/floatingPlacement.js";

const selectFocusScopeMetadata = {
  focusContainment: "owned",
  tabParticipation: "delegate",
  scrollParticipation: "allowed",
  isolation: "owned",
} as const;

function sideFromPlacement(placement: Placement): SelectContentSide {
  return placement.split("-")[0] as SelectContentSide;
}

function alignFromPlacement(placement: Placement): SelectContentAlign {
  return (placement.split("-")[1] as SelectContentAlign | undefined) ?? "center";
}

type SelectListboxNativeProps = NativeDivProps<"children" | "role">;

export interface SelectListboxProps extends SelectListboxNativeProps {
  children: ReactNode;
  className?: string;
  container?: HTMLElement | null;
  disablePortal?: boolean;
  onInteractOutside?: (event: OutsideInteractionEvent) => void;
  "data-slot"?: string;
}

export const SelectListbox = forwardRef<HTMLDivElement, SelectListboxProps>(
function SelectListbox(
  {
    children,
    className,
    container,
    disablePortal = false,
    dir: dirProp,
    onInteractOutside,
    style,
    "data-slot": dataSlot = "select-listbox",
    ...restProps
  },
  ref,
) {
  const ctx = useSelectContext();
  const presence = useSelectPresence(ctx.isOpen, ctx.lifecycle);
  const contextDir = useDirection();
  const resolvedDir = resolveFloatingDirection(
    dirProp,
    ctx.triggerRef.current,
    contextDir,
  );
  const internalRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  useFocusScopeContainer(
    internalRef,
    ctx.isOpen,
    undefined,
    selectFocusScopeMetadata,
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
        : ctx.value && values.includes(ctx.value)
          ? ctx.value
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
  const contentContextValue = useMemo<SelectContentContextValue>(
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

  const content = (
    <SelectContentContextProvider value={contentContextValue}>
      <div
        {...restProps}
        ref={composedRef}
        id={ctx.listboxId}
        role="listbox"
        dir={resolvedDir}
        tabIndex={-1}
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
      >
        {children}
      </div>
    </SelectContentContextProvider>
  );
  return (
    <Portal container={container ?? ctx.triggerRef.current?.ownerDocument.body} disabled={disablePortal || ctx.isInsidePortal}>
      {content}
    </Portal>
  );
});

export const SelectContent = SelectListbox;
export type SelectContentProps = SelectListboxProps;
