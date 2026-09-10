"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { ButtonRoot, type ButtonRootProps } from "../button/index.js";
import { downloadableBlob, initiateDownload, type DownloadableData, type DownloadDetails } from "./download.js";

export interface DownloadTriggerRootProps extends Omit<ButtonRootProps,
  "href" | "target" | "rel" | "type" | "asChild" | "onError"
> {
  data: DownloadableData | ((context: { signal: AbortSignal }) => DownloadableData | PromiseLike<DownloadableData>);
  fileName: string;
  mimeType?: string;
  onDownloadStart?: () => void;
  onDownloadInitiated?: (details: DownloadDetails) => void;
  onDownloadError?: (details: { error: unknown }) => void;
}

export const DownloadTriggerRoot = forwardRef<HTMLElement, DownloadTriggerRootProps>(function DownloadTriggerRoot(
  { data, fileName, mimeType, onDownloadStart, onDownloadInitiated, onDownloadError,
    onClick, onPress, disabled, loading, "data-slot": slot = "download-trigger", ...props }, ref,
) {
  const [state, setState] = useState<"idle" | "preparing" | "error">("idle");
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; active.current?.abort(); active.current = null; };
  }, []);
  useEffect(() => {
    if (disabled && active.current) { active.current.abort(); active.current = null; setState("idle"); }
  }, [disabled]);

  return <ButtonRoot {...props} ref={ref} type="button" disabled={disabled}
    loading={loading || state === "preparing"} data-slot={slot} data-state={state}
    onClick={event => {
      onClick?.(event);
      if (!event.defaultPrevented) onPress?.(event);
      if (event.defaultPrevented || disabled || loading || active.current) return;
      const controller = new AbortController();
      active.current = controller;
      const doc = event.currentTarget.ownerDocument;
      const current = () => mounted.current && active.current === controller && !controller.signal.aborted;
      const fail = (error: unknown) => {
        if (!current()) return;
        active.current = null; setState("error"); onDownloadError?.({ error });
      };
      const save = (value: DownloadableData) => {
        if (!current()) return;
        let details: DownloadDetails;
        try { details = initiateDownload(doc, downloadableBlob(value, mimeType), fileName); }
        catch (error) { fail(error); return; }
        active.current = null; setState("idle"); onDownloadInitiated?.(details);
      };
      try {
        if (!fileName.trim()) throw new TypeError("DownloadTrigger requires a nonempty fileName.");
        onDownloadStart?.();
        if (!current()) return;
        const value = typeof data === "function" ? data({ signal: controller.signal }) : data;
        if (value && typeof (value as PromiseLike<DownloadableData>).then === "function") {
          setState("preparing");
          void Promise.resolve(value).then(save, fail);
        } else save(value as DownloadableData);
      } catch (error) { fail(error); }
    }} />;
});
DownloadTriggerRoot.displayName = "DownloadTrigger.Root";
