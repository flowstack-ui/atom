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
      readOnly,
      setDragState,
      setFilesFromList,
    } = ctx;
    const isInactive = disabled || readOnly;

    const handleDragEnter = useCallback<DragEventHandler<HTMLDivElement>>(
      (event) => {
        if (isInactive) return;
        event.preventDefault();
        setDragState("accept");
      },
      [isInactive, setDragState],
    );

    const handleDragOver = useCallback<DragEventHandler<HTMLDivElement>>(
      (event) => {
        if (isInactive) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setDragState("accept");
      },
      [isInactive, setDragState],
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
