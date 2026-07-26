"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import type { ImageLoadingStatus } from "../../utils/imageLoadingStatus.js";
import { useImageContext } from "./context.js";

type NativeProps = NativeDivProps<"children">;
export type ImageFallbackWhen = Exclude<ImageLoadingStatus, "loaded">;
export interface ImageFallbackProps extends NativeProps {
  when?: ImageFallbackWhen | readonly ImageFallbackWhen[];
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}
export const ImageFallback = forwardRef<HTMLDivElement, ImageFallbackProps>(function ImageFallback({ when = ["idle", "loading", "error"], render, asChild, children, "data-slot": dataSlot = "image-fallback", ...rest }, ref) {
  const { status } = useImageContext();
  const matches = Array.isArray(when) ? when.includes(status as ImageFallbackWhen) : when === status;
  if (!matches) return null;
  const props = { ...rest, ref, "data-slot": dataSlot, "data-state": status };
  if (asChild) return cloneAndMerge(children, props);
  return renderElement(render, "div", { ...props, children });
});
