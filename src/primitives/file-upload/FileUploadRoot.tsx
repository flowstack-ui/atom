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
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormReset } from "../../hooks/useFormReset.js";
import type { NativeDivProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
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
  type FileUploadRejectedFile,
} from "./utils.js";

type FileUploadRootNativeProps = NativeDivProps<"children" | "onChange">;

export interface FileUploadRootProps extends FileUploadRootNativeProps {
  children?: ReactNode;
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  onRejectedFilesChange?: (files: FileUploadRejectedFile[]) => void;
  accept?: string;
  multiple?: boolean;
  appendFiles?: boolean;
  maxFiles?: number;
  maxSize?: number;
  validateFile?: (file: File) => string | null | undefined | false;
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

export const FileUploadRoot = forwardRef<HTMLDivElement, FileUploadRootProps>(
  function FileUploadRoot(
    {
      children,
      files,
      defaultFiles = [],
      onFilesChange,
      onRejectedFilesChange,
      accept,
      multiple = false,
      appendFiles,
      maxFiles,
      maxSize,
      validateFile,
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
    },
    ref,
  ) {
    const fieldCtx = useFieldContext();
    const formContext = useOptionalFormContext();
    const validationId = useId();
    const autoId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const triggerRef = useRef<HTMLElement | null>(null);
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
    const describedBy = ariaDescribedBy ?? fieldCtx?.describedBy;

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
      if (files === undefined) setResolvedFiles(defaultFiles);
      setRejectedFiles([]);
      setDragState("idle");
      resetNativeInput();
    }, [defaultFiles, files, resetNativeInput, setResolvedFiles]);
    useFormReset(inputRef, form, files !== undefined, reset);

    useEffect(() => {
      const input = inputRef.current;
      if (!input || typeof DataTransfer === "undefined") return;

      try {
        const transfer = new DataTransfer();
        resolvedFiles.forEach((file) => transfer.items.add(file));
        input.files = transfer.files;
      } catch {
        // Some browsers expose FileList as read-only; picker selections still stay native.
      }
    }, [resolvedFiles]);

    const setFilesFromList = useCallback(
      (nextFiles: FileList | File[]) => {
        if (isDisabled || isReadOnly) return;

        const incomingFiles = Array.from(nextFiles);
        const shouldAppendFiles = multiple && (appendFiles ?? true);
        const candidates = multiple
          ? (shouldAppendFiles ? [...resolvedFiles, ...incomingFiles] : incomingFiles)
          : incomingFiles.slice(0, 1);
        const validation = validateFileUploadFiles(candidates, {
          accept,
          maxFiles: multiple ? maxFiles : 1,
          maxSize,
          validateFile,
        });

        setResolvedFiles(validation.acceptedFiles);
        setRejected(validation.rejectedFiles);
      },
      [
        accept,
        appendFiles,
        isDisabled,
        isReadOnly,
        maxFiles,
        maxSize,
        multiple,
        resolvedFiles,
        setRejected,
        setResolvedFiles,
        validateFile,
      ],
    );

    const removeFile = useCallback(
      (file: File) => {
        if (isDisabled || isReadOnly) return;
        setResolvedFiles(resolvedFiles.filter((currentFile) => currentFile !== file));
        resetNativeInput();
      },
      [isDisabled, isReadOnly, resetNativeInput, resolvedFiles, setResolvedFiles],
    );

    const clearFiles = useCallback(() => {
      if (isDisabled || isReadOnly) return;
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
        accept,
        name,
        form,
        controlId,
        describedBy,
        dragState,
        setDragState,
        validationBehavior: resolvedValidationBehavior,
        reportControlValidity,
      }),
      [
        accept,
        clearFiles,
        controlId,
        describedBy,
        dragState,
        form,
        isDisabled,
        isInvalid,
        isReadOnly,
        isRequired,
        multiple,
        name,
        openFilePicker,
        rejectedFiles,
        removeFile,
        resolvedFiles,
        setFilesFromList,
        reportControlValidity,
        resolvedValidationBehavior,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      id: providedId,
      "data-slot": dataSlot,
      "data-state": resolvedFiles.length > 0 ? "filled" : "empty",
      "data-drag": dragState,
      ...(resolvedFiles.length > 0 && { "data-filled": "" }),
      ...(rejectedFiles.length > 0 && { "data-rejected": "" }),
      ...(isDisabled && { "data-disabled": "" }),
      ...(isReadOnly && { "data-readonly": "" }),
      ...(isRequired && { "data-required": "" }),
      ...(isInvalid && { "data-invalid": "" }),
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", {
          ...behaviorProps,
          children,
        });

    return (
      <FileUploadContextProvider value={contextValue}>
        {element}
      </FileUploadContextProvider>
    );
  },
);
