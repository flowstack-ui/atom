"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefCallback,
} from "react";

export type VirtualizerScrollAlignment = "start" | "center" | "end" | "auto";

export interface VirtualItem {
  index: number;
  key: string | number;
  start: number;
  end: number;
  size: number;
}

export interface GetVirtualItemsOptions {
  count: number;
  scrollOffset: number;
  viewportSize: number;
  overscan?: number;
  getItemSize: (index: number) => number;
  getItemKey?: (index: number) => string | number;
}

export interface UseVirtualizerOptions {
  count: number;
  /** Keep this callback stable with useCallback or a module-level function for best scroll performance. */
  estimateSize: (index: number) => number;
  overscan?: number;
  getItemKey?: (index: number) => string | number;
}

export interface ScrollToIndexOptions {
  align?: VirtualizerScrollAlignment;
}

export interface UseVirtualizerReturn {
  scrollRef: RefCallback<HTMLElement>;
  scrollElement: HTMLElement | null;
  items: VirtualItem[];
  totalSize: number;
  scrollOffset: number;
  viewportSize: number;
  measureElement: (index: number, element: HTMLElement | null) => void;
  getItemRef: (index: number) => RefCallback<HTMLElement>;
  getItemSize: (index: number) => number;
  scrollToOffset: (offset: number) => void;
  scrollToIndex: (index: number, options?: ScrollToIndexOptions) => void;
}

const defaultOverscan = 1;

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeCount(count: number): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.floor(count);
}

function normalizeSize(size: number): number {
  if (!Number.isFinite(size) || size < 0) return 0;
  return size;
}

function normalizeOverscan(overscan: number | undefined): number {
  if (!Number.isFinite(overscan ?? defaultOverscan)) return defaultOverscan;
  return Math.max(0, Math.floor(overscan ?? defaultOverscan));
}

function getVirtualizerItemKey(
  index: number,
  getItemKey: ((index: number) => string | number) | undefined,
): string | number {
  return getItemKey?.(index) ?? index;
}

export function getVirtualTotalSize(
  count: number,
  getItemSize: (index: number) => number,
): number {
  const normalizedCount = normalizeCount(count);
  let totalSize = 0;

  for (let index = 0; index < normalizedCount; index += 1) {
    totalSize += normalizeSize(getItemSize(index));
  }

  return totalSize;
}

export function getVirtualOffsetForIndex(
  count: number,
  index: number,
  getItemSize: (itemIndex: number) => number,
): number {
  const normalizedCount = normalizeCount(count);
  const normalizedIndex = clampNumber(Math.floor(index), 0, normalizedCount);
  let offset = 0;

  for (let itemIndex = 0; itemIndex < normalizedIndex; itemIndex += 1) {
    offset += normalizeSize(getItemSize(itemIndex));
  }

  return offset;
}

export function getVirtualItems({
  count,
  scrollOffset,
  viewportSize,
  overscan,
  getItemSize,
  getItemKey,
}: GetVirtualItemsOptions): VirtualItem[] {
  const normalizedCount = normalizeCount(count);
  if (normalizedCount === 0) return [];

  const normalizedOverscan = normalizeOverscan(overscan);
  const normalizedViewportSize = Math.max(0, normalizeSize(viewportSize));
  const normalizedScrollOffset = Math.max(0, normalizeSize(scrollOffset));
  const viewportEnd = normalizedScrollOffset + normalizedViewportSize;
  const items: VirtualItem[] = [];
  let startIndex = 0;
  let endIndex = normalizedCount - 1;
  let offset = 0;
  let foundStart = normalizedScrollOffset === 0;

  for (let index = 0; index < normalizedCount; index += 1) {
    const size = normalizeSize(getItemSize(index));
    const itemEnd = offset + size;

    if (!foundStart && itemEnd > normalizedScrollOffset) {
      startIndex = index;
      foundStart = true;
    }

    if (foundStart && offset >= viewportEnd) {
      endIndex = Math.max(startIndex, index - 1);
      break;
    }

    offset = itemEnd;
  }

  if (!foundStart) {
    startIndex = normalizedCount - 1;
    endIndex = normalizedCount - 1;
  }

  const overscannedStart = Math.max(0, startIndex - normalizedOverscan);
  const overscannedEnd = Math.min(normalizedCount - 1, endIndex + normalizedOverscan);
  let currentStart = getVirtualOffsetForIndex(
    normalizedCount,
    overscannedStart,
    getItemSize,
  );

  for (let index = overscannedStart; index <= overscannedEnd; index += 1) {
    const size = normalizeSize(getItemSize(index));
    const start = currentStart;
    const end = start + size;
    items.push({
      index,
      key: getVirtualizerItemKey(index, getItemKey),
      start,
      end,
      size,
    });
    currentStart = end;
  }

  return items;
}

