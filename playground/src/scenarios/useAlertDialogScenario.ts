import { useCallback, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";

export type AlertDialogCompositionMode = "default" | "asChild" | "render";
export type AlertDialogHeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type AlertDialogLogEntry = {
  id: number;
  text: string;
  time: string;
};

export type AlertDialogScenarioState = {
  controlled: boolean;
  disabled: boolean;
  keepMounted: boolean;
  closeOnEscape: boolean;
  useAriaLabel: boolean;
  cancelAutoFocus: boolean;
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
};

export type AlertDialogScenarioActions = {
  setControlled: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
  setKeepMounted: (value: boolean) => void;
  setCloseOnEscape: (value: boolean) => void;
  setUseAriaLabel: (value: boolean) => void;
  setCancelAutoFocus: (value: boolean) => void;
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
  clearLog: () => void;
};

export function useAlertDialogScenario() {
  const nextLogId = useRef(1);
  const [controlled, setControlled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [useAriaLabel, setUseAriaLabel] = useState(false);
  const [cancelAutoFocus, setCancelAutoFocus] = useState(true);
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

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  return {
    state: {
      controlled,
      disabled,
      keepMounted,
      closeOnEscape,
      useAriaLabel,
      cancelAutoFocus,
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
    },
    actions: {
      setControlled,
      setDisabled,
      setKeepMounted,
      setCloseOnEscape,
      setUseAriaLabel,
      setCancelAutoFocus,
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
      clearLog,
    },
  };
}

function getLogTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}
