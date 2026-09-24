"use client";
import * as React from "react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect.js";
import { usePresence } from "../../hooks/usePresence.js";
import type { MenuLifecycleOptions } from "./options.js";


export function useMenuPresence(open: boolean, options: MenuLifecycleOptions = {}, host: RefObject<HTMLElement | null>) {
  const [scheduled, setScheduled] = useState(open);
  useEffect(() => {
    const win = host.current?.ownerDocument.defaultView;
    if (options.immediate !== false || !win) { setScheduled(open); return; }
    const frame = win.requestAnimationFrame(() => setScheduled(open));
    return () => win.cancelAnimationFrame(frame);
  }, [open, options.immediate, host]);
  const presence = usePresence({ present: options.present ?? (options.immediate === false ? scheduled : open), onExitComplete: options.onExitComplete });
  const [hasOpened, setHasOpened] = useState(open);
  useEffect(() => { if (open) setHasOpened(true); }, [open]);
  const initial = useRef(open);
  const transitioned = useRef(false);
  if (initial.current !== open) transitioned.current = true;
  useLayoutEffect(() => { host.current?.toggleAttribute("inert", !open); });
  const keepMounted = (!hasOpened && options.lazyMount === false) || (hasOpened && options.unmountOnExit === false);
  return { ...presence, shouldRender: presence.isPresent || keepMounted, skipAnimation: options.skipAnimationOnMount && !transitioned.current, Activity: options.hideMode === "activity" ? (React as unknown as { Activity?: React.ComponentType<{ mode: "visible" | "hidden"; children: ReactNode }> }).Activity : undefined };
}
