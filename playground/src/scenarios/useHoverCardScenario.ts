import { useCallback, useRef, useState } from "react";
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import type { HoverCardAlign, HoverCardSide } from "@flowstack-ui/atom/hover-card";

export type { HoverCardAlign, HoverCardSide };

export type HoverCardCompositionMode = "default" | "asChild" | "render";

export type HoverCardLogEntry = {
  id: number;
  text: string;
  time: string;
};

export type HoverCardScenarioState = {
  controlled: boolean;
  disabled: boolean;
  useAriaLabel: boolean;
  openDelay: number;
  closeDelay: number;
  side: HoverCardSide;
  align: HoverCardAlign;
  sideOffset: number;
  triggerComposition: HoverCardCompositionMode;
  propCheck: boolean;
  customTriggerSlot: boolean;
  customContentSlot: boolean;
  customArrowSlot: boolean;
  open: boolean;
  log: HoverCardLogEntry[];
};

export type HoverCardScenarioActions = {
  setControlled: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
  setUseAriaLabel: (value: boolean) => void;
  setOpenDelay: (value: number) => void;
  setCloseDelay: (value: number) => void;
  setSide: (value: HoverCardSide) => void;
  setAlign: (value: HoverCardAlign) => void;
  setSideOffset: (value: number) => void;
  setTriggerComposition: (value: HoverCardCompositionMode) => void;
  setPropCheck: (value: boolean) => void;
  setCustomTriggerSlot: (value: boolean) => void;
  setCustomContentSlot: (value: boolean) => void;
  setCustomArrowSlot: (value: boolean) => void;
  setControlledOpen: (value: boolean) => void;
  handleOpenChange: (open: boolean) => void;
  handleTriggerMouseEnter: (event: ReactMouseEvent<HTMLElement>) => void;
  handleTriggerMouseLeave: (event: ReactMouseEvent<HTMLElement>) => void;
  handleTriggerFocus: (event: ReactFocusEvent<HTMLElement>) => void;
  handleTriggerBlur: (event: ReactFocusEvent<HTMLElement>) => void;
  handleTriggerKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  clearLog: () => void;
};

export function useHoverCardScenario() {
  const nextLogId = useRef(1);
  const [controlled, setControlled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [useAriaLabel, setUseAriaLabel] = useState(true);
  const [openDelay, setOpenDelay] = useState(0);
  const [closeDelay, setCloseDelay] = useState(150);
  const [side, setSide] = useState<HoverCardSide>("bottom");
  const [align, setAlign] = useState<HoverCardAlign>("center");
  const [sideOffset, setSideOffset] = useState(8);
  const [triggerComposition, setTriggerComposition] =
    useState<HoverCardCompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customContentSlot, setCustomContentSlot] = useState(false);
  const [customArrowSlot, setCustomArrowSlot] = useState(false);
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<HoverCardLogEntry[]>([]);

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

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    addLog(nextOpen ? "opened" : "closed");
  }, [addLog]);

  const handleTriggerMouseEnter = useCallback(() => {
    addLog("trigger user mouseenter");
  }, [addLog]);

  const handleTriggerMouseLeave = useCallback(() => {
    addLog("trigger user mouseleave");
  }, [addLog]);

  const handleTriggerFocus = useCallback(() => {
    addLog("trigger user focus");
  }, [addLog]);

  const handleTriggerBlur = useCallback(() => {
    addLog("trigger user blur");
  }, [addLog]);

  const handleTriggerKeyDown = useCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") addLog("trigger user onKeyDown Escape");
  }, [addLog]);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  return {
    state: {
      controlled,
      disabled,
      useAriaLabel,
      openDelay,
      closeDelay,
      side,
      align,
      sideOffset,
      triggerComposition,
      propCheck,
      customTriggerSlot,
      customContentSlot,
      customArrowSlot,
      open,
      log,
    },
    actions: {
      setControlled,
      setDisabled,
      setUseAriaLabel,
      setOpenDelay,
      setCloseDelay,
      setSide,
      setAlign,
      setSideOffset,
      setTriggerComposition,
      setPropCheck,
      setCustomTriggerSlot,
      setCustomContentSlot,
      setCustomArrowSlot,
      setControlledOpen,
      handleOpenChange,
      handleTriggerMouseEnter,
      handleTriggerMouseLeave,
      handleTriggerFocus,
      handleTriggerBlur,
      handleTriggerKeyDown,
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
