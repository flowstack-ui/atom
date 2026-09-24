"use client";

import { forwardRef, useEffect, useMemo, useState, type ReactNode } from "react";
import type { NativeImageProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useImageContext } from "./context.js";

type NativeProps = NativeImageProps<"src" | "alt" | "children">;
export interface ImageContentProps extends NativeProps {
  alt: string;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}
export const ImageContent = forwardRef<HTMLImageElement, ImageContentProps>(function ImageContent({ alt, render, asChild, children, "data-slot": dataSlot = "image-content", ...rest }, ref) {
  const { src, srcSet: rootSrcSet, status, reportStatus } = useImageContext();
  const [element, setElement] = useState<HTMLImageElement | null>(null);
  const mergedRef = useMemo(() => composeRefs(ref, setElement), [ref]);
  const srcSet = rest.srcSet ?? rootSrcSet;
  const hasHost = Boolean(src || srcSet || asChild || render);
  useEffect(() => {
    if (!hasHost) {
      reportStatus?.("idle");
      return;
    }
    if (!element || !element.isConnected) return;
    // Observe only the real host. This also covers a framework changing its
    // generated URLs without changing Root metadata. No detached requests.
    let active = true;
    const hasSource = () => Boolean(element.getAttribute("src") || element.getAttribute("srcset"));
    const report = (next: "idle" | "loading" | "loaded" | "error") => {
      if (active && element.isConnected) reportStatus?.(hasSource() ? next : "idle");
    };
    const synchronize = () => {
      if (!hasSource()) report("idle");
      else if (element.complete) report(element.naturalWidth > 0 ? "loaded" : "error");
      else report("loading");
    };
    const loaded = () => report("loaded");
    const failed = () => report("error");
    element.addEventListener("load", loaded);
    element.addEventListener("error", failed);
    const Observer = element.ownerDocument.defaultView?.MutationObserver;
    const observer = Observer ? new Observer(synchronize) : undefined;
    observer?.observe(element, { attributes: true, attributeFilter: ["src", "srcset", "sizes", "crossorigin", "referrerpolicy", "loading"] });
    synchronize();
    return () => {
      active = false;
      observer?.disconnect();
      element.removeEventListener("load", loaded);
      element.removeEventListener("error", failed);
    };
  }, [element, hasHost, src, srcSet, rest.sizes, rest.crossOrigin, rest.referrerPolicy, rest.loading, asChild, render, reportStatus]);
  if (!hasHost) return null;
  const props = { ...rest, hidden: status === "error" ? true : rest.hidden, ref: mergedRef, src, srcSet, alt, "data-slot": dataSlot, "data-state": status };
  if (asChild) return cloneAndMerge(children, props);
  return renderElement(render, "img", props);
});
