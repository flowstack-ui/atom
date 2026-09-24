"use client";

import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import { useOutsideInteraction } from "../../hooks/useOutsideInteraction.js";
import { OverlayScopeProvider, useCreateOverlayScope } from "../../hooks/overlayScope.js";
import type { NativeNavProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  NavigationMenuContextProvider,
  NavigationMenuControllerViewportContext,
  type ContentNodeEntry,
  type NavigationMenuContextValue,
  type NavigationMenuControlType,
} from "./context.js";

type NavigationMenuRootNativeProps = NativeNavProps<"children" | "defaultValue" | "dir" | "onChange">;

export interface NavigationMenuRootProps extends NavigationMenuRootNativeProps {
  children: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  delayDuration?: number;
  openDelay?: number;
  closeDelay?: number;
  disableClickTrigger?: boolean;
  disableHoverTrigger?: boolean;
  disablePointerLeaveClose?: boolean;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  hideMode?: "display-none" | "activity";
  /** Use false for inline disclosure panels without a shared Viewport. */
  viewport?: boolean;
  skipDelayDuration?: number;
  loop?: boolean;
  orientation?: "horizontal" | "vertical";
  dir?: DirectionValue;
  className?: string;
  style?: CSSProperties;
  "data-slot"?: string;
}

export const NavigationMenuRoot = forwardRef<
  HTMLElement,
  NavigationMenuRootProps
