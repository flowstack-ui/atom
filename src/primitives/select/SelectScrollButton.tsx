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
import { useSelectContext } from "./context.js";

type SelectScrollButtonNativeProps = NativeButtonProps<"children" | "type">;

export interface SelectScrollButtonProps extends SelectScrollButtonNativeProps {
  children?: ReactNode;
  direction: "up" | "down";
  className?: string;
  "data-slot"?: string;
}

export const SelectScrollButton = forwardRef<HTMLButtonElement, SelectScrollButtonProps>(
  function SelectScrollButton(
    {
      children,
      direction,
      className,
      onClick,
      "data-slot": dataSlot = `select-scroll-${direction}-button`,
      ...restProps
    },
    ref,
  ) {
    const ctx = useSelectContext();
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

export type SelectScrollUpButtonProps = Omit<SelectScrollButtonProps, "direction">;
export type SelectScrollDownButtonProps = Omit<SelectScrollButtonProps, "direction">;

export const SelectScrollUpButton = forwardRef<
  HTMLButtonElement,
  SelectScrollUpButtonProps
>(function SelectScrollUpButton(props, ref) {
  return <SelectScrollButton {...props} ref={ref} direction="up" />;
});

export const SelectScrollDownButton = forwardRef<
  HTMLButtonElement,
  SelectScrollDownButtonProps
>(function SelectScrollDownButton(props, ref) {
  return <SelectScrollButton {...props} ref={ref} direction="down" />;
});
