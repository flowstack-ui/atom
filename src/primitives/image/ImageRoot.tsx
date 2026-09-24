"use client";

import { Children, forwardRef, useMemo, useCallback, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import { type ImageLoadingStatus } from "../../utils/imageLoadingStatus.js";
import { ImageContext } from "./context.js";

type NativeProps = NativeDivProps<"children">;
export interface ImageRootProps extends NativeProps {
  src?: string;
  srcSet?: string;
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
  render?: RenderProp;
  asChild?: boolean;
  children?: ReactNode;
  "data-slot"?: string;
}

export const ImageRoot = forwardRef<HTMLDivElement, ImageRootProps>(function ImageRoot({ src, srcSet, onLoadingStatusChange, render, asChild, children, "data-slot": dataSlot = "image", ...rest }, ref) {
  const sourceKey = JSON.stringify([src, srcSet]);
  const initialStatus = src || srcSet ? "loading" : "idle";
  const [record, setRecord] = useState<{ sourceKey: string; status: ImageLoadingStatus }>(() => ({ sourceKey, status: initialStatus }));
  const status = record.sourceKey === sourceKey ? record.status : initialStatus;
  const callback = useRef(onLoadingStatusChange);
  callback.current = onLoadingStatusChange;
  const reportStatus = useCallback((next: ImageLoadingStatus) => {
    setRecord(previous => previous.sourceKey === sourceKey && previous.status === next ? previous : { sourceKey, status: next });
  }, [sourceKey]);
  useEffect(() => { callback.current?.(status); }, [sourceKey, status]);
  const value = useMemo(() => ({ src, srcSet, status, reportStatus }), [src, srcSet, status, reportStatus]);
  const props = { ...rest, ref, "data-slot": dataSlot, "data-state": status };
  if (asChild) {
    const child = Children.only(children) as ReactElement<{ children?: ReactNode }>;
    return cloneAndMerge(child, { ...props, children: <ImageContext.Provider value={value}>{child.props.children}</ImageContext.Provider> });
  }
  return renderElement(render, "div", { ...props, children: <ImageContext.Provider value={value}>{children}</ImageContext.Provider> });
});
