import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  collectDomEvidence,
  formatDomEvidenceGroup,
} from "./domEvidence";
import {
  createDomEvidenceRevisionScheduler,
  hasDomEvidenceMutation,
} from "./domEvidenceRevision";

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
  revision: number;
  rootRef: RefObject<HTMLDivElement | null>;
  selectedDetails: InspectorDetails;
};

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
  const evidence = collectDomEvidence(element);

  return {
    aria: formatDomEvidenceGroup(evidence.aria),
    checked: evidence.checked,
    data: formatDomEvidenceGroup(evidence.data),
    disabled: evidence.disabled,
    hidden: evidence.hidden,
    id: evidence.id,
    native: formatDomEvidenceGroup(evidence.attributes),
    role: evidence.role,
    tag: evidence.tag,
    text: evidence.text,
    value: evidence.value,
  };
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/["\\]/g, "\\$&");
}

function getReplacementSelectors(element: Element): string[] {
  const selectors: string[] = [];
  const id = element.id;
  const inspectId = element.getAttribute("data-playground-inspect");
  const propCheck = element.getAttribute("data-prop-check");
  const slot = element.getAttribute("data-slot");
  const value = element.getAttribute("data-value");

  if (id) selectors.push(`#${cssEscape(id)}`);
  if (inspectId) selectors.push(`[data-playground-inspect="${cssEscape(inspectId)}"]`);
  if (slot && value && propCheck) {
    selectors.push(`[data-slot="${cssEscape(slot)}"][data-value="${cssEscape(value)}"][data-prop-check="${cssEscape(propCheck)}"]`);
  }
  if (slot && value) selectors.push(`[data-slot="${cssEscape(slot)}"][data-value="${cssEscape(value)}"]`);
  if (propCheck) selectors.push(`[data-prop-check="${cssEscape(propCheck)}"]`);
  if (slot) selectors.push(`[data-slot="${cssEscape(slot)}"]`);

  return selectors;
}

function getReplacementScore(
  root: HTMLDivElement | null,
  original: Element,
  candidate: Element,
) {
  let score = root?.contains(candidate) ? 128 : 0;
  const originalEvidence = collectDomEvidence(original);
  const candidateEvidence = collectDomEvidence(candidate);

  if (original.id && candidate.id === original.id) score += 256;
  if (candidate.tagName === original.tagName) score += 16;
  if (
    originalEvidence.text !== "-" &&
    candidateEvidence.text === originalEvidence.text
  ) score += 8;

  ["data-playground-inspect", "data-prop-check", "data-slot", "data-value"].forEach((name) => {
    const value = original.getAttribute(name);
    if (value && candidate.getAttribute(name) === value) score += 32;
  });

  return score;
}

function chooseReplacement(
  root: HTMLDivElement | null,
  original: Element,
  candidates: Element[],
) {
  if (candidates.length === 1) return candidates[0];

  const scoredCandidates = candidates.map((candidate) => ({
    candidate,
    score: getReplacementScore(root, original, candidate),
  }));
  const highestScore = Math.max(...scoredCandidates.map(({ score }) => score));
  const bestCandidates = scoredCandidates.filter(({ score }) => score === highestScore);

  return bestCandidates.length === 1 ? bestCandidates[0].candidate : null;
}

function resolveLiveElement(root: HTMLDivElement | null, element: Element | null): Element | null {
  if (!element) return null;
  if (element.isConnected) return element;

  for (const selector of getReplacementSelectors(element)) {
    const candidates = Array.from(document.querySelectorAll(selector))
      .filter((candidate) => isInspectable(root, candidate));
    const replacement = chooseReplacement(root, element, candidates);
    if (replacement) return replacement;
  }

  return null;
}

export function useElementInspector(scenarioKey: string): ElementInspector {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [focusedElement, setFocusedElement] = useState<Element | null>(null);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const scheduler = createDomEvidenceRevisionScheduler(() => {
      setRevision((currentRevision) => currentRevision + 1);
    });
    const updateFocusedElement = () => {
      const activeElement = document.activeElement;
      setFocusedElement(
        isInspectable(rootRef.current, activeElement) ? activeElement : null,
      );
      scheduler.schedule();
    };

    const updateSelectedElement = (event: PointerEvent | MouseEvent) => {
      const target = getInspectableEventTarget(rootRef.current, event);
      if (target) {
        setSelectedElement(target);
        scheduler.schedule();
      }
    };

    const updateLiveProperties = () => {
      scheduler.schedule();
    };
    const observer = new MutationObserver((records) => {
      if (hasDomEvidenceMutation(records)) scheduler.schedule();
    });
    const portalObserver = new MutationObserver(() => {
      observer.disconnect();
      observeTargets();
      scheduler.schedule();
    });
    const observeOptions: MutationObserverInit = {
      attributes: true,
      childList: true,
      subtree: true,
    };
    const observeTargets = () => {
      if (rootRef.current) {
        observer.observe(rootRef.current, observeOptions);
      }

      document.querySelectorAll("[data-playground-inspect]").forEach((element) => {
        observer.observe(element, observeOptions);
      });
    };

    setSelectedElement(null);
    observeTargets();
    portalObserver.observe(document.body, {
      childList: true,
      subtree: false,
    });
    document.addEventListener("focusin", updateFocusedElement);
    document.addEventListener("focusout", updateFocusedElement);
    document.addEventListener("change", updateLiveProperties, true);
    document.addEventListener("input", updateLiveProperties, true);
    document.addEventListener("pointerdown", updateSelectedElement, true);
    document.addEventListener("mousedown", updateSelectedElement, true);
    updateFocusedElement();
    scheduler.schedule();

    return () => {
      scheduler.cancel();
      observer.disconnect();
      portalObserver.disconnect();
      document.removeEventListener("focusin", updateFocusedElement);
      document.removeEventListener("focusout", updateFocusedElement);
      document.removeEventListener("change", updateLiveProperties, true);
      document.removeEventListener("input", updateLiveProperties, true);
      document.removeEventListener("pointerdown", updateSelectedElement, true);
      document.removeEventListener("mousedown", updateSelectedElement, true);
    };
  }, [scenarioKey]);

  const focusedDetails = useMemo(
    () => getElementDetails(resolveLiveElement(rootRef.current, focusedElement)),
    [focusedElement, revision],
  );
  const selectedDetails = useMemo(
    () => getElementDetails(resolveLiveElement(rootRef.current, selectedElement)),
    [selectedElement, revision],
  );

  return { focusedDetails, revision, rootRef, selectedDetails };
}
