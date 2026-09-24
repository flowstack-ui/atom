"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFieldContext } from "../field/context.js";
import { useOptionalFormContext } from "../form/context.js";
import type { ValidationBehavior } from "../form/validation.js";
import {
  FileUploadContextProvider,
  type FileUploadContextValue,
  type FileUploadDragState,
} from "./context.js";
import {
  validateFileUploadFiles,
  normalizeFileAccept,
  type FileUploadValidationOptions,
  type FileUploadValidationResult,
  type FileUploadRejectedFile,
} from "./utils.js";

type FileUploadRootNativeProps = NativeDivProps<"children" | "onChange">;

export interface FileUploadRootProps extends FileUploadRootNativeProps {
  children?: ReactNode;
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  onRejectedFilesChange?: (files: FileUploadRejectedFile[]) => void;
  accept?: FileUploadValidationOptions["accept"];
  multiple?: boolean;
  appendFiles?: boolean;
  maxFiles?: number;
  maxSize?: number;
  minSize?: number;
  validateFile?: FileUploadValidationOptions["validateFile"];
  onFileAccept?: (details: { files: File[] }) => void;
  onFileReject?: (details: { files: FileUploadRejectedFile[] }) => void;
  onFileChange?: (details: FileUploadValidationResult) => void;
  transformFiles?: (files: File[]) => File[] | Promise<File[]>;
  onTransformError?: (error: unknown) => void;
  directory?: boolean;
  capture?: boolean | "user" | "environment";
  allowDrop?: boolean;
  translations?: { clear?: string; removeFile?: (name: string) => string; fileCount?: (count: number) => string };
  preventDocumentDrop?: boolean;
  name?: string;
  form?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  validationBehavior?: ValidationBehavior;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export function useFileUpload(
    {
      children,
      files,
      defaultFiles = [],
      onFilesChange,
      onRejectedFilesChange,
      accept,
      multiple: providedMultiple,
      appendFiles,
      maxFiles,
      maxSize,
      minSize,
      validateFile,
      onFileAccept,
      onFileReject,
      onFileChange,
      transformFiles,
      onTransformError,
      directory = false,
      capture,
      allowDrop = true,
      translations = {},
      preventDocumentDrop = true,
      name,
      form,
      disabled,
      required,
      readOnly,
      invalid,
      validationBehavior,
      render,
      asChild,
      id: providedId,
      "aria-describedby": ariaDescribedBy,
      "data-slot": dataSlot = "file-upload",
      ...restProps
    }: FileUploadRootProps = {},
  ): FileUploadController {
    const multiple = providedMultiple ?? (maxFiles !== undefined && maxFiles > 1);
    const fieldCtx = useFieldContext();
    const formContext = useOptionalFormContext();
    const validationId = useId();
    const autoId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const triggerRef = useRef<HTMLElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const generation = useRef(0);
    const [transforming, setTransforming] = useState(false);
    const [transformError, setTransformError] = useState<unknown>(null);
    useEffect(() => () => { generation.current += 1; }, []);
    const [rejectedFiles, setRejectedFiles] = useState<FileUploadRejectedFile[]>([]);
    const [dragState, setDragState] = useState<FileUploadDragState>("idle");
    const [resolvedFiles, setResolvedFiles] = useControllableState<File[]>({
      value: files,
      defaultValue: defaultFiles,
      onChange: onFilesChange,
    });
    const isDisabled = disabled ?? fieldCtx?.disabled ?? false;
    const isRequired = required ?? fieldCtx?.required ?? false;
    const isReadOnly = readOnly ?? fieldCtx?.readOnly ?? false;
    useEffect(() => {
      if (isDisabled || isReadOnly) { generation.current += 1; setTransforming(false); }
    }, [isDisabled, isReadOnly]);
    const [invalidControlIds, setInvalidControlIds] = useState<Set<string>>(
      () => new Set(),
    );
    const locallyInvalid = Boolean(invalid) || invalidControlIds.size > 0;
    const isInvalid = locallyInvalid || (fieldCtx?.invalid ?? false);
    const resolvedValidationBehavior =
      validationBehavior ??
      fieldCtx?.validationBehavior ??
      formContext?.validationBehavior;
    const controlId = fieldCtx?.controlId ?? (providedId ? `${providedId}-input` : `${autoId}-control`);
    const triggerId = providedId ? `${providedId}-trigger` : `${autoId}-trigger`;
    const labelId = fieldCtx?.labelId;
    const describedBy = ariaDescribedBy ?? fieldCtx?.describedBy;

    useEffect(() => {
      if (!preventDocumentDrop) return undefined;
      const ownerDocument = rootRef.current?.ownerDocument;
      if (!ownerDocument) return undefined;

      const preventFileDrop = (event: DragEvent) => {
        const items = Array.from(event.dataTransfer?.items ?? []);
        const hasFiles = items.some((item) => item.kind === "file") ||
          Array.from(event.dataTransfer?.types ?? []).includes("Files");
        if (hasFiles) event.preventDefault();
      };

      ownerDocument.addEventListener("dragover", preventFileDrop);
      ownerDocument.addEventListener("drop", preventFileDrop);
      return () => {
        ownerDocument.removeEventListener("dragover", preventFileDrop);
        ownerDocument.removeEventListener("drop", preventFileDrop);
      };
    }, [preventDocumentDrop]);

    const setRejected = useCallback(
      (nextRejectedFiles: FileUploadRejectedFile[]) => {
        setRejectedFiles(nextRejectedFiles);
        onRejectedFilesChange?.(nextRejectedFiles);
      },
      [onRejectedFilesChange],
    );
    const reportControlValidity = useCallback((id: string, nextInvalid: boolean) => {
      setInvalidControlIds((current) => {
        const next = new Set(current);
        if (nextInvalid) next.add(id);
        else next.delete(id);
        return next.size === current.size && [...next].every((value) => current.has(value))
          ? current
          : next;
      });
    }, []);
    const parentReportValidity =
      fieldCtx?.reportControlValidity ?? formContext?.reportControlValidity;

    useEffect(() => {
      parentReportValidity?.(validationId, locallyInvalid);
      return () => parentReportValidity?.(validationId, false);
    }, [locallyInvalid, parentReportValidity, validationId]);

    const resetNativeInput = useCallback(() => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }, []);
    const reset = useCallback(() => {
      generation.current += 1;
      setTransforming(false);
      if (files === undefined) setResolvedFiles(defaultFiles);
      setRejectedFiles([]);
      setDragState("idle");
      resetNativeInput();
    }, [defaultFiles, files, resetNativeInput, setResolvedFiles]);
    useFormReset(inputRef, form, false, reset);

