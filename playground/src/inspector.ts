import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

export type InspectorDetails = {
  aria: string;
  data: string;
  disabled: boolean;
  hidden: boolean;
  id: string;
  native: string;
  role: string;
  tag: string;
  text: string;
  value: string;
};

export type ElementInspector = {
  focusedDetails: InspectorDetails;
  rootRef: RefObject<HTMLDivElement | null>;
  selectedDetails: InspectorDetails;
};

const observedAttributes = [
  "aria-checked",
  "aria-controls",
  "aria-describedby",
  "aria-disabled",
  "aria-expanded",
  "aria-haspopup",
  "aria-hidden",
  "aria-labelledby",
  "aria-modal",
  "checked",
  "data-checked",
  "data-disabled",
  "data-positioned",
  "data-state",
  "data-slot",
  "disabled",
  "hidden",
  "href",
  "name",
  "placeholder",
  "readonly",
  "role",
  "selected",
  "tabindex",
  "title",
  "type",
  "value",
];

const EMPTY_VALUE = "-";
const hiddenDataAttributes = new Set([
  "data-playground-inspect",
]);

function formatAttribute(attribute: Attr): string {
  return attribute.value === ""
    ? attribute.name
    : `${attribute.name}="${attribute.value}"`;
}

function getAttributes(element: Element | null, prefix: string): string {
  if (!element) return EMPTY_VALUE;

  const attrs = Array.from(element.attributes)
    .filter((attribute) => (
      attribute.name.startsWith(prefix) &&
      !hiddenDataAttributes.has(attribute.name)
    ))
    .map(formatAttribute);

  return attrs.length > 0 ? attrs.join("\n") : EMPTY_VALUE;
}

function getNativeAttributes(element: Element | null): string {
  if (!element) return EMPTY_VALUE;

  const attrs = Array.from(element.attributes)
    .filter((attribute) => (
      !attribute.name.startsWith("aria-") &&
      !attribute.name.startsWith("data-") &&
      attribute.name !== "class" &&
      attribute.name !== "id" &&
      attribute.name !== "style"
    ))
    .map(formatAttribute);

  return attrs.length > 0 ? attrs.join("\n") : EMPTY_VALUE;
}

function getDisabledState(element: Element | null): boolean {
  if (!element) return false;
  return element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true" ||
    element.hasAttribute("data-disabled");
}

function getText(element: Element | null): string {
  const text = Array.from(element?.childNodes ?? [])
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return EMPTY_VALUE;
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

function getValue(element: Element | null): string {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLOptionElement
  ) {
    return element.value || EMPTY_VALUE;
  }

  return element?.getAttribute("value") || EMPTY_VALUE;
}

function isInspectable(root: HTMLDivElement | null, element: Element | null): boolean {
  if (!element) return false;
  return Boolean(root?.contains(element) || element.closest("[data-playground-inspect]"));
}

function getInspectableEventTarget(
  root: HTMLDivElement | null,
  event: PointerEvent | MouseEvent,
): Element | null {
  const target = event.target instanceof Element ? event.target : null;
  if (isInspectable(root, target)) return target;

  const pointTarget = document.elementFromPoint(event.clientX, event.clientY);
  return isInspectable(root, pointTarget) ? pointTarget : null;
}

function getElementDetails(element: Element | null): InspectorDetails {
  return {
    aria: getAttributes(element, "aria-"),
    data: getAttributes(element, "data-"),
    disabled: getDisabledState(element),
    hidden: Boolean(element?.hasAttribute("hidden")),
    id: element?.id || EMPTY_VALUE,
    native: getNativeAttributes(element),
    role: element?.getAttribute("role") ?? EMPTY_VALUE,
    tag: element ? element.tagName.toLowerCase() : EMPTY_VALUE,
    text: getText(element),
    value: getValue(element),
  };
}

export function useElementInspector(): ElementInspector {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [focusedElement, setFocusedElement] = useState<Element | null>(null);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const updateFocusedElement = () => {
      const activeElement = document.activeElement;
      setFocusedElement(
        isInspectable(rootRef.current, activeElement) ? activeElement : null,
      );
    };

    const updateSelectedElement = (event: PointerEvent | MouseEvent) => {
      const target = getInspectableEventTarget(rootRef.current, event);
      if (target) {
        setSelectedElement(target);
      }
    };

    document.addEventListener("focusin", updateFocusedElement);
    document.addEventListener("focusout", updateFocusedElement);
    document.addEventListener("pointerdown", updateSelectedElement, true);
    document.addEventListener("mousedown", updateSelectedElement, true);
    updateFocusedElement();

    return () => {
      document.removeEventListener("focusin", updateFocusedElement);
      document.removeEventListener("focusout", updateFocusedElement);
      document.removeEventListener("pointerdown", updateSelectedElement, true);
      document.removeEventListener("mousedown", updateSelectedElement, true);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const scheduleRevision = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setRevision((currentRevision) => currentRevision + 1);
      });
    };
    const observer = new MutationObserver(() => {
      scheduleRevision();
    });
    const portalObserver = new MutationObserver(() => {
      observer.disconnect();
      observeTargets();
      scheduleRevision();
    });
    const observeOptions: MutationObserverInit = {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: observedAttributes,
    };
    const observeTargets = () => {
      if (rootRef.current) {
        observer.observe(rootRef.current, observeOptions);
      }

      document.querySelectorAll("[data-playground-inspect]").forEach((element) => {
        observer.observe(element, observeOptions);
      });
    };

    observeTargets();
    portalObserver.observe(document.body, {
      childList: true,
      subtree: false,
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      portalObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const syncInspector = () => {
      const activeElement = document.activeElement;
      setFocusedElement(
        isInspectable(rootRef.current, activeElement) ? activeElement : null,
      );
      setRevision((currentRevision) => currentRevision + 1);
    };

    const frame = requestAnimationFrame(syncInspector);

    return () => cancelAnimationFrame(frame);
  }, []);

  const focusedDetails = useMemo(
    () => getElementDetails(focusedElement),
    [focusedElement, revision],
  );
  const selectedDetails = useMemo(
    () => getElementDetails(selectedElement),
    [selectedElement, revision],
  );

  return { focusedDetails, rootRef, selectedDetails };
}
