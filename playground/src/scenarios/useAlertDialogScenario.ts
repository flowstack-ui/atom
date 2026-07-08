import { useCallback, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";

export type AlertDialogCompositionMode = "default" | "asChild" | "render";
export type AlertDialogHeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type AlertDialogRefPart =
  | "trigger"
  | "overlay"
  | "content"
  | "title"
  | "description"
  | "cancel"
  | "action";
export type AlertDialogRefSnapshot = Record<AlertDialogRefPart, string>;

export type AlertDialogLogEntry = {
  id: number;
  text: string;
  time: string;
};

export type AlertDialogScenarioState = {
  controlled: boolean;
  disabled: boolean;
  keepMounted: boolean;
  portalDisabled: boolean;
  overlayDisabled: boolean;
  closeOnEscape: boolean;
  useAriaLabel: boolean;
  cancelAutoFocus: boolean;
  showNestedSelect: boolean;
  titleHeadingLevel: AlertDialogHeadingLevel;
  triggerComposition: AlertDialogCompositionMode;
  cancelComposition: AlertDialogCompositionMode;
  actionComposition: AlertDialogCompositionMode;
  blockTriggerEvent: boolean;
  blockCancelClose: boolean;
  blockActionClose: boolean;
  propCheck: boolean;
  customTriggerSlot: boolean;
  customOverlaySlot: boolean;
  customContentSlot: boolean;
  customTitleSlot: boolean;
  customDescriptionSlot: boolean;
  customCancelSlot: boolean;
  customActionSlot: boolean;
  open: boolean;
  log: AlertDialogLogEntry[];
  refs: AlertDialogRefSnapshot;
};

export type AlertDialogScenarioActions = {
  setControlled: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
  setKeepMounted: (value: boolean) => void;
  setPortalDisabled: (value: boolean) => void;
  setOverlayDisabled: (value: boolean) => void;
  setCloseOnEscape: (value: boolean) => void;
  setUseAriaLabel: (value: boolean) => void;
  setCancelAutoFocus: (value: boolean) => void;
  setShowNestedSelect: (value: boolean) => void;
  setTitleHeadingLevel: (value: AlertDialogHeadingLevel) => void;
  setTriggerComposition: (value: AlertDialogCompositionMode) => void;
  setCancelComposition: (value: AlertDialogCompositionMode) => void;
  setActionComposition: (value: AlertDialogCompositionMode) => void;
  setBlockTriggerEvent: (value: boolean) => void;
  setBlockCancelClose: (value: boolean) => void;
  setBlockActionClose: (value: boolean) => void;
  setPropCheck: (value: boolean) => void;
  setCustomTriggerSlot: (value: boolean) => void;
  setCustomOverlaySlot: (value: boolean) => void;
  setCustomContentSlot: (value: boolean) => void;
  setCustomTitleSlot: (value: boolean) => void;
  setCustomDescriptionSlot: (value: boolean) => void;
  setCustomCancelSlot: (value: boolean) => void;
  setCustomActionSlot: (value: boolean) => void;
  setControlledOpen: (value: boolean) => void;
  handleOpenChange: (open: boolean, reason?: string) => void;
  handleTriggerClick: (event: ReactMouseEvent<HTMLElement>) => void;
  handleTriggerKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  handleCancelClick: (event: ReactMouseEvent<HTMLElement>) => void;
  handleActionClick: (event: ReactMouseEvent<HTMLElement>) => void;
  handleOverlayClick: () => void;
  markPartRef: (part: AlertDialogRefPart, element: HTMLElement | null) => void;
  testDisabledTriggerKey: (key: "Enter" | " ") => void;
  testFocusEscape: () => void;
  clearLog: () => void;
};

export function useAlertDialogScenario() {
  const nextLogId = useRef(1);
  const [controlled, setControlled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);
  const [portalDisabled, setPortalDisabled] = useState(false);
  const [overlayDisabled, setOverlayDisabled] = useState(false);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [useAriaLabel, setUseAriaLabel] = useState(false);
  const [cancelAutoFocus, setCancelAutoFocus] = useState(true);
  const [showNestedSelect, setShowNestedSelect] = useState(false);
  const [titleHeadingLevel, setTitleHeadingLevel] =
    useState<AlertDialogHeadingLevel>("h2");
  const [triggerComposition, setTriggerComposition] =
    useState<AlertDialogCompositionMode>("default");
  const [cancelComposition, setCancelComposition] =
    useState<AlertDialogCompositionMode>("default");
  const [actionComposition, setActionComposition] =
    useState<AlertDialogCompositionMode>("default");
  const [blockTriggerEvent, setBlockTriggerEvent] = useState(false);
  const [blockCancelClose, setBlockCancelClose] = useState(false);
  const [blockActionClose, setBlockActionClose] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customOverlaySlot, setCustomOverlaySlot] = useState(false);
  const [customContentSlot, setCustomContentSlot] = useState(false);
  const [customTitleSlot, setCustomTitleSlot] = useState(false);
  const [customDescriptionSlot, setCustomDescriptionSlot] = useState(false);
  const [customCancelSlot, setCustomCancelSlot] = useState(false);
  const [customActionSlot, setCustomActionSlot] = useState(false);
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<AlertDialogLogEntry[]>([]);
  const [refs, setRefs] = useState<AlertDialogRefSnapshot>(emptyAlertDialogRefSnapshot);

  const addLog = useCallback((text: string) => {
    setLog((currentLog) => [
      { id: nextLogId.current++, text, time: getLogTime() },
      ...currentLog,
    ].slice(0, 10));
  }, []);

  const setControlledOpen = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    addLog(`${nextOpen ? "opened" : "closed"} by external control`);
  }, [addLog]);

  const handleOpenChange = useCallback((nextOpen: boolean, reason?: string) => {
    setOpen(nextOpen);
    if (nextOpen) {
      addLog("opened");
      return;
    }

    addLog(reason ? `closed by ${reason}` : "closed");
  }, [addLog]);

  const handleTriggerClick = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (blockTriggerEvent) {
      event.preventDefault();
      addLog("trigger user onClick blocked open");
      return;
    }

    addLog("trigger user onClick");
  }, [addLog, blockTriggerEvent]);

  const handleTriggerKeyDown = useCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const key = event.key === " " ? "Space" : event.key;
    if (blockTriggerEvent) {
      event.preventDefault();
      addLog(`trigger user onKeyDown blocked ${key}`);
      return;
    }

    addLog(`trigger user onKeyDown ${key}`);
  }, [addLog, blockTriggerEvent]);

  const handleCancelClick = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (blockCancelClose) {
      event.preventDefault();
      addLog("cancel user onClick blocked close");
      return;
    }

    addLog("cancel user onClick");
  }, [addLog, blockCancelClose]);

  const handleActionClick = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (blockActionClose) {
      event.preventDefault();
      addLog("action user onClick blocked close");
      return;
    }

    addLog("action user onClick");
  }, [addLog, blockActionClose]);

  const handleOverlayClick = useCallback(() => {
    addLog("overlay clicked; alert dialog stays open");
  }, [addLog]);

  const markPartRef = useCallback((part: AlertDialogRefPart, element: HTMLElement | null) => {
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

  const testDisabledTriggerKey = useCallback((key: "Enter" | " ") => {
    const trigger = document.querySelector<HTMLElement>("[data-alert-dialog-trigger]");
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
      const content = document.querySelector("[data-alert-dialog-content]");
      const stayedClosed = !content || content.getAttribute("data-state") === "closed";
      addLog(
        stayedClosed
          ? `disabled trigger blocked ${key === " " ? "Space" : "Enter"}`
          : `disabled trigger opened with ${key === " " ? "Space" : "Enter"}`,
      );
    });
  }, [addLog]);

  const testFocusEscape = useCallback(() => {
    const behindButton = document.querySelector<HTMLButtonElement>("[data-alert-dialog-behind]");
    const content = document.querySelector<HTMLElement>("[data-alert-dialog-content]");

    if (!behindButton || !content) {
      addLog("focus escape probe skipped");
      return;
    }

    behindButton.focus();

    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      addLog(`focus stayed inside alert dialog: ${content.contains(activeElement) ? "yes" : "no"}`);
    });
  }, [addLog]);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  return {
    state: {
      controlled,
      disabled,
      keepMounted,
      portalDisabled,
      overlayDisabled,
      closeOnEscape,
      useAriaLabel,
      cancelAutoFocus,
      showNestedSelect,
      titleHeadingLevel,
      triggerComposition,
      cancelComposition,
      actionComposition,
      blockTriggerEvent,
      blockCancelClose,
      blockActionClose,
      propCheck,
      customTriggerSlot,
      customOverlaySlot,
      customContentSlot,
      customTitleSlot,
      customDescriptionSlot,
      customCancelSlot,
      customActionSlot,
      open,
      log,
      refs,
    },
    actions: {
      setControlled,
      setDisabled,
      setKeepMounted,
      setPortalDisabled,
      setOverlayDisabled,
      setCloseOnEscape,
      setUseAriaLabel,
      setCancelAutoFocus,
      setShowNestedSelect,
      setTitleHeadingLevel,
      setTriggerComposition,
      setCancelComposition,
      setActionComposition,
      setBlockTriggerEvent,
      setBlockCancelClose,
      setBlockActionClose,
      setPropCheck,
      setCustomTriggerSlot,
      setCustomOverlaySlot,
      setCustomContentSlot,
      setCustomTitleSlot,
      setCustomDescriptionSlot,
      setCustomCancelSlot,
      setCustomActionSlot,
      setControlledOpen,
      handleOpenChange,
      handleTriggerClick,
      handleTriggerKeyDown,
      handleCancelClick,
      handleActionClick,
      handleOverlayClick,
      markPartRef,
      testDisabledTriggerKey,
      testFocusEscape,
      clearLog,
    },
  };
}

const emptyAlertDialogRefSnapshot: AlertDialogRefSnapshot = {
  trigger: "none",
  overlay: "none",
  content: "none",
  title: "none",
  description: "none",
  cancel: "none",
  action: "none",
};

function getLogTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}
