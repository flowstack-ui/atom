"use client";

import { createContext, useContext } from "react";
import type { ImageLoadingStatus } from "./useImageLoadingStatus.js";

export interface AvatarContextValue {
  /** Current image loading status. */
  status: ImageLoadingStatus;
}

export const AvatarContext = createContext<AvatarContextValue | null>(null);
AvatarContext.displayName = "AvatarContext";

export function useAvatarContext(): AvatarContextValue {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error("Avatar compound components must be used within <AvatarRoot>");
  }
  return context;
}
