"use client";

import {
  FileUploadDropzone,
  FileUploadHiddenInput,
  FileUploadItem,
  FileUploadItemDeleteTrigger,
  FileUploadItemGroup,
  FileUploadItemName,
  FileUploadItemSize,
  FileUploadRoot,
  FileUploadTrigger,
  FileUploadRootProvider,
  FileUploadContext,
  FileUploadClearTrigger,
  FileUploadFileText,
  FileUploadLabel,
  FileUploadItemPreview,
  FileUploadItemPreviewImage,
} from "./primitives/file-upload/index.js";

export { FileUploadRootProvider, useFileUpload, FileUploadContext, FileUploadClearTrigger, FileUploadFileText, FileUploadLabel, FileUploadItemPreview, FileUploadItemPreviewImage, normalizeFileAccept } from "./primitives/file-upload/index.js";
export type { FileUploadRootProviderProps, FileUploadController, FileUploadAccept, FileUploadError, FileUploadClearTriggerProps, FileUploadFileTextProps, FileUploadItemPreviewProps, FileUploadItemPreviewImageProps } from "./primitives/file-upload/index.js";

export {
  FileUploadContextProvider,
  FileUploadDropzone,
  FileUploadHiddenInput,
  FileUploadItem,
  FileUploadItemContextProvider,
  FileUploadItemDeleteTrigger,
  FileUploadItemGroup,
  FileUploadItemName,
  FileUploadItemSize,
  FileUploadRoot,
  FileUploadTrigger,
  fileMatchesAccept,
  formatFileSize,
  useFileUploadContext,
  useFileUploadItemContext,
  validateFileUploadFiles,
} from "./primitives/file-upload/index.js";
export type {
  FileUploadContextValue,
  FileUploadDragState,
  FileUploadDropzoneProps,
  FileUploadHiddenInputProps,
  FileUploadItemContextValue,
  FileUploadItemDeleteTriggerProps,
  FileUploadItemGroupProps,
  FileUploadItemNameProps,
  FileUploadItemProps,
  FileUploadItemSizeProps,
  FileUploadRejectedFile,
  FileUploadRootProps,
  FileUploadValidationOptions,
  FileUploadValidationResult,
} from "./primitives/file-upload/index.js";

export const FileUpload = {
  Root: FileUploadRoot,
  RootProvider: FileUploadRootProvider,
  Context: FileUploadContext,
  ClearTrigger: FileUploadClearTrigger,
  FileText: FileUploadFileText,
  Label: FileUploadLabel,
  ItemPreview: FileUploadItemPreview,
  ItemPreviewImage: FileUploadItemPreviewImage,
  HiddenInput: FileUploadHiddenInput,
  Trigger: FileUploadTrigger,
  Dropzone: FileUploadDropzone,
  ItemGroup: FileUploadItemGroup,
  Item: FileUploadItem,
  ItemName: FileUploadItemName,
  ItemSize: FileUploadItemSize,
  ItemDeleteTrigger: FileUploadItemDeleteTrigger,
} as const;