export function getVirtualScrollOffsetForIndex({
  count,
  index,
  align = "auto",
  scrollOffset,
  viewportSize,
  getItemSize,
}: {
  count: number;
  index: number;
  align?: VirtualizerScrollAlignment;
  scrollOffset: number;
  viewportSize: number;
  getItemSize: (itemIndex: number) => number;
}): number {
  const normalizedCount = normalizeCount(count);
  if (normalizedCount === 0) return 0;

  const itemIndex = clampNumber(Math.floor(index), 0, normalizedCount - 1);
  const itemStart = getVirtualOffsetForIndex(normalizedCount, itemIndex, getItemSize);
  const itemSize = normalizeSize(getItemSize(itemIndex));
  const itemEnd = itemStart + itemSize;
  const normalizedViewportSize = Math.max(0, normalizeSize(viewportSize));
  const normalizedScrollOffset = Math.max(0, normalizeSize(scrollOffset));
  const viewportEnd = normalizedScrollOffset + normalizedViewportSize;

  if (align === "auto") {
    if (itemStart < normalizedScrollOffset) return itemStart;
    if (itemEnd > viewportEnd) return Math.max(0, itemEnd - normalizedViewportSize);
    return normalizedScrollOffset;
  }

  if (align === "center") {
    return Math.max(0, itemStart - (normalizedViewportSize - itemSize) / 2);
  }

  if (align === "end") {
    return Math.max(0, itemEnd - normalizedViewportSize);
  }

  return itemStart;
}

