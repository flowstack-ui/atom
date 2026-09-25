"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { decodeScrollHash, findScrollTarget, observeScrollTargets } from "../../hooks/scrollTargets.js";
import { focusScrollTarget, selectCurrentSection, targetOffset } from "./geometry.js";
import type { TableOfContentsApi, TableOfContentsChangeDetails, TableOfContentsOptions } from "./types.js";

export interface TableOfContentsController extends TableOfContentsApi {
  /** @internal Native Link activation records intent without cancelling browser navigation. */
  activateLink: (id: string) => { available: boolean; managed: boolean };
}

export function useTableOfContents(options: TableOfContentsOptions): TableOfContentsController {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [activeId, setActiveId] = useControllableState({
    value: options.activeId, defaultValue: options.defaultActiveId ?? "",
    onChange: (id) => optionsRef.current.onActiveIdChange?.(id, { reason: reason.current }),
  });
  const reason = useRef<TableOfContentsChangeDetails["reason"]>("scroll");
  const activeRef = useRef(activeId);
  activeRef.current = activeId;
  const setter = useRef(setActiveId);
  setter.current = setActiveId;
  const requested = useRef<string | null>(null);
  useEffect(() => { requested.current = null; }, [activeId]);
  const update = useCallback((id: string, why: TableOfContentsChangeDetails["reason"]) => {
    if (id === activeRef.current || id === requested.current) return;
    requested.current = id;
    reason.current = why;
    setter.current(id);
  }, []);
  const [visibleIds, setVisibleIds] = useState<readonly string[]>([]);
  const [availableIds, setAvailableIds] = useState<readonly string[]>([]);
  const [pendingId, setPendingId] = useState("");
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const activation = useRef<(id: string, fromLink: boolean) => { available: boolean; managed: boolean }>(
    () => ({ available: false, managed: false }),
  );
  const itemKey = JSON.stringify(options.items.map(({ id, depth }) => [id, depth]));
  const items = useMemo(() => {
    const ids = new Set<string>();
    return options.items.filter((item) => {
      const valid = !!item.id && !item.id.startsWith("#") && !ids.has(item.id)
        && Number.isInteger(item.depth) && item.depth >= 1 && item.depth <= 6;
      if (!valid) {
        console.warn("TableOfContents: items require unique nonempty IDs and integer depths 1–6; invalid item skipped.");
        return false;
      }
      ids.add(item.id);
      return true;
    });
  }, [itemKey]);

  useEffect(() => {
    setPendingId("");
    if (options.enabled === false || typeof document === "undefined") {
      setVisibleIds([]);
      setAvailableIds([]);
      return;
    }
    const root = options.getTargetRoot?.() ?? document;
    const doc = root.nodeType === 9 ? root as Document : root.ownerDocument!;
    const view = doc.defaultView;
    if (!view) return;
    const scrollElement = options.getScrollElement?.() ?? null;
    const eventRoot = scrollElement ?? doc;
    const managed = (options.navigation ?? (scrollElement || root.nodeType === 11 ? "managed" : "native")) === "managed";
    const reduced = view.matchMedia?.("(prefers-reduced-motion: reduce)");
    let targets: HTMLElement[] = [];
    let pending: { id: string; destination: number; started: number } | null = null;
    let frame = 0;
    let idle = 0;
    let safety = 0;
    let disposed = false;
    let reconciliationReason: TableOfContentsChangeDetails["reason"] = "scroll";
    let restoreFocus = () => {};
    const scrollTop = () => scrollElement?.scrollTop ?? view.scrollY;
    const height = () => scrollElement?.clientHeight ?? doc.documentElement.clientHeight;
    const maxScroll = () => Math.max(0, (scrollElement?.scrollHeight ?? doc.documentElement.scrollHeight) - height());
    const rootTop = () => scrollElement ? scrollElement.getBoundingClientRect().top + scrollElement.clientTop : 0;
    const offset = (target: HTMLElement) => targetOffset(target, scrollElement, optionsRef.current.scrollOffset);
    const destination = (target: HTMLElement) => Math.max(0, Math.min(maxScroll(),
      target.getBoundingClientRect().top - rootTop() + scrollTop() - offset(target)));
    const rendered = (target: HTMLElement) => target.isConnected && target.getClientRects().length > 0
      && view.getComputedStyle(target).visibility !== "hidden";
    const read = () => {
      frame = 0;
      if (disposed) return;
      const positions = targets.filter(rendered).map((target) => {
        const rect = target.getBoundingClientRect();
        return { id: target.id, top: rect.top - rootTop(), bottom: rect.bottom - rootTop(), offset: offset(target) };
      });
      const visible = positions.filter((position) => position.top < height() && position.bottom > 0).map(({ id }) => id);
      setVisibleIds((previous) => previous.length === visible.length && previous.every((id, index) => id === visible[index]) ? previous : visible);
      if (!pending) update(selectCurrentSection(positions, height(), maxScroll() > 0 && scrollTop() >= maxScroll() - 1,
        optionsRef.current.defaultActiveId), reconciliationReason);
      reconciliationReason = "scroll";
    };
    const schedule = () => { if (!frame && !disposed) frame = view.requestAnimationFrame(read); };
    const settle = () => {
      view.clearTimeout(idle);
      view.clearTimeout(safety);
      pending = null;
      setPendingId("");
      requested.current = null;
      schedule();
    };
    const onScroll = () => {
      reconciliationReason = "scroll";
      schedule();
      if (!pending) return;
      view.clearTimeout(idle);
      idle = view.setTimeout(settle, 160);
    };
    const onScrollEnd = (event: Event) => {
      // Nested rail/example scrolls must not settle article navigation.
      if (event.target === eventRoot) settle();
    };
    const move = (target: HTMLElement, instant = false) => {
      const behavior = instant || reduced?.matches || optionsRef.current.scrollBehavior === "instant" ? "instant" : "smooth";
      const top = destination(target);
      if (scrollElement) scrollElement.scrollTo({ top, behavior });
      else view.scrollTo({ top, behavior });
    };
    const start = (id: string, fromLink: boolean, historyEvent = false) => {
      const target = findScrollTarget(root, id);
      if (!items.some((item) => item.id === id) || !target || !rendered(target)) return { available: false, managed };
      view.clearTimeout(idle);
      view.clearTimeout(safety);
      requested.current = null;
      pending = { id, destination: destination(target), started: view.performance.now() };
      setPendingId(id);
      update(id, historyEvent ? "hash" : "navigation");
      if (managed) {
        if (!historyEvent && optionsRef.current.history !== "none") {
          const hash = `#${encodeURIComponent(id)}`;
          if (view.location.hash !== hash) {
            view.history[optionsRef.current.history === "replace" ? "replaceState" : "pushState"](view.history.state, "", hash);
          }
        }
        if (!historyEvent && optionsRef.current.focusTarget !== false) {
          restoreFocus();
          restoreFocus = focusScrollTarget(target);
        }
        move(target, historyEvent);
      } else if (!fromLink && !historyEvent) {
        view.location.hash = encodeURIComponent(id);
      }
      // Native links must keep their default action; this callback runs after it.
      idle = view.setTimeout(() => {
        if (pending && Math.abs(scrollTop() - pending.destination) <= 1) settle();
      }, 0);
      safety = view.setTimeout(settle, 3000);
      return { available: true, managed };
    };
    activation.current = (id, fromLink) => start(id, fromLink);
    const hash = () => {
      const id = decodeScrollHash(view.location.hash);
      if (pending?.id === id) return;
      if (items.some((item) => item.id === id)) start(id, true, true);
      else { settle(); }
    };
    const interrupt = (event: Event) => {
      if (!pending) return;
      if (event.type === "keydown" && !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes((event as KeyboardEvent).key)) return;
      settle();
    };
    const motionChange = () => {
      if (!pending || !reduced?.matches || !managed) return;
      const target = findScrollTarget(root, pending.id);
      if (target) move(target, true);
      settle();
    };
    const resize = view.ResizeObserver ? new view.ResizeObserver(schedule) : null;
    resize?.observe(scrollElement ?? doc.documentElement);
    const discovery = observeScrollTargets(root, items.map(({ id }) => id), (next) => {
      reconciliationReason = "items";
      targets.forEach((target) => resize?.unobserve(target));
      targets = next;
      targets.forEach((target) => resize?.observe(target));
      setAvailableIds((previous) => {
        const ids = next.map(({ id }) => id);
        return ids.length === previous.length && ids.every((id, index) => id === previous[index]) ? previous : ids;
      });
      if (pending && !next.some(({ id }) => id === pending?.id)) settle();
      schedule();
    });
    eventRoot.addEventListener("scroll", onScroll, { passive: true });
    eventRoot.addEventListener("scrollend", onScrollEnd);
    for (const event of ["wheel", "touchstart", "keydown"]) eventRoot.addEventListener(event, interrupt, { passive: true });
    view.addEventListener("resize", schedule);
    view.addEventListener("hashchange", hash);
    view.addEventListener("popstate", hash);
    root.addEventListener("load", schedule, true);
    reduced?.addEventListener("change", motionChange);
    void doc.fonts?.ready.then(() => { if (!disposed) schedule(); });
    hash();
    return () => {
      disposed = true;
      activation.current = () => ({ available: false, managed: false });
      discovery(); resize?.disconnect(); restoreFocus();
      view.cancelAnimationFrame(frame); view.clearTimeout(idle); view.clearTimeout(safety);
      eventRoot.removeEventListener("scroll", onScroll);
      eventRoot.removeEventListener("scrollend", onScrollEnd);
      for (const event of ["wheel", "touchstart", "keydown"]) eventRoot.removeEventListener(event, interrupt);
      view.removeEventListener("resize", schedule); view.removeEventListener("hashchange", hash); view.removeEventListener("popstate", hash);
      root.removeEventListener("load", schedule, true);
      reduced?.removeEventListener("change", motionChange);
    };
  }, [itemKey, options.enabled, options.getTargetRoot, options.getScrollElement, options.navigation, revision, update]);

  const navigateTo = useCallback((id: string) => activation.current(id, false).available, []);
  const activateLink = useCallback((id: string) => activation.current(id, true), []);
  const minDepth = Math.min(...items.map(({ depth }) => depth));
  return {
    activeId, visibleIds, pendingId, refresh, navigateTo, activateLink,
    getItemState: (id) => {
      const item = items.find((entry) => entry.id === id);
      return { current: activeId === id, visible: visibleIds.includes(id), pending: pendingId === id,
        depth: item?.depth ?? 1, level: item ? item.depth - minDepth : 0, targetAvailable: availableIds.includes(id) };
    },
  };
}