    useEffect(() => {
      const input = inputRef.current;
      const Transfer = input?.ownerDocument.defaultView?.DataTransfer;
      if (!input || !Transfer) return;

      try {
        const transfer = new Transfer();
        resolvedFiles.forEach((file) => transfer.items.add(file));
        input.files = transfer.files;
      } catch {
        // Some browsers expose FileList as read-only; picker selections still stay native.
      }
    }, [resolvedFiles]);

    const setFilesFromList = useCallback(
      (nextFiles: FileList | File[] | Promise<File[]>, options?: { append?: boolean }) => {
        if (isDisabled || isReadOnly) return;
        const request = ++generation.current;
        setTransformError(null);
        const commit = (incomingFiles: File[]) => {
        if (request !== generation.current) return;
        const shouldAppendFiles = multiple && (options?.append ?? appendFiles ?? true);
        const candidates = multiple
          ? (shouldAppendFiles ? [...resolvedFiles, ...incomingFiles] : incomingFiles)
          : incomingFiles.slice(0, 1);
        const validation = validateFileUploadFiles(candidates, {
          accept,
          maxFiles: multiple ? maxFiles : 1,
          maxSize,
          minSize,
          validateFile,
        });

        setResolvedFiles(validation.acceptedFiles);
        setRejected(validation.rejectedFiles);
        onFileChange?.(validation);
        if (validation.acceptedFiles.length) onFileAccept?.({ files: validation.acceptedFiles });
        if (validation.rejectedFiles.length) onFileReject?.({ files: validation.rejectedFiles });
        };
        const pending = "then" in nextFiles;
        if (!transformFiles && !pending) { setTransforming(false); commit(Array.from(nextFiles)); return; }
        setTransforming(true);
        void Promise.resolve(nextFiles).then((incoming) => transformFiles ? transformFiles(Array.from(incoming)) : Array.from(incoming)).then(commit).catch((error: unknown) => {
          if (request === generation.current) { setTransformError(error); onTransformError?.(error); }
        }).finally(() => {
          if (request === generation.current) setTransforming(false);
        });
      },
      [
        accept,
        appendFiles,
        isDisabled,
        isReadOnly,
        maxFiles,
        maxSize,
        minSize,
        transformFiles,
        onTransformError,
        onFileAccept,
        onFileReject,
        onFileChange,
        multiple,
        resolvedFiles,
        setRejected,
        setResolvedFiles,
        validateFile,
      ],
    );

    const getDragState = useCallback(
      (incomingFiles: File[]): Exclude<FileUploadDragState, "idle"> => {
        const shouldAppendFiles = multiple && (appendFiles ?? true);
        const candidates = multiple
          ? (shouldAppendFiles ? [...resolvedFiles, ...incomingFiles] : incomingFiles)
          : incomingFiles.slice(0, 1);
        const validation = validateFileUploadFiles(candidates, {
          accept,
          maxFiles: multiple ? maxFiles : 1,
          maxSize,
          minSize,
          validateFile,
        });
        return validation.rejectedFiles.length > 0 ? "reject" : "accept";
      },
      [accept, appendFiles, maxFiles, maxSize, minSize, multiple, resolvedFiles, validateFile],
    );

