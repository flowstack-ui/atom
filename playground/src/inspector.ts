import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

export type InspectorDetails = {
  aria: string;
  checked: string;
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
  "aria-current",
  "aria-describedby",
  "aria-disabled",
  "aria-expanded",
  "aria-haspopup",
  "aria-hidden",
  "aria-labelledby",
  "aria-modal",
  "aria-required",
  "aria-selected",
  "alt",
  "checked",
  "data-checked",
  "data-active",
  "data-autoresize",
  "data-disabled",
  "data-filled",
  "data-positioned",
  "data-pressed",
  "data-prop-check",
  "data-value",
  "data-state",
  "data-slot",
  "dir",
  "disabled",
  "hidden",
  "href",
  "inert",
  "maxlength",
  "name",
  "placeholder",
  "required",
  "readonly",
  "rel",
  "role",
  "rows",
  "selected",
  "src",
  "tabindex",
  "target",
  "title",
  "type",
  "value",
];

const EMPTY_VALUE = "-";
const hiddenDataAttributes = new Set([
  "data-playground-inspect",
]);
const hiddenNativeAttributes = new Set([
  "checked",
  "class",
  "id",
  "style",
  "value",
]);
const booleanNativeAttributes = new Set([
  "checked",
  "disabled",
  "hidden",
  "inert",
  "multiple",
  "readonly",
  "required",
  "selected",
]);

function formatAttribute(attribute: Attr): string {
  return attribute.value === "" && (attribute.name.startsWith("data-") || booleanNativeAttributes.has(attribute.name))
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
      !hiddenNativeAttributes.has(attribute.name)
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

function getChecked(element: Element | null): string {
  if (
    element instanceof HTMLInputElement &&
    (element.type === "checkbox" || element.type === "radio")
  ) {
    return element.checked ? "true" : "false";
  }

  return EMPTY_VALUE;
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
    checked: getChecked(element),
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

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/["\\]/g, "\\$&");
}

function getReplacementSelector(element: Element): string | null {
  const inspectId = element.getAttribute("data-playground-inspect");
  if (inspectId) return `[data-playground-inspect="${cssEscape(inspectId)}"]`;

  const propCheck = element.getAttribute("data-prop-check");
  if (propCheck) return `[data-prop-check="${cssEscape(propCheck)}"]`;

  const slot = element.getAttribute("data-slot");
  const value = element.getAttribute("data-value");
  if (slot && value) return `[data-slot="${cssEscape(slot)}"][data-value="${cssEscape(value)}"]`;
  if (slot) return `[data-slot="${cssEscape(slot)}"]`;

  const id = element.id;
  if (id) return `#${cssEscape(id)}`;

  return null;
}

function resolveLiveElement(root: HTMLDivElement | null, element: Element | null): Element | null {
  if (!element) return null;
  if (element.isConnected) return element;

  const selector = getReplacementSelector(element);
  if (!selector) return null;

  const replacement = document.querySelector(selector);
  return isInspectable(root, replacement) ? replacement : null;
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
        requestAnimationFrame(() => {
          setSelectedElement(target);
          setRevision((currentRevision) => currentRevision + 1);
        });
      }
    };

    const updateLiveProperties = () => {
      requestAnimationFrame(() => {
        setRevision((currentRevision) => currentRevision + 1);
      });
    };

    document.addEventListener("focusin", updateFocusedElement);
    document.addEventListener("focusout", updateFocusedElement);
    document.addEventListener("change", updateLiveProperties, true);
    document.addEventListener("input", updateLiveProperties, true);
    document.addEventListener("pointerdown", updateSelectedElement, true);
    document.addEventListener("mousedown", updateSelectedElement, true);
    updateFocusedElement();

    return () => {
      document.removeEventListener("focusin", updateFocusedElement);
      document.removeEventListener("focusout", updateFocusedElement);
      document.removeEventListener("change", updateLiveProperties, true);
      document.removeEventListener("input", updateLiveProperties, true);
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
    () => getElementDetails(resolveLiveElement(rootRef.current, focusedElement)),
    [focusedElement, revision],
  );
  const selectedDetails = useMemo(
    () => getElementDetails(resolveLiveElement(rootRef.current, selectedElement)),
    [selectedElement, revision],
  );

  return { focusedDetails, rootRef, selectedDetails };
}
