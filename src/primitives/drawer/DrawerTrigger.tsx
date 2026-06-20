"use client";

import { forwardRef } from "react";
import { ModalTrigger, type ModalTriggerProps } from "../modal/index.js";

export interface DrawerTriggerProps extends ModalTriggerProps {}

export const DrawerTrigger = forwardRef<HTMLElement, DrawerTriggerProps>(
  function DrawerTrigger(
    {
      "data-slot": dataSlot = "drawer-trigger",
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
