"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

export function useImageLoadingStatus(
  src: string | undefined,
  onStatusChange?: (status: ImageLoadingStatus) => void,
): ImageLoadingStatus {
  const [status, setStatus] = useState<ImageLoadingStatus>(() => src ? "loading" : "idle");
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  const updateStatus = useCallback((next: ImageLoadingStatus) => {
    setStatus(next);
    onStatusChangeRef.current?.(next);
  }, []);

  useEffect(() => {
    if (!src) {
      updateStatus("idle");
      return undefined;
    }

    updateStatus("loading");
    const image = new window.Image();
    const handleLoad = () => updateStatus("loaded");
    const handleError = () => updateStatus("error");
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    image.src = src;

    if (image.complete) updateStatus(image.naturalWidth > 0 ? "loaded" : "error");

    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [src, updateStatus]);

  return status;
}
