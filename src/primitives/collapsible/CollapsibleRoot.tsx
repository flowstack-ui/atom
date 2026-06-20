"use client";

import { forwardRef, useCallback, useId, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  CollapsibleContextProvider,
  type CollapsibleContextValue,
} from "./context.js";

type CollapsibleRootNativeProps = NativeDivProps<"children" | "onChange">;

export interface CollapsibleRootProps extends CollapsibleRootNativeProps {
  /** Content is visible in controlled mode. */
  open?: boolean;
  /** Initial open state in uncontrolled mode. */
  defaultOpen?: boolean;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Disable interaction. */
  disabled?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Content. */
  children?: ReactNode;
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const CollapsibleRoot = forwardRef<HTMLDivElement, CollapsibleRootProps>(
  function CollapsibleRoot(
    {
      open,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      render,
      asChild,
      children,
      className,
      "data-slot": dataSlot = "collapsible-root",
      ...restProps
    },
    ref,
  ) {
    const [isOpen, setIsOpen] = useControllableState({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });
    const idPrefix = useId();
    const contentId = `${idPrefix}-content`;
    const triggerId = `${idPrefix}-trigger`;

    const setOpen = useCallback(
      (value: boolean) => {
        if (disabled) return;
        setIsOpen(value);
      },
      [disabled, setIsOpen],
    );

    const onToggle = useCallback(() => {
      setOpen(!isOpen);
    }, [isOpen, setOpen]);

    const onOpen = useCallback(() => {
      setOpen(true);
    }, [setOpen]);

    const onClose = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    const contextValue: CollapsibleContextValue = {
      isOpen,
      onToggle,
      onOpen,
      onClose,
      contentId,
      triggerId,
      disabled,
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-state": isOpen ? "open" : "closed",
      ...(disabled ? { "data-disabled": "" } : {}),
      className,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <CollapsibleContextProvider value={contextValue}>
        {element}
      </CollapsibleContextProvider>
    );
  },
);
