"use client";

import { forwardRef } from "react";
import {
  ModalDescription,
  type ModalDescriptionProps,
} from "../modal/index.js";

export interface DialogDescriptionProps extends ModalDescriptionProps {}

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(
  function DialogDescription(
    {
      "data-slot": dataSlot = "dialog-description",
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