>(function NavigationMenuRoot(
  {
    children,
    asChild,
    render,
    value: controlledValue,
    defaultValue,
    onValueChange,
    delayDuration = 200,
    openDelay,
    closeDelay,
    disableClickTrigger = false,
    disableHoverTrigger = false,
    disablePointerLeaveClose = false,
    lazyMount: lazyMountProp,
    unmountOnExit: unmountOnExitProp,
    hideMode = "display-none",
    viewport = true,
    skipDelayDuration = 300,
    loop = true,
    orientation = "horizontal",
    dir: dirProp,
    className,
    style,
    "data-slot": dataSlot = "navigation-menu",
    ...restProps
  },
  ref,
) {
  const lazyMount = lazyMountProp ?? true;
  const unmountOnExit = unmountOnExitProp ?? true;
  const lifecycleExplicit = lazyMountProp !== undefined || unmountOnExitProp !== undefined;
  const [viewportSide, setViewportSide] = useState<"left" | "right" | null>(null);
  const normalizeDelay = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 200;
  const resolvedOpenDelay = normalizeDelay(openDelay ?? delayDuration);
  const resolvedCloseDelay = normalizeDelay(closeDelay ?? delayDuration);
  const contextDir = useDirection();
  const overlayScope = useCreateOverlayScope();
  const dir = dirProp ?? contextDir;
  const {
    "aria-label": ariaLabel = "Main",
    ...navigationProps
  } = restProps;
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null,
  );
  const activeValue = isControlled ? controlledValue : internalValue;

  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [observedValue, setObservedValue] = useState(activeValue);
  // Track committed value changes, including externally controlled updates.
  if (observedValue !== activeValue) {
    setPreviousValue(observedValue);
    setObservedValue(activeValue);
  }

  const setValue = useCallback(
    (newValue: string | null) => {
      if (!isControlled) setInternalValue(newValue);
      onValueChange?.(newValue);
    },
    [activeValue, isControlled, onValueChange],
  );

  const [isSkipDelayActive, setIsSkipDelayActive] = useState(false);
  const skipDelayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleValueChange = useCallback(
    (newValue: string | null) => {
      setValue(newValue);

      if (newValue === null) {
        clearTimeout(skipDelayTimerRef.current);
        setIsSkipDelayActive(true);
        skipDelayTimerRef.current = setTimeout(() => {
          setIsSkipDelayActive(false);
        }, skipDelayDuration);
      } else {
        clearTimeout(skipDelayTimerRef.current);
      }
    },
    [setValue, skipDelayDuration],
  );

  const registerItem = useCallback((_value: string) => {}, []);
  const unregisterItem = useCallback((_value: string) => {}, []);

  const {
    registerItem: registerControlItem,
    unregisterItem: unregisterControlItem,
    getItem: getControlItem,
    getNextItem: getNextControlItem,
    getFirstItem: getFirstControlItem,
    getLastItem: getLastControlItem,
    getValues: getControlValues,
  } = useCollection<string, HTMLElement, { type: NavigationMenuControlType }>();

  const getItemValues = useCallback(() => getControlValues(), [getControlValues]);

  const registerTrigger = useCallback(
    (value: string, element: HTMLButtonElement) => {
      registerControlItem(value, element, { data: { type: "trigger" } });
    },
    [registerControlItem],
  );

  const unregisterTrigger = useCallback((value: string) => {
    unregisterControlItem(value);
  }, [unregisterControlItem]);

  const registerLink = useCallback(
    (value: string, element: HTMLAnchorElement) => {
      registerControlItem(value, element, { data: { type: "link" } });
    },
    [registerControlItem],
  );

  const unregisterLink = useCallback((value: string) => {
    unregisterControlItem(value);
  }, [unregisterControlItem]);

  const getControlElement = useCallback((value: string) => {
    return getControlItem(value)?.element ?? null;
  }, [getControlItem]);

  const getControlType = useCallback((value: string) => {
    return getControlItem(value)?.data.type ?? null;
  }, [getControlItem]);

  const getTriggerElement = useCallback((value: string) => {
    const item = getControlItem(value);
    if (item?.data.type !== "trigger") return null;
    return item.element as HTMLButtonElement;
  }, [getControlItem]);

  const getNextTriggerValue = useCallback(
    (value: string, direction: "next" | "previous") =>
      getNextControlItem(value, direction, { loop })?.value ?? null,
    [getNextControlItem, loop],
  );

  const getFirstTriggerValue = useCallback(
    () => getFirstControlItem()?.value ?? null,
    [getFirstControlItem],
  );

  const getLastTriggerValue = useCallback(
    () => getLastControlItem()?.value ?? null,
    [getLastControlItem],
  );

  const contentNodeRegistryRef = useRef<Map<string, ContentNodeEntry>>(new Map());

  const registerContentNode = useCallback(
    (value: string, entry: ContentNodeEntry) => {
      contentNodeRegistryRef.current.set(value, entry);
    },
    [],
  );

  const unregisterContentNode = useCallback((value: string) => {
    contentNodeRegistryRef.current.delete(value);
  }, []);

  const getContentNode = useCallback((value: string) => {
    return contentNodeRegistryRef.current.get(value) ?? null;
  }, []);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const getContentValues = useCallback(() => Array.from(contentNodeRegistryRef.current.keys()), []);

  const startCloseTimer = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    if (disablePointerLeaveClose) return;
    closeTimerRef.current = setTimeout(() => {
      handleValueChange(null);
    }, resolvedCloseDelay);
  }, [resolvedCloseDelay, disablePointerLeaveClose, handleValueChange]);

  const cancelCloseTimer = useCallback(() => {
    clearTimeout(closeTimerRef.current);
  }, []);

  const rootRef = useRef<HTMLElement | null>(null);
  const localViewportRef = useRef<HTMLDivElement | null>(null);
  const controllerViewportRef = useContext(NavigationMenuControllerViewportContext);
  const viewportRef = controllerViewportRef ?? localViewportRef;
  const getViewportNode = useCallback(() => viewportRef.current, [viewportRef]);
  const reposition = useCallback(() => {
    const node = viewportRef.current;
    const view = node?.ownerDocument.defaultView;
    if (node && view) node.dispatchEvent(new view.Event("atom-navigation-menu-reposition"));
  }, [viewportRef]);
  useEffect(() => () => {
    clearTimeout(closeTimerRef.current);
    clearTimeout(skipDelayTimerRef.current);
  }, []);
  const composedRef = useMemo(() => composeRefs(rootRef, ref), [ref]);
  const idPrefix = useId();

  useDismissableLayer({
    enabled: activeValue !== null,
    scope: overlayScope,
    ownerDocument: rootRef.current?.ownerDocument,
    onEscapeKeyDown: (event) => {
      if (activeValue) getContentNode(activeValue)?.onEscapeKeyDown?.(event);
      if (event.defaultPrevented) return;
      const target = event.target;
      if (
        target && (target as Element).nodeType === 1 &&
        (target as Element).closest('[data-slot="navigation-menu-sub"]') &&
        (target as Element).closest('[data-slot="navigation-menu-sub"]') !== rootRef.current
      ) {
        return;
      }

      const trigger = activeValue === null ? null : getTriggerElement(activeValue);
      event.preventDefault();
      handleValueChange(null);
      trigger?.focus({ preventScroll: true });
    },
  });

  const isNestedLayerTarget = useCallback((target: Node) => {
    const root = rootRef.current;
    if (!root) return false;
    return Array.from(root.querySelectorAll<HTMLElement>('[aria-controls][aria-expanded="true"]')).some(trigger => {
      const ids = trigger.getAttribute("aria-controls")?.split(/\s+/) ?? [];
      const tree = root.getRootNode();
      return ids.some(id =>
        ("getElementById" in tree && (tree as Document | ShadowRoot).getElementById(id)?.contains(target)) ||
        root.ownerDocument.getElementById(id)?.contains(target));
    });
  }, []);

  useOutsideInteraction({
    refs: [rootRef, viewportRef],
    ignore: isNestedLayerTarget,
    enabled: activeValue !== null,
    onPointerDownOutside: event => {
      if (activeValue) getContentNode(activeValue)?.onPointerDownOutside?.(event);
    },
    onInteractOutside: event => {
      if (activeValue) getContentNode(activeValue)?.onInteractOutside?.(event);
      if (!event.defaultPrevented) handleValueChange(null);
    },
  });
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !activeValue) return;
    const doc = root.ownerDocument;
    const onOutside = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (target && (root.contains(target) || viewportRef.current?.contains(target) || isNestedLayerTarget(target))) return;
      const entry = getContentNode(activeValue);
      const notification = new (doc.defaultView?.FocusEvent ?? FocusEvent)("focusoutside", { cancelable: true, relatedTarget: event.relatedTarget });
      Object.defineProperty(notification, "target", { value: target });
      entry?.onFocusOutside?.(notification);
      entry?.onInteractOutside?.(notification);
      if (!notification.defaultPrevented) handleValueChange(null);
    };
    doc.addEventListener("focusin", onOutside);
    return () => {
      doc.removeEventListener("focusin", onOutside);
    };
  }, [activeValue, getContentNode, handleValueChange, isNestedLayerTarget]);

  const contextValue: NavigationMenuContextValue = useMemo(
    () => ({
      value: activeValue,
      open: activeValue !== null,
      setValue: handleValueChange,
      get isViewportRendered() { return viewportRef.current !== null; },
      getViewportNode,
      reposition,
      onValueChange: handleValueChange,
      previousValue,
      delayDuration: resolvedOpenDelay,
      closeDelay: resolvedCloseDelay,
      disableClickTrigger,
      disableHoverTrigger,
      disablePointerLeaveClose,
      lazyMount,
      lifecycleExplicit,
      viewportSide,
      setViewportSide,
      unmountOnExit,
      hideMode,
      viewport,
      skipDelayDuration,
      isSkipDelayActive,
      orientation,
      dir,
      loop,
      registerItem,
      unregisterItem,
      getItemValues,
      registerTrigger,
      registerLink,
      unregisterTrigger,
      unregisterLink,
      getTriggerElement,
      getControlElement,
      getControlType,
      getNextTriggerValue,
      getFirstTriggerValue,
      getLastTriggerValue,
      registerContentNode,
      unregisterContentNode,
      getContentNode,
      getContentValues,
      startCloseTimer,
      cancelCloseTimer,
      rootRef,
      viewportRef,
      idPrefix,
    }),
    [
      activeValue,
      getViewportNode,
      reposition,
      cancelCloseTimer,
      resolvedOpenDelay,
      resolvedCloseDelay,
      disableClickTrigger,
      disableHoverTrigger,
      disablePointerLeaveClose,
      lazyMount,
      lifecycleExplicit,
      viewportSide,
      unmountOnExit,
      hideMode,
      viewport,
      viewportRef,
      dir,
      getContentNode,
      getContentValues,
      getControlElement,
      getControlType,
      getFirstTriggerValue,
      getItemValues,
      getLastTriggerValue,
      getNextTriggerValue,
      getTriggerElement,
      handleValueChange,
      idPrefix,
      isSkipDelayActive,
      loop,
      orientation,
      previousValue,
      registerContentNode,
      registerItem,
      registerLink,
      registerTrigger,
      skipDelayDuration,
      startCloseTimer,
      unregisterContentNode,
      unregisterItem,
      unregisterLink,
      unregisterTrigger,
    ],
  );

  const behaviorProps = {
    ...navigationProps,
    ref: composedRef,
    "data-slot": dataSlot,
    "data-orientation": orientation,
    dir,
    "aria-label": ariaLabel,
    className,
    style,
  };

  return (
    <OverlayScopeProvider value={overlayScope}><NavigationMenuContextProvider value={contextValue}>
      {asChild
        ? cloneAndMerge(children, behaviorProps)
        : renderElement(render, "nav", {
            ...behaviorProps,
            children,
          })}
    </NavigationMenuContextProvider></OverlayScopeProvider>
  );
});
