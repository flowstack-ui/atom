import { encode } from "uqr";

export interface QrCodeEncoding {
  ecc?: "L" | "M" | "Q" | "H";
  boostEcc?: boolean;
  minVersion?: number;
  maxVersion?: number;
  maskPattern?: number;
  /** Clear margin in modules, not CSS pixels. Default 4. */
  border?: number;
  invert?: boolean;
}
export interface QrCodeResult {
  readonly version: number;
  readonly maskPattern: number;
  readonly size: number;
  readonly symbolSize: number;
  readonly border: number;
  readonly pixelSize: number;
  readonly data: readonly (readonly boolean[])[];
  readonly path: string;
}
export class QrCodeError extends Error {
  constructor(public readonly code: "options" | "capacity" | "unavailable" | "export" | "overlay", message: string) {
    super(message); this.name = "QrCodeError";
  }
}
function integer(value: number, min: number, max: number) {
  return Number.isInteger(value) && value >= min && value <= max;
}
/** Pure, synchronous and server-safe. Never visits or normalizes the payload. */
export function encodeQrCode(value: string, encoding: QrCodeEncoding = {}, pixelSize = 10): QrCodeResult {
  const { ecc = "L", boostEcc = false, minVersion = 1, maxVersion = 40,
    maskPattern = -1, border = 4, invert = false } = encoding;
  if (typeof value !== "string" || !["L", "M", "Q", "H"].includes(ecc) ||
    typeof boostEcc !== "boolean" || typeof invert !== "boolean" ||
    !integer(minVersion, 1, 40) || !integer(maxVersion, minVersion, 40) ||
    !integer(maskPattern, -1, 7) || !integer(border, 0, 16) ||
    !Number.isFinite(pixelSize) || pixelSize <= 0 || pixelSize > 100) {
    throw new QrCodeError("options", "Invalid QR encoding options.");
  }
  // Bound impossible inputs before the encoder performs expensive segment work.
  if (value.length > 7089) throw new QrCodeError("capacity", "QR value exceeds encoding capacity.");
  let qr;
  try { qr = encode(value, { ecc, boostEcc, minVersion, maxVersion, maskPattern, border, invert }); }
  catch { throw new QrCodeError("capacity", "QR value exceeds the selected encoding capacity."); }
  const paths: string[] = [];
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.data[y]![x]) paths.push(`M${x * pixelSize} ${y * pixelSize}h${pixelSize}v${pixelSize}h-${pixelSize}z`);
    }
  }
  return Object.freeze({ version: qr.version, maskPattern: qr.maskPattern, size: qr.size,
    symbolSize: qr.size - border * 2, border, pixelSize, path: paths.join(""),
    data: Object.freeze(qr.data.map(row => Object.freeze([...row]))) });
}
