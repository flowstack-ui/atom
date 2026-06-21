import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

export type InspectorRow = {
  label: string;
  value: string;
};

export type ElementInspector = {
  rootRef: RefObject<HTMLDivElement | null>;
  rows: InspectorRow[];
};

const observedAttributes = [
  "aria-controls",
  "aria-describedby",
  "aria-disabled",
  "aria-expanded",
  "aria-hidden",
  "aria-labelledby",
  "aria-modal",
  "data-disabled",
  "data-positioned",
  "data-state",
  "data-slot",
  "disabled",
  "hidden",
  "role",
  "tabindex",
];

function formatElement(element: Element | null): string {
  if (!element) return "None";

  const id = element.id ? `#${element.id}` : "";
  const slot = element.getAttribute("data-slot");
  const slotText = slot ? `[data-slot="${slot}"]` : "";

  return `${element.tagName.toLowerCase()}${id}${slotText}`;
}

function getAttributes(element: Element | null, prefix: string): string {
  if (!element) return "None";

  const attrs = Array.from(element.attributes)
    .filter((attribute) => attribute.name.startsWith(prefix))
    .map((attribute) => `${attribute.name}="${attribute.value}"`);

  return attrs.length > 0 ? attrs.join(" ") : "None";
}

function getBooleanAttribute(element: Element | null, name: string): string {
  if (!element) return "None";
  return element.hasAttribute(name) ? "Yes" : "No";
}

function isInspectable(root: HTMLDivElement | null, element: Element | null): boolean {
  if (!element) return false;
  return Boolean(root?.contains(element) || element.closest("[data-playground-inspect]"));
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

    const updateSelectedElement = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (isInspectable(rootRef.current, target)) {
        setSelectedElement(target);
      }
    };

    document.addEventListener("focusin", updateFocusedElement);
    document.addEventListener("focusout", updateFocusedElement);
    document.addEventListener("pointerdown", updateSelectedElement);
    updateFocusedElement();

    return () => {
      document.removeEventListener("focusin", updateFocusedElement);
      document.removeEventListener("focusout", updateFocusedElement);
      document.removeEventListener("pointerdown", updateSelectedElement);
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

  const rows = useMemo<InspectorRow[]>(() => {
    const target = selectedElement ?? focusedElement;

    return [
      { label: "Focused", value: formatElement(focusedElement) },
      { label: "Selected", value: formatElement(selectedElement) },
      { label: "Tag", value: target ? target.tagName.toLowerCase() : "None" },
      { label: "Role", value: target?.getAttribute("role") ?? "None" },
      { label: "ARIA", value: getAttributes(target, "aria-") },
      { label: "Data", value: getAttributes(target, "data-") },
      { label: "Disabled", value: getBooleanAttribute(target, "disabled") },
      { label: "Hidden", value: getBooleanAttribute(target, "hidden") },
      { label: "Tabindex", value: target?.getAttribute("tabindex") ?? "None" },
    ];
  }, [focusedElement, selectedElement, revision]);

  return { rootRef, rows };
}
