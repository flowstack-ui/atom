"use client";

import { forwardRef, useCallback, useMemo, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeNavProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  BottomNavigationContextProvider,
  type BottomNavigationContextValue,
} from "./context.js";

type BottomNavigationRootNativeProps = NativeNavProps<
  "children" | "defaultValue" | "onChange" | "aria-label"
>;

export type BottomNavigationLabelVisibility = "always" | "active" | "hidden";
export type BottomNavigationPosition = "static" | "sticky" | "absolute" | "fixed";

export interface BottomNavigationRootProps extends BottomNavigationRootNativeProps {
  /** Bottom navigation subtree. */
  children: ReactNode;
  /** Controlled active destination value. */
  value?: string | null;
  /** Uncontrolled initial active destination value. */
  defaultValue?: string | null;
  /** Called when active destination changes. */
  onChange?: (value: string) => void;
  /** Control which item labels should be visibly presented. */
  labelVisibility?: BottomNavigationLabelVisibility;
  /** @deprecated Use `labelVisibility`. False maps to `"active"`. */
  showLabels?: boolean;
  /** Positioning intent exposed for styled layers. */
  position?: BottomNavigationPosition;
  /** Accessible label for the navigation landmark. */
  ariaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const BottomNavigationRoot = forwardRef<HTMLElement, BottomNavigationRootProps>(
  function BottomNavigationRoot(
    {
      children,
      value: controlledValue,
      defaultValue = null,
      onChange: onChangeProp,
      labelVisibility: labelVisibilityProp,
      showLabels,
      position = "static",
      render,
      asChild,
      "data-slot": dataSlot = "bottom-nav-root",
      ariaLabel = "Bottom navigation",
      ...restProps
    },
    ref,
  ) {
    const labelVisibility =
      labelVisibilityProp ?? (showLabels === false ? "active" : "always");
    const [value, setValue] = useControllableState<string | null>({
      value: controlledValue,
      defaultValue,
      onChange: (nextValue) => {
        if (nextValue !== null) {
          onChangeProp?.(nextValue);
        }
      },
    });

    const onChange = useCallback(
      (nextValue: string) => {
        setValue(nextValue);
      },
      [setValue],
    );

    const contextValue = useMemo<BottomNavigationContextValue>(
      () => ({
        value,
        onChange,
        labelVisibility,
      }),
      [labelVisibility, onChange, value],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-label": ariaLabel,
      "data-label-visibility": labelVisibility,
      "data-position": position,
      "data-slot": dataSlot,
    };

    const navigation = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "nav", {
        ...behaviorProps,
        children,
      });

    return (
      <BottomNavigationContextProvider value={contextValue}>
        {navigation}
      </BottomNavigationContextProvider>
    );
  },
);
