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
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
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
    ...restProps
  },
  ref,
) {
  const ctx = useSelectContext();
  const internalRef = useRef<HTMLDivElement>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  useFocusScopeContainer(internalRef, ctx.isOpen);
  useEscapeKey(() => {
    ctx.onClose();
    ctx.triggerRef.current?.focus();
  }, ctx.isOpen);

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
    if (!ctx.isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const listbox = internalRef.current;
      const trigger = ctx.triggerRef.current;

      if (listbox && listbox.contains(target)) return;
      if (trigger && trigger.contains(target)) return;

      ctx.onClose();
    };

    const raf = requestAnimationFrame(() => {
      document.addEventListener("pointerdown", handlePointerDown);
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [ctx.isOpen, ctx.onClose, ctx.triggerRef]);

  useEffect(() => {
    if (!ctx.isOpen || !ctx.highlightedValue) return;
    const el = ctx.getItemElement(ctx.highlightedValue);
    el?.scrollIntoView({ block: "nearest" });
  }, [ctx.isOpen, ctx.highlightedValue, ctx.getItemElement]);

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
        data-slot="select-listbox"
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
