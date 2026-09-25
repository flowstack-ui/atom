import { QrCodeError, type QrCodeResult } from "./encode.js";

export type QrCodeMimeType = "image/svg+xml" | "image/png" | "image/jpeg" | "image/webp";
export interface QrCodeExportOptions {
  mimeType: QrCodeMimeType;
  quality?: number;
  /** Output edge in pixels. Integer 1–4096; independent of CSS display size. */
  size?: number;
  includeOverlay?: boolean;
  signal?: AbortSignal;
}
export interface QrCodeExportSnapshot {
  frame: SVGSVGElement;
  overlay: HTMLElement | null;
  exportSrc?: string;
  result: QrCodeResult;
}
const ns = "http://www.w3.org/2000/svg";
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
function aborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("QR export aborted.", "AbortError");
}
function loadImage(doc: Document, src: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  aborted(signal);
  return new Promise((resolve, reject) => {
    const image = doc.createElement("img");
    const finish = (error?: Error) => {
      clearTimeout(timer); signal?.removeEventListener("abort", cancel);
      image.onload = null; image.onerror = null;
      if (error) { image.removeAttribute("src"); reject(error); } else resolve(image);
    };
    const cancel = () => finish(new DOMException("QR export aborted.", "AbortError"));
    const timer = setTimeout(() => finish(new QrCodeError("overlay", "QR image preparation timed out.")), 10000);
    signal?.addEventListener("abort", cancel, { once: true });
    image.crossOrigin = "anonymous";
    image.onload = () => finish();
    image.onerror = () => finish(new QrCodeError("overlay", "QR image could not be loaded. Check its URL and CORS policy."));
    image.src = src;
  });
}
function canvas(doc: Document, size: number) {
  const element = doc.createElement("canvas"); element.width = size; element.height = size;
  const ctx = element.getContext("2d");
  if (!ctx) throw new QrCodeError("export", "Canvas export is unavailable.");
  return { element, ctx };
}
/** Snapshot the frame and logo synchronously before any image preparation. */
export async function exportQrCode(snapshot: QrCodeExportSnapshot, options: QrCodeExportOptions): Promise<Blob> {
  const { frame, overlay, result, exportSrc } = snapshot;
  const { mimeType, quality, signal, includeOverlay = true } = options;
  const size = options.size ?? Math.min(4096, Math.ceil(result.size * result.pixelSize));
  if (!["image/svg+xml", "image/png", "image/jpeg", "image/webp"].includes(mimeType) ||
    !Number.isInteger(size) || size < 1 || size > 4096 ||
    (quality !== undefined && (!Number.isFinite(quality) || quality < 0 || quality > 1))) {
    throw new QrCodeError("options", "Invalid QR export options.");
  }
  aborted(signal);
  const doc = frame.ownerDocument, win = doc.defaultView;
  if (!win || !frame.isConnected) throw new QrCodeError("unavailable", "A mounted QR Frame is required for export.");
  const pattern = frame.querySelector('[data-slot="qr-code-pattern"]');
  const backing = frame.querySelector('[data-slot="qr-code-background"]');
  if (!pattern || !backing) throw new QrCodeError("unavailable", "QR Frame requires its Pattern and background.");
  const fill = win.getComputedStyle(pattern).fill;
  const background = win.getComputedStyle(backing).fill;
  const dimension = result.size * result.pixelSize;
  let logoMarkup = "";
  let logo: { src: string; x: number; y: number; width: number; height: number; background: string; radius: number } | undefined;
  if (includeOverlay && overlay) {
    const rect = frame.getBoundingClientRect(), box = overlay.getBoundingClientRect();
    if (!rect.width || !rect.height || !box.width || !box.height) throw new QrCodeError("overlay", "QR logo must have visible dimensions for export.");
    const style = win.getComputedStyle(overlay);
    const sx = dimension / rect.width, sy = dimension / rect.height;
    let src = exportSrc;
    if (!src) {
      const img = overlay.querySelector("img");
      const svg = overlay.querySelector("svg");
      if (img) src = img.currentSrc || img.src;
      else if (svg) {
        const clone = svg.cloneNode(true) as SVGSVGElement;
        // Inline computed paint so currentColor/icons survive standalone export.
        const originals = [svg, ...svg.querySelectorAll("*")];
        const copies = [clone, ...clone.querySelectorAll("*")];
        originals.forEach((node, i) => {
          const paint = win.getComputedStyle(node);
          for (const key of ["fill", "stroke", "stroke-width", "opacity"] as const) copies[i]!.setAttribute(key, paint.getPropertyValue(key));
        });
        if (clone.querySelector("script,foreignObject,image,use,style")) throw new QrCodeError("overlay", "Supply exportSrc for SVG logos with external or unsupported content.");
        clone.setAttribute("xmlns", ns);
        src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new win.XMLSerializer().serializeToString(clone))}`;
      }
    }
    if (!src) throw new QrCodeError("overlay", "Supply exportSrc for this overlay, or explicitly omit it from export.");
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    logo = { src, x: (box.left - rect.left) * sx, y: (box.top - rect.top) * sy,
      width: box.width * sx, height: box.height * sy, background: style.backgroundColor,
      radius: (parseFloat(style.borderTopLeftRadius) || 0) * sx };
    // Decode into an embedded PNG: exported SVG has no external asset dependencies.
    const image = await loadImage(doc, src, signal);
    aborted(signal);
    const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
    const imageCanvas = canvas(doc, Math.max(1, Math.round(image.naturalWidth * scale)));
    imageCanvas.element.height = Math.max(1, Math.round(image.naturalHeight * scale));
    imageCanvas.ctx.drawImage(image, 0, 0, imageCanvas.element.width, imageCanvas.element.height);
    try { logo.src = imageCanvas.element.toDataURL("image/png"); }
    catch { throw new QrCodeError("overlay", "QR logo export was blocked by its CORS policy."); }
    const px = paddingX * sx / 2, py = paddingY * sy / 2;
    const outer = { ...logo };
    logo.x += px; logo.y += py; logo.width -= px * 2; logo.height -= py * 2;
    if (logo.width <= 0 || logo.height <= 0) throw new QrCodeError("overlay", "QR logo padding leaves no image area.");
    // Store only generated markup, never arbitrary overlay HTML.
    logoMarkup = `<rect x="${outer.x}" y="${outer.y}" width="${outer.width}" height="${outer.height}" rx="${outer.radius}" fill="${escape(outer.background)}"/><image x="${logo.x}" y="${logo.y}" width="${logo.width}" height="${logo.height}" preserveAspectRatio="xMidYMid meet" href="${escape(logo.src)}"/>`;
  }
  const markup = `<svg xmlns="${ns}" width="${size}" height="${size}" viewBox="0 0 ${dimension} ${dimension}"><rect width="100%" height="100%" fill="${escape(background)}"/><path d="${result.path}" fill="${escape(fill)}"/>${logoMarkup}</svg>`;
  aborted(signal);
  if (mimeType === "image/svg+xml") return new Blob([markup], { type: mimeType });
  const image = await loadImage(doc, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`, signal);
  const out = canvas(doc, size);
  if (mimeType === "image/jpeg") { out.ctx.fillStyle = "white"; out.ctx.fillRect(0, 0, size, size); }
  out.ctx.drawImage(image, 0, 0, size, size);
  const blob = await new Promise<Blob>((resolve, reject) => out.element.toBlob(b => b ? resolve(b) : reject(new QrCodeError("export", "QR image conversion failed.")), mimeType, quality));
  aborted(signal);
  if (blob.type !== mimeType) throw new QrCodeError("export", "Requested QR image format is unsupported.");
  return blob;
}
