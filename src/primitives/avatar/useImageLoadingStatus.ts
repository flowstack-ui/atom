"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

export function useImageLoadingStatus(
  src: string | undefined,
  onStatusChange?: (status: ImageLoadingStatus) => void,
): ImageLoadingStatus {
  const [status, setStatus] = useState<ImageLoadingStatus>(() =>
    src ? "loading" : "idle",
  );

  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  const updateStatus = useCallback((newStatus: ImageLoadingStatus) => {
    setStatus(newStatus);
    onStatusChangeRef.current?.(newStatus);
  }, []);

  useEffect(() => {
    if (!src) {
      updateStatus("idle");
      return undefined;
    }

    updateStatus("loading");

    const img = new window.Image();

    const handleLoad = () => updateStatus("loaded");
    const handleError = () => updateStatus("error");

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);
    img.src = src;

    if (img.complete) {
      updateStatus(img.naturalWidth > 0 ? "loaded" : "error");
    }

    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [src, updateStatus]);

  return status;
}
