"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  arrow as floatingArrow,
  autoUpdate,
  flip,
  offset,
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
  const contextDir = useDirection();
  const resolvedDir = resolveFloatingDirection(
    dirProp,
    ctx.triggerRef.current,
    contextDir,
  );
  const internalRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  useFocusScopeContainer(
    internalRef,
    ctx.isOpen,
    undefined,
    selectFocusScopeMetadata,
  );
  useDismissableLayer({
    enabled: ctx.isOpen,
    onEscapeKeyDown: () => {
      ctx.onClose();
      ctx.triggerRef.current?.focus();
    },
  });

  useEffect(() => {
    if (!ctx.isOpen) {
      setIsPositioned(false);
      return undefined;
    }

    setIsPositioned(false);
    const raf = requestAnimationFrame(() => setIsPositioned(true));
    return () => cancelAnimationFrame(raf);
  }, [ctx.isOpen]);

  const clickAwayRefs = useMemo(
    () => [internalRef, ctx.triggerRef],
    [ctx.triggerRef],
  );
  useOutsideInteraction({
    refs: clickAwayRefs,
    onInteractOutside: (event) => {
      onInteractOutside?.(event);
      if (!event.defaultPrevented) ctx.onClose();
    },
    enabled: ctx.isOpen,
  });

  useEffect(() => {
    if (!ctx.isOpen || !ctx.highlightedValue) return;
    const el = ctx.getItemElement(ctx.highlightedValue);
    el?.scrollIntoView({ block: "nearest" });
  }, [ctx.isOpen, ctx.highlightedValue, ctx.getItemElement]);

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

  const { refs, floatingStyles, placement, middlewareData } = useFloating({
    elements: { reference: ctx.triggerRef.current },
    placement: "bottom-start",
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      sizeMiddleware({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
          });
        },
      }),
      floatingArrow({ element: arrowRef, padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
    open: ctx.isOpen,
  });
  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, internalRef, ctx.listboxRef, ref),
    [ctx.listboxRef, ref, refs.setFloating],
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

  if (!ctx.isOpen) return null;

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
        data-state="open"
        data-side={actualSide}
        data-align={actualAlign}
        {...(isPositioned ? { "data-positioned": "" } : {})}
        className={className}
        style={{
          ...style,
          ...floatingStyles,
        }}
      >
        {children}
      </div>
    </SelectContentContextProvider>
  );
  return (
    <Portal container={container} disabled={disablePortal || ctx.isInsidePortal}>
      {content}
    </Portal>
  );
});

export const SelectContent = SelectListbox;
export type SelectContentProps = SelectListboxProps;
