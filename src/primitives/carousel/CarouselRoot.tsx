"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import { useCollection } from "../../collection.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import {
  CarouselContextProvider,
  type CarouselChangeReason,
  type CarouselContextValue,
  type CarouselLoopTransition,
  type CarouselSelectionOptions,
  type CarouselSlideData,
} from "./context.js";
import {
  getCarouselAdjacentValue,
  normalizeCarouselInterval,
} from "./utils.js";

type CarouselRootNativeProps = NativeDivProps<
  "children" | "defaultValue" | "dir" | "onChange"
>;

export interface CarouselRootProps extends CarouselRootNativeProps {
  /** Controlled active slide value. */
  value?: string;
  /** Initial active slide value for uncontrolled usage. */
  defaultValue?: string;
  /** Called when the active slide changes. */
  onValueChange?: (value: string, reason: CarouselChangeReason) => void;
  /** Controlled automatic-rotation state. */
  autoPlay?: boolean;
  /** Initial automatic-rotation state for uncontrolled usage. @default false */
  defaultAutoPlay?: boolean;
  /** Called when automatic rotation starts or stops. */
  onAutoPlayChange?: (autoPlay: boolean) => void;
  /** Delay between automatic slide changes in milliseconds. @default 7000 */
  interval?: number;
  /** Wrap Previous and Next across collection boundaries. @default true */
  loop?: boolean;
  /** Text direction used for scroll selection. Defaults to DirectionProvider. */
  dir?: DirectionValue;
  /** Accessible label inherited by Previous when it has no direct label. */
  previousAriaLabel?: string;
  /** Accessible label inherited by Next when it has no direct label. */
  nextAriaLabel?: string;
  /** Accessible action label used when rotation can be started. */
  startAriaLabel?: string;
  /** Accessible action label used when rotation can be stopped. */
  stopAriaLabel?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Carousel parts. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

type CarouselRootStyle = CSSProperties & {
  "--atom-carousel-count"?: number;
  "--atom-carousel-index"?: number;
};

const useSafeLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const CarouselRoot = forwardRef<HTMLDivElement, CarouselRootProps>(
  function CarouselRoot(
    {
      value,
      defaultValue = "",
      onValueChange,
      autoPlay,
      defaultAutoPlay = false,
      onAutoPlayChange,
      interval = 7000,
      loop = true,
      dir: dirProp,
      previousAriaLabel = "Previous slide",
      nextAriaLabel = "Next slide",
      startAriaLabel = "Start slide rotation",
      stopAriaLabel = "Stop slide rotation",
      render,
      asChild,
      children,
      className,
      style,
      role = "group",
      "aria-label": ariaLabel = "Featured content",
      "aria-roledescription": ariaRoleDescription = "carousel",
      "data-slot": dataSlot = "carousel-root",
      onFocusCapture,
      onMouseEnter,
      onMouseLeave,
      onPointerDownCapture,
      onPointerUpCapture,
      onPointerCancelCapture,
      ...restProps
    },
    ref,
  ) {
    const contextDir = useDirection();
    const dir = dirProp ?? contextDir;
    const [activeValue, setActiveValue] = useControllableState({
      value,
      defaultValue,
      onChange: (nextValue) => onValueChange?.(nextValue, changeReasonRef.current),
    });
    const [requestedAutoPlay, setRequestedAutoPlay] = useControllableState({
      value: autoPlay,
      defaultValue: defaultAutoPlay,
      onChange: onAutoPlayChange,
    });
    const [isHovered, setIsHovered] = useState(false);
    const [isStoppedByInteraction, setIsStoppedByInteraction] = useState(false);
    const [isDocumentVisible, setIsDocumentVisible] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [viewportElement, setViewportElement] = useState<HTMLElement | null>(null);
    const changeReasonRef = useRef<CarouselChangeReason>("scroll");
    const pointerRotationControlRef = useRef(false);
    const alignedValueRef = useRef("");
    const scrollTargetValueRef = useRef("");
    const pendingLoopRebaseRef = useRef("");
    const [loopTransition, setLoopTransition] = useState<CarouselLoopTransition>(null);
    const idPrefix = useId();
    const {
      version: collectionVersion,
      registerItem,
      unregisterItem,
      getItem,
      getItems,
      getValues,
    } = useCollection<string, HTMLElement, CarouselSlideData>();

    const slideValues = getValues();
    const activeIndex = slideValues.indexOf(activeValue);
    const canGoPrevious = loop
      ? slideValues.length > 1
      : activeIndex > 0;
    const canGoNext = loop
      ? slideValues.length > 1
      : activeIndex !== -1 && activeIndex < slideValues.length - 1;
    const activeAutoPlay = requestedAutoPlay && !isStoppedByInteraction;
    const effectiveAutoPlay =
      activeAutoPlay &&
      !isHovered &&
      isDocumentVisible &&
      slideValues.length > 1;

    const stopAutoPlay = useCallback(() => {
      setIsStoppedByInteraction(true);
      setRequestedAutoPlay(false);
    }, [setRequestedAutoPlay]);

    const scrollToValue = useCallback((nextValue: string, immediate = false) => {
      const element = getItem(nextValue)?.element;
      if (!element || !viewportElement) return;

      const viewportRect = viewportElement.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const left = dir === "rtl"
        ? elementRect.right - viewportRect.right
        : elementRect.left - viewportRect.left;
      const targetLeft = viewportElement.scrollLeft + left;

      if (!immediate) {
        if (typeof viewportElement.scrollTo === "function") {
          viewportElement.scrollTo({ left: targetLeft });
        } else {
          element.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
        return;
      }

      const previousScrollBehavior = viewportElement.style.scrollBehavior;
      viewportElement.style.scrollBehavior = "auto";
      if (typeof viewportElement.scrollTo === "function") {
        viewportElement.scrollTo({ behavior: "instant", left: targetLeft });
      } else {
        element.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
      }
      scrollTargetValueRef.current = "";
      const restoreScrollBehavior = () => {
        viewportElement.style.scrollBehavior = previousScrollBehavior;
      };
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(restoreScrollBehavior);
      } else {
        window.setTimeout(restoreScrollBehavior, 0);
      }
    }, [dir, getItem, viewportElement]);

    const shouldDeferScrollSelection = useCallback((candidateValue: string) => {
      const targetValue = scrollTargetValueRef.current;
      if (!targetValue) return false;
      if (candidateValue !== targetValue) return true;
      scrollTargetValueRef.current = "";
      return false;
    }, []);
    const clearPendingScrollSelection = useCallback(() => {
      scrollTargetValueRef.current = "";
    }, []);

    const selectValue = useCallback((
      nextValue: string,
      reason: CarouselChangeReason,
      options: CarouselSelectionOptions = {},
    ) => {
      if (!getItem(nextValue)) return;
      if (reason !== "autoplay" && reason !== "scroll") {
        stopAutoPlay();
      }
      const values = getValues();
      const currentIndex = values.indexOf(activeValue);
      const nextIndex = values.indexOf(nextValue);
      const wrapsNext = loop && options.direction === "next" &&
        currentIndex === values.length - 1 && nextIndex === 0;
      const wrapsPrevious = loop && options.direction === "previous" &&
        currentIndex === 0 && nextIndex === values.length - 1;

      if (options.rebase) {
        pendingLoopRebaseRef.current = nextValue;
        setLoopTransition(null);
      } else if (wrapsNext) {
        setLoopTransition("next");
      } else if (wrapsPrevious) {
        setLoopTransition("previous");
      } else {
        setLoopTransition(null);
      }

      changeReasonRef.current = reason;
      if (options.scroll === false) {
        alignedValueRef.current = nextValue;
      } else {
        alignedValueRef.current = "";
        scrollTargetValueRef.current = nextValue;
      }
      setActiveValue(nextValue);
    }, [activeValue, getItem, getValues, loop, setActiveValue, stopAutoPlay]);

    const go = useCallback((
      direction: "next" | "previous",
      reason: CarouselChangeReason,
    ) => {
      const nextValue = getCarouselAdjacentValue(
        getValues(),
        activeValue,
        direction,
        loop,
      );
      if (nextValue) selectValue(nextValue, reason, { direction });
    }, [activeValue, getValues, loop, selectValue]);

    const goPrevious = useCallback(
      (reason: CarouselChangeReason = "previous") => go("previous", reason),
      [go],
    );
    const goNext = useCallback(
      (reason: CarouselChangeReason = "next") => go("next", reason),
      [go],
    );

    const toggleAutoPlay = useCallback(() => {
      if (activeAutoPlay) {
        setIsStoppedByInteraction(true);
        setRequestedAutoPlay(false);
      } else {
        setIsStoppedByInteraction(false);
        setRequestedAutoPlay(true);
      }
    }, [activeAutoPlay, setRequestedAutoPlay]);

    useEffect(() => {
      if (!requestedAutoPlay) setIsStoppedByInteraction(false);
    }, [requestedAutoPlay]);

    useEffect(() => {
      const handleVisibilityChange = () => {
        setIsDocumentVisible(document.visibilityState !== "hidden");
      };
      handleVisibilityChange();
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    useEffect(() => {
      if (!effectiveAutoPlay) return undefined;
      const timeout = window.setTimeout(
        () => goNext("autoplay"),
        normalizeCarouselInterval(interval),
      );
      return () => window.clearTimeout(timeout);
    }, [activeValue, effectiveAutoPlay, goNext, interval]);

    useSafeLayoutEffect(() => {
      if (!activeValue || collectionVersion < 1) return;

      if (pendingLoopRebaseRef.current) {
        const rebaseValue = pendingLoopRebaseRef.current;
        pendingLoopRebaseRef.current = "";
        alignedValueRef.current = rebaseValue;
        scrollTargetValueRef.current = rebaseValue;
        scrollToValue(rebaseValue, true);
        return;
      }

      if (alignedValueRef.current === activeValue) return;
      const requestedScrollValue = scrollTargetValueRef.current;
      if (requestedScrollValue && requestedScrollValue !== activeValue) return;
      alignedValueRef.current = activeValue;
      if (!isInitialized) {
        scrollTargetValueRef.current = activeValue;
        scrollToValue(activeValue, true);
        setIsInitialized(true);
        return;
      }
      if (requestedScrollValue === activeValue) {
        scrollToValue(activeValue);
      } else {
        scrollTargetValueRef.current = activeValue;
        scrollToValue(activeValue, true);
      }
    }, [activeValue, collectionVersion, isInitialized, loopTransition, scrollToValue]);

    const registerSlide = useCallback((
      slideValue: string,
      element: HTMLElement,
      data: CarouselSlideData,
    ) => registerItem(slideValue, element, { data }), [registerItem]);

    const getSlideElement = useCallback(
      (slideValue: string) => getItem(slideValue)?.element ?? null,
      [getItem],
    );
    const getSlideData = useCallback(
      (slideValue: string) => getItem(slideValue)?.data ?? null,
      [getItem],
    );

    const contextValue = useMemo<CarouselContextValue>(() => ({
      activeValue,
      autoPlay: activeAutoPlay,
      isPlaying: effectiveAutoPlay,
      dir,
      loop,
      loopTransition,
      previousAriaLabel,
      nextAriaLabel,
      startAriaLabel,
      stopAriaLabel,
      idPrefix,
      registerSlide,
      unregisterSlide: unregisterItem,
      getSlideValues: getValues,
      getSlideElement,
      getSlideData,
      selectValue,
      goPrevious,
      goNext,
      canGoPrevious,
      canGoNext,
      stopAutoPlay,
      toggleAutoPlay,
      shouldDeferScrollSelection,
      clearPendingScrollSelection,
      setViewportElement,
    }), [
      activeValue,
      activeAutoPlay,
      canGoNext,
      canGoPrevious,
      clearPendingScrollSelection,
      dir,
      effectiveAutoPlay,
      getSlideData,
      getSlideElement,
      getValues,
      goNext,
      goPrevious,
      idPrefix,
      loop,
      loopTransition,
      nextAriaLabel,
      previousAriaLabel,
      registerSlide,
      selectValue,
      shouldDeferScrollSelection,
      startAriaLabel,
      stopAriaLabel,
      stopAutoPlay,
      toggleAutoPlay,
      unregisterItem,
    ]);

    const handleFocusCapture: FocusEventHandler<HTMLDivElement> = (event) => {
      const target = event.target as Element | null;
      const isPointerRotationFocus = pointerRotationControlRef.current &&
        Boolean(target?.closest("[data-atom-carousel-rotation-control]"));
      pointerRotationControlRef.current = false;

      // Pointer activation must reach RotationControl while it still reflects
      // the pre-click state. Keyboard focus and focus entering any other part
      // stop rotation immediately.
      if (activeAutoPlay && !isPointerRotationFocus) stopAutoPlay();
    };
    const handleMouseEnter: MouseEventHandler<HTMLDivElement> = () => setIsHovered(true);
    const handleMouseLeave: MouseEventHandler<HTMLDivElement> = () => setIsHovered(false);
    const handlePointerDownCapture: PointerEventHandler<HTMLDivElement> = (event) => {
      const target = event.target as Element | null;
      pointerRotationControlRef.current = Boolean(
        target?.closest("[data-atom-carousel-rotation-control]"),
      );
    };
    const handlePointerUpCapture: PointerEventHandler<HTMLDivElement> = () => {
      // Retain the marker through the browser's focus/click sequence. This
      // timeout only clears provenance; it never mutates carousel state.
      window.setTimeout(() => {
        pointerRotationControlRef.current = false;
      }, 0);
    };
    const handlePointerCancelCapture: PointerEventHandler<HTMLDivElement> = () => {
      pointerRotationControlRef.current = false;
    };
    const rootStyle: CarouselRootStyle = {
      ...style,
      "--atom-carousel-count": slideValues.length,
      "--atom-carousel-index": Math.max(0, activeIndex),
    };

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      role,
      dir,
      "aria-label": ariaLabel,
      "aria-roledescription": ariaRoleDescription,
      "data-slot": dataSlot,
      "data-state": effectiveAutoPlay
        ? "playing"
        : activeAutoPlay ? "paused" : "stopped",
      "data-direction": dir,
      "data-initialized": isInitialized ? "" : undefined,
      "data-loop-transition": loopTransition ?? undefined,
      "data-value": activeValue || undefined,
      className,
      style: rootStyle,
      onFocusCapture: composeEventHandlers(onFocusCapture, handleFocusCapture),
      onMouseEnter: composeEventHandlers(onMouseEnter, handleMouseEnter),
      onMouseLeave: composeEventHandlers(onMouseLeave, handleMouseLeave),
      onPointerDownCapture: composeEventHandlers(onPointerDownCapture, handlePointerDownCapture),
      onPointerUpCapture: composeEventHandlers(onPointerUpCapture, handlePointerUpCapture),
      onPointerCancelCapture: composeEventHandlers(onPointerCancelCapture, handlePointerCancelCapture),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children });

    return (
      <CarouselContextProvider value={contextValue}>
        {element}
      </CarouselContextProvider>
    );
  },
);
