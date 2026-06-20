"use client";

import { forwardRef, type ReactNode } from "react";
import { DialogContent, type DialogContentProps } from "../dialog/index.js";

export interface AlertDialogContentProps extends Omit<DialogContentProps, "role" | "children"> {
  /** Alert dialog content. */
  children: ReactNode;
}

export const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent(
    {
      children,
      "data-slot": dataSlot = "alert-dialog-content",
      ...props
    },
    ref,
  ) {
    return (
      <DialogContent
        {...props}
        ref={ref}
        role="alertdialog"
        data-slot={dataSlot}
      >
        {children}
      </DialogContent>
    );
  },
);
