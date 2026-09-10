"use client";

import { useEffect, useRef } from "react";
import { getMotionTimeout } from "./usePresence.js";

/** One completion signal for all owned surfaces, independent of child exits. */
export function useOverlayExit(open: boolean, nodes: () => (HTMLElement | null)[], onExitComplete?: () => void) {
  const wasOpen = useRef(open);
  const callback = useRef(onExitComplete);
  const getNodes = useRef(nodes);
  callback.current = onExitComplete;
  getNodes.current = nodes;
  useEffect(() => {
    const closing = wasOpen.current && !open;
    wasOpen.current = open;
    if (!closing) return;
    const elements = getNodes.current().filter((node): node is HTMLElement => Boolean(node));
    const view = elements[0]?.ownerDocument.defaultView ?? window;
    let timer = 0;
    const schedule = view.requestAnimationFrame?.bind(view) ?? ((fn: FrameRequestCallback) => view.setTimeout(() => fn(Date.now()), 0));
    const cancel = view.cancelAnimationFrame?.bind(view) ?? view.clearTimeout.bind(view);
    const frame = schedule(() => {
      const duration = Math.max(0, ...elements.filter(node => node.isConnected).map(getMotionTimeout));
      timer = view.setTimeout(() => callback.current?.(), duration ? duration + 50 : 0);
    });
    return () => { cancel(frame); view.clearTimeout(timer); };
  }, [open]);
}
