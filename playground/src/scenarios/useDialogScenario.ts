import { useEffect, useRef, useState } from "react";

export type DialogLogEntry = {
  id: number;
  text: string;
};

export type DialogScenarioState = {
  controlled: boolean;
  disabled: boolean;
  keepMounted: boolean;
  closeOnEscape: boolean;
  closeOnBackdropClick: boolean;
  useAriaLabel: boolean;
  open: boolean;
  lastReason: string;
  log: DialogLogEntry[];
  parts: DialogPartsSnapshot;
};

export type DialogPartsSnapshot = {
  triggerState: string;
  triggerControls: string;
  contentExists: string;
  contentId: string;
  contentState: string;
  contentHidden: string;
  contentAriaLabel: string;
  contentLabelledBy: string;
  controlsMatch: string;
  overlayExists: string;
  overlayState: string;
  portalParent: string;
  inCanvas: string;
};

export type DialogScenarioActions = {
  setControlled: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
  setKeepMounted: (value: boolean) => void;
  setCloseOnEscape: (value: boolean) => void;
  setCloseOnBackdropClick: (value: boolean) => void;
  setUseAriaLabel: (value: boolean) => void;
  setControlledOpen: (value: boolean) => void;
  clearLog: () => void;
};

export function useDialogScenario() {
  const nextLogId = useRef(2);
  const [revision, setRevision] = useState(0);
  const [controlled, setControlled] = useState(false);
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
  const [useAriaLabel, setUseAriaLabel] = useState(false);
  const [lastReason, setLastReason] = useState("None");
  const [log, setLog] = useState<DialogLogEntry[]>([
    { id: 1, text: "Ready" },
  ]);
  const parts = getDialogPartsSnapshot(revision);

  const addLog = (text: string) => {
    setLog((currentLog) => [
      { id: nextLogId.current++, text },
      ...currentLog,
    ].slice(0, 8));
  };

  const setControlledOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    setLastReason("external");
    addLog(`${nextOpen ? "Opened" : "Closed"} by external control`);
  };

  const handleOpenChange = (nextOpen: boolean, reason?: string) => {
    setOpen(nextOpen);
    setLastReason(reason ?? "open");
    addLog(reason ? `Closed by ${reason}` : "Opened from trigger");
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

  const state: DialogScenarioState = {
    controlled,
    disabled,
    keepMounted,
    closeOnEscape,
    closeOnBackdropClick,
    useAriaLabel,
    open,
    lastReason,
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
    clearLog: () => setLog([{ id: nextLogId.current++, text: "Log cleared" }]),
  };

  return { state, actions, handleOpenChange };
}

function getDialogPartsSnapshot(revision: number): DialogPartsSnapshot {
  void revision;

  if (typeof document === "undefined") {
    return emptyDialogPartsSnapshot;
  }

  const trigger = document.querySelector("[data-slot='dialog-trigger']");
  const content = document.querySelector("[data-slot='dialog-content']");
  const overlay = document.querySelector("[data-slot='dialog-overlay']");
  const canvas = document.querySelector(".canvas");
  const triggerControls = trigger?.getAttribute("aria-controls") ?? "None";
  const contentId = content?.id || "None";
  const contentParent = content?.parentElement;

  return {
    triggerState: trigger?.getAttribute("data-state") ?? "None",
    triggerControls,
    contentExists: content ? "Yes" : "No",
    contentId,
    contentState: content?.getAttribute("data-state") ?? "None",
    contentHidden: content?.closest("[hidden]") || content?.hasAttribute("hidden") ? "Yes" : "No",
    contentAriaLabel: content?.getAttribute("aria-label") ?? "None",
    contentLabelledBy: content?.getAttribute("aria-labelledby") ?? "None",
    controlsMatch: triggerControls !== "None" && triggerControls === contentId ? "Yes" : "No",
    overlayExists: overlay ? "Yes" : "No",
    overlayState: overlay?.getAttribute("data-state") ?? "None",
    portalParent: contentParent
      ? contentParent === document.body
        ? "body"
        : contentParent.tagName.toLowerCase()
      : "None",
    inCanvas: content && canvas?.contains(content) ? "Yes" : "No",
  };
}

const emptyDialogPartsSnapshot: DialogPartsSnapshot = {
  triggerState: "None",
  triggerControls: "None",
  contentExists: "No",
  contentId: "None",
  contentState: "None",
  contentHidden: "No",
  contentAriaLabel: "None",
  contentLabelledBy: "None",
  controlsMatch: "No",
  overlayExists: "No",
  overlayState: "None",
  portalParent: "None",
  inCanvas: "No",
};
