"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import { useCreateOverlayScope, type OverlayScope } from "../../hooks/overlayScope.js";
import { useDirection } from "../direction/index.js";
import { useOptionalModalContext } from "../modal/context.js";
import { getTopModalLayer } from "../modal/layer.js";
import { constrainRect, validatePoint, validateSize, type PanelRect, type FloatingPanelPoint, type FloatingPanelSize, type FloatingPanelStage } from "./geometry.js";

export type FloatingPanelChangeReason = "pointer" | "keyboard" | "programmatic" | "boundary" | "stage" | "cancel";
export interface FloatingPanelChangeDetails { reason: FloatingPanelChangeReason }
export type FloatingPanelFocusTarget = RefObject<HTMLElement | null> | (() => HTMLElement | null | false | undefined) | false;
export interface FloatingPanelOptions {
  id?: string; ids?: Partial<Record<"trigger" | "positioner" | "content" | "title" | "description" | "header", string>>;
  dir?: "ltr" | "rtl"; open?: boolean; defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason?: string) => void;
  position?: FloatingPanelPoint; defaultPosition?: FloatingPanelPoint;
  size?: FloatingPanelSize; defaultSize?: FloatingPanelSize;
  minSize?: FloatingPanelSize; maxSize?: FloatingPanelSize;
  onPositionChange?: (point: FloatingPanelPoint, details: FloatingPanelChangeDetails) => void;
  onPositionChangeEnd?: (point: FloatingPanelPoint, details: FloatingPanelChangeDetails) => void;
  onSizeChange?: (size: FloatingPanelSize, details: FloatingPanelChangeDetails) => void;
  onSizeChangeEnd?: (size: FloatingPanelSize, details: FloatingPanelChangeDetails) => void;
  onStageChange?: (stage: FloatingPanelStage) => void;
  draggable?: boolean; resizable?: boolean; disabled?: boolean; closeOnEscape?: boolean;
  gridSize?: number; scale?: number; lockAspectRatio?: boolean; allowOverflow?: boolean;
  strategy?: "fixed" | "absolute"; persistRect?: boolean;
  getBoundaryEl?: () => HTMLElement | null;
  getAnchorPosition?: (details: { triggerRect: DOMRect | null; boundaryRect: DOMRect | null }) => FloatingPanelPoint;
  initialFocus?: FloatingPanelFocusTarget; finalFocus?: FloatingPanelFocusTarget; restoreFocus?: boolean;
  translations?: Partial<Record<"close" | "minimize" | "maximize" | "restore" | "move" | "resize", string>>;
  lazyMount?: boolean; unmountOnExit?: boolean; onExitComplete?: () => void;
  present?: boolean; immediate?: boolean; skipAnimationOnMount?: boolean; hideMode?: "display-none" | "activity";
}
export interface FloatingPanelController {
  open: boolean; position: FloatingPanelPoint; size: FloatingPanelSize; stage: FloatingPanelStage;
  dragging: boolean; resizing: boolean; topmost: boolean;
  setOpen: (open: boolean) => void; setPosition: (point: FloatingPanelPoint) => void;
  setSize: (size: FloatingPanelSize) => void; minimize: () => void; maximize: () => void;
  restore: () => void; bringToFront: () => void;
}
const stacks = new WeakMap<Document, { ids: string[]; listeners: Set<() => void> }>();
function stack(doc: Document) {
  let value = stacks.get(doc);
  if (!value) { value = { ids: [], listeners: new Set() }; stacks.set(doc, value); }
  return value;
}
function focus(target: FloatingPanelFocusTarget | undefined, fallback: HTMLElement | null) {
  if (target === false) return;
  const node = typeof target === "function" ? target() : target?.current ?? fallback;
  if (node && node.isConnected && !node.closest("[hidden],[inert]")) node.focus({ preventScroll: true });
}
export interface InternalPanel extends FloatingPanelController {
  options: FloatingPanelOptions; id: string; dir: "ltr" | "rtl"; rect: PanelRect;
  content: RefObject<HTMLElement | null>; positioner: RefObject<HTMLElement | null>;
  trigger: RefObject<HTMLElement | null>; header: RefObject<HTMLElement | null>;
  mounted: () => void; ready: boolean; index: number;
  boundary: () => PanelRect | undefined;
  change: (rect: PanelRect, reason: FloatingPanelChangeReason) => void;
  end: (reason: FloatingPanelChangeReason, resize: boolean) => void;
  setInteraction: (state: "dragging" | "resizing" | null) => void;
  cancel: RefObject<(() => void) | null>;
  descriptions: number; registerDescription: () => () => void;
  overlayScope: OverlayScope;
  resetAfterExit: () => void;
}
export function useFloatingPanel(options: FloatingPanelOptions = {}): FloatingPanelController {
  return usePanel(options);
}
function usePanel(options: FloatingPanelOptions): InternalPanel {
  const generatedId = useId(), id = options.id ?? generatedId;
  const inheritedDir = useDirection(), dir = options.dir ?? inheritedDir;
  const [openState, setOpenState] = useState(options.defaultOpen ?? false);
  const open = options.open ?? openState;
  const [point, setPoint] = useState(options.defaultPosition ?? { x: 0, y: 0 });
  const [dimensions, setDimensions] = useState(options.defaultSize ?? { width: 320, height: 240 });
  const position = options.position ?? point, size = options.size ?? dimensions;
  validatePoint(position); validateSize(size);
  if (!(Number.isFinite(options.gridSize ?? 1) && (options.gridSize ?? 1) > 0 && Number.isFinite(options.scale ?? 1) && (options.scale ?? 1) > 0)) throw new Error("FloatingPanel gridSize and scale must be positive finite numbers.");
  if (options.minSize) validateSize(options.minSize);
  if (options.maxSize) validateSize(options.maxSize);
  if (options.minSize && options.maxSize && (options.minSize.width > options.maxSize.width || options.minSize.height > options.maxSize.height)) throw new Error("FloatingPanel minSize exceeds maxSize.");
  const [stage, setStage] = useState<FloatingPanelStage>("default");
  const [descriptions, setDescriptions] = useState(0);
  const registerDescription = useCallback(() => { setDescriptions(n => n + 1); return () => setDescriptions(n => n - 1); }, []);
  const [interaction, setInteraction] = useState<"dragging" | "resizing" | null>(null);
  const [ready, setReady] = useState(false), [revision, setRevision] = useState(0);
  const [index, setIndex] = useState(-1), [topmost, setTopmost] = useState(false);
  const content = useRef<HTMLElement | null>(null), trigger = useRef<HTMLElement | null>(null);
  const positioner = useRef<HTMLElement | null>(null), header = useRef<HTMLElement | null>(null);
  const cancel = useRef<(() => void) | null>(null), restoreRect = useRef<PanelRect | null>(null);
  const initial = useRef({ position: options.defaultPosition ?? { x: 0, y: 0 }, size: options.defaultSize ?? { width: 320, height: 240 } });
  const previousOpen = useRef(false), returnTarget = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef(false);
  const parentModal = useOptionalModalContext();
  const latest = useRef({ options, position, size, stage, open }); latest.current = { options, position, size, stage, open };
  const mounted = useCallback(() => setRevision(n => n + 1), []);
  const boundary = useCallback(() => {
    const host = positioner.current, doc = host?.ownerDocument, view = doc?.defaultView;
    if (!host || !view) return undefined;
    const o = latest.current.options, element = o.getBoundaryEl?.();
    const rect = element?.getBoundingClientRect();
    const vp = view.visualViewport;
    let x = rect?.x ?? vp?.offsetLeft ?? 0, y = rect?.y ?? vp?.offsetTop ?? 0;
    let width = rect?.width ?? vp?.width ?? view.innerWidth, height = rect?.height ?? vp?.height ?? view.innerHeight;
    if (o.strategy === "absolute") {
      const parent = host.offsetParent as HTMLElement | null, pr = parent?.getBoundingClientRect();
      x = x - (pr?.x ?? 0) - (parent?.clientLeft ?? 0) + (parent?.scrollLeft ?? view.scrollX);
      y = y - (pr?.y ?? 0) - (parent?.clientTop ?? 0) + (parent?.scrollTop ?? view.scrollY);
      const scale = o.scale ?? 1; x /= scale; y /= scale; width /= scale; height /= scale;
    }
    if (width <= 0 || height <= 0) return undefined;
    return { x, y, width, height };
  }, []);
  const change = useCallback((rect: PanelRect, reason: FloatingPanelChangeReason) => {
    const s = latest.current, o = s.options;
    validatePoint(rect); validateSize(rect);
    if (rect.x !== s.position.x || rect.y !== s.position.y) {
      const next = { x: rect.x, y: rect.y };
      if (o.position === undefined) { setPoint(next); latest.current = { ...latest.current, position: next }; }
      o.onPositionChange?.(next, { reason });
    }
    if (rect.width !== s.size.width || rect.height !== s.size.height) {
      const next = { width: rect.width, height: rect.height };
      if (o.size === undefined) { setDimensions(next); latest.current = { ...latest.current, size: next }; }
      o.onSizeChange?.(next, { reason });
    }
  }, []);
  const end = useCallback((reason: FloatingPanelChangeReason, resize: boolean) => {
    const s = latest.current;
    s.options.onPositionChangeEnd?.(s.position, { reason });
    if (resize) s.options.onSizeChangeEnd?.(s.size, { reason });
  }, []);
  const setOpen = useCallback((next: boolean) => {
    const s = latest.current;
    if (next === s.open || (s.options.disabled && next)) return;
    if (s.options.open === undefined) setOpenState(next);
    s.options.onOpenChange?.(next, "programmatic");
  }, []);
  const available = open && options.present !== false;
  const overlayScope = useCreateOverlayScope();
  const promoteDismissal = useDismissableLayer({ enabled: available, ownerDocument: content.current?.ownerDocument,
    scope: overlayScope, elements: [positioner.current],
    onEscapeKeyDown(event) {
      if (cancel.current) { event.preventDefault(); cancel.current(); }
      else if (latest.current.options.closeOnEscape) { event.preventDefault(); setOpen(false); }
    } });
  const bringToFront = useCallback(() => {
    const doc = content.current?.ownerDocument;
    if (!doc) return;
    const modal = getTopModalLayer(doc);
    if (modal && modal !== parentModal?.layer) return;
    const s = stack(doc);
    s.ids = [...s.ids.filter(value => value !== id), id]; s.listeners.forEach(fn => fn());
    promoteDismissal();
  }, [id, parentModal?.layer, promoteDismissal]);
  useEffect(() => {
    const doc = content.current?.ownerDocument;
    if (!available || !doc) return;
    const s = stack(doc), notify = () => { setIndex(s.ids.indexOf(id)); setTopmost(s.ids[s.ids.length - 1] === id); };
    s.listeners.add(notify); bringToFront();
    return () => { s.listeners.delete(notify); s.ids = s.ids.filter(value => value !== id); s.listeners.forEach(fn => fn()); };
  }, [available, revision, id, bringToFront]);
  const setPosition = useCallback((p: FloatingPanelPoint) => { const s = latest.current;
    change(constrainRect({ ...s.size, ...p }, { boundary: boundary(), contain: s.options.allowOverflow === false }), "programmatic");
  }, [boundary, change]);
  const setSize = useCallback((d: FloatingPanelSize) => { const s = latest.current;
    change(constrainRect({ ...s.position, ...d }, { min: s.options.minSize, max: s.options.maxSize, boundary: boundary(), contain: true }), "programmatic");
  }, [boundary, change]);
  const setStageValue = useCallback((next: FloatingPanelStage) => {
    const s = latest.current, b = boundary();
    if (next === s.stage || !b) return;
    cancel.current?.();
    if (s.stage === "default") restoreRect.current = { ...s.position, ...s.size };
    if (next === "minimized") {
      if (content.current?.contains(content.current.ownerDocument.activeElement)) content.current.focus();
      const styles = content.current && content.current.ownerDocument.defaultView?.getComputedStyle(content.current);
      const extra = styles ? [styles.borderTopWidth, styles.borderBottomWidth, styles.paddingTop, styles.paddingBottom].reduce((total,value) => total + (Number.parseFloat(value) || 0), 0) : 0;
      change({ ...s.position, ...s.size, height: Math.max(1, (header.current?.getBoundingClientRect().height ?? 40) / (s.options.scale ?? 1) + extra) }, "stage");
    } else if (next === "maximized") change(b, "stage");
    else { change(constrainRect(restoreRect.current ?? { ...s.position, ...s.size }, { boundary: b, contain: true, min: s.options.minSize, max: s.options.maxSize }), "stage"); restoreRect.current = null; }
    setStage(next); s.options.onStageChange?.(next);
  }, [boundary, change]);
  const previousLogicalOpen = useRef(open);
  const pendingReset = useRef(false);
  const resetRect = useCallback(() => {
    if (!pendingReset.current) return false;
    pendingReset.current = false;
    const s = latest.current, o = s.options;
    if (!o.persistRect) {
      setPoint(initial.current.position);
      setDimensions(initial.current.size);
      latest.current = { ...s, position: o.position ?? initial.current.position, size: o.size ?? initial.current.size };
      setReady(false);
    } else if (restoreRect.current) change(restoreRect.current, "stage");
    restoreRect.current = null;
    setStage("default");
    latest.current = { ...latest.current, stage: "default" };
    return true;
  }, [change]);
  const resetAfterExit = useCallback(() => {
    if (!latest.current.open) resetRect();
  }, [resetRect]);
  useLayoutEffect(() => {
    if (previousLogicalOpen.current && !open) {
      cancel.current?.();
      pendingReset.current = true;
    }
    previousLogicalOpen.current = open;
  }, [open]);
  useLayoutEffect(() => {
    if (available && content.current && !previousOpen.current) {
      previousOpen.current = true;
      pendingFocus.current = true;
      // A reopen may interrupt the exit before Content becomes hidden.
      const reset = resetRect();
      const s = latest.current, b = boundary();
      returnTarget.current = content.current.ownerDocument.activeElement as HTMLElement | null;
      if (b) {
        const Rect = content.current.ownerDocument.defaultView?.DOMRect;
        const p = s.options.position ?? (ready && (!reset || s.options.persistRect) ? s.position : s.options.defaultPosition ?? s.options.getAnchorPosition?.({ triggerRect: trigger.current?.getBoundingClientRect() ?? null, boundaryRect: Rect ? Rect.fromRect(b) : null }) ?? { x: b.x + (b.width - s.size.width) / 2, y: b.y + (b.height - s.size.height) / 2 });
        change(constrainRect({ ...p, ...s.size }, { boundary: b, contain: s.options.allowOverflow === false, min: s.options.minSize, max: s.options.maxSize }), "boundary");
        setReady(true);
      }
    } else if (!available && previousOpen.current) {
      previousOpen.current = false; cancel.current?.();
      pendingFocus.current = false;
      const o = latest.current.options;
      if (o.restoreFocus !== false) focus(o.finalFocus, trigger.current ?? returnTarget.current);
    }
  }, [available, revision, boundary, change, ready, resetRect]);
  useLayoutEffect(() => {
    if (available && ready && pendingFocus.current && content.current) {
      pendingFocus.current = false;
      focus(latest.current.options.initialFocus, content.current);
    }
  }, [available, ready, revision]);
  useEffect(() => {
    const view = positioner.current?.ownerDocument.defaultView;
    if (!open || !view) return;
    const update = () => { const s = latest.current, b = boundary(); if (!b) return;
      change(s.stage === "maximized" ? b : constrainRect({ ...s.position, ...s.size }, { boundary: b, contain: s.options.allowOverflow === false }), "boundary"); };
    const observer = typeof view.ResizeObserver === "function" ? new view.ResizeObserver(update) : null;
    const el = options.getBoundaryEl?.(); if (el) observer?.observe(el);
    view.addEventListener("resize", update); view.addEventListener("scroll", update, true);
    view.visualViewport?.addEventListener("resize", update);
    return () => { observer?.disconnect(); view.removeEventListener("resize", update); view.removeEventListener("scroll", update, true); view.visualViewport?.removeEventListener("resize", update); };
  }, [open, revision, boundary, change, options.getBoundaryEl]);
  useEffect(() => { if (!open || options.disabled) cancel.current?.(); }, [open, options.disabled]);
  useEffect(() => () => cancel.current?.(), []);
  return { options, id, dir, open, position, size, rect: { ...position, ...size }, stage, dragging: interaction === "dragging", resizing: interaction === "resizing", topmost, index,
    setOpen, setPosition, setSize, minimize: () => setStageValue("minimized"), maximize: () => setStageValue("maximized"), restore: () => setStageValue("default"), bringToFront,
    content, positioner, trigger, header, mounted, ready, boundary, change, end, setInteraction, cancel, descriptions, registerDescription, overlayScope, resetAfterExit };
}
