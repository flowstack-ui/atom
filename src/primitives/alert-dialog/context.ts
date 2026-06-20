"use client";

import {
  useModalContext,
  type ModalContextValue,
} from "../modal/index.js";

export type AlertDialogContextValue = ModalContextValue;

export function useAlertDialogContext(): AlertDialogContextValue {
  try {
    return useModalContext();
  } catch {
    throw new Error(
      "AlertDialog compound components must be used within <AlertDialogRoot>",
    );
  }
}
