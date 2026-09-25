"use client";

import { createContext, useContext, type RefObject } from "react";
import type { FileUploadRejectedFile } from "./utils.js";
import type { ValidationBehavior } from "../form/validation.js";

export type FileUploadDragState = "idle" | "accept" | "reject";

export interface FileUploadContextValue {
  files: File[];
  rejectedFiles: FileUploadRejectedFile[];
  setFilesFromList: (files: FileList | File[] | Promise<File[]>) => void;
  setFiles: (files: File[]) => void;
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
  directory: boolean;
  capture: boolean | "user" | "environment" | undefined;
  allowDrop: boolean;
  transforming: boolean;
  transformError: unknown;
  remainingFiles: number;
  maxFilesReached: boolean;
  clearRejectedFiles: () => void;
  setClipboardFiles: (data: DataTransfer) => void;
  translations: { clear?: string; removeFile?: (name: string) => string; fileCount?: (count: number) => string };
  accept: string | undefined;
  name: string | undefined;
  form: string | undefined;
  controlId: string | undefined;
  triggerId: string;
  labelId: string | undefined;
  describedBy: string | undefined;
  dragState: FileUploadDragState;
  setDragState: (state: FileUploadDragState) => void;
  getDragState: (files: File[]) => Exclude<FileUploadDragState, "idle">;
  validationBehavior: ValidationBehavior | undefined;
  reportControlValidity: (id: string, invalid: boolean) => void;
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
