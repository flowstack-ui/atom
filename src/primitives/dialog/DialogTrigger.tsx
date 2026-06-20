"use client";

import { forwardRef } from "react";
import { ModalTrigger, type ModalTriggerProps } from "../modal/index.js";

export interface DialogTriggerProps extends ModalTriggerProps {}

export const DialogTrigger = forwardRef<HTMLElement, DialogTriggerProps>(
  function DialogTrigger(
    {
      "data-slot": dataSlot = "dialog-trigger",
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
