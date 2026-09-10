import { QrCodeRoot, QrCodeRootProvider, QrCodeFrame, QrCodePattern, QrCodeOverlay, QrCodeDownloadTrigger, QrCodeContext } from "./QrCode.js";
export const QrCode = { Root: QrCodeRoot, RootProvider: QrCodeRootProvider, Frame: QrCodeFrame,
  Pattern: QrCodePattern, Overlay: QrCodeOverlay, DownloadTrigger: QrCodeDownloadTrigger, Context: QrCodeContext };
export * from "./QrCode.js";
export { encodeQrCode, QrCodeError, type QrCodeEncoding, type QrCodeResult } from "./encode.js";
export type { QrCodeExportOptions, QrCodeMimeType } from "./export.js";
