"use client";

import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useRef, useState,
  type HTMLAttributes, type SVGProps, type ReactNode, type ReactElement } from "react";
import { cloneAndMerge as composeHost, composeRefs } from "../../utils/slot.js";
import { isValidElement } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { DownloadTriggerRoot, type DownloadTriggerRootProps, type UseDownloadProps } from "../download-trigger/index.js";
import { encodeQrCode, QrCodeError, type QrCodeEncoding, type QrCodeResult } from "./encode.js";
import { exportQrCode, type QrCodeExportOptions } from "./export.js";

declare const process: { env?: { NODE_ENV?: string } } | undefined;

export interface QrCodeOptions {
  id?: string;
  ids?: { root?: string; frame?: string; overlay?: string };
  value?: string;
  defaultValue?: string;
  encoding?: QrCodeEncoding;
  pixelSize?: number;
  onValueChange?: (details: { value: string }) => void;
  onEncode?: (details: { result: QrCodeResult }) => void;
  onEncodingError?: (details: { error: QrCodeError }) => void;
}
export interface QrCodeApi {
  readonly value: string;
  readonly result: QrCodeResult | null;
  readonly error: QrCodeError | null;
  readonly state: "ready" | "error";
  setValue(value: string): void;
  toBlob(options: QrCodeExportOptions): Promise<Blob>;
  getDataUrl(options: QrCodeExportOptions): Promise<string>;
}
interface Internal {
  ids: { root: string; frame: string; overlay: string };
  frame: SVGSVGElement | null;
  overlay: HTMLDivElement | null;
  exportSrc?: string;
  listen: Set<() => void>;
}
const internals = new WeakMap<QrCodeApi, Internal>();
const Context = createContext<QrCodeApi | null>(null);
Context.displayName = "QrCodeContext";

