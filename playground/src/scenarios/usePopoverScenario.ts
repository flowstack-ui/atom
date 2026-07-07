import { useCallback, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import type { PopoverAlign, PopoverSide } from "@flowstack-ui/atom/popover";

export type { PopoverAlign, PopoverSide };

export type PopoverCompositionMode = "default" | "asChild" | "render";
export type PopoverTriggerMode = "click" | "hover";

export type PopoverLogEntry = {
  id: number;
  text: string;
  time: string;
};

export type PopoverScenarioState = {
  controlled: boolean;
  disabled: boolean;
  modal: boolean;
  closeOnInteractOutside: boolean;
  useAnchor: boolean;
  useAriaLabel: boolean;
  triggerMode: PopoverTriggerMode;
  side: PopoverSide;
  align: PopoverAlign;
  sideOffset: number;
  triggerComposition: PopoverCompositionMode;
  anchorComposition: PopoverCompositionMode;
  closeComposition: PopoverCompositionMode;
  blockTriggerEvent: boolean;
  blockCloseEvent: boolean;
  propCheck: boolean;
  customAnchorSlot: boolean;
  customTriggerSlot: boolean;
  customContentSlot: boolean;
  customArrowSlot: boolean;
  customCloseSlot: boolean;
  open: boolean;
  log: PopoverLogEntry[];
};

export type PopoverScenarioActions = {
  setControlled: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
  setModal: (value: boolean) => void;
  setCloseOnInteractOutside: (value: boolean) => void;
  setUseAnchor: (value: boolean) => void;
  setUseAriaLabel: (value: boolean) => void;
  setTriggerMode: (value: PopoverTriggerMode) => void;
  setSide: (value: PopoverSide) => void;
  setAlign: (value: PopoverAlign) => void;
  setSideOffset: (value: number) => void;
  setTriggerComposition: (value: PopoverCompositionMode) => void;
  setAnchorComposition: (value: PopoverCompositionMode) => void;
  setCloseComposition: (value: PopoverCompositionMode) => void;
  setBlockTriggerEvent: (value: boolean) => void;
  setBlockCloseEvent: (value: boolean) => void;
  setPropCheck: (value: boolean) => void;
  setCustomAnchorSlot: (value: boolean) => void;
  setCustomTriggerSlot: (value: boolean) => void;
  setCustomContentSlot: (value: boolean) => void;
  setCustomArrowSlot: (value: boolean) => void;
  setCustomCloseSlot: (value: boolean) => void;
  setControlledOpen: (value: boolean) => void;
  handleOpenChange: (open: boolean) => void;
  handleTriggerClick: (event: ReactMouseEvent<HTMLElement>) => void;
  handleTriggerKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  handleCloseClick: (event: ReactMouseEvent<HTMLElement>) => void;
  clearLog: () => void;
};

export function usePopoverScenario() {
  const nextLogId = useRef(1);
  const [controlled, setControlled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [modal, setModal] = useState(false);
  const [closeOnInteractOutside, setCloseOnInteractOutside] = useState(true);
  const [useAnchor, setUseAnchor] = useState(false);
  const [useAriaLabel, setUseAriaLabel] = useState(true);
  const [triggerMode, setTriggerMode] = useState<PopoverTriggerMode>("click");
  const [side, setSide] = useState<PopoverSide>("bottom");
  const [align, setAlign] = useState<PopoverAlign>("center");
  const [sideOffset, setSideOffset] = useState(8);
  const [triggerComposition, setTriggerComposition] =
    useState<PopoverCompositionMode>("default");
  const [anchorComposition, setAnchorComposition] =
    useState<PopoverCompositionMode>("default");
  const [closeComposition, setCloseComposition] =
    useState<PopoverCompositionMode>("default");
  const [blockTriggerEvent, setBlockTriggerEvent] = useState(false);
  const [blockCloseEvent, setBlockCloseEvent] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const [customAnchorSlot, setCustomAnchorSlot] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customContentSlot, setCustomContentSlot] = useState(false);
  const [customArrowSlot, setCustomArrowSlot] = useState(false);
  const [customCloseSlot, setCustomCloseSlot] = useState(false);
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<PopoverLogEntry[]>([]);

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

  const handleTriggerClick = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (blockTriggerEvent) {
      event.preventDefault();
      addLog("trigger user onClick blocked toggle");
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

  const handleCloseClick = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (blockCloseEvent) {
      event.preventDefault();
      addLog("close user onClick blocked close");
      return;
    }

    addLog("close user onClick");
  }, [addLog, blockCloseEvent]);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  return {
    state: {
      controlled,
      disabled,
      modal,
      closeOnInteractOutside,
      useAnchor,
      useAriaLabel,
      triggerMode,
      side,
      align,
      sideOffset,
      triggerComposition,
      anchorComposition,
      closeComposition,
      blockTriggerEvent,
      blockCloseEvent,
      propCheck,
      customAnchorSlot,
      customTriggerSlot,
      customContentSlot,
      customArrowSlot,
      customCloseSlot,
      open,
      log,
    },
    actions: {
      setControlled,
      setDisabled,
      setModal,
      setCloseOnInteractOutside,
      setUseAnchor,
      setUseAriaLabel,
      setTriggerMode,
      setSide,
      setAlign,
      setSideOffset,
      setTriggerComposition,
      setAnchorComposition,
      setCloseComposition,
      setBlockTriggerEvent,
      setBlockCloseEvent,
      setPropCheck,
      setCustomAnchorSlot,
      setCustomTriggerSlot,
      setCustomContentSlot,
      setCustomArrowSlot,
      setCustomCloseSlot,
      setControlledOpen,
      handleOpenChange,
      handleTriggerClick,
      handleTriggerKeyDown,
      handleCloseClick,
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
