"use client";

import { forwardRef } from "react";
import { DialogOverlay, type DialogOverlayProps } from "../dialog/index.js";

export interface AlertDialogOverlayProps extends DialogOverlayProps {}

export const AlertDialogOverlay = forwardRef<HTMLDivElement, AlertDialogOverlayProps>(
  function AlertDialogOverlay(
    {
      "data-slot": dataSlot = "alert-dialog-overlay",
      ...props
    },
    ref,
  ) {
    return (
      <DialogOverlay
        {...props}
        ref={ref}
        data-slot={dataSlot}
      />
    );
  },
);
