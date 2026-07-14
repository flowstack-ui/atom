export type DomEvidenceAttribute = {
  name: string;
  value: string;
};

export type DomEvidence = {
  aria: DomEvidenceAttribute[];
  attributes: DomEvidenceAttribute[];
  checked: string;
  data: DomEvidenceAttribute[];
  disabled: boolean;
  hidden: boolean;
  id: string;
  role: string;
  tag: string;
  text: string;
  value: string;
};

export const EMPTY_DOM_EVIDENCE_VALUE = "-";

const hiddenNativeAttributes = new Set([
  "checked",
  "class",
  "id",
  "style",
  "value",
]);

const booleanEvidenceAttributes = new Set([
  "checked",
  "data-active",
  "data-checked",
  "data-disabled",
  "disabled",
  "hidden",
  "inert",
  "multiple",
  "readonly",
  "required",
  "selected",
]);

export function isPlaygroundEvidenceAttribute(name: string) {
  return name.startsWith("data-playground-");
}

export function shouldRefreshDomEvidence(attributeName?: string | null) {
  if (!attributeName) return true;
  if (attributeName === "class" || attributeName === "style") return false;
  return !isPlaygroundEvidenceAttribute(attributeName);
}

export function formatDomEvidenceAttribute(attribute: DomEvidenceAttribute) {
  return (
    attribute.value === "" && (
      attribute.name.startsWith("data-") ||
      booleanEvidenceAttributes.has(attribute.name)
    )
  ) || (
    attribute.value === "true" && booleanEvidenceAttributes.has(attribute.name)
  )
    ? attribute.name
    : `${attribute.name}="${attribute.value}"`;
}

export function formatDomEvidenceGroup(attributes: DomEvidenceAttribute[]) {
  if (attributes.length === 0) return EMPTY_DOM_EVIDENCE_VALUE;
  return attributes.map(formatDomEvidenceAttribute).join("\n");
}

export function collectDomEvidence(element: Element | null): DomEvidence {
  if (!element) {
    return {
      aria: [],
      attributes: [],
      checked: EMPTY_DOM_EVIDENCE_VALUE,
      data: [],
      disabled: false,
      hidden: false,
      id: EMPTY_DOM_EVIDENCE_VALUE,
      role: EMPTY_DOM_EVIDENCE_VALUE,
      tag: EMPTY_DOM_EVIDENCE_VALUE,
      text: EMPTY_DOM_EVIDENCE_VALUE,
      value: EMPTY_DOM_EVIDENCE_VALUE,
    };
  }

  const aria: DomEvidenceAttribute[] = [];
  const attributes: DomEvidenceAttribute[] = [];
  const data: DomEvidenceAttribute[] = [];

  Array.from(element.attributes).forEach((attribute) => {
    if (isPlaygroundEvidenceAttribute(attribute.name)) return;

    const evidenceAttribute = {
      name: attribute.name,
      value: attribute.value,
    };

    if (attribute.name.startsWith("aria-")) {
      aria.push(evidenceAttribute);
      return;
    }

    if (attribute.name.startsWith("data-")) {
      data.push(evidenceAttribute);
      return;
    }

    if (!hiddenNativeAttributes.has(attribute.name)) {
      attributes.push(evidenceAttribute);
    }
  });

  const sortAttributes = (left: DomEvidenceAttribute, right: DomEvidenceAttribute) => (
    left.name.localeCompare(right.name)
  );

  aria.sort(sortAttributes);
  attributes.sort(sortAttributes);
  data.sort(sortAttributes);

  return {
    aria,
    attributes,
    checked: getChecked(element),
    data,
    disabled: element.hasAttribute("disabled") ||
      element.getAttribute("aria-disabled") === "true" ||
      element.hasAttribute("data-disabled"),
    hidden: element.hasAttribute("hidden"),
    id: element.id || EMPTY_DOM_EVIDENCE_VALUE,
    role: element.getAttribute("role") ?? EMPTY_DOM_EVIDENCE_VALUE,
    tag: element.tagName.toLowerCase(),
    text: getDirectText(element),
    value: getElementValue(element),
  };
}

function getDirectText(element: Element) {
  const text = Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return EMPTY_DOM_EVIDENCE_VALUE;
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

function getElementValue(element: Element) {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLOptionElement
  ) {
    return element.value || EMPTY_DOM_EVIDENCE_VALUE;
  }

  return element.getAttribute("value") || EMPTY_DOM_EVIDENCE_VALUE;
}

function getChecked(element: Element) {
  if (
    element instanceof HTMLInputElement &&
    (element.type === "checkbox" || element.type === "radio")
  ) {
    return element.checked ? "true" : "false";
  }

  return EMPTY_DOM_EVIDENCE_VALUE;
}
