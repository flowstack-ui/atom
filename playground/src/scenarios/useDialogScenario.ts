import { useEffect, useRef, useState } from "react";

export type DialogLogEntry = {
  id: number;
  text: string;
  time: string;
};

export type DialogScenarioState = {
  controlled: boolean;
  disabled: boolean;
  keepMounted: boolean;
  closeOnEscape: boolean;
  closeOnBackdropClick: boolean;
  useAriaLabel: boolean;
  open: boolean;
  log: DialogLogEntry[];
  parts: DialogPartsSnapshot;
};

export type DialogPartsSnapshot = {
  triggerExists: string;
  triggerState: string;
  triggerControls: string;
  triggerHasPopup: string;
  triggerExpanded: string;
  triggerDisabled: string;
  contentExists: string;
  contentId: string;
  contentRole: string;
  contentState: string;
  contentPositioned: string;
  contentHidden: string;
  contentAriaModal: string;
  contentAriaLabel: string;
  contentLabelledBy: string;
  contentDescribedBy: string;
  controlsMatch: string;
  overlayExists: string;
  overlayState: string;
  portalParent: string;
  inCanvas: string;
  titleExists: string;
  titleTag: string;
  titleId: string;
  titleMatches: string;
  descriptionExists: string;
  descriptionId: string;
  descriptionMatches: string;
};

export type DialogScenarioActions = {
  setControlled: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
  setKeepMounted: (value: boolean) => void;
  setCloseOnEscape: (value: boolean) => void;
  setCloseOnBackdropClick: (value: boolean) => void;
  setUseAriaLabel: (value: boolean) => void;
  setControlledOpen: (value: boolean) => void;
  testDisabledTriggerKey: (key: "Enter" | " ") => void;
  testFocusEscape: () => void;
  clearLog: () => void;
};

export function useDialogScenario() {
  const nextLogId = useRef(2);
  const focusPathRef = useRef<string[]>([]);
  const loggedFocusLoopsRef = useRef<Record<string, boolean>>({});
  const lastTabDirectionRef = useRef<"forward" | "backward" | null>(null);
  const [revision, setRevision] = useState(0);
  const [controlled, setControlled] = useState(false);
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
  const [useAriaLabel, setUseAriaLabel] = useState(false);
  const [log, setLog] = useState<DialogLogEntry[]>([]);
  const parts = getDialogPartsSnapshot(revision);

  const addLog = (text: string) => {
    setLog((currentLog) => [
      { id: nextLogId.current++, text, time: getLogTime() },
      ...currentLog,
    ].slice(0, 8));
  };

  const setControlledOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    addLog(`${nextOpen ? "opened" : "closed"} by external control`);
  };

  const handleOpenChange = (nextOpen: boolean, reason?: string) => {
    setOpen(nextOpen);
    addLog(reason ? `closed by ${reason}` : "opened from trigger");
  };

  const testDisabledTriggerKey = (key: "Enter" | " ") => {
    const trigger = document.querySelector<HTMLElement>("[data-slot='dialog-trigger']");
    if (!trigger) {
      addLog("disabled trigger probe failed: no trigger");
      return;
    }

    trigger.dispatchEvent(new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key,
    }));

    requestAnimationFrame(() => {
      const content = document.querySelector("[data-slot='dialog-content']");
      const stayedClosed = !content || content.getAttribute("data-state") === "closed";
      addLog(
        stayedClosed
          ? `disabled trigger blocked ${key === " " ? "Space" : "Enter"}`
          : `disabled trigger opened with ${key === " " ? "Space" : "Enter"}`,
      );
    });
  };

  const testFocusEscape = () => {
    const behindButton = document.querySelector<HTMLButtonElement>("[data-dialog-behind]");
    const content = document.querySelector<HTMLElement>("[data-slot='dialog-content']");

    if (!behindButton || !content) {
      addLog("focus escape probe skipped");
      return;
    }

    behindButton.focus();

    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      addLog(content.contains(activeElement) ? "focus stayed inside dialog" : "focus escaped dialog");
    });
  };

  useEffect(() => {
    let frame = 0;
    const updateRevision = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setRevision((currentRevision) => currentRevision + 1);
      });
    };
    const observer = new MutationObserver(updateRevision);

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: [
        "aria-controls",
        "aria-expanded",
        "aria-haspopup",
        "aria-hidden",
        "aria-label",
        "aria-labelledby",
        "data-state",
        "data-slot",
        "hidden",
        "id",
      ],
    });

    updateRevision();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      focusPathRef.current = [];
      loggedFocusLoopsRef.current = {};
      lastTabDirectionRef.current = null;
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        lastTabDirectionRef.current = event.shiftKey ? "backward" : "forward";
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const content = document.querySelector("[data-slot='dialog-content']");
      const target = event.target instanceof HTMLElement ? event.target : null;

      if (!content || !target || !content.contains(target)) {
        return;
      }

      const label = getFocusLabel(target);
      const path = focusPathRef.current;

      if (path[path.length - 1] !== label) {
        path.push(label);
      }

      const direction = lastTabDirectionRef.current;
      if (!direction || loggedFocusLoopsRef.current[direction] || path.length < 4) {
        return;
      }

      const firstIndex = path.findIndex((item, index) => index < path.length - 1 && item === label);
      if (firstIndex === -1) {
        return;
      }

      const loopPath = path.slice(firstIndex);
      loggedFocusLoopsRef.current[direction] = true;
      addLog(`focus looped ${direction}: ${loopPath.join(direction === "backward" ? " <- " : " -> ")}`);
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [open]);

  const state: DialogScenarioState = {
    controlled,
    disabled,
    keepMounted,
    closeOnEscape,
    closeOnBackdropClick,
    useAriaLabel,
    open,
    log,
    parts,
  };

  const actions: DialogScenarioActions = {
    setControlled,
    setDisabled,
    setKeepMounted,
    setCloseOnEscape,
    setCloseOnBackdropClick,
    setUseAriaLabel,
    setControlledOpen,
    testDisabledTriggerKey,
    testFocusEscape,
    clearLog: () => setLog([]),
  };

  return { state, actions, handleOpenChange };
}

