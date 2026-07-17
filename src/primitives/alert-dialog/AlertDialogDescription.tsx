"use client";

import { forwardRef } from "react";
import { ModalDescription, type ModalDescriptionProps } from "../modal/index.js";
import { markModalPart } from "../modal/parts.js";

export interface AlertDialogDescriptionProps extends ModalDescriptionProps {}

export const AlertDialogDescription = forwardRef<
  HTMLParagraphElement,
  AlertDialogDescriptionProps
>(
  function AlertDialogDescription(
    {
      "data-slot": dataSlot = "alert-dialog-description",
      ...props
    },
    ref,
  ) {
    return (
      <ModalDescription
        {...props}
        ref={ref}
        data-slot={dataSlot}
      />
    );
  },
);

markModalPart(AlertDialogDescription, "description");
