"use client";

import { forwardRef, useEffect, useMemo, useState, type ReactNode } from "react";
import type { NativeImageProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useAvatarContext } from "./context.js";

type AvatarImageNativeProps = NativeImageProps<"src" | "alt" | "children">;

export interface AvatarImageProps extends AvatarImageNativeProps {
  /** Image source URL. */
  src?: string;
  /** Alt text for the image. */
  alt?: string;
  /** Override the rendered element. */
  render?: RenderProp;
  /** Merge behavior props onto a single child element. */
  asChild?: boolean;
  /** Child element used when asChild is true. */
  children?: ReactNode;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage(
    {
      src,
      alt = "",
      render,
      asChild,
      children,
      "data-slot": dataSlot = "avatar-image",
      ...rest
    },
    ref,
  ) {
    const { src: rootSource, status, reportStatus } = useAvatarContext();
    const source = src ?? rootSource;
    const [element, setElement] = useState<HTMLImageElement | null>(null);
    const mergedRef = useMemo(() => composeRefs(ref, setElement), [ref]);
    useEffect(() => {
      if (!source && !rest.srcSet && !asChild && !render) {
        reportStatus?.("idle");
        return;
      }
      if (!element) return;
      const loaded = () => reportStatus?.("loaded");
      const failed = () => reportStatus?.("error");
      element.addEventListener("load", loaded);
      element.addEventListener("error", failed);
      if (!element.getAttribute("src") && !element.getAttribute("srcset")) reportStatus?.("idle");
      else if (element.complete && element.currentSrc) reportStatus?.(element.naturalWidth > 0 ? "loaded" : "error");
      else reportStatus?.("loading");
      return () => {
        element.removeEventListener("load", loaded);
        element.removeEventListener("error", failed);
      };
    }, [element, source, rest.srcSet, rest.sizes, rest.crossOrigin, rest.referrerPolicy, asChild, render, reportStatus]);
    if (!source && !rest.srcSet && !asChild && !render) return null;

    const behaviorProps: Record<string, unknown> = {
      ...rest,
      ref: mergedRef,
      src: source,
      alt,
      "data-slot": dataSlot,
      "data-state": status,
      hidden: status === "error" ? true : rest.hidden,
      "aria-hidden": status !== "loaded" ? true : rest["aria-hidden"],
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "img", behaviorProps);
  },
);
