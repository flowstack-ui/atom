"use client";

import { Children, forwardRef, useMemo, type ReactElement, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { useImageLoadingStatus, type ImageLoadingStatus } from "../../utils/imageLoadingStatus.js";
import { ImageContext } from "./context.js";

type NativeProps = NativeDivProps<"children">;
export interface ImageRootProps extends NativeProps {
  src?: string;
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export const ImageRoot = forwardRef<HTMLDivElement, ImageRootProps>(function ImageRoot({ src, onLoadingStatusChange, render, asChild, children, "data-slot": dataSlot = "image", ...rest }, ref) {
  const status = useImageLoadingStatus(src, onLoadingStatusChange);
  const value = useMemo(() => ({ src, status }), [src, status]);
  const props = { ...rest, ref, "data-slot": dataSlot, "data-state": status };
  if (asChild) {
    const child = Children.only(children) as ReactElement<{ children?: ReactNode }>;
    return cloneAndMerge(child, { ...props, children: <ImageContext.Provider value={value}>{child.props.children}</ImageContext.Provider> });
  }
  return renderElement(render, "div", { ...props, children: <ImageContext.Provider value={value}>{children}</ImageContext.Provider> });
});
