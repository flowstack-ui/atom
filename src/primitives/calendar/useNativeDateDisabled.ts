"use client";
import { useEffect, useState, type RefObject } from "react";

/** Native fieldsets do not disable editable spans; mirror their actual DOM scope. */
export function useNativeDateDisabled(ref: RefObject<HTMLElement | null>) {
  const [disabled, setDisabled] = useState<boolean>();
  useEffect(() => {
    const root = ref.current;
    const Observer = root?.ownerDocument.defaultView?.MutationObserver;
    if (!root || !Observer) return;
    const sync = () => {
      let ancestor = root.parentElement;
      let next = false;
      while (ancestor) {
        if (ancestor.tagName === "FIELDSET" && (ancestor as HTMLFieldSetElement).disabled) {
          const legend = Array.from(ancestor.children).find(child => child.tagName === "LEGEND");
          if (!legend?.contains(root)) next = true;
        }
        ancestor = ancestor.parentElement;
      }
      setDisabled(next);
    };
    sync();
    const observer = new Observer(sync);
    observer.observe(root.ownerDocument.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["disabled"] });
    return () => observer.disconnect();
  // A store can exist before its RootProvider mounts (for example, a popup).
  // Rebind after a render so a newly attached or moved root is not missed.
  });
  return disabled;
}
