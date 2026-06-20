"use client";

import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeSectionProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  NavListSectionContextProvider,
  type NavListSectionContextValue,
  useNavListContext,
} from "./context.js";

type NavListSectionNativeProps = NativeSectionProps<"children" | "onChange">;

export interface NavListSectionProps extends NavListSectionNativeProps {
  /** Section content. */
  children?: ReactNode;
  /** Whether the section can be collapsed. */
  collapsible?: boolean;
  /** Controlled open state for collapsible sections. */
  open?: boolean;
  /** Initial open state for uncontrolled collapsible sections. */
  defaultOpen?: boolean;
  /** Called when collapsible section open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Disable section trigger interaction. */
  disabled?: boolean;
  /** Override the rendered section element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const NavListSection = forwardRef<HTMLElement, NavListSectionProps>(
  function NavListSection(
    {
      children,
      collapsible = false,
      open,
      defaultOpen = true,
      onOpenChange,
      disabled = false,
      render,
      asChild,
      "data-slot": dataSlot = "nav-list-section",
      ...restProps
    },
    ref,
  ) {
    const { orientation } = useNavListContext();
    const idPrefix = useId();
    const triggerId = `${idPrefix}-trigger`;
    const contentId = `${idPrefix}-content`;
    const labelId = `${idPrefix}-label`;
    const [hasLabel, setHasLabel] = useState(false);
    const [resolvedOpen, setResolvedOpen] = useControllableState<boolean>({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });
    const isOpen = collapsible ? resolvedOpen : true;

    const setOpen = useCallback(
      (nextOpen: boolean) => {
        if (disabled || !collapsible) return;
        setResolvedOpen(nextOpen);
      },
      [collapsible, disabled, setResolvedOpen],
    );

    const toggle = useCallback(() => {
      setOpen(!isOpen);
    }, [isOpen, setOpen]);

    const registerLabel = useCallback(() => {
      setHasLabel(true);
    }, []);

    const unregisterLabel = useCallback(() => {
      setHasLabel(false);
    }, []);

    const contextValue = useMemo<NavListSectionContextValue>(
      () => ({
        isOpen,
        collapsible,
        disabled,
        triggerId,
        contentId,
        labelId,
        hasLabel,
        registerLabel,
        unregisterLabel,
        setOpen,
        toggle,
      }),
      [
        collapsible,
        contentId,
        disabled,
        hasLabel,
        isOpen,
        labelId,
        registerLabel,
        setOpen,
        toggle,
        triggerId,
        unregisterLabel,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-orientation": orientation,
      "data-state": isOpen ? "open" : "closed",
      ...(collapsible ? { "data-collapsible": "" } : {}),
      ...(disabled ? { "data-disabled": "" } : {}),
    };

    const section = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "section", { ...behaviorProps, children });

    return (
      <NavListSectionContextProvider value={contextValue}>
        {section}
      </NavListSectionContextProvider>
    );
  },
);
