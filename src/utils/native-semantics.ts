import { isValidElement, type ReactElement, type ReactNode } from "react";
import type { RenderProp } from "./slot.js";

const nativeButtonInputTypes = new Set(["button", "submit", "reset", "checkbox", "radio"]);

export function elementHasNativeButtonSemantics(
  element: ReactElement<Record<string, unknown>>,
): boolean {
  if (element.type === "button" || element.type === "summary") return true;

  if (element.type === "input") {
    const inputType =
      typeof element.props.type === "string" ? element.props.type.toLowerCase() : "text";
    return nativeButtonInputTypes.has(inputType);
  }

  return false;
}

export function renderHasNativeButtonSemantics(render: RenderProp | undefined): boolean {
  if (render === "button" || render === "summary") return true;

  if (isValidElement(render)) {
    return elementHasNativeButtonSemantics(render as ReactElement<Record<string, unknown>>);
  }

  return false;
}

export function childHasNativeButtonSemantics(children: ReactNode): boolean {
  if (!isValidElement(children)) return false;
  return elementHasNativeButtonSemantics(children as ReactElement<Record<string, unknown>>);
}

export function renderIsNativeButton(render: RenderProp | undefined): boolean {
  if (render === "button") return true;

  if (isValidElement(render)) {
    const element = render as ReactElement<Record<string, unknown>>;
    return element.type === "button";
  }

  return false;
}

export function childIsNativeButton(children: ReactNode): boolean {
  if (!isValidElement(children)) return false;

  const element = children as ReactElement<Record<string, unknown>>;
  return element.type === "button";
}

export function hasNativeButtonKeyboardActivation(element: HTMLElement, key: string): boolean {
  const tagName = element.tagName.toLowerCase();

  if (tagName === "button") return true;

  if (tagName === "input") {
    const inputType = element.getAttribute("type")?.toLowerCase() ?? "text";
    return nativeButtonInputTypes.has(inputType);
  }

  if (tagName === "summary") return true;

  if (tagName === "a" && key === "Enter" && element.hasAttribute("href")) {
    return true;
  }

  return false;
}
