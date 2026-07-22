import type { FormEvent } from "react";

export type ValidationBehavior = "inline" | "native";

export const VALIDATION_OWNER_ATTRIBUTE = "data-atom-validation-owner";
export const VALIDATION_BEHAVIOR_ATTRIBUTE = "data-atom-validation-behavior";
export const VALIDATION_SCOPE_ATTRIBUTE = "data-atom-validation-scope";

export type NativeValidityElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export function isNativeValidityElement(
  target: EventTarget | null,
): target is NativeValidityElement {
  if (!target || typeof target !== "object") return false;
  const candidate = target as Partial<NativeValidityElement> & { tagName?: string };
  return (
    (candidate.tagName === "INPUT" ||
      candidate.tagName === "SELECT" ||
      candidate.tagName === "TEXTAREA") &&
    candidate.validity !== undefined
  );
}

export function getValidationBehavior(
  target: Element,
  fallback: ValidationBehavior | undefined,
): ValidationBehavior {
  const explicit = target.getAttribute(VALIDATION_BEHAVIOR_ATTRIBUTE);
  if (explicit === "inline" || explicit === "native") return explicit;

  const scope = target.closest(`[${VALIDATION_SCOPE_ATTRIBUTE}]`);
  const inherited = scope?.getAttribute(VALIDATION_BEHAVIOR_ATTRIBUTE);
  return inherited === "inline" || inherited === "native"
    ? inherited
    : fallback ?? "native";
}

const pendingFocusScopes = new WeakSet<Document | HTMLFormElement>();

export function scheduleFirstInvalidFocus(
  validityOwner: NativeValidityElement,
  visibleOwner: HTMLElement,
): void {
  const scope = validityOwner.form ?? validityOwner.ownerDocument;
  if (pendingFocusScopes.has(scope)) return;

  pendingFocusScopes.add(scope);
  queueMicrotask(() => {
    if (visibleOwner.isConnected && !visibleOwner.hasAttribute("disabled")) {
      visibleOwner.focus();
    }

    setTimeout(() => pendingFocusScopes.delete(scope), 0);
  });
}

export function runValidationCapture(
  event: FormEvent<HTMLElement>,
  fallback: ValidationBehavior | undefined,
  onInvalid: (target: NativeValidityElement) => void,
): void {
  const target = event.target;
  if (!isNativeValidityElement(target)) return;

  // Atom validity owners handle their own state and explicit behavior override.
  if (target.hasAttribute(VALIDATION_OWNER_ATTRIBUTE)) return;

  onInvalid(target);
  if (getValidationBehavior(target, fallback) === "inline") {
    event.preventDefault();
    scheduleFirstInvalidFocus(target, target);
  }
}
