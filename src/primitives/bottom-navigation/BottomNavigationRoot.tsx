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

export interface BottomNavigationRootProps extends BottomNavigationRootNativeProps {
  /** Bottom navigation subtree. */
  children: ReactNode;
  /** Controlled active destination value. */
  value?: string | null;
  /** Uncontrolled initial active destination value. */
  defaultValue?: string | null;
  /** Called when active destination changes. */
  onChange?: (value: string) => void;
  /** Show labels on all items. */
  showLabels?: boolean;
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
      showLabels = true,
      render,
      asChild,
      "data-slot": dataSlot = "bottom-nav-root",
      ariaLabel = "Bottom navigation",
      ...restProps
    },
    ref,
  ) {
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
        showLabels,
      }),
      [onChange, showLabels, value],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "aria-label": ariaLabel,
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
