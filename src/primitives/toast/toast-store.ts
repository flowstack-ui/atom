import type { ToastData, ToastId, ToastOptions, ToastUpdateOptions } from "./types.js";
import { normalizeToastDuration } from "./toast-values.js";

export interface ToastStoreOptions { duration?: number; removeDelay?: number; }
export interface ToastStore {
  create(options: ToastOptions): ToastId;
  update(id: ToastId, options: ToastUpdateOptions): void;
  dismiss(id?: ToastId): void;
  remove(id?: ToastId): void;
  pause(id?: ToastId, reason?: string): void;
  resume(id?: ToastId, reason?: string): void;
  getToasts(): ToastData[];
  getVisibleToasts(): ToastData[];
  getCount(): number;
  isVisible(id: ToastId): boolean;
  isDismissed(id: ToastId): boolean;
  subscribe(listener: () => void): () => void;
  expand(): void;
  collapse(): void;
  isExpanded(): boolean;
  /** Viewport bridge: queued time never consumes reading time. */
  setVisible(ids: readonly ToastId[]): void;
  /** Root measurement bridge in CSS pixels. */
  setHeight(id: ToastId, height: number): void;
}

let nextStore = 0;
export function createToastStore(defaults: ToastStoreOptions = {}): ToastStore {
  const prefix = ++nextStore;
  let nextId = 0;
  let records: ToastData[] = [];
  let expanded = false;
  const listeners = new Set<() => void>();
  const timers = new Map<ToastId, ReturnType<typeof setTimeout>>();
  const exits = new Map<ToastId, ReturnType<typeof setTimeout>>();
  const reasons = new Map<ToastId, Set<string>>();
  const globalReasons = new Set<string>();
  const started = new Map<ToastId, number>();
  const find = (id: ToastId) => records.find(t => t.id === id);
  const notify = () => { records = [...records]; [...listeners].forEach(fn => fn()); };
  const replace = (id: ToastId, fields: Partial<ToastData>) => {
    records = records.map(t => t.id === id ? { ...t, ...fields } : t);
  };
  const stop = (id: ToastId) => {
    clearTimeout(timers.get(id)); timers.delete(id);
    const time = started.get(id); started.delete(id);
    const item = find(id);
    if (item && time !== undefined) replace(id, {remainingDuration: Math.max(0, item.remainingDuration - (Date.now() - time))});
  };
  const schedule = (id: ToastId) => {
    const item = find(id);
    if (!item || item.status !== "visible" || item.paused || item.duration === Infinity || timers.has(id)) return;
    started.set(id, Date.now());
    timers.set(id, setTimeout(() => {
      timers.delete(id); started.delete(id);
      const current = find(id);
      if (!current || current.status !== "visible") return;
      replace(id, { remainingDuration: 0 });
      const elapsedRecord = find(id);
      current.onAutoClose?.(id);
      // A callback may remove, replace, or update this ID synchronously.
      if (find(id) === elapsedRecord) api.dismiss(id);
    }, item.remainingDuration));
  };
  const status = (item: ToastData) => item.onStatusChange?.({id:item.id,status:item.status!});
  const api: ToastStore = {
    create(options) {
      const id = options.id ?? `toast-${prefix}-${++nextId}`;
      if (find(id)) { api.update(id, options); return id; }
      const type = options.type ?? "default";
      const duration = normalizeToastDuration(options.duration ?? defaults.duration, type);
      const item: ToastData = {...options,id,type,duration,dismissible:options.dismissible ?? true,
        createdAt:Date.now(),paused:globalReasons.size > 0,remainingDuration:duration,status:"queued"};
      reasons.set(id,new Set()); records = [item,...records]; status(item); notify();
      return id;
    },
    update(id, options) {
      const old = find(id); if (!old || old.status === "dismissing") return;
      const {id:_ignored,...updates} = options as ToastOptions;
      const resets = updates.duration !== undefined || updates.type !== undefined;
      if (resets) stop(id);
      const type = updates.type ?? old.type;
      const duration = normalizeToastDuration(updates.duration ?? defaults.duration,type);
      replace(id,{...updates,...(resets ? {duration,remainingDuration:duration} : {})});
      schedule(id); notify();
    },
    dismiss(id) {
      for (const item of [...records].filter(t => id === undefined || t.id === id)) {
        if (!find(item.id) || item.status === "dismissing") continue;
        stop(item.id);
        if (item.status === "queued") { api.remove(item.id); continue; }
        replace(item.id,{status:"dismissing"});
        const delay = item.removeDelay ?? defaults.removeDelay ?? 200;
        exits.set(item.id,setTimeout(() => api.remove(item.id),Number.isFinite(delay) ? Math.max(0,delay) : 200));
        status({...item,status:"dismissing"}); notify();
      }
    },
    remove(id) {
      const removed = records.filter(t => id === undefined || t.id === id);
      records = records.filter(t => !removed.includes(t));
      for (const item of removed) {
        clearTimeout(timers.get(item.id)); clearTimeout(exits.get(item.id));
        timers.delete(item.id); exits.delete(item.id); started.delete(item.id); reasons.delete(item.id);
      }
      if (!removed.length) return;
      for (const item of removed) { status({...item,status:"unmounted"}); item.onDismiss?.(item.id); }
      notify();
    },
    pause(id, reason = "manual") {
      if (id === undefined) globalReasons.add(reason);
      else { if (!find(id)) return; reasons.get(id)!.add(reason); }
      for (const item of records.filter(t => id === undefined || t.id === id)) {
        stop(item.id); replace(item.id,{paused:true});
      }
      notify();
    },
    resume(id, reason = "manual") {
      if (id === undefined) globalReasons.delete(reason);
      else reasons.get(id)?.delete(reason);
      for (const item of records.filter(t => id === undefined || t.id === id)) {
        replace(item.id,{paused:globalReasons.size > 0 || (reasons.get(item.id)?.size ?? 0) > 0});
        schedule(item.id);
      }
      notify();
    },
    getToasts: () => records,
    getVisibleToasts: () => records.filter(t => t.status === "visible" || t.status === "dismissing"),
    getCount: () => records.length,
    isVisible: id => find(id)?.status === "visible",
    isDismissed: id => !find(id) || find(id)?.status === "dismissing",
    subscribe(fn) { listeners.add(fn); return () => {listeners.delete(fn);}; },
    expand() { if (!expanded) {expanded=true;notify();} },
    collapse() { if (expanded) {expanded=false;notify();} },
    isExpanded: () => expanded,
    setVisible(ids) {
      let changed = false;
      const events: ToastData[] = [];
      for (const item of records) {
        if (item.status === "dismissing") continue;
        const visible = ids.includes(item.id);
        if (visible && item.status === "queued") {
          replace(item.id,{status:"visible"}); schedule(item.id); events.push(find(item.id)!); changed=true;
        } else if (!visible && item.status === "visible") {
          stop(item.id); replace(item.id,{status:"queued"}); changed=true;
        }
      }
      events.forEach(status);
      if (changed) notify();
    },
    setHeight(id,height) {
      if (!Number.isFinite(height) || height <= 0 || !find(id) || find(id)?.height === height) return;
      replace(id,{height}); notify();
    },
  };
  return api;
}

export const defaultToastStore = createToastStore();
