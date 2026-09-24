"use client";

import { forwardRef, useMemo, useEffect, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cloneAndMerge, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { useFileUploadContext, useFileUploadItemContext, type FileUploadContextValue } from "./context.js";
import { fileUploadActionHost } from "./action-host.js";

export function FileUploadContext({ children }: { children: (value: FileUploadContextValue) => ReactNode }) {
  return children(useFileUploadContext());
}

export interface FileUploadClearTriggerProps extends ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
  render?: RenderProp;
}
export const FileUploadClearTrigger = forwardRef<HTMLButtonElement, FileUploadClearTriggerProps>(function FileUploadClearTrigger(
  { children, asChild, render, onClick, ...props }, ref,
) {
  const ctx = useFileUploadContext();
  const host = fileUploadActionHost(children, render, asChild);
  const disabled = ctx.disabled || ctx.readOnly || props.disabled || host.inactive;
  const behavior = { ...props, ref, type: "button", disabled, "data-slot": "file-upload-clear-trigger",
    "aria-label": props["aria-label"] ?? host.label ?? ctx.translations.clear ?? "Clear files",
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) { event.preventDefault(); return; }
      onClick?.(event);
      if (!event.defaultPrevented) host.onClick?.(event);
      if (!event.defaultPrevented) host.onPress?.(event);
      if (!event.defaultPrevented) ctx.clearFiles();
    } };
  return asChild ? cloneAndMerge(host.children, behavior) : renderElement(host.render, "button", { ...behavior, children });
});

export interface FileUploadFileTextProps extends ComponentPropsWithoutRef<"span"> {
  fallback?: ReactNode;
}
export const FileUploadFileText = forwardRef<HTMLSpanElement, FileUploadFileTextProps>(function FileUploadFileText(
  { fallback = "No file selected", children, ...props }, ref,
) {
  const ctx = useFileUploadContext();
  const text = ctx.files.length === 1 ? ctx.files[0]?.name : ctx.files.length
    ? ctx.translations.fileCount?.(ctx.files.length) ?? `${ctx.files.length} files selected` : fallback;
  return <span {...props} ref={ref} data-slot="file-upload-file-text" data-placeholder={!ctx.files.length ? "" : undefined}>{children ?? text}</span>;
});

export const FileUploadLabel = forwardRef<HTMLLabelElement, ComponentPropsWithoutRef<"label">>(function FileUploadLabel(props, ref) {
  const ctx = useFileUploadContext();
  return <label {...props} ref={ref} htmlFor={ctx.controlId} data-slot="file-upload-label" />;
});

export interface FileUploadItemPreviewProps extends ComponentPropsWithoutRef<"div"> { type?: string; fallback?: ReactNode }
export const FileUploadItemPreview = forwardRef<HTMLDivElement, FileUploadItemPreviewProps>(function FileUploadItemPreview(
  { type = ".*", fallback, children, ...props }, ref,
) {
  const { file } = useFileUploadItemContext();
  const matches = type === ".*" || type === "*" || (type.endsWith("/*") ? file.type.startsWith(type.slice(0, -1)) : file.type === type);
  return <div {...props} ref={ref} data-slot="file-upload-item-preview">{matches ? children : fallback}</div>;
});

export interface FileUploadItemPreviewImageProps extends Omit<ComponentPropsWithoutRef<"img">, "src"> {}
export const FileUploadItemPreviewImage = forwardRef<HTMLImageElement, FileUploadItemPreviewImageProps>(function FileUploadItemPreviewImage(
  { alt = "", ...props }, ref,
) {
  const { file } = useFileUploadItemContext();
  const [node, setNode] = useState<HTMLImageElement | null>(null);
  const imageRef = useMemo(() => composeRefs(setNode, ref), [ref]);
  const [source, setSource] = useState<{ file: File; url: string }>();
  useEffect(() => {
    const urlApi = node?.ownerDocument.defaultView?.URL;
    if (!file.type.startsWith("image/") || !urlApi?.createObjectURL) return;
    const url = urlApi.createObjectURL(file);
    setSource({ file, url });
    return () => urlApi.revokeObjectURL(url);
  }, [file, node]);
  return <img {...props} ref={imageRef}
    alt={alt} src={source?.file === file ? source.url : undefined} data-slot="file-upload-item-preview-image" />;
});
