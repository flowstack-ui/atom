"use client";

import { createContext, useContext } from "react";
import type { ImageLoadingStatus } from "../../utils/imageLoadingStatus.js";

export interface ImageContextValue { src?: string; status: ImageLoadingStatus; }
export const ImageContext = createContext<ImageContextValue | null>(null);
ImageContext.displayName = "ImageContext";
export function useImageContext() {
  const value = useContext(ImageContext);
  if (!value) throw new Error("Image parts must be used within Image.Root.");
  return value;
}
