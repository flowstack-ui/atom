import type { ModalInteractionType } from "./context.js";

export function getModalPointerInteractionType(
  pointerType: string,
): Exclude<ModalInteractionType, "keyboard" | "programmatic"> {
  if (pointerType === "touch" || pointerType === "pen") return pointerType;
  return "mouse";
}

export function isModalActivationKey(key: string): boolean {
  return key === "Enter" || key === " ";
}
