"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useControllableState } from "./useControllableState.js";

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

function compareDocumentOrder(a: Element, b: Element): number {
  if (a === b) return 0;
  const position = a.compareDocumentPosition(b);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
  return 0;
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
  const [domVersion, setDomVersion] = useState(0);

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

    const observedItems = resolvedItems
      .filter((item) => item.id !== "")
      .map((item) => {
        const element = document.getElementById(item.id);
        if (!element) return null;
        return { ...item, element };
      })
      .filter((item): item is ResolvedScrollSpyItem & { element: HTMLElement } => item !== null)
      .sort((a, b) => compareDocumentOrder(a.element, b.element));

    const missingIds = resolvedItems
      .filter((item) => item.id !== "" && !document.getElementById(item.id))
      .map((item) => item.id);

    if (observedItems.length === 0 && missingIds.length === 0) return undefined;

    let mutationObserver: MutationObserver | undefined;
    if (missingIds.length > 0 && typeof MutationObserver !== "undefined" && document.body) {
      mutationObserver = new MutationObserver(() => {
        if (missingIds.some((id) => document.getElementById(id))) {
          setDomVersion((version) => version + 1);
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    if (observedItems.length === 0) {
      return () => mutationObserver?.disconnect();
    }

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

        const firstElement = observedItems[0]?.element;
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

    for (const item of observedItems) {
      observer.observe(item.element);
    }

    return () => {
      mutationObserver?.disconnect();
      observer.disconnect();
    };
  }, [
    defaultActiveId,
    domVersion,
    enabled,
    observerThreshold,
    resolvedItems,
    root,
    rootMargin,
    updateActiveId,
  ]);

  return { activeId, activeHref };
}
