"use client";

import { useEffect, type CSSProperties, type RefObject } from "react";

export const formControlProxyStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: 0,
  border: 0,
  opacity: 0,
  pointerEvents: "none",
  transformOrigin: "0 0",
};

/** Keeps an invisible native form control over its visible composite owner. */
export function useFormControlProxy(
  proxyRef: RefObject<HTMLElement | null>,
  ownerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const proxy = proxyRef.current;
    const owner = ownerRef.current;
    if (!proxy || !owner) return;

    const position = () => {
      proxy.style.transform = "none";
      proxy.style.width = `${owner.getBoundingClientRect().width}px`;
      proxy.style.height = `${owner.getBoundingClientRect().height}px`;

      const proxyRect = proxy.getBoundingClientRect();
      const ownerRect = owner.getBoundingClientRect();
      proxy.style.transform = `translate(${ownerRect.left - proxyRect.left}px, ${
        ownerRect.top - proxyRect.top
      }px)`;
    };

    position();
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(position);
    observer?.observe(owner);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  });
}
