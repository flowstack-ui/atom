"use client";

import { useEffect, useRef, useState } from "react";
import { usePresence } from "./usePresence.js";

export interface OverlayPresenceOptions {
  open: boolean; present?: boolean; immediate?: boolean; lazyMount?: boolean;
  unmountOnExit?: boolean; skipAnimationOnMount?: boolean; onExitComplete?: () => void;
}
/** Presentation is independent from disclosure and always removes interaction when unavailable. */
export function useOverlayPresence(options: OverlayPresenceOptions) {
  const requested = options.present ?? options.open;
  const [synchronized, setSynchronized] = useState(requested);
  const initial = useRef(requested), [initialEntry, setInitialEntry] = useState(true);
  const everPresent = useRef(requested), node = useRef<HTMLElement | null>(null);
  const target = options.immediate ? requested : synchronized;
  if (target) everPresent.current = true;
  useEffect(() => {
    if (options.immediate) { setSynchronized(requested); setInitialEntry(false); return; }
    const view = node.current?.ownerDocument.defaultView ?? window;
    const schedule = view.requestAnimationFrame?.bind(view) ?? ((fn: FrameRequestCallback) => view.setTimeout(() => fn(Date.now()), 0));
    const cancel = view.cancelAnimationFrame?.bind(view) ?? view.clearTimeout.bind(view);
    const handle = schedule(() => { setSynchronized(requested); setInitialEntry(false); });
    return () => cancel(handle);
  }, [requested, options.immediate]);
  const presence = usePresence({ present: target, onExitComplete: options.onExitComplete });
  const visible = target || presence.isPresent;
  return { ref: presence.ref, node, visible, target, interactive: options.open && requested && visible,
    mounted: visible || (!everPresent.current && options.lazyMount === false) || (options.unmountOnExit === false && everPresent.current),
    skipEntry: Boolean(options.skipAnimationOnMount && initial.current && initialEntry) };
}
