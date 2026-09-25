"use client";
import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  ScrollAreaContextProvider,
  ScrollAreaEngineProvider,
  type ScrollAreaOrientation,
} from "./context.js";
import { getScrollAreaEngine, useScrollAreaInternal } from "./useScrollArea.js";
import type { ScrollAreaController, ScrollAreaIds } from "./types.js";
export interface ScrollAreaRootProps extends NativeDivProps<"children"> {
  orientation?: ScrollAreaOrientation;
  ids?: ScrollAreaIds;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}
export interface ScrollAreaRootProviderProps
  extends Omit<ScrollAreaRootProps, "orientation" | "ids"> {
  value: ScrollAreaController;
}
export const ScrollAreaRootProvider = forwardRef<
  HTMLDivElement,
  ScrollAreaRootProviderProps
>(function ScrollAreaRootProvider(
  {
    value,
    asChild,
    render,
    children,
    onPointerEnter,
    onPointerLeave,
    "data-slot": slot = "scroll-area",
    ...rest
  },
  ref,
) {
  const engine = getScrollAreaEngine(value);
  const mergedRef = useMemo(
    () =>
      composeRefs(
        (node: HTMLElement | null) => engine.register("root", node),
        ref,
      ),
    [engine, ref],
  );
  const context = useMemo(
    () => ({ orientation: value.orientation }),
    [value.orientation],
  );
  const props = {
    ...rest,
    id: rest.id ?? engine.id("root"),
    ref: mergedRef,
    "data-slot": slot,
    "data-orientation": value.orientation,
    onPointerEnter: (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerEnter?.(event);
      if (!event.defaultPrevented) engine.hover(true);
    },
    onPointerLeave: (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      if (!event.defaultPrevented) engine.hover(false);
    },
  };
  return (
    <ScrollAreaEngineProvider value={engine}>
      <ScrollAreaContextProvider value={context}>
        {asChild
          ? cloneAndMerge(children, props)
          : renderElement(render, "div", { ...props, children })}
      </ScrollAreaContextProvider>
    </ScrollAreaEngineProvider>
  );
});
export const ScrollAreaRoot = forwardRef<HTMLDivElement, ScrollAreaRootProps>(
  function ScrollAreaRoot(
    { orientation = "vertical", ids, id, ...props },
    ref,
  ) {
    const value = useScrollAreaInternal(
      { orientation, ids: { ...ids, root: id ?? ids?.root } },
      false,
    );
    return (
      <ScrollAreaRootProvider {...props} id={id} ref={ref} value={value} />
    );
  },
);
