"use client";

import { forwardRef, type ReactNode } from "react";
import type { NativeImageProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
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
  const { src, status } = useImageContext();
  if (status !== "loaded" || !src) return null;
  const props = { ...rest, ref, src, alt, "data-slot": dataSlot, "data-state": status };
  if (asChild) return cloneAndMerge(children, props);
  return renderElement(render, "img", props);
});
