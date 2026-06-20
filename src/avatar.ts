"use client";

import {
  AvatarFallback,
  AvatarGroupRoot,
  AvatarImage,
  AvatarRoot,
} from "./primitives/avatar/index.js";

export {
  AvatarContext,
  AvatarFallback,
  AvatarGroupRoot,
  AvatarImage,
  AvatarRoot,
  useAvatarContext,
  useImageLoadingStatus,
} from "./primitives/avatar/index.js";
export type {
  AvatarContextValue,
  AvatarFallbackProps,
  AvatarGroupRootProps,
  AvatarImageProps,
  AvatarRootProps,
  ImageLoadingStatus,
} from "./primitives/avatar/index.js";

export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
  Group: AvatarGroupRoot,
} as const;
