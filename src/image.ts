"use client";
import { ImageContent, ImageFallback, ImageRoot } from "./primitives/image/index.js";
export { ImageContent, ImageFallback, ImageRoot, ImageContext, useImageContext } from "./primitives/image/index.js";
export type { ImageContentProps, ImageContextValue, ImageFallbackProps, ImageFallbackWhen, ImageRootProps } from "./primitives/image/index.js";
export type { ImageLoadingStatus } from "./utils/imageLoadingStatus.js";
export const Image = { Root: ImageRoot, Content: ImageContent, Fallback: ImageFallback } as const;
