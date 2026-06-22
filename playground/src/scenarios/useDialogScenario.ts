import { useRef, useState } from "react";

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