    const removeFile = useCallback(
      (file: File) => {
        if (isDisabled || isReadOnly) return;
        generation.current += 1;
        setTransforming(false);
        setResolvedFiles(resolvedFiles.filter((currentFile) => currentFile !== file));
        setRejected(rejectedFiles.filter((entry) => entry.file !== file));
        resetNativeInput();
      },
      [isDisabled, isReadOnly, resetNativeInput, resolvedFiles, setResolvedFiles, rejectedFiles, setRejected],
    );

    const clearFiles = useCallback(() => {
      if (isDisabled || isReadOnly) return;
      generation.current += 1;
      setTransforming(false);
      setResolvedFiles([]);
      setRejected([]);
      resetNativeInput();
    }, [isDisabled, isReadOnly, resetNativeInput, setRejected, setResolvedFiles]);

    const openFilePicker = useCallback(() => {
      if (isDisabled || isReadOnly) return;
      inputRef.current?.click();
    }, [isDisabled, isReadOnly]);

    const contextValue = useMemo<FileUploadContextValue>(
      () => ({
        files: resolvedFiles,
        rejectedFiles,
        setFilesFromList,
        setFiles: (files: File[]) => setFilesFromList(files, { append: false }),
        removeFile,
        clearFiles,
        openFilePicker,
        inputRef,
        triggerRef,
        disabled: isDisabled,
        readOnly: isReadOnly,
        required: isRequired,
        invalid: isInvalid,
        multiple,
        accept: normalizeFileAccept(accept),
        directory,
        capture,
        allowDrop,
        translations,
        transforming,
        transformError,
        remainingFiles: Math.max(0, (multiple ? maxFiles ?? Infinity : 1) - resolvedFiles.length),
        maxFilesReached: resolvedFiles.length >= (multiple ? maxFiles ?? Infinity : 1),
        clearRejectedFiles: () => setRejected([]),
        setClipboardFiles: (data: DataTransfer) => setFilesFromList(Array.from(data.files)),
        name,
        form,
        controlId,
        triggerId,
        labelId,
        describedBy,
        dragState,
        setDragState,
        getDragState,
        validationBehavior: resolvedValidationBehavior,
        reportControlValidity,
      }),
      [
        accept,
        directory,
        capture,
        allowDrop,
        translations,
        transforming,
        transformError,
        maxFiles,
        setRejected,
        clearFiles,
        controlId,
        describedBy,
        dragState,
        form,
        getDragState,
        isDisabled,
        isInvalid,
        isReadOnly,
        isRequired,
        multiple,
        name,
        labelId,
        openFilePicker,
        rejectedFiles,
        removeFile,
        resolvedFiles,
        setFilesFromList,
        triggerId,
        reportControlValidity,
        resolvedValidationBehavior,
      ],
    );

    return { ...contextValue, rootRef, rootProps: { ...restProps, id: providedId, asChild, render, "data-slot": dataSlot } };
}

export interface FileUploadController extends FileUploadContextValue {
  rootRef: RefObject<HTMLDivElement | null>;
  rootProps: FileUploadRootNativeProps & Pick<FileUploadRootProps, "asChild" | "render" | "data-slot">;
}
export interface FileUploadRootProviderProps extends FileUploadRootNativeProps {
  value: FileUploadController;
  children?: ReactNode;
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
}
export const FileUploadRootProvider = forwardRef<HTMLDivElement, FileUploadRootProviderProps>(
  function FileUploadRootProvider({ value, children, ...props }, ref) {
    const { asChild, render, ...restProps } = { ...value.rootProps, ...props };
    const behaviorProps = {
      ...restProps, ref: composeRefs(value.rootRef, ref),
      "data-state": value.files.length ? "filled" : "empty",
      "data-drag": value.dragState,
      "data-filled": value.files.length ? "" : undefined,
      "data-rejected": value.rejectedFiles.length ? "" : undefined,
      "data-disabled": value.disabled ? "" : undefined,
      "data-readonly": value.readOnly ? "" : undefined,
      "data-required": value.required ? "" : undefined,
      "data-invalid": value.invalid ? "" : undefined,
      "data-transforming": value.transforming ? "" : undefined,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", {
          ...behaviorProps,
          children,
        });

    return (
      <FileUploadContextProvider value={value}>
        {element}
      </FileUploadContextProvider>
    );
  },
);

export const FileUploadRoot = forwardRef<HTMLDivElement, FileUploadRootProps>(function FileUploadRoot({ children, ...props }, ref) {
  const value = useFileUpload(props);
  return <FileUploadRootProvider value={value} ref={ref}>{children}</FileUploadRootProvider>;
});
