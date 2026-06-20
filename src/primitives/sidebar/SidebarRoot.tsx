"use client";

import { forwardRef, useCallback, useId, useMemo, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  SidebarContextProvider,
  type SidebarCollapsedState,
  type SidebarContextValue,
  type SidebarSide,
  type SidebarState,
} from "./context.js";

type SidebarRootNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange">;

export interface SidebarRootProps extends SidebarRootNativeProps {
  /** Controlled sidebar state. */
  state?: SidebarState;
  /** Initial sidebar state for uncontrolled usage. */
  defaultState?: SidebarState;
  /** Called when sidebar state changes. */
  onStateChange?: (state: SidebarState) => void;
  /** State used by the default trigger when collapsing from expanded mode. */
  collapsedState?: SidebarCollapsedState;
  /** Side where the sidebar panel is placed. */
  side?: SidebarSide;
  /** Disable sidebar triggers. */
  disabled?: boolean;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Sidebar layout subtree. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

function normalizeSidebarState(state: SidebarState | undefined): SidebarState {
  return state ?? "expanded";
}

export const SidebarRoot = forwardRef<HTMLDivElement, SidebarRootProps>(
  function SidebarRoot(
    {
      state: controlledState,
      defaultState = "expanded",
      onStateChange,
      collapsedState = "offcanvas",
      side = "left",
      disabled = false,
      render,
      asChild,
      children,
      "data-slot": dataSlot = "sidebar",
      ...restProps
    },
    ref,
  ) {
    const [state, setResolvedState] = useControllableState<SidebarState>({
      value: controlledState,
      defaultValue: normalizeSidebarState(defaultState),
      onChange: onStateChange,
    });
    const idPrefix = useId();
    const panelId = `${idPrefix}-panel`;
    const triggerId = `${idPrefix}-trigger`;

    const setState = useCallback(
      (nextState: SidebarState) => {
        if (disabled) return;
        setResolvedState(nextState);
      },
      [disabled, setResolvedState],
    );

    const expand = useCallback(() => {
      setState("expanded");
    }, [setState]);

    const collapse = useCallback(() => {
      setState(collapsedState);
    }, [collapsedState, setState]);

    const toggle = useCallback(() => {
      setState(state === "expanded" ? collapsedState : "expanded");
    }, [collapsedState, setState, state]);

    const contextValue = useMemo<SidebarContextValue>(
      () => ({
        state,
        collapsedState,
        side,
        disabled,
        panelId,
        triggerId,
        setState,
        toggle,
        expand,
        collapse,
      }),
      [
        collapse,
        collapsedState,
        disabled,
        expand,
        panelId,
        setState,
        side,
        state,
        toggle,
        triggerId,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-state": state,
      "data-side": side,
      "data-collapsed-state": collapsedState,
      ...(disabled ? { "data-disabled": "" } : {}),
    };

    const root = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <SidebarContextProvider value={contextValue}>
        {root}
      </SidebarContextProvider>
    );
  },
);
