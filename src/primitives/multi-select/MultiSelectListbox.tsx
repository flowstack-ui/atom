"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
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
import { useClickAway } from "../../hooks/useClickAway.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import { Portal } from "../../utils/Portal.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers, composeRefs } from "../../utils/slot.js";
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
  "data-slot"?: string;
}

export const MultiSelectListbox = forwardRef<HTMLDivElement, MultiSelectListboxProps>(
function MultiSelectListbox(
  {
    children,
    className,
    container,
    disablePortal = false,
    onKeyDown,
    style,
    "data-slot": dataSlot = "multi-select-listbox",
    ...restProps
  },
  ref,
) {
  const ctx = useMultiSelectContext();
  const internalRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const typeaheadBufferRef = useRef("");
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  useFocusScopeContainer(
    internalRef,
    ctx.isOpen,
    undefined,
    multiSelectFocusScopeMetadata,
  );
  useDismissableLayer({
    enabled: ctx.isOpen,
    onEscapeKeyDown: () => {
      ctx.onClose();
      ctx.triggerRef.current?.focus();
    },
  });

  useEffect(() => {
    return () => {
      if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!ctx.isOpen) {
      setIsPositioned(false);
      return undefined;
    }

    setIsPositioned(false);
    const raf = requestAnimationFrame(() => setIsPositioned(true));
    return () => cancelAnimationFrame(raf);
  }, [ctx.isOpen]);

  useEffect(() => {
    if (!ctx.isOpen || !isPositioned) return;
    internalRef.current?.focus({ preventScroll: true });
  }, [ctx.isOpen, isPositioned]);

  const clickAwayRefs = useMemo(
    () => [internalRef, ctx.triggerRef],
    [ctx.triggerRef],
  );
  useClickAway({
    refs: clickAwayRefs,
    onClickAway: ctx.onClose,
    enabled: ctx.isOpen,
    deferTouch: true,
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

  if (!ctx.isOpen) return null;

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const values = ctx.getEnabledItemValues();
    const current = ctx.highlightedValue ?? values[0] ?? null;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      ctx.onHighlight(getNextMultiSelectHighlight(
        values,
        current,
        event.key === "ArrowDown" ? "next" : "previous",
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
        aria-labelledby={ctx.fieldLabelId}
        aria-describedby={ctx.fieldDescribedBy}
        aria-activedescendant={ctx.highlightedValue ? ctx.getItemId(ctx.highlightedValue) : undefined}
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
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      >
        {children}
      </div>
    </MultiSelectContentContextProvider>
  );
  return (
    <Portal container={container} disabled={disablePortal || ctx.isInsidePortal}>
      {content}
    </Portal>
  );
});

export const MultiSelectContent = MultiSelectListbox;
export type MultiSelectContentProps = MultiSelectListboxProps;
