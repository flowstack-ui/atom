"use client";
import { forwardRef } from "react";
import { ButtonRoot, type ButtonRootProps } from "../button/index.js";
import { useDownload, type UseDownloadProps } from "./useDownload.js";
export interface DownloadTriggerRootProps extends Omit<ButtonRootProps, "href" | "target" | "rel" | "type" | "asChild" | "onError">, UseDownloadProps {}
export const DownloadTriggerRoot = forwardRef<HTMLElement, DownloadTriggerRootProps>(function DownloadTriggerRoot(
 { data,fileName,mimeType,onDownloadStart,onDownloadInitiated,onDownloadError,onClick,onPress,disabled,loading,"data-slot":slot="download-trigger",...props },ref
) {
 const download=useDownload({data,fileName,mimeType,onDownloadStart,onDownloadInitiated,onDownloadError,disabled,loading});
 return <ButtonRoot {...props} ref={ref} type="button" disabled={disabled} loading={download.loading} data-slot={slot} data-state={download.state} onClick={event=>{
 onClick?.(event); if(!event.defaultPrevented) onPress?.(event); if(!event.defaultPrevented) download.download(event.currentTarget.ownerDocument);
 }} />;
});
DownloadTriggerRoot.displayName="DownloadTrigger.Root";
