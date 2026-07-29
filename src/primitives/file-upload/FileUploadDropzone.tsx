"use client";

import {
  forwardRef,
  useCallback,
  type DragEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useFileUploadContext } from "./context.js";

function getDraggedFiles(dataTransfer: DataTransfer): File[] {
  const files = Array.from(dataTransfer.files ?? []);
  if (files.length > 0) return files;
  return Array.from(dataTransfer.items ?? [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
}

function hasDraggedFiles(dataTransfer: DataTransfer): boolean {
  return Array.from(dataTransfer.items ?? []).some((item) => item.kind === "file") ||
    Array.from(dataTransfer.types ?? []).includes("Files");
}

type FileUploadDropzoneNativeProps = NativeDivProps<"children">;

export interface FileUploadDropzoneProps extends FileUploadDropzoneNativeProps {
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FileUploadDropzone = forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
  function FileUploadDropzone(
    {
      children,
      render,
      asChild,
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
      "data-slot": dataSlot = "file-upload-dropzone",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFileUploadContext();
    const {
      disabled,
      dragState,
      getDragState,
      readOnly,
      setDragState,
      setFilesFromList,
    } = ctx;
    const isInactive = disabled || readOnly;

    const handleDragEnter = useCallback<DragEventHandler<HTMLDivElement>>(
      (event) => {
        if (isInactive) return;
        if (!hasDraggedFiles(event.dataTransfer)) return;
        event.preventDefault();
        const files = getDraggedFiles(event.dataTransfer);
        setDragState(files.length > 0 ? getDragState(files) : "accept");
      },
      [getDragState, isInactive, setDragState],
    );

    const handleDragOver = useCallback<DragEventHandler<HTMLDivElement>>(
      (event) => {
        if (isInactive) return;
        if (!hasDraggedFiles(event.dataTransfer)) return;
        event.preventDefault();
        const files = getDraggedFiles(event.dataTransfer);
        const nextDragState = files.length > 0 ? getDragState(files) : "accept";
        event.dataTransfer.dropEffect = nextDragState === "accept" ? "copy" : "none";
        setDragState(nextDragState);
      },
      [getDragState, isInactive, setDragState],
    );

    const handleDragLeave = useCallback<DragEventHandler<HTMLDivElement>>(
      (event) => {
        if (isInactive) return;
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setDragState("idle");
      },
      [isInactive, setDragState],
    );

    const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>(
      (event) => {
        if (isInactive) return;
        if (!hasDraggedFiles(event.dataTransfer)) return;
        event.preventDefault();
        setDragState("idle");
        setFilesFromList(event.dataTransfer.files);
      },
      [isInactive, setDragState, setFilesFromList],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-drag": dragState,
      ...(dragState === "accept" && { "data-dragging": "", "data-accepted": "" }),
      ...(dragState === "reject" && { "data-dragging": "", "data-rejected": "" }),
      ...(disabled && { "data-disabled": "" }),
      ...(readOnly && { "data-readonly": "" }),
      onDragEnter: composeEventHandlers(onDragEnter, handleDragEnter),
      onDragOver: composeEventHandlers(onDragOver, handleDragOver),
      onDragLeave: composeEventHandlers(onDragLeave, handleDragLeave),
      onDrop: composeEventHandlers(onDrop, handleDrop),
    };

    if (asChild) {
      return cloneAndMerge(children, behaviorProps);
    }

    return renderElement(render, "div", {
      ...behaviorProps,
      children,
    });
  },
);
