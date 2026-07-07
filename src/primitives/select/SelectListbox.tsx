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
  autoUpdate,
  flip,
  offset,
  shift,
  size as sizeMiddleware,
  useFloating,
} from "@floating-ui/react";
import { useFocusScopeContainer } from "../../hooks/focus.js";
import { useClickAway } from "../../hooks/useClickAway.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import { Portal } from "../../utils/Portal.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useSelectContext } from "./context.js";

type SelectListboxNativeProps = NativeDivProps<"children" | "role">;

export interface SelectListboxProps extends SelectListboxNativeProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  container?: HTMLElement | null;
  disablePortal?: boolean;
  "data-slot"?: string;
}

export const SelectListbox = forwardRef<HTMLDivElement, SelectListboxProps>(
function SelectListbox(
  {
    children,
    className,
    ariaLabel,
    container,
    disablePortal = false,
    style,
    "data-slot": dataSlot = "select-listbox",
    ...restProps
  },
  ref,
) {
  const ctx = useSelectContext();
  const internalRef = useRef<HTMLDivElement>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  useFocusScopeContainer(internalRef, ctx.isOpen);
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
  useClickAway({
    refs: clickAwayRefs,
    onClickAway: ctx.onClose,
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

  const { refs, floatingStyles } = useFloating({
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
    ],
    whileElementsMounted: autoUpdate,
    open: ctx.isOpen,
  });
  const composedRef = useMemo(
    () => composeRefs(refs.setFloating, internalRef, ctx.listboxRef, ref),
    [ctx.listboxRef, ref, refs.setFloating],
  );

  if (!ctx.isOpen) return null;

  const content = (
      <div
        {...restProps}
        ref={composedRef}
        id={ctx.listboxId}
        role="listbox"
        aria-label={ariaLabel}
        tabIndex={-1}
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
  return (
    <Portal container={container} disabled={disablePortal || ctx.isInsidePortal}>
      {content}
    </Portal>
  );
});

export const SelectContent = SelectListbox;
export type SelectContentProps = SelectListboxProps;
