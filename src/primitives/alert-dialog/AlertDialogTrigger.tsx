"use client";

import { forwardRef } from "react";
import { ModalTrigger, type ModalTriggerProps } from "../modal/index.js";

export interface AlertDialogTriggerProps extends ModalTriggerProps {}

export const AlertDialogTrigger = forwardRef<HTMLElement, AlertDialogTriggerProps>(
  function AlertDialogTrigger(
    {
      "data-slot": dataSlot = "alert-dialog-trigger",
      ...props
    },
    ref,
  ) {
    return (
      <ModalTrigger
        {...props}
        ref={ref}
        data-slot={dataSlot}
      />
    );
  },
);
