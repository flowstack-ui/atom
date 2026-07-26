"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { NativeButtonProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/slot.js";
import { useMultiSelectContext } from "./context.js";

type MultiSelectScrollButtonNativeProps = NativeButtonProps<"children" | "type">;

export interface MultiSelectScrollButtonProps extends MultiSelectScrollButtonNativeProps {
  children?: ReactNode;
  direction: "up" | "down";
  className?: string;
  "data-slot"?: string;
}

export const MultiSelectScrollButton = forwardRef<HTMLButtonElement, MultiSelectScrollButtonProps>(
  function MultiSelectScrollButton(
    {
      children,
      direction,
      className,
      onClick,
      "data-slot": dataSlot = `multi-select-scroll-${direction}-button`,
      ...restProps
    },
    ref,
  ) {
    const ctx = useMultiSelectContext();
    const [canScroll, setCanScroll] = useState(false);

    const updateCanScroll = useCallback(() => {
      const el = ctx.viewportRef.current ?? ctx.listboxRef.current;
      if (!el) {
        setCanScroll(false);
        return;
      }

      if (direction === "up") {
        setCanScroll(el.scrollTop > 0);
      } else {
        setCanScroll(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
      }
    }, [ctx.listboxRef, ctx.viewportRef, direction]);

    useEffect(() => {
      const el = ctx.viewportRef.current ?? ctx.listboxRef.current;
      if (!ctx.isOpen || !el) return undefined;

      updateCanScroll();
      el.addEventListener("scroll", updateCanScroll);
      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(updateCanScroll);
      resizeObserver?.observe(el);

      return () => {
        el.removeEventListener("scroll", updateCanScroll);
        resizeObserver?.disconnect();
      };
    }, [ctx.isOpen, ctx.listboxRef, ctx.viewportRef, updateCanScroll]);

    const handleClick = useCallback(() => {
      const el = ctx.viewportRef.current ?? ctx.listboxRef.current;

      el?.scrollBy({
        top: direction === "up" ? -40 : 40,
        behavior: "smooth",
      });
    }, [ctx.listboxRef, ctx.viewportRef, direction]);

    if (!canScroll) return null;

    return (
      <button
        {...restProps}
        ref={ref}
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        data-slot={dataSlot}
        className={className}
        onClick={composeEventHandlers(onClick, handleClick)}
      >
        {children}
      </button>
    );
  },
);

export type MultiSelectScrollUpButtonProps = Omit<MultiSelectScrollButtonProps, "direction">;
export type MultiSelectScrollDownButtonProps = Omit<MultiSelectScrollButtonProps, "direction">;

export const MultiSelectScrollUpButton = forwardRef<
  HTMLButtonElement,
  MultiSelectScrollUpButtonProps
>(function MultiSelectScrollUpButton(props, ref) {
  return <MultiSelectScrollButton {...props} ref={ref} direction="up" />;
});

export const MultiSelectScrollDownButton = forwardRef<
  HTMLButtonElement,
  MultiSelectScrollDownButtonProps
>(function MultiSelectScrollDownButton(props, ref) {
  return <MultiSelectScrollButton {...props} ref={ref} direction="down" />;
});
