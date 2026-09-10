"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useControllableState } from "./useControllableState.js";
import { observeScrollTargets } from "./scrollTargets.js";

export interface ScrollSpyItem {
  id: string;
  href?: string;
}

export interface UseScrollSpyOptions<TItem = ScrollSpyItem> {
  items: readonly TItem[];
  getId?: (item: TItem) => string | undefined;
  getHref?: (item: TItem) => string | undefined;
  activeId?: string;
  defaultActiveId?: string;
  onActiveIdChange?: (activeId: string) => void;
  enabled?: boolean;
  hashSync?: boolean;
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export interface UseScrollSpyReturn {
  activeId: string;
  activeHref?: string;
}

interface ResolvedScrollSpyItem {
  id: string;
  href?: string;
}

const defaultRootMargin = "0px 0px -70% 0px";

function defaultGetId(item: ScrollSpyItem): string | undefined {
  return item.id;
}

function defaultGetHref(item: ScrollSpyItem): string | undefined {
  return item.href;
}

function decodeHash(hash: string): string {
  const rawHash = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!rawHash) return "";

  try {
    return decodeURIComponent(rawHash);
  } catch {
    return rawHash;
  }
}

function getTopPosition(entry: IntersectionObserverEntry): number {
  return entry.boundingClientRect.top - (entry.rootBounds?.top ?? 0);
}

function getNearestVisibleEntry(
  entries: readonly IntersectionObserverEntry[],
): IntersectionObserverEntry | undefined {
  const visibleEntries = entries.filter((entry) => entry.isIntersecting);

  return visibleEntries.sort((a, b) => {
    const aTop = getTopPosition(a);
    const bTop = getTopPosition(b);
    const aIsBelowTop = aTop >= 0;
    const bIsBelowTop = bTop >= 0;

    if (aIsBelowTop && bIsBelowTop) return aTop - bTop;
    if (!aIsBelowTop && !bIsBelowTop) return bTop - aTop;
    return aIsBelowTop ? -1 : 1;
  })[0];
}

export function useScrollSpy<TItem = ScrollSpyItem>({
  items,
  getId = defaultGetId as (item: TItem) => string | undefined,
  getHref = defaultGetHref as (item: TItem) => string | undefined,
  activeId: activeIdProp,
  defaultActiveId = "",
  onActiveIdChange,
  enabled = true,
  hashSync = true,
  root = null,
  rootMargin = defaultRootMargin,
  threshold = 0,
}: UseScrollSpyOptions<TItem>): UseScrollSpyReturn {
  const [activeId, setActiveId] = useControllableState<string>({
    value: activeIdProp,
    defaultValue: defaultActiveId,
    onChange: onActiveIdChange,
  });
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const thresholdKey = Array.isArray(threshold) ? threshold.join(",") : String(threshold);
  const observerThreshold = useMemo(
    () => (Array.isArray(threshold) ? [...threshold] : threshold),
    [thresholdKey],
  );

  const updateActiveId = useCallback(
    (nextActiveId: string) => {
      if (activeIdRef.current === nextActiveId) return;
      activeIdRef.current = nextActiveId;
      setActiveId(nextActiveId);
    },
    [setActiveId],
  );

  const resolvedItems = useMemo<ResolvedScrollSpyItem[]>(
    () =>
      items.flatMap((item) => {
        const id = getId(item);
        if (id === undefined) return [];
        const href = getHref(item);
        return href === undefined ? [{ id }] : [{ id, href }];
      }),
    [getHref, getId, items],
  );

  const activeHref = useMemo(
    () => resolvedItems.find((item) => item.id === activeId)?.href,
    [activeId, resolvedItems],
  );

  useEffect(() => {
    if (!enabled || !hashSync || typeof window === "undefined") return undefined;

    const syncHash = () => {
      const nextActiveId = decodeHash(window.location.hash) || defaultActiveId;
      if (activeIdRef.current !== nextActiveId) {
        updateActiveId(nextActiveId);
      }
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [defaultActiveId, enabled, hashSync, updateActiveId]);

  useEffect(() => {
    if (
      !enabled ||
      typeof document === "undefined" ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    let observedItems: HTMLElement[] = [];
    const visibleEntries = new Map<Element, IntersectionObserverEntry>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleEntries.set(entry.target, entry);
          } else {
            visibleEntries.delete(entry.target);
          }
        }

        const nearestEntry = getNearestVisibleEntry([...visibleEntries.values()]);
        if (nearestEntry?.target.id && activeIdRef.current !== nearestEntry.target.id) {
          updateActiveId(nearestEntry.target.id);
          return;
        }

        const firstElement = observedItems[0];
        if (
          defaultActiveId !== activeIdRef.current &&
          firstElement?.isConnected &&
          firstElement.getBoundingClientRect().top > 0
        ) {
          updateActiveId(defaultActiveId);
        }
      },
      { root, rootMargin, threshold: observerThreshold },
    );

    const stopDiscovery = observeScrollTargets(document, resolvedItems.map(({ id }) => id), (targets) => {
      observer.disconnect();
      visibleEntries.clear();
      observedItems = targets;
      for (const target of targets) observer.observe(target);
    });

    return () => {
      stopDiscovery();
      observer.disconnect();
    };
  }, [
    defaultActiveId,
    enabled,
    observerThreshold,
    resolvedItems,
    root,
    rootMargin,
    updateActiveId,
  ]);

  return { activeId, activeHref };
}
