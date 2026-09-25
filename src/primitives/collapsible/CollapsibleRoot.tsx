"use client";
import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { CollapsibleContextProvider } from "./context.js";
import {
  useCollapsible,
  type UseCollapsibleOptions,
  type UseCollapsibleReturn,
} from "./controller.js";
interface RootHostProps extends NativeDivProps<"children" | "onChange"> {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}
export interface CollapsibleRootProps
  extends RootHostProps,
    UseCollapsibleOptions {}
export interface CollapsibleRootProviderProps extends RootHostProps {
  value: UseCollapsibleReturn;
}
export const CollapsibleRootProvider = forwardRef<
  HTMLDivElement,
  CollapsibleRootProviderProps
>(function CollapsibleRootProvider(
  {
    value,
    children,
    asChild,
    render,
    "data-slot": slot = "collapsible-root",
    ...props
  },
  ref,
) {
  const attributes = {
    ...props,
    ref,
    id: props.id ?? value.rootId,
    "data-slot": slot,
    "data-state": value.open ? "open" : "closed",
    "data-orientation": value.orientation,
    "data-disabled": value.disabled ? "" : undefined,
  };
  const element = asChild
    ? cloneAndMerge(children, attributes)
    : renderElement(render, "div", { ...attributes, children });
  return (
    <CollapsibleContextProvider value={value}>
      {element}
    </CollapsibleContextProvider>
  );
});
export const CollapsibleRoot = forwardRef<HTMLDivElement, CollapsibleRootProps>(
  function CollapsibleRoot(
    {
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      orientation,
      ids,
      lazyMount,
      unmountOnExit,
      collapsedHeight,
      collapsedWidth,
      hideMode,
      onExitComplete,
      ...props
    },
    ref,
  ) {
    const value = useCollapsible({
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      orientation,
      ids,
      lazyMount,
      unmountOnExit,
      collapsedHeight,
      collapsedWidth,
      hideMode,
      onExitComplete,
    });
    return (
      <CollapsibleRootProvider
        {...props}
        id={ids?.root ?? props.id}
        value={value}
        ref={ref}
      />
    );
  },
);
