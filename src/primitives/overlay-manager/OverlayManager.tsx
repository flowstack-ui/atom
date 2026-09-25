"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore, type ComponentType } from "react";

export interface OverlayLifecycleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExitComplete: () => void;
}
export interface OverlaySnapshotEntry<P> {
  readonly id: string;
  readonly props: Readonly<P>;
  readonly open: boolean;
}
export interface OverlayManager<P, R> {
  Viewport: ComponentType;
  open(id: string, props: P): Promise<R | undefined>;
  close(id: string, result?: R): Promise<void>;
  update(id: string, props: Partial<P>): void;
  remove(id: string): void;
  removeAll(): void;
  has(id: string): boolean;
  get(id: string): OverlaySnapshotEntry<P>;
  getSnapshot(): readonly OverlaySnapshotEntry<P>[];
  waitForExit(id: string): Promise<void>;
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
type Reserved = { [K in keyof OverlayLifecycleProps]?: never };

/** Creates an isolated instance host. Place Viewport below application providers. */
export function createOverlay<P extends object, R = unknown>(
  Component: ComponentType<P & OverlayLifecycleProps>,
): OverlayManager<P & Reserved, R> {
  type Entry = {
    id: string; props: P; open: boolean; generation: number;
    result: ReturnType<typeof deferred<R | undefined>>;
    exit: ReturnType<typeof deferred<void>>;
  };
  const entries = new Map<string, Entry>();
  const presented = new Set<number>();
  const subscribers = new Set<() => void>();
  let snapshot: readonly OverlaySnapshotEntry<P & Reserved>[] = [];
  let renderSnapshot: readonly Entry[] = [];
  const serverSnapshot: readonly Entry[] = [];
  let sequence = 0;
  let hosts = 0;
  let disposal = 0;
  const publish = () => {
    renderSnapshot = [...entries.values()];
    snapshot = renderSnapshot.map(({ id, props, open }) => ({ id, props: props as P & Reserved, open }));
    subscribers.forEach(notify => notify());
  };
  const requireEntry = (id: string) => {
    const entry = entries.get(id);
    if (!entry) throw new Error(`Overlay ${id} does not exist.`);
    return entry;
  };
  const validate = (props: object) => {
    for (const key of ["open", "onOpenChange", "onExitComplete"]) {
      if (Object.prototype.hasOwnProperty.call(props, key)) throw new Error(`Overlay prop ${key} is lifecycle-owned.`);
    }
  };
  const remove = (id: string) => {
    const entry = entries.get(id);
    if (!entry) return;
    entries.delete(id);
    presented.delete(entry.generation);
    entry.result.resolve(undefined);
    entry.exit.resolve();
    publish();
  };
  const removeAll = () => {
    for (const entry of entries.values()) { entry.result.resolve(undefined); entry.exit.resolve(); }
    entries.clear();
    presented.clear();
    publish();
  };
  const close = (id: string, value?: R) => {
    const entry = entries.get(id);
    if (!entry) return Promise.resolve();
    if (entry.open) {
      entries.set(id, { ...entry, open: false });
      entry.result.resolve(value);
      publish();
      // A never-committed overlay has no exit animation to report. Defer until
      // the current commit finishes: a child may close from its layout effect.
      queueMicrotask(() => {
        const latest = entries.get(id);
        if (latest?.generation === entry.generation && !latest.open && !presented.has(entry.generation)) remove(id);
      });
    }
    return entry.exit.promise;
  };
  function ViewportItem({ entry }: { entry: Entry }) {
    useLayoutEffect(() => {
      if (entry.open && entries.get(entry.id)?.generation === entry.generation) presented.add(entry.generation);
    }, [entry.open, entry.id, entry.generation]);
    return <Component
      {...entry.props}
      open={entry.open}
      onOpenChange={open => {
        if (entries.get(entry.id)?.generation === entry.generation && !open) void close(entry.id);
      }}
      onExitComplete={() => {
        const latest = entries.get(entry.id);
        if (latest?.generation === entry.generation && !latest.open) remove(entry.id);
      }}
    />;
  }
  function Viewport() {
    const current = useSyncExternalStore(
      subscribe,
      () => renderSnapshot,
      () => serverSnapshot,
    );
    useEffect(() => {
      if (hosts) throw new Error("An Overlay Manager supports exactly one mounted Viewport.");
      hosts++;
      disposal++;
      return () => {
        hosts--;
        const ticket = ++disposal;
        queueMicrotask(() => { if (!hosts && ticket === disposal) removeAll(); });
      };
    }, []);
    return <>{current.map(entry => <ViewportItem entry={entry} key={`${entry.id}:${entry.generation}`} />)}</>;
  }
  function subscribe(notify: () => void) {
    subscribers.add(notify);
    return () => { subscribers.delete(notify); };
  }
  return {
    Viewport,
    open(id, props) {
      if (!hosts) return Promise.reject(new Error("Mount the Overlay Manager Viewport before opening an overlay."));
      if (!id.trim()) return Promise.reject(new Error("Overlay IDs must be nonempty."));
      validate(props);
      const existing = entries.get(id);
      if (existing?.open) {
        entries.set(id, { ...existing, props: { ...existing.props, ...props } });
        publish();
        return existing.result.promise;
      }
      if (existing) { presented.delete(existing.generation); existing.exit.resolve(); existing.result.resolve(undefined); }
      const entry: Entry = { id, props: { ...props }, open: true, generation: ++sequence,
        result: deferred<R | undefined>(), exit: deferred<void>() };
      entries.set(id, entry);
      publish();
      return entry.result.promise;
    },
    close, remove, removeAll,
    update(id, props) {
      validate(props);
      const entry = requireEntry(id);
      entries.set(id, { ...entry, props: { ...entry.props, ...props } });
      publish();
    },
    has: id => entries.has(id),
    get(id) { requireEntry(id); return snapshot.find(entry => entry.id === id)!; },
    getSnapshot: () => snapshot,
    waitForExit: id => entries.get(id)?.exit.promise ?? Promise.resolve(),
  };
}
