"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { NativeListItemProps } from "../../utils/dom.js";
import { cloneAndMerge, renderElement, type RenderProp } from "../../utils/slot.js";
import {
  FileUploadItemContextProvider,
  type FileUploadItemContextValue,
  useFileUploadContext,
} from "./context.js";

type FileUploadItemNativeProps = NativeListItemProps<"children">;

export interface FileUploadItemProps extends FileUploadItemNativeProps {
  file?: File;
  index?: number;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const FileUploadItem = forwardRef<HTMLLIElement, FileUploadItemProps>(
  function FileUploadItem(
    {
      file,
      index = 0,
      children,
      render,
      asChild,
      "data-slot": dataSlot = "file-upload-item",
      ...restProps
    },
    ref,
  ) {
    const ctx = useFileUploadContext();
    const resolvedFile = file ?? ctx.files[index];
    const resolvedIndex = file ? ctx.files.indexOf(file) : index;

    const itemContextValue = useMemo<FileUploadItemContextValue | null>(
      () => resolvedFile
        ? {
            file: resolvedFile,
            index: resolvedIndex >= 0 ? resolvedIndex : index,
          }
        : null,
      [index, resolvedFile, resolvedIndex],
    );

    if (!resolvedFile || !itemContextValue) return null;

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-index": itemContextValue.index,
      "data-name": resolvedFile.name,
      "data-size": resolvedFile.size,
    };

    const element = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "li", {
          ...behaviorProps,
          children,
        });

    return (
      <FileUploadItemContextProvider value={itemContextValue}>
        {element}
      </FileUploadItemContextProvider>
    );
  },
);
