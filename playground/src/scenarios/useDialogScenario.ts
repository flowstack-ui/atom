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
  triggerDisabled: string;
  contentExists: string;
  contentId: string;
  contentRole: string;
  contentState: string;
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
  const [log, setLog] = useState<DialogLogEntry[]>([
    { id: 1, text: "ready", time: getLogTime() },
  ]);
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
    clearLog: () => setLog([{ id: nextLogId.current++, text: "log cleared", time: getLogTime() }]),
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
    triggerDisabled: trigger?.hasAttribute("disabled") || trigger?.hasAttribute("data-disabled")
      ? "yes"
      : "no",
    contentExists: content ? "yes" : "no",
    contentId,
    contentRole: content?.getAttribute("role") ?? "none",
    contentState: content?.getAttribute("data-state") ?? "none",
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
  triggerDisabled: "no",
  contentExists: "no",
  contentId: "none",
  contentRole: "none",
  contentState: "none",
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
  titleId: "none",
  titleMatches: "no",
  descriptionExists: "no",
  descriptionId: "none",
  descriptionMatches: "no",
};
