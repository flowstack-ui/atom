export type FileUploadAccept = string | string[] | Record<string, string[]>;
export interface FileUploadError { code: string; message?: string }
export interface FileUploadValidationOptions {
  accept?: FileUploadAccept;
  maxFiles?: number;
  maxSize?: number;
  minSize?: number;
  validateFile?: (file: File, details: { files: File[]; acceptedFiles: File[] }) => string | FileUploadError[] | null | undefined | false;
}

export interface FileUploadValidationResult {
  acceptedFiles: File[];
  rejectedFiles: FileUploadRejectedFile[];
}

export interface FileUploadRejectedFile {
  file: File;
  errors: string[];
  details?: FileUploadError[];
}

export function normalizeFileAccept(accept: FileUploadAccept | undefined): string | undefined {
  if (accept === undefined || typeof accept === "string") return accept;
  return (Array.isArray(accept) ? accept : Object.entries(accept).flatMap(([mime, extensions]) => [mime, ...extensions])).join(",");
}

export function fileMatchesAccept(file: File, accept: FileUploadAccept | undefined): boolean {
  if (!accept) return true;

  const rules = normalizeFileAccept(accept)!
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return rules.some((rule) => {
    if (rule.startsWith(".")) {
      return fileName.endsWith(rule);
    }

    if (rule.endsWith("/*")) {
      const prefix = rule.slice(0, -1);
      return fileType.startsWith(prefix);
    }

    return fileType === rule;
  });
}

export function validateFileUploadFiles(
  files: File[],
  options: FileUploadValidationOptions,
): FileUploadValidationResult {
  const acceptedFiles: File[] = [];
  const rejectedFiles: FileUploadRejectedFile[] = [];
  const maxFiles = options.maxFiles === undefined
    ? undefined
    : Math.max(0, Math.floor(options.maxFiles));

  for (const file of files) {
    const errors: string[] = [];

    if (!fileMatchesAccept(file, options.accept)) {
      errors.push("type");
    }

    if (options.maxSize !== undefined && file.size > options.maxSize) {
      errors.push("size");
    }
    if (options.minSize !== undefined && file.size < options.minSize) errors.push("too-small");

    const customError = options.validateFile?.(file, { files, acceptedFiles: [...acceptedFiles] });
    if (typeof customError === "string" && customError.length > 0) {
      errors.push(customError);
    }
    if (Array.isArray(customError)) errors.push(...customError.map((error) => error.code));

    if (maxFiles !== undefined && acceptedFiles.length >= maxFiles) {
      errors.push("count");
    }

    if (errors.length > 0) {
      rejectedFiles.push({ file, errors, ...(Array.isArray(customError) && { details: customError }) });
    } else {
      acceptedFiles.push(file);
    }
  }

  return { acceptedFiles, rejectedFiles };
}

export function formatFileSize(size: number, locale?: string): string {
  if (!Number.isFinite(size) || size <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatted = locale ? new Intl.NumberFormat(locale, { maximumFractionDigits: value >= 10 || unitIndex === 0 ? 0 : 1 }).format(value) : value >= 10 || unitIndex === 0
    ? Math.round(value).toString()
    : value.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
}
