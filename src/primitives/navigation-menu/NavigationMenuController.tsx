"use client";
import { forwardRef, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { NavigationMenuRoot, type NavigationMenuRootProps } from "./NavigationMenuRoot.js";
import { NavigationMenuControllerViewportContext, useNavigationMenuContext as useInternalNavigationMenuContext } from "./context.js";

export type UseNavigationMenuOptions = Pick<NavigationMenuRootProps,
  "value" | "defaultValue" | "onValueChange" | "orientation" | "dir" | "loop" |
  "delayDuration" | "openDelay" | "closeDelay" | "skipDelayDuration" |
  "disableClickTrigger" | "disableHoverTrigger" | "disablePointerLeaveClose" |
  "lazyMount" | "unmountOnExit" | "hideMode" | "viewport">;
export interface NavigationMenuApi {
  value: string | null;
  open: boolean;
  orientation: "horizontal" | "vertical";
  setValue(value: string | null): void;
  isViewportRendered: boolean;
  getViewportNode(): HTMLDivElement | null;
  reposition(): void;
}
export interface UseNavigationMenuReturn extends NavigationMenuApi {
  /** Options consumed by RootProvider; use RootProvider rather than spreading. */
  readonly rootProps: UseNavigationMenuOptions;
  /** @internal */
  readonly viewport: { current: HTMLDivElement | null };
}
export function useNavigationMenu(options: UseNavigationMenuOptions = {}): UseNavigationMenuReturn {
  const [internal, setInternal] = useState<string | null>(options.defaultValue ?? null);
  const value = options.value !== undefined ? options.value : internal;
  const viewport = useRef<HTMLDivElement | null>(null);
  const setValue = useCallback((next: string | null) => {
    if (options.value === undefined) setInternal(next);
    options.onValueChange?.(next);
  }, [options.value, options.onValueChange]);
  const getViewportNode = useCallback(() => viewport.current, []);
  const reposition = useCallback(() => {
    const node = viewport.current;
    const view = node?.ownerDocument.defaultView;
    if (node && view) node.dispatchEvent(new view.Event("atom-navigation-menu-reposition"));
  }, []);
  return useMemo(() => ({
    value, open: value !== null, orientation: options.orientation ?? "horizontal",
    setValue, getViewportNode, reposition, get isViewportRendered() { return viewport.current !== null; },
    viewport, rootProps: { ...options, value, onValueChange: setValue },
  }), [value, options, setValue, getViewportNode, reposition]);
}
export interface NavigationMenuRootProviderProps extends Omit<NavigationMenuRootProps, keyof UseNavigationMenuOptions | "value"> {
  value: UseNavigationMenuReturn;
}
export const NavigationMenuRootProvider = forwardRef<HTMLElement, NavigationMenuRootProviderProps>(
  function NavigationMenuRootProvider({ value, children, ...props }, ref) {
    return <NavigationMenuControllerViewportContext.Provider value={value.viewport}>
      <NavigationMenuRoot {...value.rootProps} {...props} ref={ref}>{children}</NavigationMenuRoot>
    </NavigationMenuControllerViewportContext.Provider>;
  },
);
export function useNavigationMenuContext(): NavigationMenuApi {
  const context = useInternalNavigationMenuContext();
  return {
    value: context.value, open: context.value !== null, orientation: context.orientation,
    setValue: context.onValueChange, isViewportRendered: context.viewportRef.current !== null,
    getViewportNode: () => context.viewportRef.current,
    reposition: () => {
      const node = context.viewportRef.current;
      const view = node?.ownerDocument.defaultView;
      if (node && view) node.dispatchEvent(new view.Event("atom-navigation-menu-reposition"));
    },
  };
}
export function NavigationMenuContext({ children }: { children(api: NavigationMenuApi): ReactNode }) {
  return children(useNavigationMenuContext());
}
