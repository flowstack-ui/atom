import { useCallback, useRef, useState } from "react";
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from "react";
import type { TooltipAlign, TooltipSide } from "@flowstack-ui/atom/tooltip";

export type { TooltipAlign, TooltipSide };

export type TooltipArrowSize = "default" | "wide";
export type TooltipCompositionMode = "default" | "asChild" | "render";
export type TooltipPortalMode = "body" | "container" | "disabled";
export type TooltipVariant = "plain" | "rich";

export type TooltipLogEntry = {
  id: number;
  text: string;
  time: string;
};

export type TooltipScenarioState = {
  controlled: boolean;
  defaultOpen: boolean;
  disabled: boolean;
  useAriaLabel: boolean;
  portalMode: TooltipPortalMode;
  providerOpenDelay: number;
  providerCloseDelay: number;
  providerSkipDelay: number;
  variant: TooltipVariant;
  side: TooltipSide;
  align: TooltipAlign;
  sideOffset: number;
  arrowSize: TooltipArrowSize;
  triggerComposition: TooltipCompositionMode;
  arrowComposition: TooltipCompositionMode;
  propCheck: boolean;
  customTriggerSlot: boolean;
  customContentSlot: boolean;
  customArrowSlot: boolean;
  open: boolean;
  log: TooltipLogEntry[];
};

export type TooltipScenarioActions = {
  setControlled: (value: boolean) => void;
  setDefaultOpen: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
  setUseAriaLabel: (value: boolean) => void;
  setPortalMode: (value: TooltipPortalMode) => void;
  setProviderOpenDelay: (value: number) => void;
  setProviderCloseDelay: (value: number) => void;
  setProviderSkipDelay: (value: number) => void;
  setVariant: (value: TooltipVariant) => void;
  setSide: (value: TooltipSide) => void;
  setAlign: (value: TooltipAlign) => void;
  setSideOffset: (value: number) => void;
  setArrowSize: (value: TooltipArrowSize) => void;
  setTriggerComposition: (value: TooltipCompositionMode) => void;
  setArrowComposition: (value: TooltipCompositionMode) => void;
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
  handleTriggerTouchStart: (event: ReactTouchEvent<HTMLElement>) => void;
  handleTriggerTouchMove: (event: ReactTouchEvent<HTMLElement>) => void;
  handleTriggerTouchEnd: (event: ReactTouchEvent<HTMLElement>) => void;
  handleTriggerTouchCancel: (event: ReactTouchEvent<HTMLElement>) => void;
  handleTriggerKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  clearLog: () => void;
};

export function useTooltipScenario() {
  const nextLogId = useRef(1);
  const [controlled, setControlled] = useState(false);
  const [defaultOpen, setDefaultOpenState] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [useAriaLabel, setUseAriaLabel] = useState(true);
  const [portalMode, setPortalMode] = useState<TooltipPortalMode>("body");
  const [providerOpenDelay, setProviderOpenDelay] = useState(400);
  const [providerCloseDelay, setProviderCloseDelay] = useState(150);
  const [providerSkipDelay, setProviderSkipDelay] = useState(300);
  const [variant, setVariant] = useState<TooltipVariant>("plain");
  const [side, setSide] = useState<TooltipSide>("top");
  const [align, setAlign] = useState<TooltipAlign>("center");
  const [sideOffset, setSideOffset] = useState(4);
  const [arrowSize, setArrowSize] = useState<TooltipArrowSize>("default");
  const [triggerComposition, setTriggerComposition] =
    useState<TooltipCompositionMode>("default");
  const [arrowComposition, setArrowComposition] =
    useState<TooltipCompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customContentSlot, setCustomContentSlot] = useState(false);
  const [customArrowSlot, setCustomArrowSlot] = useState(false);
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<TooltipLogEntry[]>([]);

  const addLog = useCallback((text: string) => {
    setLog((currentLog) => [
      { id: nextLogId.current++, text, time: getLogTime() },
      ...currentLog,
    ].slice(0, 10));
  }, []);

  const setDefaultOpen = useCallback((value: boolean) => {
    setDefaultOpenState(value);
    if (!controlled) {
      setOpen(value);
      addLog(`uncontrolled defaultOpen set ${value}`);
    }
  }, [addLog, controlled]);

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

  const handleTriggerTouchStart = useCallback(() => {
    addLog("trigger user touchstart");
  }, [addLog]);

  const handleTriggerTouchMove = useCallback(() => {
    addLog("trigger user touchmove");
  }, [addLog]);

  const handleTriggerTouchEnd = useCallback(() => {
    addLog("trigger user touchend");
  }, [addLog]);

  const handleTriggerTouchCancel = useCallback(() => {
    addLog("trigger user touchcancel");
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
      defaultOpen,
      disabled,
      useAriaLabel,
      portalMode,
      providerOpenDelay,
      providerCloseDelay,
      providerSkipDelay,
      variant,
      side,
      align,
      sideOffset,
      arrowSize,
      triggerComposition,
      arrowComposition,
      propCheck,
      customTriggerSlot,
      customContentSlot,
      customArrowSlot,
      open,
      log,
    },
    actions: {
      setControlled,
      setDefaultOpen,
      setDisabled,
      setUseAriaLabel,
      setPortalMode,
      setProviderOpenDelay,
      setProviderCloseDelay,
      setProviderSkipDelay,
      setVariant,
      setSide,
      setAlign,
      setSideOffset,
      setArrowSize,
      setTriggerComposition,
      setArrowComposition,
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
      handleTriggerTouchStart,
      handleTriggerTouchMove,
      handleTriggerTouchEnd,
      handleTriggerTouchCancel,
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
