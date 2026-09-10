export type DownloadableData = string | Blob | File;
export interface DownloadDetails { fileName: string; mimeType: string; size: number }

/** Resolve file bytes without evaluating or converting their contents. */
export function downloadableBlob(data: DownloadableData, mimeType?: string): Blob {
  if (typeof data === "string") {
    if (!mimeType?.trim()) throw new TypeError("DownloadTrigger requires mimeType for string data.");
    return new Blob([data], { type: mimeType });
  }
  // Structural checks also accept Blobs from another same-origin window.
  if (!data || typeof data.arrayBuffer !== "function" || typeof data.slice !== "function" ||
      typeof data.size !== "number" || typeof data.type !== "string") {
    throw new TypeError("DownloadTrigger data must be a string, Blob or File.");
  }
  const type = mimeType?.trim() || data.type || "application/octet-stream";
  return type === data.type ? data : data.slice(0, data.size, type);
}

export function initiateDownload(doc: Document, blob: Blob, fileName: string): DownloadDetails {
  if (!fileName.trim()) throw new TypeError("DownloadTrigger requires a nonempty fileName.");
  const win = doc.defaultView;
  if (!win || !doc.body) throw new Error("DownloadTrigger requires an active document.");
  const anchor = doc.createElement("a");
  const urls = (win as Window & { URL: typeof URL }).URL;
  if (!("download" in anchor) || !urls?.createObjectURL) throw new Error("File download is not supported in this environment.");
  const url = urls.createObjectURL(blob);
  try {
    anchor.href = url; anchor.download = fileName; anchor.hidden = true;
    doc.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    // Keep bytes alive past navigation dispatch; never revoke someone else's URL.
    win.setTimeout(() => urls.revokeObjectURL(url), 1000);
  }
  return { fileName, mimeType: blob.type, size: blob.size };
}
