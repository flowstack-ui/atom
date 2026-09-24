"use client";
import { forwardRef } from "react";
import { DialogPositioner, type DialogPositionerProps } from "../dialog/DialogPositioner.js";
export type DrawerPositionerProps = DialogPositionerProps;
export const DrawerPositioner = forwardRef<HTMLDivElement, DrawerPositionerProps>(
  function DrawerPositioner({ "data-slot": slot = "drawer-positioner", ...props }, ref) {
    return <DialogPositioner {...props} data-slot={slot} ref={ref} />;
  },
);
