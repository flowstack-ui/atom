import type { PopoverInteractionType } from "./context.js";

export function getPopoverPointerInteractionType(
  pointerType: string,
): Exclude<PopoverInteractionType, "keyboard" | "programmatic"> {
  if (pointerType === "touch" || pointerType === "pen") return pointerType;
  return "mouse";
}

export function isPopoverActivationKey(key: string): boolean {
  return key === "Enter" || key === " ";
}
