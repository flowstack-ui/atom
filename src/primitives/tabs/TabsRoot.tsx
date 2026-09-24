"use client";
import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { TabsContextProvider } from "./context.js";
import {
  useTabs,
  type UseTabsProps,
  type UseTabsReturn,
} from "./controller.js";

export interface TabsRootProps
  extends NativeDivProps<"children" | "defaultValue" | "dir" | "onChange">,
    UseTabsProps {
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}
export interface TabsRootProviderProps
  extends Omit<TabsRootProps, keyof UseTabsProps> {
  value: UseTabsReturn;
}
export const TabsRootProvider = forwardRef<
  HTMLDivElement,
  TabsRootProviderProps
>(function TabsRootProvider(
  {
    value,
    render,
    asChild,
    children,
    "data-slot": slot = "tabs-root",
    ...rest
  },
  ref,
) {
  const props = {
    ...rest,
    ref,
    id: value.getId("root"),
    dir: value.dir,
    "data-slot": slot,
    "data-orientation": value.orientation,
  };
  const element = asChild
    ? cloneAndMerge(children, props)
    : renderElement(render, "div", { ...props, children });
  return <TabsContextProvider value={value}>{element}</TabsContextProvider>;
});
export const TabsRoot = forwardRef<HTMLDivElement, TabsRootProps>(
  function TabsRoot(
    {
      value,
      defaultValue,
      onValueChange,
      orientation,
      dir,
      activationMode,
      loop,
      loopFocus,
      deselectable,
      composite,
      onFocusChange,
      navigate,
      id,
      ids,
      lazyMount,
      unmountOnExit,
      hideMode,
      onExitComplete,
      ...rest
    },
    ref,
  ) {
    const api = useTabs({
      value,
      defaultValue,
      onValueChange,
      orientation,
      dir,
      activationMode,
      loop,
      loopFocus,
      deselectable,
      composite,
      onFocusChange,
      navigate,
      id,
      ids,
      lazyMount,
      unmountOnExit,
      hideMode,
      onExitComplete,
    });
    return <TabsRootProvider {...rest} value={api} ref={ref} />;
  },
);
