"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePresence } from "./usePresence.js";
import type { SelectLifecycleOptions } from "../utils/selectOptions.js";

/** Shared mount policy; closed retained content is inert, not interactive. */
export function useSelectPresence(open: boolean, options: SelectLifecycleOptions) {
  const opened = useRef(open);
  if (open) opened.current = true;
  const desired = options.present ?? open;
  const presence = usePresence({ present: desired, onExitComplete: options.onExitComplete });
  const node = useRef<HTMLElement | null>(null);
  useEffect(() => { node.current?.toggleAttribute("inert", !open); });
  const ref = useCallback((element: HTMLElement | null) => {
    node.current = element;
    presence.ref(element);
  }, [presence.ref]);
  return {
    mounted: desired || presence.isPresent ||
      (opened.current ? options.unmountOnExit === false : options.lazyMount === false),
    hidden: !desired && !presence.isPresent,
    ref,
  };
}
