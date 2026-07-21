"use client";

import { createContext, useContext, type RefObject } from "react";
import type { FileUploadRejectedFile } from "./utils.js";

export type FileUploadDragState = "idle" | "accept" | "reject";

export interface FileUploadContextValue {
  files: File[];
  rejectedFiles: FileUploadRejectedFile[];
  setFilesFromList: (files: FileList | File[]) => void;
  removeFile: (file: File) => void;
  clearFiles: () => void;
  openFilePicker: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  multiple: boolean;
  accept: string | undefined;
  name: string | undefined;
  form: string | undefined;
  controlId: string | undefined;
  describedBy: string | undefined;
  dragState: FileUploadDragState;
  setDragState: (state: FileUploadDragState) => void;
}

export interface FileUploadItemContextValue {
  file: File;
  index: number;
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);
FileUploadContext.displayName = "FileUploadContext";

const FileUploadItemContext = createContext<FileUploadItemContextValue | null>(null);
FileUploadItemContext.displayName = "FileUploadItemContext";

export const FileUploadContextProvider = FileUploadContext.Provider;
export const FileUploadItemContextProvider = FileUploadItemContext.Provider;

export function useFileUploadContext(): FileUploadContextValue {
  const ctx = useContext(FileUploadContext);
  if (!ctx) {
    throw new Error("FileUpload compound components must be used within <FileUpload.Root>");
  }
  return ctx;
}

export function useFileUploadItemContext(): FileUploadItemContextValue {
  const ctx = useContext(FileUploadItemContext);
  if (!ctx) {
    throw new Error("FileUpload item components must be used within <FileUpload.Item>");
  }
  return ctx;
}
