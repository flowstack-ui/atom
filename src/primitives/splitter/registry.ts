"use client";

export interface SplitterRegistryOptions {
  hitAreaMargins?: { fine?: number; coarse?: number };
}
export interface SplitterRegistryHandle {
  node: HTMLElement;
  orientation: "horizontal" | "vertical";
  disabled: () => boolean;
  start: (event: PointerEvent) => boolean;
  move: (coordinate: number) => void;
  end: (cancelled: boolean) => void;
}
export interface SplitterRegistry {
  register: (handle: SplitterRegistryHandle) => () => void;
  start: (node: HTMLElement, event: PointerEvent) => boolean;
  readonly active: boolean;
}

/** A shared pointer session, scoped to explicitly registered roots and one document. */
export function createSplitterRegistry(options: SplitterRegistryOptions = {}): SplitterRegistry {
  const fine = options.hitAreaMargins?.fine ?? 12, coarse = options.hitAreaMargins?.coarse ?? 22;
  if (![fine, coarse].every(value => Number.isFinite(value) && value >= 0)) throw new Error("Splitter registry margins must be nonnegative.");
  const handles = new Set<SplitterRegistryHandle>();
  let cancel: (() => void) | null = null;
  const registry: SplitterRegistry = {
    get active() { return cancel !== null; },
    register(handle) {
      handles.add(handle);
      return () => { cancel?.(); handles.delete(handle); };
    },
    start(node, event) {
      if (cancel || event.button !== 0 || !event.isPrimary) return false;
      const origin = [...handles].find(handle => handle.node === node);
      if (!origin || origin.disabled()) return false;
      const margin = event.pointerType === "mouse" ? fine : coarse;
      const selected = [...handles].filter(handle => {
        if (handle.disabled() || handle.node.ownerDocument !== node.ownerDocument) return false;
        if (handle === origin) return true;
        if (handle.orientation === origin.orientation) return false;
        const rect = handle.node.getBoundingClientRect();
        return event.clientX >= rect.left - margin && event.clientX <= rect.right + margin && event.clientY >= rect.top - margin && event.clientY <= rect.bottom + margin;
      });
      const started = selected.filter(handle => handle.start(event));
      if (!started.length) return false;
      const doc = node.ownerDocument, win = doc.defaultView;
      const move = (next: PointerEvent) => {
        if (next.pointerId !== event.pointerId) return;
        for (const handle of started) handle.move(handle.orientation === "horizontal" ? next.clientX : next.clientY);
      };
      const end = (cancelled: boolean) => {
        if (!cancel) return;
        cancel = null;
        doc.removeEventListener("pointermove", move); doc.removeEventListener("pointerup", up); doc.removeEventListener("pointercancel", aborted); doc.removeEventListener("keydown", key);
        node.removeEventListener("lostpointercapture", aborted);
        win?.removeEventListener("blur", blur);
        for (const handle of started) handle.end(cancelled);
        if (node.hasPointerCapture?.(event.pointerId)) node.releasePointerCapture(event.pointerId);
      };
      const up = (next: PointerEvent) => { if (next.pointerId === event.pointerId) { move(next); end(false); } };
      const aborted = (next: PointerEvent) => { if (next.pointerId === event.pointerId) end(true); };
      const blur = () => end(true);
      const key = (next: KeyboardEvent) => { if (next.key === "Escape") { next.preventDefault(); end(true); } };
      cancel = blur;
      doc.addEventListener("pointermove", move); doc.addEventListener("pointerup", up); doc.addEventListener("pointercancel", aborted); doc.addEventListener("keydown", key);
      node.addEventListener("lostpointercapture", aborted);
      win?.addEventListener("blur", blur);
      node.setPointerCapture?.(event.pointerId);
      return true;
    },
  };
  return registry;
}