export function useVirtualizer({
  count,
  estimateSize,
  overscan = defaultOverscan,
  getItemKey,
}: UseVirtualizerOptions): UseVirtualizerReturn {
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportSize, setViewportSize] = useState(0);
  const [measuredVersion, setMeasuredVersion] = useState(0);
  const measuredSizesRef = useRef(new Map<number, number>());
  const measuredElementsRef = useRef(new Map<number, HTMLElement>());
  const measuredElementIndexesRef = useRef(new Map<HTMLElement, number>());
  const itemRefCallbacksRef = useRef(new Map<number, RefCallback<HTMLElement>>());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const normalizedCount = normalizeCount(count);
  const normalizedOverscan = normalizeOverscan(overscan);

  const scrollRef = useCallback<RefCallback<HTMLElement>>((element) => {
    setScrollElement(element);
  }, []);

  const getItemSize = useCallback(
    (index: number) => {
      return measuredSizesRef.current.get(index) ?? normalizeSize(estimateSize(index));
    },
    [estimateSize, measuredVersion],
  );

  const totalSize = useMemo(
    () => getVirtualTotalSize(normalizedCount, getItemSize),
    [getItemSize, normalizedCount],
  );

  const items = useMemo(
    () =>
      getVirtualItems({
        count: normalizedCount,
        scrollOffset,
        viewportSize,
        overscan: normalizedOverscan,
        getItemSize,
        getItemKey,
      }),
    [
      getItemKey,
      getItemSize,
      normalizedCount,
      normalizedOverscan,
      scrollOffset,
      viewportSize,
    ],
  );

  const measureElement = useCallback((index: number, element: HTMLElement | null) => {
    if (!Number.isInteger(index) || index < 0) return;

    const previousElement = measuredElementsRef.current.get(index);
    if (previousElement === element) return;

    if (previousElement) {
      resizeObserverRef.current?.unobserve(previousElement);
      measuredElementIndexesRef.current.delete(previousElement);
    }

    if (!element) {
      measuredElementsRef.current.delete(index);
      return;
    }

    measuredElementsRef.current.set(index, element);
    measuredElementIndexesRef.current.set(element, index);

    const measure = () => {
      if (!element.isConnected) return;

      const size = normalizeSize(element.getBoundingClientRect().height);
      const previousSize = measuredSizesRef.current.get(index);
      if (previousSize === size) return;

      measuredSizesRef.current.set(index, size);
      setMeasuredVersion((version) => version + 1);
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      if (!resizeObserverRef.current) {
        resizeObserverRef.current = new ResizeObserver((entries) => {
          let changed = false;

          for (const entry of entries) {
            const target = entry.target;
            if (!(target instanceof HTMLElement) || !target.isConnected) continue;

            const targetIndex = measuredElementIndexesRef.current.get(target);
            if (targetIndex === undefined) continue;

            const size = normalizeSize(target.getBoundingClientRect().height);
            const previousSize = measuredSizesRef.current.get(targetIndex);
            if (previousSize === size) continue;

            measuredSizesRef.current.set(targetIndex, size);
            changed = true;
          }

          if (changed) {
            setMeasuredVersion((version) => version + 1);
          }
        });
      }

      resizeObserverRef.current.observe(element);
    }
  }, []);

  const getItemRef = useCallback(
    (index: number) => {
      const existingRef = itemRefCallbacksRef.current.get(index);
      if (existingRef) return existingRef;

      const itemRef: RefCallback<HTMLElement> = (element) => {
        measureElement(index, element);
      };
      itemRefCallbacksRef.current.set(index, itemRef);
      return itemRef;
    },
    [measureElement],
  );

  const scrollToOffset = useCallback(
    (offset: number) => {
      if (!scrollElement) return;
      const nextOffset = Math.max(0, normalizeSize(offset));
      scrollElement.scrollTop = nextOffset;
      setScrollOffset(scrollElement.scrollTop);
    },
    [scrollElement],
  );

  const scrollToIndex = useCallback(
    (index: number, { align = "auto" }: ScrollToIndexOptions = {}) => {
      if (!scrollElement) return;

      const nextOffset = getVirtualScrollOffsetForIndex({
        count: normalizedCount,
        index,
        align,
        scrollOffset: scrollElement.scrollTop,
        viewportSize: scrollElement.clientHeight,
        getItemSize,
      });

      scrollElement.scrollTop = nextOffset;
      setScrollOffset(scrollElement.scrollTop);
    },
    [getItemSize, normalizedCount, scrollElement],
  );

  useEffect(() => {
    if (!scrollElement) return undefined;

    const updateScrollState = () => {
      setScrollOffset(scrollElement.scrollTop);
      setViewportSize(scrollElement.clientHeight);
    };

    updateScrollState();
    scrollElement.addEventListener("scroll", updateScrollState, { passive: true });

    if (typeof ResizeObserver === "undefined") {
      return () => {
        scrollElement.removeEventListener("scroll", updateScrollState);
      };
    }

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(scrollElement);

    return () => {
      scrollElement.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [scrollElement]);

  useEffect(() => {
    let removedMeasuredItem = false;
    for (const index of measuredSizesRef.current.keys()) {
      if (index < normalizedCount) continue;
      const element = measuredElementsRef.current.get(index);
      if (element) {
        resizeObserverRef.current?.unobserve(element);
        measuredElementIndexesRef.current.delete(element);
      }
      measuredSizesRef.current.delete(index);
      measuredElementsRef.current.delete(index);
      itemRefCallbacksRef.current.delete(index);
      removedMeasuredItem = true;
    }
    if (removedMeasuredItem) {
      setMeasuredVersion((version) => version + 1);
    }
  }, [normalizedCount]);

  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      measuredElementsRef.current.clear();
      measuredElementIndexesRef.current.clear();
      itemRefCallbacksRef.current.clear();
    };
  }, []);

  return {
    scrollRef,
    scrollElement,
    items,
    totalSize,
    scrollOffset,
    viewportSize,
    measureElement,
    getItemRef,
    getItemSize,
    scrollToOffset,
    scrollToIndex,
  };
}
