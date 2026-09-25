"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useDirection, type DirectionValue } from "../direction/index.js";
import type {
  CarouselChangeReason,
  CarouselContextValue,
  CarouselSlideData,
} from "./context.js";
import {
  closestCarouselPage,
  getCarouselSnapPages,
  positiveCarouselNumber,
  type CarouselItemMeasurement,
  type CarouselSnapPage,
} from "./geometry.js";
import { normalizeCarouselInterval } from "./utils.js";
import { createCarouselController, type CarouselController } from "./controller.js";

export interface CarouselPageChangeDetails {
  page: number;
  value: string;
  reason: CarouselChangeReason;
}
export interface CarouselTranslations {
  previous?: string;
  next?: string;
  start?: string;
  stop?: string;
  indicator?: (page: number) => string;
  progress?: (page: number, count: number) => string;
}
interface CarouselOptions {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, reason: CarouselChangeReason) => void;
  page?: number;
  defaultPage?: number;
  onPageChange?: (details: CarouselPageChangeDetails) => void;
  autoPlay?: boolean;
  defaultAutoPlay?: boolean;
  interval?: number;
  onAutoPlayChange?: (playing: boolean) => void;
  onAutoplayStatusChange?: (details: { isPlaying: boolean }) => void;
  onDragStatusChange?: (details: { isDragging: boolean }) => void;
  loop?: boolean;
  dir?: DirectionValue;
  orientation?: "horizontal" | "vertical";
  slidesPerPage?: number;
  slidesPerMove?: number | "auto";
  autoSize?: boolean;
  snapType?: "mandatory" | "proximity";
  inViewThreshold?: number | number[];
  allowMouseDrag?: boolean;
  slideCount?: number;
  translations?: CarouselTranslations;
  ids?: { root?: string; viewport?: string; item?: (value: string) => string };
  previousAriaLabel?: string;
  nextAriaLabel?: string;
  startAriaLabel?: string;
  stopAriaLabel?: string;
}
export type UseCarouselProps = Omit<
  CarouselOptions,
  "value" | "defaultValue" | "page" | "defaultPage"
> &
  (
    | {
        value?: string;
        defaultValue?: string;
        page?: never;
        defaultPage?: never;
      }
    | {
        page?: number;
        defaultPage?: number;
        value?: never;
        defaultValue?: never;
      }
  );

const useLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;
const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/** One controller is shared by Root and RootProvider; no second selection engine. */
export function useCarousel(
  options: UseCarouselProps = {},
): CarouselController {
  const inheritedDir = useDirection();
  const dir = options.dir ?? inheritedDir;
  const orientation = options.orientation ?? "horizontal";
  const vertical = orientation === "vertical";
  const loop = options.loop ?? true;
  const slidesPerPage = positiveCarouselNumber(options.slidesPerPage ?? 1);
  const move =
    options.slidesPerMove === undefined || options.slidesPerMove === "auto"
      ? Math.max(1, Math.floor(slidesPerPage))
      : Math.max(1, Math.floor(positiveCarouselNumber(options.slidesPerMove)));
  const initialCount = Number.isFinite(options.slideCount)
    ? Math.max(0, Math.floor(options.slideCount!))
    : 0;
  const idPrefix = useId();
  const optionsRef = useRef(options);
  optionsRef.current = options;
  useEffect(() => {
    if (options.page !== undefined && options.value !== undefined)
      console.warn(
        "Carousel: choose page or value control, not both; page takes precedence.",
      );
  }, [options.page, options.value]);
  const [internalValue, setInternalValue] = useState(
    options.defaultValue ?? "",
  );
  const [internalPage, setInternalPage] = useState(options.defaultPage ?? 0);
  const [requested, setRequested] = useState(options.defaultAutoPlay ?? false);
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [isDragging, setDragging] = useState(false);
  const [touchNavigation, setTouchNavigation] = useState(false);
  const [viewport, setViewportElement] = useState<HTMLElement | null>(null);
  const [version, setVersion] = useState(0);
  const items = useRef(
    new Map<string, { element: HTMLElement; data: CarouselSlideData }>(),
  );
  const [geometry, setGeometry] = useState<{
    items: CarouselItemMeasurement[];
    pages: CarouselSnapPage[];
    viewport: number;
    cycle: number;
    seamless: boolean;
  }>({ items: [], pages: [], viewport: 0, cycle: 0, seamless: false });
  const [visibleValues, setVisibleValues] = useState<string[]>([]);
  const [inViewValues, setInViewValues] = useState<string[]>([]);
  const [shifts, setShifts] = useState<Record<string, number>>({});
  const shiftsRef = useRef(shifts);
  shiftsRef.current = shifts;
  const [initialized, setInitialized] = useState(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const touchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const pointerRotation = useRef(false);
  const targetRef = useRef<{ page: number; offset: number } | null>(null);
  const snapRestoreFrame = useRef(0);
  const signatureRef = useRef("");
  const previousValuesRef = useRef<string[]>([]);
  const live = useRef<CarouselContextValue | null>(null);

  const getSlideValues = useCallback(
    () =>
      Array.from(items.current.entries())
        .sort((a, b) => {
          const position = a[1].element.compareDocumentPosition(b[1].element);
          return position & 4 ? -1 : position & 2 ? 1 : 0;
        })
        .map(([value]) => value),
    [],
  );
  const getSlideElement = useCallback(
    (value: string) => items.current.get(value)?.element ?? null,
    [],
  );
  const getSlideData = useCallback(
    (value: string) => items.current.get(value)?.data ?? null,
    [],
  );
  const registerSlide = useCallback(
    (value: string, element: HTMLElement, data: CarouselSlideData) => {
      items.current.set(value, { element, data });
      setVersion((n) => n + 1);
    },
    [],
  );
  const unregisterSlide = useCallback((value: string) => {
    items.current.delete(value);
    setVersion((n) => n + 1);
  }, []);
  const readOffset = useCallback(
    () =>
      !viewport
        ? 0
        : vertical
          ? viewport.scrollTop
          : dir === "rtl"
            ? -viewport.scrollLeft
            : viewport.scrollLeft,
    [viewport, vertical, dir],
  );
  const writeOffset = useCallback(
    (offset: number, instant = false) => {
      if (!viewport) return;
      cancelAnimationFrame(snapRestoreFrame.current);
      // Browser snapping must not redirect a command to an item's old cyclic position.
      viewport.setAttribute("data-programmatic", "");
      const position = vertical
        ? { top: offset }
        : { left: dir === "rtl" ? -offset : offset };
      viewport.scrollTo?.({
        ...position,
        ...(instant ? { behavior: "instant" as ScrollBehavior } : {}),
      });
    },
    [viewport, vertical, dir],
  );

  const refresh = useCallback(() => {
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    const offset = readOffset();
    const size = vertical ? viewport.clientHeight : viewport.clientWidth;
    if (!size) return;
    const viewportStyle = getComputedStyle(viewport);
    const padding =
      parseFloat(
        vertical
          ? viewportStyle.scrollPaddingTop
          : dir === "rtl"
            ? viewportStyle.scrollPaddingRight
            : viewportStyle.scrollPaddingLeft,
      ) || 0;
    const measured = getSlideValues().flatMap((value) => {
      const entry = items.current.get(value);
      if (!entry) return [];
      const rect = entry.element.getBoundingClientRect();
      const delta = vertical
        ? rect.top - bounds.top - viewport.clientTop
        : dir === "rtl"
          ? bounds.right - rect.right - viewport.clientLeft
          : rect.left - bounds.left - viewport.clientLeft;
      return [
        {
          value,
          start: delta + offset - (shiftsRef.current[value] ?? 0),
          size: vertical ? rect.height : rect.width,
          align: entry.data.snapAlign,
        },
      ];
    });
    const track = items.current.values().next().value?.element.parentElement;
    const gap = track
      ? parseFloat(
          vertical
            ? getComputedStyle(track).rowGap
            : getComputedStyle(track).columnGap,
        ) || 0
      : 0;
    const first = measured[0];
    const last = measured[measured.length - 1];
    const cycle =
      first && last ? last.start + last.size - first.start + gap : 0;
    const seamless =
      loop &&
      measured.length > 1 &&
      cycle >= size + Math.max(...measured.map((item) => item.size)) - 1;
    const extent = vertical ? viewport.scrollHeight : viewport.scrollWidth;
    const pages =
      cycle <= size + 1 && measured.length
        ? [
            {
              value: measured[0]!.value,
              offset: Math.max(0, measured[0]!.start - padding),
              index: 0,
            },
          ]
        : getCarouselSnapPages(measured, size, extent, move, padding, seamless);
    const next = { items: measured, pages, viewport: size, cycle, seamless };
    setGeometry((previous) => (same(previous, next) ? previous : next));
  }, [viewport, readOffset, vertical, dir, getSlideValues, move, loop]);

  const fallbackValues = getSlideValues();
  const pages = useMemo(
    () =>
      geometry.pages.length
        ? geometry.pages
        : fallbackValues.length
          ? fallbackValues.map((value, index) => ({
              value,
              offset: index,
              index,
            }))
          : Array.from(
              { length: Math.ceil(initialCount / move) },
              (_, index) => ({
                value: "",
                offset: index,
                index: index * Math.floor(move),
              }),
            ),
    [geometry.pages, fallbackValues.join("\u0000"), initialCount, move],
  );
  const recoveryIndex = previousValuesRef.current.indexOf(internalValue);
  const recoveredValue =
    recoveryIndex >= 0 && !fallbackValues.includes(internalValue)
      ? (fallbackValues[Math.min(recoveryIndex, fallbackValues.length - 1)] ??
        "")
      : internalValue;
  const suppliedValue = options.value ?? recoveredValue;
  const valueIndex = fallbackValues.indexOf(suppliedValue);
  const pageForValue = pages.reduce(
    (best, snap, index) => (snap.index <= valueIndex ? index : best),
    0,
  );
  const requestedPage =
    options.page ?? (suppliedValue ? pageForValue : internalPage);
  const page = Math.min(
    Math.max(0, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 0),
    Math.max(0, pages.length - 1),
  );
  const activeValue = pages[page]?.value ?? suppliedValue;
  const autoPlay = (options.autoPlay ?? requested) && !stopped;
  const canGoPrevious = pages.length > 1 && (loop || page > 0);
  const canGoNext = pages.length > 1 && (loop || page < pages.length - 1);
  const isPlaying =
    autoPlay && !hovered && documentVisible && !isDragging && canGoNext;
  useLayout(() => {
    if (
      options.value === undefined &&
      options.page === undefined &&
      internalValue !== recoveredValue
    ) {
      setInternalValue(recoveredValue);
      optionsRef.current.onValueChange?.(recoveredValue, "collection");
      optionsRef.current.onPageChange?.({
        page,
        value: recoveredValue,
        reason: "collection",
      });
    }
    previousValuesRef.current = fallbackValues;
  }, [
    fallbackValues.join("\u0000"),
    internalValue,
    recoveredValue,
    options.value,
    options.page,
    page,
  ]);

  const stopAutoPlay = useCallback(() => {
    const api = live.current;
    setStopped(true);
    setRequested(false);
    if (api?.autoPlay) optionsRef.current.onAutoPlayChange?.(false);
  }, []);
  const play = useCallback(() => {
    setStopped(false);
    setRequested(true);
    if (!live.current?.autoPlay) optionsRef.current.onAutoPlayChange?.(true);
  }, []);
  const toggleAutoPlay = useCallback(() => {
    if (live.current?.autoPlay) stopAutoPlay();
    else play();
  }, [play, stopAutoPlay]);

  const updateVisibility = useCallback(() => {
    if (!viewport) return;
    const offset = readOffset();
    const nextShifts: Record<string, number> = {};
    if (geometry.seamless)
      for (const item of geometry.items) {
        nextShifts[item.value] =
          Math.max(
            -1,
            Math.min(
              1,
              Math.round(
                (offset + geometry.viewport / 2 - item.start - item.size / 2) /
                  geometry.cycle,
              ),
            ),
          ) * geometry.cycle;
      }
    // Cyclic positioning and the native scroll offset must reach the same frame.
    // React's deferred render alone can expose a blank frame during WebKit rebasing.
    shiftsRef.current = nextShifts;
    for (const item of geometry.items) {
      const physicalShift =
        (nextShifts[item.value] ?? 0) * (!vertical && dir === "rtl" ? -1 : 1);
      getSlideElement(item.value)?.style.setProperty(
        "--atom-carousel-shift",
        `${physicalShift}px`,
      );
    }
    setShifts((previous) =>
      same(previous, nextShifts) ? previous : nextShifts,
    );
    const thresholdInput = optionsRef.current.inViewThreshold ?? 0.6;
    const threshold = Math.max(
      0,
      Math.min(
        1,
        Array.isArray(thresholdInput)
          ? Math.min(...thresholdInput)
          : thresholdInput,
      ),
    );
    const visible: string[] = [];
    const inView: string[] = [];
    for (const item of geometry.items) {
      const start = item.start + (nextShifts[item.value] ?? 0);
      const intersection = Math.max(
        0,
        Math.min(start + item.size, offset + geometry.viewport) -
          Math.max(start, offset),
      );
      if (intersection > 1) visible.push(item.value);
      if (
        intersection > 0 &&
        intersection / Math.max(1, item.size) >= threshold
      )
        inView.push(item.value);
    }
    const focused = viewport.ownerDocument.activeElement;
    for (const item of geometry.items) {
      const element = getSlideElement(item.value);
      if (
        !visible.includes(item.value) &&
        focused &&
        element?.contains(focused)
      )
        viewport.focus({ preventScroll: true });
    }
    setVisibleValues((previous) =>
      same(previous, visible) ? previous : visible,
    );
    setInViewValues((previous) => (same(previous, inView) ? previous : inView));
  }, [viewport, readOffset, geometry, getSlideElement, vertical, dir]);

  const commitPage = useCallback(
    (next: number, reason: CarouselChangeReason) => {
      const api = live.current;
      const target = api?.pageSnapPoints[next];
      if (!api || !target || next === api.page) return;
      if (
        optionsRef.current.page === undefined &&
        optionsRef.current.value === undefined
      ) {
        setInternalPage(next);
        setInternalValue(target.value);
      }
      optionsRef.current.onPageChange?.({
        page: next,
        value: target.value,
        reason,
      });
      optionsRef.current.onValueChange?.(target.value, reason);
    },
    [],
  );

  const selectPage = useCallback(
    (
      next: number,
      reason: CarouselChangeReason = "picker",
      direction?: "next" | "previous",
    ) => {
      const api = live.current;
      if (!api || !Number.isFinite(next)) return;
      next = Math.min(
        Math.max(0, Math.floor(next)),
        Math.max(0, api.pageSnapPoints.length - 1),
      );
      const target = api.pageSnapPoints[next];
      if (!target) return;
      if (reason !== "autoplay" && reason !== "scroll") stopAutoPlay();
      let offset = target.offset;
      const wraps =
        api.loop &&
        ((direction === "next" && next < api.page) ||
          (direction === "previous" && next > api.page));
      if (wraps && geometry.seamless)
        offset += direction === "next" ? geometry.cycle : -geometry.cycle;
      // Controlled requests notify the owner; only accepted props may move the viewport.
      if (
        optionsRef.current.page !== undefined ||
        optionsRef.current.value !== undefined
      ) {
        targetRef.current = { page: next, offset };
        commitPage(next, reason);
        return;
      }
      targetRef.current = { page: next, offset };
      writeOffset(offset, Boolean(wraps && !geometry.seamless));
      commitPage(next, reason);
      live.current?.onViewportScroll();
    },
    [stopAutoPlay, geometry.seamless, geometry.cycle, writeOffset, commitPage],
  );
  const selectValue = useCallback(
    (value: string, reason: CarouselChangeReason = "picker") => {
      const api = live.current;
      if (!api) return;
      const itemIndex = api.getSlideValues().indexOf(value);
      if (itemIndex < 0) return;
      const index = api.pageSnapPoints.reduce(
        (best, snap, n) => (snap.index <= itemIndex ? n : best),
        0,
      );
      selectPage(index, reason);
    },
    [selectPage],
  );
  const goNext = useCallback(
    (reason: CarouselChangeReason = "next") => {
      const api = live.current;
      if (api?.canGoNext)
        selectPage((api.page + 1) % api.pageSnapPoints.length, reason, "next");
    },
    [selectPage],
  );
  const goPrevious = useCallback(
    (reason: CarouselChangeReason = "previous") => {
      const api = live.current;
      if (api?.canGoPrevious)
        selectPage(
          (api.page - 1 + api.pageSnapPoints.length) %
            api.pageSnapPoints.length,
          reason,
          "previous",
        );
    },
    [selectPage],
  );

  const settle = useCallback(() => {
    if (!viewport || isDragging || !pages.length) return;
    let offset = readOffset();
    if (geometry.seamless && geometry.cycle) {
      const start = pages[0]!.offset;
      if (offset < start - 1) offset += geometry.cycle;
      else if (offset >= start + geometry.cycle - 1) offset -= geometry.cycle;
      if (Math.abs(offset - readOffset()) > 1) writeOffset(offset, true);
    }
    const next = closestCarouselPage(pages, offset);
    const target = targetRef.current;
    if (target && next !== target.page) return;
    targetRef.current = null;
    commitPage(next, "scroll");
    updateVisibility();
    if (
      (optionsRef.current.page !== undefined ||
        optionsRef.current.value !== undefined) &&
      next !== live.current?.page
    ) {
      const current = pages[live.current?.page ?? 0];
      if (current) writeOffset(current.offset, true);
    }
    cancelAnimationFrame(snapRestoreFrame.current);
    snapRestoreFrame.current = requestAnimationFrame(() => {
      snapRestoreFrame.current = requestAnimationFrame(() =>
        viewport.removeAttribute("data-programmatic"),
      );
    });
  }, [
    viewport,
    isDragging,
    pages,
    readOffset,
    geometry.seamless,
    geometry.cycle,
    writeOffset,
    commitPage,
    updateVisibility,
  ]);
  const onViewportScroll = useCallback(() => {
    updateVisibility();
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => live.current?.settle(), 150);
  }, [updateVisibility]);
  const clearPendingScrollSelection = useCallback(() => {
    targetRef.current = null;
    clearTimeout(settleTimer.current);
  }, []);

  useLayout(() => {
    const current = pages[page];
    if (!viewport || !current) return;
    const signature = JSON.stringify([
      page,
      current.value,
      pages,
      orientation,
      dir,
    ]);
    if (signatureRef.current === signature) return;
    const initial = !signatureRef.current;
    signatureRef.current = signature;
    const pending = targetRef.current;
    // A new owner value or collection layout supersedes an older requested target.
    // Do not let its delayed scroll event hold subsequent native selection hostage.
    const target = pending?.page === page ? pending : null;
    if (!target) targetRef.current = null;
    writeOffset(target?.offset ?? current.offset, initial || !target);
    if (geometry.viewport > 0) {
      setInitialized(true);
      updateVisibility();
      onViewportScroll();
    }
  }, [
    viewport,
    page,
    pages,
    orientation,
    dir,
    writeOffset,
    updateVisibility,
    onViewportScroll,
    geometry.viewport,
  ]);

  useLayout(() => {
    if (!viewport) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    };
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    const intersection =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) schedule();
          });
    observer?.observe(viewport);
    intersection?.observe(viewport);
    for (const { element } of items.current.values())
      observer?.observe(element);
    const track = items.current.values().next().value?.element.parentElement;
    const mutation =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(schedule);
    if (track) mutation?.observe(track, { childList: true });
    viewport.addEventListener("load", schedule, true);
    viewport.ownerDocument.fonts?.addEventListener("loadingdone", schedule);
    window.addEventListener("resize", schedule);
    refresh();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      intersection?.disconnect();
      mutation?.disconnect();
      viewport.removeEventListener("load", schedule, true);
      viewport.ownerDocument.fonts?.removeEventListener(
        "loadingdone",
        schedule,
      );
      window.removeEventListener("resize", schedule);
    };
  }, [viewport, version, refresh]);
  useEffect(() => {
    const update = () =>
      setDocumentVisible(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!options.autoPlay) setStopped(false);
  }, [options.autoPlay]);
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(
      () => live.current?.goNext("autoplay"),
      normalizeCarouselInterval(options.interval ?? 7000),
    );
    return () => clearTimeout(timer);
  }, [isPlaying, page, options.interval]);
  useEffect(() => {
    optionsRef.current.onAutoplayStatusChange?.({ isPlaying });
  }, [isPlaying]);
  useEffect(() => {
    optionsRef.current.onDragStatusChange?.({ isDragging });
  }, [isDragging]);
  useEffect(
    () => () => {
      clearTimeout(settleTimer.current);
      clearTimeout(touchTimer.current);
      cancelAnimationFrame(snapRestoreFrame.current);
    },
    [],
  );

  const rootStyle = {
    "--atom-carousel-count": geometry.items.length,
    "--atom-carousel-index": Math.max(0, getSlideValues().indexOf(activeValue)),
    "--atom-carousel-slides-per-page": slidesPerPage,
  } as CSSProperties;
  const api: CarouselContextValue = {
    activeValue,
    autoPlay,
    isPlaying,
    dir,
    loop,
    seamlessLoop: geometry.seamless,
    loopTransition: null,
    idPrefix,
    previousAriaLabel:
      options.previousAriaLabel ??
      options.translations?.previous ??
      "Previous slide",
    nextAriaLabel:
      options.nextAriaLabel ?? options.translations?.next ?? "Next slide",
    startAriaLabel:
      options.startAriaLabel ??
      options.translations?.start ??
      "Start slide rotation",
    stopAriaLabel:
      options.stopAriaLabel ??
      options.translations?.stop ??
      "Stop slide rotation",
    registerSlide,
    unregisterSlide,
    getSlideValues,
    getSlideElement,
    getSlideData,
    selectValue,
    goPrevious,
    goNext,
    canGoPrevious,
    canGoNext,
    stopAutoPlay,
    toggleAutoPlay,
    shouldDeferScrollSelection: () => Boolean(targetRef.current),
    clearPendingScrollSelection,
    setViewportElement,
    page,
    pageSnapPoints: pages,
    selectPage,
    refresh,
    play,
    pause: stopAutoPlay,
    orientation,
    slidesPerPage,
    autoSize: options.autoSize ?? false,
    snapType: options.snapType ?? "mandatory",
    allowMouseDrag: options.allowMouseDrag ?? false,
    isDragging,
    setDragging,
    initialized,
    visibleValues,
    inViewValues,
    shifts,
    onViewportScroll,
    settle,
    readOffset,
    writeOffset,
    translations: options.translations,
    ids: options.ids,
    rootStyle,
    touchNavigation,
    onRootFocus: (target) => {
      if (
        !pointerRotation.current ||
        !target.closest("[data-atom-carousel-rotation-control]")
      )
        stopAutoPlay();
      pointerRotation.current = false;
    },
    onRootHover: setHovered,
    onRootPointerDown: (target) => {
      pointerRotation.current = Boolean(
        target.closest("[data-atom-carousel-rotation-control]"),
      );
    },
    onRootPointerUp: (pointerType) => {
      pointerRotation.current = false;
      if (pointerType !== "mouse") {
        setTouchNavigation(true);
        clearTimeout(touchTimer.current);
        touchTimer.current = setTimeout(() => setTouchNavigation(false), 2500);
      }
    },
    slideCount: options.slideCount,
    defaultPage: options.page ?? options.defaultPage ?? 0,
  };
  live.current = api;
  return createCarouselController(api);
}
