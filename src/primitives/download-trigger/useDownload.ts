"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { downloadableBlob, initiateDownload, type DownloadableData, type DownloadDetails } from "./download.js";
export interface UseDownloadProps {
  data: DownloadableData | ((context: { signal: AbortSignal }) => DownloadableData | PromiseLike<DownloadableData>);
  fileName: string;
  mimeType?: string;
  disabled?: boolean;
  loading?: boolean;
  onDownloadStart?: () => void;
  onDownloadInitiated?: (details: DownloadDetails) => void;
  onDownloadError?: (details: { error: unknown }) => void;
}
export interface UseDownloadReturn {
 state: "idle" | "preparing" | "error";
 loading: boolean;
 /** Call from user activation; pass the control's ownerDocument for iframe composition. */
 download: (ownerDocument?: Document) => void;
 cancel: () => void;
}
export function useDownload({data,fileName,mimeType,disabled,loading,onDownloadStart,onDownloadInitiated,onDownloadError}:UseDownloadProps):UseDownloadReturn {
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

 const cancel = useCallback(() => { active.current?.abort(); active.current=null; if(mounted.current) setState("idle"); }, []);
 const download = useCallback((ownerDocument?: Document) => {
 if(!mounted.current || disabled || loading || active.current) return;
      const controller = new AbortController();
      active.current = controller;
      const doc = ownerDocument ?? (typeof document !== "undefined" ? document : undefined);
      const current = () => mounted.current && active.current === controller && !controller.signal.aborted;
      const fail = (error: unknown) => {
        if (!current()) return;
        active.current = null; setState("error"); onDownloadError?.({ error });
      };
      const save = (value: DownloadableData) => {
        if (!current()) return;
        let details: DownloadDetails;
        try { if (!doc) throw new Error("Download requires an active document."); details = initiateDownload(doc, downloadableBlob(value, mimeType), fileName); }
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
 }, [data,fileName,mimeType,disabled,loading,onDownloadStart,onDownloadInitiated,onDownloadError]);
 return {state, loading:Boolean(loading || state==="preparing"),download,cancel};
}
