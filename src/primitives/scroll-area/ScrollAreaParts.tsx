"use client";
import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useScrollAreaEngine } from "./context.js";
import type { ScrollAreaAxis, ScrollAreaController } from "./types.js";
interface PartProps extends NativeDivProps<"children"> {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}
export interface ScrollAreaContentProps extends PartProps {}
export interface ScrollAreaScrollbarProps extends PartProps {
  orientation?: ScrollAreaAxis;
}
export interface ScrollAreaThumbProps extends PartProps {
  orientation?: ScrollAreaAxis;
}
export interface ScrollAreaCornerProps extends PartProps {}
const TrackContext = createContext<ScrollAreaAxis | null>(null);
TrackContext.displayName = "ScrollAreaScrollbar";
function useEngine() {
  const engine = useScrollAreaEngine();
  if (!engine)
    throw new Error(
      "Custom ScrollArea parts require Root or RootProvider, not an orientation-only context.",
    );
  return engine;
}
export const ScrollAreaContent = forwardRef<
  HTMLDivElement,
  ScrollAreaContentProps
>(function ScrollAreaContent(
  {
    children,
    render,
    asChild,
    "data-slot": slot = "scroll-area-content",
    ...rest
  },
  ref,
) {
  const engine = useEngine();
  const merged = useMemo(
    () => composeRefs(engine.api.contentRef, ref),
    [engine, ref],
  );
  const props = {
    ...rest,
    id: rest.id ?? engine.id("content"),
    ref: merged,
    "data-slot": slot,
  };
  return asChild
    ? cloneAndMerge(children, props)
    : renderElement(render, "div", { ...props, children });
});
export const ScrollAreaScrollbar = forwardRef<
  HTMLDivElement,
  ScrollAreaScrollbarProps
>(function ScrollAreaScrollbar(
  {
    orientation = "vertical",
    children,
    render,
    asChild,
    onPointerDown,
    "data-slot": slot = "scroll-area-scrollbar",
    ...rest
  },
  ref,
) {
  const engine = useEngine();
  const merged = useMemo(
    () =>
      composeRefs(
        (node: HTMLElement | null) => engine.register(orientation, node),
        ref,
      ),
    [engine, orientation, ref],
  );
  const props = {
    ...rest,
    id: rest.id ?? engine.id(orientation),
    ref: merged,
    "data-slot": slot,
    "data-orientation": orientation,
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (!event.defaultPrevented && event.target === event.currentTarget)
        engine.pointerDown(event.nativeEvent, orientation, false);
    },
  };
  return (
    <TrackContext.Provider value={orientation}>
      {asChild
        ? cloneAndMerge(children, props)
        : renderElement(render, "div", { ...props, children })}
    </TrackContext.Provider>
  );
});
export const ScrollAreaThumb = forwardRef<HTMLDivElement, ScrollAreaThumbProps>(
  function ScrollAreaThumb(
    {
      orientation,
      children,
      render,
      asChild,
      onPointerDown,
      "data-slot": slot = "scroll-area-thumb",
      ...rest
    },
    ref,
  ) {
    const engine = useEngine(),
      inherited = useContext(TrackContext);
    if (!inherited || (orientation && orientation !== inherited))
      throw new Error(
        "ScrollArea.Thumb must belong to a Scrollbar with matching orientation.",
      );
    const axis = orientation ?? inherited;
    const merged = useMemo(
      () =>
        composeRefs(
          (node: HTMLElement | null) => engine.register(`${axis}-thumb`, node),
          ref,
        ),
      [engine, axis, ref],
    );
    const props = {
      ...rest,
      id: rest.id ?? engine.id(`${axis}-thumb`),
      ref: merged,
      "data-slot": slot,
      "data-orientation": axis,
      onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented)
          engine.pointerDown(event.nativeEvent, axis, true);
      },
    };
    return asChild
      ? cloneAndMerge(children, props)
      : renderElement(render, "div", { ...props, children });
  },
);
export const ScrollAreaCorner = forwardRef<
  HTMLDivElement,
  ScrollAreaCornerProps
>(function ScrollAreaCorner(
  {
    children,
    render,
    asChild,
    "data-slot": slot = "scroll-area-corner",
    ...rest
  },
  ref,
) {
  const engine = useEngine();
  const merged = useMemo(
    () =>
      composeRefs(
        (node: HTMLElement | null) => engine.register("corner", node),
        ref,
      ),
    [engine, ref],
  );
  const props = {
    ...rest,
    id: rest.id ?? engine.id("corner"),
    ref: merged,
    "data-slot": slot,
  };
  return asChild
    ? cloneAndMerge(children, props)
    : renderElement(render, "div", { ...props, children });
});
export function ScrollAreaContext({
  children,
}: {
  children: (value: ScrollAreaController) => ReactNode;
}) {
  const engine = useEngine();
  useSyncExternalStore(
    engine.subscribe,
    engine.getSnapshot,
    engine.getServerSnapshot,
  );
  return children(engine.api);
}