export function useQrCode(options: QrCodeOptions = {}): QrCodeApi {
  const generatedId = useId();
  const id = options.id ?? `qr-${generatedId}`;
  const ids = { root: options.ids?.root ?? id, frame: options.ids?.frame ?? `${id}-frame`, overlay: options.ids?.overlay ?? `${id}-overlay` };
  const { defaultValue = "", encoding = {}, pixelSize = 10 } = options;
  const [value, setValue] = useControllableState({ value: options.value, defaultValue,
    onChange: value => options.onValueChange?.({ value }) });
  const { ecc, boostEcc, minVersion, maxVersion, maskPattern, border, invert } = encoding;
  useEffect(() => {
    if (!(typeof process !== "undefined" && process.env?.NODE_ENV === "production") && border !== undefined && border < 4) {
      console.warn("QrCode: fewer than four quiet-zone modules requires application scan qualification.");
    }
  }, [border]);
  const generated = useMemo(() => {
    try { return { result: encodeQrCode(value, { ecc, boostEcc, minVersion, maxVersion, maskPattern, border, invert }, pixelSize), error: null }; }
    catch (error) { return { result: null, error: error as QrCodeError }; }
  }, [value, ecc, boostEcc, minVersion, maxVersion, maskPattern, border, invert, pixelSize]);
  const refs = useRef<Internal>({ ids, frame: null, overlay: null, listen: new Set() });
  refs.current.ids = ids;
  const notified = useRef<typeof generated | null>(null);
  useEffect(() => {
    if (notified.current === generated) return;
    notified.current = generated;
    if (generated.error) options.onEncodingError?.({ error: generated.error });
    else options.onEncode?.({ result: generated.result! });
  }, [generated, options.onEncode, options.onEncodingError]);
  const toBlob = useCallback(async (exportOptions: QrCodeExportOptions) => {
    if (!generated.result || !refs.current.frame) throw new QrCodeError("unavailable", "A valid mounted QR Frame is required for export.");
    return exportQrCode({ ...refs.current, frame: refs.current.frame, result: generated.result }, exportOptions);
  }, [generated]);
  const api = useMemo<QrCodeApi>(() => ({ value, ...generated, state: generated.error ? "error" : "ready", setValue,
    toBlob, async getDataUrl(exportOptions) {
      const blob = await toBlob(exportOptions);
      if (exportOptions.signal?.aborted) throw new DOMException("QR export aborted.", "AbortError");
      const bytes = new Uint8Array(await blob.arrayBuffer());
      if (exportOptions.signal?.aborted) throw new DOMException("QR export aborted.", "AbortError");
      let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte);
      return `data:${blob.type};base64,${btoa(binary)}`;
    } }), [value, generated, setValue, toBlob]);
  internals.set(api, refs.current);
  return api;
}
export function useQrCodeContext(): QrCodeApi {
  const api = useContext(Context);
  if (!api) throw new Error("QrCode parts require QrCode.Root or RootProvider.");
  return api;
}
type HostComposition = { asChild?: boolean };
export type QrCodeRootProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & QrCodeOptions & HostComposition;
export const QrCodeRoot = forwardRef<HTMLDivElement, QrCodeRootProps>(function QrCodeRoot(
  { id, ids, value, defaultValue, encoding, pixelSize, onValueChange, onEncode, onEncodingError, ...props }, ref,
) {
  const api = useQrCode({ id, ids, value, defaultValue, encoding, pixelSize, onValueChange, onEncode, onEncodingError });
  return <QrCodeRootProvider {...props} value={api} ref={ref} />;
});
export interface QrCodeRootProviderProps extends HTMLAttributes<HTMLDivElement>, HostComposition { value: QrCodeApi }
export const QrCodeRootProvider = forwardRef<HTMLDivElement, QrCodeRootProviderProps>(function QrCodeRootProvider({ value, style, asChild, children, ...props }, ref) {
  if (!internals.has(value)) throw new Error("QrCode.RootProvider requires a useQrCode controller.");
  const host = { ...props, id: props.id ?? internals.get(value)!.ids.root, style: { position: "relative" as const, ...style }, ref, "data-slot": "qr-code-root", "data-state": value.state };
  return <Context.Provider value={value}>{asChild ? composeHost(children, host) : <div {...host}>{children}</div>}</Context.Provider>;
});
export function QrCodeContext({ children }: { children: (api: QrCodeApi) => ReactNode }) { return children(useQrCodeContext()); }
export interface QrCodeFrameProps extends Omit<SVGProps<SVGSVGElement>, "viewBox" | "preserveAspectRatio">, HostComposition {
  titleText?: string;
  description?: string;
  background?: string;
}
export const QrCodeFrame = forwardRef<SVGSVGElement, QrCodeFrameProps>(function QrCodeFrame(
  { titleText, description, background = "white", children, asChild, ...props }, ref,
) {
  const api = useQrCodeContext(), internal = internals.get(api)!;
  const titleId = useId(), descriptionId = useId();
  const dimension = api.result ? api.result.size * api.result.pixelSize : 290;
  const register = useCallback((node: SVGSVGElement | null) => {
    internal.frame = node;
    for (const listener of internal.listen) listener();
  }, [internal]);
  const frameRef = useMemo(() => composeRefs(register, ref), [register, ref]);
  if (asChild && (!isValidElement(children) || (typeof children.type === "string" && children.type !== "svg"))) throw new Error("QrCode.Frame asChild requires an svg host.");
  const content = asChild ? (children as ReactElement<{ children?: ReactNode }>).props.children : children;
  const host = { role: "img", "aria-labelledby": titleText ? titleId : undefined, "aria-describedby": description ? descriptionId : undefined,
    fill: "currentColor", ...props, id: props.id ?? internal.ids.frame, ref: frameRef, focusable: "false" as const, "data-slot": "qr-code-frame", "data-state": api.state,
    xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${dimension} ${dimension}`, preserveAspectRatio: "xMidYMid meet",
    children: <>{titleText && <title id={titleId}>{titleText}</title>}{description && <desc id={descriptionId}>{description}</desc>}
      <rect width="100%" height="100%" fill={background} data-slot="qr-code-background" />{content ?? <QrCodePattern />}</> };
  return asChild ? composeHost(children, host) : <svg {...host} />;

});
export type QrCodePatternProps = Omit<SVGProps<SVGPathElement>, "d" | "children"> & ({ asChild: true; children: ReactElement } | { asChild?: false; children?: never });
export const QrCodePattern = forwardRef<SVGPathElement, QrCodePatternProps>(function QrCodePattern({ asChild, children, ...props }, ref) {
  const api = useQrCodeContext();
  if (asChild && (!isValidElement(children) || (typeof children.type === "string" && children.type !== "path"))) throw new Error("QrCode.Pattern asChild requires a path host.");
  if (!api.result) return null;
  const host = { ...props, ref, d: api.result.path, "data-slot": "qr-code-pattern" };
  return asChild ? composeHost(children, host) : <path {...host} />;
});
export interface QrCodeOverlayProps extends HTMLAttributes<HTMLDivElement>, HostComposition { exportSrc?: string }
export const QrCodeOverlay = forwardRef<HTMLDivElement, QrCodeOverlayProps>(function QrCodeOverlay({ exportSrc, style, asChild, children, ...props }, ref) {
  const api = useQrCodeContext(), internal = internals.get(api)!;
  const [position, setPosition] = useState<{ left: number; top: number; width: number } | null>(null);
  const register = useCallback((node: HTMLDivElement | null) => {
    internal.overlay = node;
    for (const listener of internal.listen) listener();
  }, [internal]);
  const overlayRef = useMemo(() => composeRefs(register, ref), [register, ref]);
  useEffect(() => { internal.exportSrc = exportSrc; }, [internal, exportSrc]);
  useEffect(() => {
    let observer: ResizeObserver | undefined;
    const update = () => {
      const frame = internal.frame, overlay = internal.overlay;
      const parent = overlay?.offsetParent;
      if (!frame || !parent) { setPosition(null); return; }
      const rect = frame.getBoundingClientRect(), host = parent.getBoundingClientRect();
      const width = rect.width * (api.result ? api.result.symbolSize / api.result.size : 1);
      const next = { left: rect.left - host.left - parent.clientLeft + parent.scrollLeft + rect.width / 2,
        top: rect.top - host.top - parent.clientTop + parent.scrollTop + rect.height / 2, width };
      setPosition(old => old && old.left === next.left && old.top === next.top && old.width === next.width ? old : next);
    };
    const observe = () => {
      observer?.disconnect();
      const frame = internal.frame, win = frame?.ownerDocument.defaultView;
      if (win?.ResizeObserver) { observer = new win.ResizeObserver(update); observer.observe(frame!); if (frame!.parentElement) observer.observe(frame!.parentElement); }
      update();
    };
    internal.listen.add(observe); observe();
    return () => { internal.listen.delete(observe); observer?.disconnect(); };
  }, [internal, api.result]);
  const host = { ...props, id: props.id ?? internal.ids.overlay, ref: overlayRef, "data-slot": "qr-code-overlay", "aria-hidden": true as const,
    style: { ...style, position: "absolute", left: position?.left ?? "50%", top: position?.top ?? "50%",
      transform: "translate(-50%, -50%)", visibility: position && api.state === "ready" ? undefined : "hidden",
      "--qr-code-symbol-size": `${position?.width ?? 0}px` } as React.CSSProperties };
  return asChild ? composeHost(children, host) : <div {...host}>{children}</div>;
});
export interface QrCodeDownloadTriggerProps extends Omit<DownloadTriggerRootProps, "data" | "mimeType">,
  Omit<QrCodeExportOptions, "signal"> {}
/** QR serialization adapter; useDownload remains the sole file-delivery owner. */
export function useQrCodeDownload({ mimeType, quality, size, includeOverlay, disabled, ...props }: QrCodeDownloadTriggerProps): Omit<QrCodeDownloadTriggerProps, "quality" | "size" | "includeOverlay"> & UseDownloadProps {
  const api = useQrCodeContext();
  const data = useCallback(({ signal }: { signal: AbortSignal }) => api.toBlob({ mimeType, quality, size, includeOverlay, signal }), [api, mimeType, quality, size, includeOverlay]);
  return { ...props, disabled: disabled || api.state === "error", mimeType, data };
}
export const QrCodeDownloadTrigger = forwardRef<HTMLElement, QrCodeDownloadTriggerProps>(function QrCodeDownloadTrigger(props, ref) {
  const download = useQrCodeDownload(props);
  return <DownloadTriggerRoot {...download} ref={ref} data-slot="qr-code-download-trigger" />;
});