function getLogTime() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  }).format(new Date());
}

function getDialogPartsSnapshot(revision: number): DialogPartsSnapshot {
  void revision;

  if (typeof document === "undefined") {
    return emptyDialogPartsSnapshot;
  }

  const trigger = document.querySelector("[data-slot='dialog-trigger']");
  const content = document.querySelector("[data-slot='dialog-content']");
  const overlay = document.querySelector("[data-slot='dialog-overlay']");
  const title = document.querySelector("[data-slot='dialog-title']");
  const description = document.querySelector("[data-slot='dialog-description']");
  const canvas = document.querySelector(".canvas");
  const triggerControls = trigger?.getAttribute("aria-controls") ?? "none";
  const contentId = content?.id || "none";
  const labelledBy = content?.getAttribute("aria-labelledby") ?? "none";
  const describedBy = content?.getAttribute("aria-describedby") ?? "none";
  const titleId = title?.id || "none";
  const descriptionId = description?.id || "none";
  const contentParent = content?.parentElement;

  return {
    triggerExists: trigger ? "yes" : "no",
    triggerState: trigger?.getAttribute("data-state") ?? "none",
    triggerControls,
    triggerHasPopup: trigger?.getAttribute("aria-haspopup") ?? "none",
    triggerExpanded: trigger?.getAttribute("aria-expanded") ?? "none",
    triggerDisabled: trigger?.hasAttribute("disabled") || trigger?.hasAttribute("data-disabled")
      ? "yes"
      : "no",
    contentExists: content ? "yes" : "no",
    contentId,
    contentRole: content?.getAttribute("role") ?? "none",
    contentState: content?.getAttribute("data-state") ?? "none",
    contentPositioned: content?.getAttribute("data-positioned") ?? "none",
    contentHidden: content?.closest("[hidden]") || content?.hasAttribute("hidden") ? "yes" : "no",
    contentAriaModal: content?.getAttribute("aria-modal") ?? "none",
    contentAriaLabel: content?.getAttribute("aria-label") ?? "none",
    contentLabelledBy: labelledBy,
    contentDescribedBy: describedBy,
    controlsMatch: triggerControls !== "none" && triggerControls === contentId ? "yes" : "no",
    overlayExists: overlay ? "yes" : "no",
    overlayState: overlay?.getAttribute("data-state") ?? "none",
    portalParent: contentParent
      ? contentParent === document.body
        ? "body"
        : contentParent.tagName.toLowerCase()
      : "none",
    inCanvas: content && canvas?.contains(content) ? "yes" : "no",
    titleExists: title ? "yes" : "no",
    titleTag: title?.tagName.toLowerCase() ?? "none",
    titleId,
    titleMatches: labelledBy !== "none" && labelledBy === titleId ? "yes" : "no",
    descriptionExists: description ? "yes" : "no",
    descriptionId,
    descriptionMatches: describedBy !== "none" && describedBy === descriptionId ? "yes" : "no",
  };
}

const emptyDialogPartsSnapshot: DialogPartsSnapshot = {
  triggerExists: "no",
  triggerState: "none",
  triggerControls: "none",
  triggerHasPopup: "none",
  triggerExpanded: "none",
  triggerDisabled: "no",
  contentExists: "no",
  contentId: "none",
  contentRole: "none",
  contentState: "none",
  contentPositioned: "none",
  contentHidden: "no",
  contentAriaModal: "none",
  contentAriaLabel: "none",
  contentLabelledBy: "none",
  contentDescribedBy: "none",
  controlsMatch: "no",
  overlayExists: "no",
  overlayState: "none",
  portalParent: "none",
  inCanvas: "no",
  titleExists: "no",
  titleTag: "none",
  titleId: "none",
  titleMatches: "no",
  descriptionExists: "no",
  descriptionId: "none",
  descriptionMatches: "no",
};

function getFocusLabel(element: HTMLElement) {
  if (element.id === "dialog-name") return "name";
  if (element.id === "dialog-mode") return "mode";

  const text = element.textContent?.trim();
  if (text) return text.toLowerCase();

  return element.getAttribute("data-slot") ?? element.tagName.toLowerCase();
}
