import { useCallback, useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";

export type DialogLogEntry = {
  id: number;
  text: string;
  time: string;
};

export type DialogCompositionMode = "default" | "asChild" | "render";
export type DialogContentRole = "dialog" | "alertdialog";
export type DialogHeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type DialogRefPart =
  | "trigger"
  | "overlay"
  | "content"
  | "title"
  | "description"
  | "saveClose";
export type DialogRefSnapshot = Record<DialogRefPart, string>;

export type DialogScenarioState = {
  controlled: boolean;
  disabled: boolean;
  keepMounted: boolean;
  closeOnEscape: boolean;
  closeOnBackdropClick: boolean;
  useAriaLabel: boolean;
  contentRole: DialogContentRole;
  noFocusableContent: boolean;
  titleHeadingLevel: DialogHeadingLevel;
  triggerComposition: DialogCompositionMode;
  closeComposition: DialogCompositionMode;
  blockTriggerEvent: boolean;
  blockSaveClose: boolean;
  blockBackdropClose: boolean;
  overrideSlots: boolean;
  open: boolean;
  log: DialogLogEntry[];
  refs: DialogRefSnapshot;
  parts: DialogPartsSnapshot;
};

export type DialogPartsSnapshot = {
  triggerExists: string;
  triggerSlot: string;
  triggerClass: string;
  triggerProps: string;
  triggerTag: string;
  triggerRole: string;
  triggerTabIndex: string;
  triggerState: string;
  triggerControls: string;
  triggerHasPopup: string;
  triggerExpanded: string;
  triggerDisabled: string;
  cancelCloseExists: string;
  cancelCloseSlot: string;
  cancelCloseTag: string;
  cancelCloseRole: string;
  cancelCloseTabIndex: string;
  saveCloseExists: string;
  saveCloseSlot: string;
  saveCloseProps: string;
  saveCloseTag: string;
  saveCloseRole: string;
  saveCloseTabIndex: string;
  contentExists: string;
  contentSlot: string;
  contentProps: string;
  contentId: string;
  contentRole: string;
  contentFocused: string;
  contentState: string;
  contentPositioned: string;
  contentHidden: string;
  contentAriaModal: string;
  contentAriaLabel: string;
  contentLabelledBy: string;
  contentDescribedBy: string;
  bodyScrollLock: string;
  controlsMatch: string;
  overlayExists: string;
  overlaySlot: string;
  overlayProps: string;
  overlayState: string;
  portalParent: string;
  inCanvas: string;
  titleExists: string;
  titleSlot: string;
  titleProps: string;
  titleTag: string;
  titleId: string;
  titleMatches: string;
  descriptionExists: string;
  descriptionSlot: string;
  descriptionProps: string;
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
  setContentRole: (value: DialogContentRole) => void;
  setNoFocusableContent: (value: boolean) => void;
  setTitleHeadingLevel: (value: DialogHeadingLevel) => void;
  setTriggerComposition: (value: DialogCompositionMode) => void;
  setCloseComposition: (value: DialogCompositionMode) => void;
  setBlockTriggerEvent: (value: boolean) => void;
  setBlockSaveClose: (value: boolean) => void;
  setBlockBackdropClose: (value: boolean) => void;
  setOverrideSlots: (value: boolean) => void;
  setControlledOpen: (value: boolean) => void;
  markCloseSource: (source: "cancel" | "save") => void;
  handleTriggerClick: (event: ReactMouseEvent<HTMLElement>) => void;
  handleTriggerKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  handleSaveCloseClick: (event: ReactMouseEvent<HTMLElement>) => void;
  handleOverlayClick: (event: ReactMouseEvent<HTMLElement>) => void;
  markPartRef: (part: DialogRefPart, element: HTMLElement | null) => void;
  testDisabledTriggerKey: (key: "Enter" | " ") => void;
  testFocusEscape: () => void;
  clearLog: () => void;
};

export function useDialogScenario() {
  const nextLogId = useRef(2);
  const closeSource = useRef<"cancel" | "save" | null>(null);
  const [revision, setRevision] = useState(0);
  const [controlled, setControlled] = useState(false);
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
  const [useAriaLabel, setUseAriaLabel] = useState(false);
  const [contentRole, setContentRole] = useState<DialogContentRole>("dialog");
  const [noFocusableContent, setNoFocusableContent] = useState(false);
  const [titleHeadingLevel, setTitleHeadingLevel] =
    useState<DialogHeadingLevel>("h2");
  const [triggerComposition, setTriggerComposition] =
    useState<DialogCompositionMode>("default");
  const [closeComposition, setCloseComposition] =
    useState<DialogCompositionMode>("default");
  const [blockTriggerEvent, setBlockTriggerEvent] = useState(false);
  const [blockSaveClose, setBlockSaveClose] = useState(false);
  const [blockBackdropClose, setBlockBackdropClose] = useState(false);
  const [overrideSlots, setOverrideSlots] = useState(false);
  const [log, setLog] = useState<DialogLogEntry[]>([]);
  const [refs, setRefs] = useState<DialogRefSnapshot>(emptyDialogRefSnapshot);
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

  const handleTriggerClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (blockTriggerEvent) {
      event.preventDefault();
      addLog("trigger user onClick blocked open");
      return;
    }

    addLog("trigger user onClick");
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const key = event.key === " " ? "Space" : event.key;
    if (blockTriggerEvent) {
      event.preventDefault();
      addLog(`trigger user onKeyDown blocked ${key}`);
      return;
    }

    addLog(`trigger user onKeyDown ${key}`);
  };

  const handleSaveCloseClick = (event: ReactMouseEvent<HTMLElement>) => {
    closeSource.current = "save";

    if (blockSaveClose) {
      event.preventDefault();
      addLog("save user onClick blocked close");
      return;
    }

    addLog("save user onClick");
  };

  const handleOverlayClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (blockBackdropClose) {
      event.preventDefault();
      addLog("overlay user onClick blocked backdrop close");
      return;
    }

    addLog("overlay user onClick");
  };

  const markPartRef = useCallback((part: DialogRefPart, element: HTMLElement | null) => {
    if (!element) return;

    const nextValue = element.tagName.toLowerCase();

    setRefs((currentRefs) => {
      if (currentRefs[part] === nextValue) return currentRefs;

      return {
        ...currentRefs,
        [part]: nextValue,
      };
    });
  }, []);

  const handleOpenChange = (nextOpen: boolean, reason?: string) => {
    setOpen(nextOpen);
    if (!reason) {
      addLog(triggerComposition === "default"
        ? "opened from trigger"
        : `opened from ${triggerComposition} trigger`);
      return;
    }

    if (reason === "closeClick") {
      const source = closeSource.current;
      closeSource.current = null;
      const composition = source === "save" ? closeComposition : "default";
      addLog(source
        ? `closed by ${reason} (${source} ${composition} close)`
        : `closed by ${reason}`);
      return;
    }

    addLog(`closed by ${reason}`);
  };

  const testDisabledTriggerKey = (key: "Enter" | " ") => {
    const trigger = document.querySelector<HTMLElement>("[data-dialog-trigger]");
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
      const content = document.querySelector("[data-dialog-content]");
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
    const content = document.querySelector<HTMLElement>("[data-dialog-content]");

    if (!behindButton || !content) {
      addLog("focus escape probe skipped");
      return;
    }

    behindButton.focus();

    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      addLog(`focus stayed inside dialog: ${content.contains(activeElement) ? "yes" : "no"}`);
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
        "data-prop-check",
        "hidden",
        "id",
        "name",
        "style",
        "title",
      ],
    });

    updateRevision();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const content = document.querySelector("[data-dialog-content]");
      const activeElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

      if (!content || !activeElement || !content.contains(activeElement)) {
        return;
      }

      const focusableElements = Array.from(
        content.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (focusableElements.length === 0) {
        return;
      }

      const currentIndex = focusableElements.indexOf(activeElement);
      const direction = event.shiftKey ? "backward" : "forward";
      const currentLabel = getFocusLabel(activeElement);
      const looped = direction === "backward"
        ? currentIndex <= 0
        : currentIndex >= focusableElements.length - 1;
      if (!looped) return;

      requestAnimationFrame(() => {
        const actualElement = document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
        const actualLabel = actualElement && content.contains(actualElement)
          ? getFocusLabel(actualElement)
          : "outside";

        addLog(`focus looped ${direction}: ${currentLabel}${direction === "backward" ? " <- " : " -> "}${actualLabel}`);
      });
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open]);

  const state: DialogScenarioState = {
    controlled,
    disabled,
    keepMounted,
    closeOnEscape,
    closeOnBackdropClick,
    useAriaLabel,
    contentRole,
    noFocusableContent,
    titleHeadingLevel,
    triggerComposition,
    closeComposition,
    blockTriggerEvent,
    blockSaveClose,
    blockBackdropClose,
    overrideSlots,
    open,
    log,
    refs,
    parts,
  };

  const actions: DialogScenarioActions = {
    setControlled,
    setDisabled,
    setKeepMounted,
    setCloseOnEscape,
    setCloseOnBackdropClick,
    setUseAriaLabel,
    setContentRole,
    setNoFocusableContent,
    setTitleHeadingLevel,
    setTriggerComposition,
    setCloseComposition,
    setBlockTriggerEvent,
    setBlockSaveClose,
    setBlockBackdropClose,
    setOverrideSlots,
    setControlledOpen,
    markCloseSource: (source) => {
      closeSource.current = source;
    },
    handleTriggerClick,
    handleTriggerKeyDown,
    handleSaveCloseClick,
    handleOverlayClick,
    markPartRef,
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

  const trigger = document.querySelector("[data-dialog-trigger]");
  const cancelClose = document.querySelector("[data-dialog-cancel-close]");
  const saveClose = document.querySelector("[data-dialog-save-close]");
  const content = document.querySelector("[data-dialog-content]");
  const overlay = document.querySelector("[data-dialog-overlay]");
  const title = document.querySelector("[data-dialog-title]");
  const description = document.querySelector("[data-dialog-description]");
  const canvas = document.querySelector(".canvas");
  const triggerControls = trigger?.getAttribute("aria-controls") ?? "none";
  const contentId = content?.id || "none";
  const activeElement = document.activeElement;
  const labelledBy = content?.getAttribute("aria-labelledby") ?? "none";
  const describedBy = content?.getAttribute("aria-describedby") ?? "none";
  const titleId = title?.id || "none";
  const descriptionId = description?.id || "none";
  const contentParent = content?.parentElement;
  const contentHidden = content?.closest("[hidden]") || content?.hasAttribute("hidden")
    ? "yes"
    : "no";

  return {
    triggerExists: trigger ? "yes" : "no",
    triggerSlot: trigger?.getAttribute("data-slot") ?? "not rendered",
    triggerClass: trigger?.classList.contains("atom-button") ? "passed" : "missing",
    triggerProps: propsMatch(trigger, [
      ["id", "dialog-trigger-prop"],
      ["name", "dialog-trigger-name"],
      ["title", "trigger prop"],
      ["data-prop-check", "trigger"],
    ]),
    triggerTag: trigger?.tagName.toLowerCase() ?? "none",
    triggerRole: trigger?.getAttribute("role") ?? "none",
    triggerTabIndex: trigger?.getAttribute("tabindex") ?? "none",
    triggerState: trigger?.getAttribute("data-state") ?? "none",
    triggerControls,
    triggerHasPopup: trigger?.getAttribute("aria-haspopup") ?? "none",
    triggerExpanded: trigger?.getAttribute("aria-expanded") ?? "none",
    triggerDisabled: trigger?.hasAttribute("disabled") || trigger?.hasAttribute("data-disabled")
      ? "yes"
      : "no",
    cancelCloseExists: cancelClose ? "yes" : "no",
    cancelCloseSlot: cancelClose?.getAttribute("data-slot") ?? "not rendered",
    cancelCloseTag: cancelClose?.tagName.toLowerCase() ?? "none",
    cancelCloseRole: cancelClose?.getAttribute("role") ?? "none",
    cancelCloseTabIndex: cancelClose?.getAttribute("tabindex") ?? "none",
    saveCloseExists: saveClose ? "yes" : "no",
    saveCloseSlot: saveClose?.getAttribute("data-slot") ?? "not rendered",
    saveCloseProps: propsMatch(saveClose, [
      ["id", "dialog-save-close-prop"],
      ["name", "dialog-save-close-name"],
      ["title", "save close prop"],
      ["data-prop-check", "save-close"],
    ]),
    saveCloseTag: saveClose?.tagName.toLowerCase() ?? "none",
    saveCloseRole: saveClose?.getAttribute("role") ?? "none",
    saveCloseTabIndex: saveClose?.getAttribute("tabindex") ?? "none",
    contentExists: content ? "yes" : "no",
    contentSlot: content?.getAttribute("data-slot") ?? "not rendered",
    contentProps: propsMatch(content, [
      ["title", "content prop"],
      ["data-prop-check", "content"],
    ]),
    contentId,
    contentRole: content?.getAttribute("role") ?? "none",
    contentFocused: content && activeElement === content ? "yes" : "no",
    contentState: content?.getAttribute("data-state") ?? "none",
    contentPositioned: content
      ? content.hasAttribute("data-positioned")
        ? "yes"
        : "no"
      : "none",
    contentHidden,
    contentAriaModal: content?.getAttribute("aria-modal") ?? "none",
    contentAriaLabel: content?.getAttribute("aria-label") ?? "none",
    contentLabelledBy: labelledBy,
    contentDescribedBy: describedBy,
    bodyScrollLock: document.body.style.overflow || "none",
    controlsMatch: triggerControls !== "none" && triggerControls === contentId ? "yes" : "no",
    overlayExists: overlay ? "yes" : "no",
    overlaySlot: overlay?.getAttribute("data-slot") ?? "not rendered",
    overlayProps: propsMatch(overlay, [
      ["id", "dialog-overlay-prop"],
      ["title", "overlay prop"],
      ["data-prop-check", "overlay"],
    ]),
    overlayState: overlay?.getAttribute("data-state") ?? "none",
    portalParent: contentParent
      ? contentParent === document.body
        ? "body"
        : contentHidden === "yes"
          ? "hidden wrapper"
          : contentParent.tagName.toLowerCase()
      : "not rendered",
    inCanvas: content && canvas?.contains(content) ? "yes" : "no",
    titleExists: title ? "yes" : "no",
    titleSlot: title?.getAttribute("data-slot") ?? "not rendered",
    titleProps: propsMatch(title, [
      ["title", "title prop"],
      ["data-prop-check", "title"],
    ]),
    titleTag: title?.tagName.toLowerCase() ?? "none",
    titleId,
    titleMatches: labelledBy !== "none" && labelledBy === titleId ? "yes" : "no",
    descriptionExists: description ? "yes" : "no",
    descriptionSlot: description?.getAttribute("data-slot") ?? "not rendered",
    descriptionProps: propsMatch(description, [
      ["title", "description prop"],
      ["data-prop-check", "description"],
    ]),
    descriptionId,
    descriptionMatches: describedBy !== "none" && describedBy === descriptionId ? "yes" : "no",
  };
}

