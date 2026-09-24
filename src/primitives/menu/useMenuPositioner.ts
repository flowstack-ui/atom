"use client";

import { useState, type RefObject } from "react";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect.js";

/** Keep decoration outside the real Content scrollport without losing its CSS scope. */
export function useMenuPositioner(content: RefObject<HTMLDivElement | null>) {
  const [positioner, setPositioner] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const source = content.current;
    const view = source?.ownerDocument.defaultView;
    if (!source || !view || !positioner) return;
    let copied = new Set<string>();
    // Do not mirror font metrics onto an ancestor: relative Content units would rebase.
    const inherited = ["direction", "color-scheme", "color", "fill", "stroke"];
    const sync = () => {
      // Read through the real ancestor scope, not our previous mirrored values.
      // Otherwise an inherited scope change above the positioner would remain shadowed.
      for (const name of copied) positioner.style.removeProperty(name);
      for (const name of inherited) positioner.style.removeProperty(name);
      positioner.style.removeProperty("z-index");
      const computed = view.getComputedStyle(source);
      const next = new Set<string>();
      for (let index = 0; index < computed.length; index += 1) {
        const name = computed.item(index);
        // Runtime overlay ordering belongs to the registered host, not mirrored CSS.
        if (!name.startsWith("--") || name === "--atom-overlay-layer") continue;
        next.add(name);
        positioner.style.setProperty(name, computed.getPropertyValue(name));
      }
      for (const name of copied) if (!next.has(name)) positioner.style.removeProperty(name);
      copied = next;
      positioner.style.zIndex = computed.zIndex;
      for (const name of inherited) positioner.style.setProperty(name, computed.getPropertyValue(name));
    };
    sync();
    const observer = new view.MutationObserver(sync);
    // Do not observe our own writes to the positioner.
    for (let node: HTMLElement | null = source; node;) {
      if (node !== positioner) observer.observe(node, { attributes: true });
      const root = node.getRootNode();
      node = node.parentElement ?? (root instanceof view.ShadowRoot ? root.host as HTMLElement : null);
    }
    const media = view.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener("change", sync);
    return () => { observer.disconnect(); media?.removeEventListener("change", sync); };
  }, [content, positioner]);
  return { positioner, setPositioner };
}