function propsMatch(
  element: Element | null | undefined,
  checks: [attribute: string, expectedValue: string][],
) {
  if (!element) return "not rendered";

  return checks.every(([attribute, expectedValue]) =>
    element.getAttribute(attribute) === expectedValue
  )
    ? "passed"
    : "missing";
}

const emptyDialogRefSnapshot: DialogRefSnapshot = {
  trigger: "none",
  overlay: "none",
  content: "none",
  title: "none",
  description: "none",
  saveClose: "none",
};

const emptyDialogPartsSnapshot: DialogPartsSnapshot = {
  triggerExists: "no",
  triggerSlot: "not rendered",
  triggerClass: "missing",
  triggerProps: "not rendered",
  triggerTag: "none",
  triggerRole: "none",
  triggerTabIndex: "none",
  triggerState: "none",
  triggerControls: "none",
  triggerHasPopup: "none",
  triggerExpanded: "none",
  triggerDisabled: "no",
  cancelCloseExists: "no",
  cancelCloseSlot: "not rendered",
  cancelCloseTag: "none",
  cancelCloseRole: "none",
  cancelCloseTabIndex: "none",
  saveCloseExists: "no",
  saveCloseSlot: "not rendered",
  saveCloseProps: "not rendered",
  saveCloseTag: "none",
  saveCloseRole: "none",
  saveCloseTabIndex: "none",
  contentExists: "no",
  contentSlot: "not rendered",
  contentProps: "not rendered",
  contentId: "none",
  contentRole: "none",
  contentFocused: "no",
  contentState: "none",
  contentPositioned: "none",
  contentHidden: "no",
  contentAriaModal: "none",
  contentAriaLabel: "none",
  contentLabelledBy: "none",
  contentDescribedBy: "none",
  bodyScrollLock: "none",
  controlsMatch: "no",
  overlayExists: "no",
  overlaySlot: "not rendered",
  overlayProps: "not rendered",
  overlayState: "none",
  portalParent: "not rendered",
  inCanvas: "no",
  titleExists: "no",
  titleSlot: "not rendered",
  titleProps: "not rendered",
  titleTag: "none",
  titleId: "none",
  titleMatches: "no",
  descriptionExists: "no",
  descriptionSlot: "not rendered",
  descriptionProps: "not rendered",
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

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");
