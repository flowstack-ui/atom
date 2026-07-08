import { Collapsible } from "@flowstack-ui/atom/collapsible";
import { useCollection, type UseCollectionReturn } from "@flowstack-ui/atom/collection";
import { Direction, useDirection } from "@flowstack-ui/atom/direction";
import { Drawer } from "@flowstack-ui/atom/drawer";
import { Menubar } from "@flowstack-ui/atom/menubar";
import { Modal, useModalContent } from "@flowstack-ui/atom/modal";
import { NavigationMenu } from "@flowstack-ui/atom/navigation-menu";
import { Portal } from "@flowstack-ui/atom/portal";
import { Pressable } from "@flowstack-ui/atom/pressable";
import { Progress } from "@flowstack-ui/atom/progress";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import { Sidebar } from "@flowstack-ui/atom/sidebar";
import { SkipLink } from "@flowstack-ui/atom/skip-link";
import { SwipeableItem } from "@flowstack-ui/atom/swipeable-item";
import { Toast, toast, useToastStore } from "@flowstack-ui/atom/toast";
import { Toolbar } from "@flowstack-ui/atom/toolbar";
import { useVirtualizer } from "@flowstack-ui/atom/virtualizer";
import { VisuallyHidden } from "@flowstack-ui/atom/visually-hidden";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ButtonHTMLAttributes,
  type Dispatch,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { AnatomyPanel, type AnatomySection } from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type ProgressMode = "determinate" | "complete" | "indeterminate" | "invalid";
type Orientation = "horizontal" | "vertical";
type TextDirection = "ltr" | "rtl";
type ToggleType = "single" | "multiple";
type OverlayPlacement = "start" | "end" | "top" | "bottom";
type SidebarStateValue = "expanded" | "rail" | "offcanvas";
type SidebarSideValue = "left" | "right";
type ToastKind = "default" | "success" | "error" | "warning" | "info" | "loading";
type ToastPositionValue = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type VirtualizerAlignValue = "start" | "center" | "end" | "auto";
type SkipLinkTargetMode = "valid" | "missing" | "malformed";

type LogEntry = {
  id: number;
  time: string;
  text: string;
};

export const utilityPrimitiveScenarioIds = new Set([
  "direction",
  "modal",
  "drawer",
  "menubar",
  "navigation-menu",
  "sidebar",
  "swipeable-item",
  "toast",
  "progress",
  "pressable",
  "visually-hidden",
  "skip-link",
  "collapsible",
  "toolbar",
  "portal",
  "collection",
  "virtualizer",
]);

function nowTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function useScenarioLog() {
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = (text: string) => {
    setLog((entries) => [
      { id: Date.now() + Math.random(), time: nowTime(), text },
      ...entries.slice(0, 10),
    ]);
  };

  return { log, addLog, clearLog: () => setLog([]) };
}

export function useUtilityPrimitiveScenarios() {
  return {
    direction: useDirectionScenario(),
    modal: useModalScenario(),
    drawer: useDrawerScenario(),
    menubar: useMenubarScenario(),
    navigationMenu: useNavigationMenuScenario(),
    sidebar: useSidebarScenario(),
    swipeableItem: useSwipeableItemScenario(),
    toast: useToastScenario(),
    progress: useProgressScenario(),
    pressable: usePressableScenario(),
    visuallyHidden: useVisuallyHiddenScenario(),
    skipLink: useSkipLinkScenario(),
    collapsible: useCollapsibleScenario(),
    toolbar: useToolbarScenario(),
    portal: usePortalScenario(),
    collection: useCollectionScenario(),
    virtualizer: useVirtualizerScenario(),
  };
}

function useDirectionScenario() {
  const [dir, setDir] = useState<TextDirection>("ltr");
  const [nested, setNested] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { dir, nested, propCheck, log },
    actions: {
      setDir,
      setNested,
      setPropCheck,
      clearLog,
      noteDirection: (value: string) => addLog(`direction ${value}`),
    },
  };
}

function useModalScenario() {
  const [controlled, setControlled] = useState(false);
  const [open, setOpen] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
  const [portalDisabled, setPortalDisabled] = useState(false);
  const [customContainer, setCustomContainer] = useState(false);
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const [closeComposition, setCloseComposition] = useState<CompositionMode>("default");
  const [blockTriggerEvent, setBlockTriggerEvent] = useState(false);
  const [blockCloseEvent, setBlockCloseEvent] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customTitleSlot, setCustomTitleSlot] = useState(false);
  const [customDescriptionSlot, setCustomDescriptionSlot] = useState(false);
  const [customCloseSlot, setCustomCloseSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleOpenChange = (nextOpen: boolean, reason?: string) => {
    setOpen(nextOpen);
    if (!nextOpen) setNestedOpen(false);
    addLog(nextOpen ? "opened" : `closed${reason ? ` by ${reason}` : ""}`);
  };

  const handleNestedOpenChange = (nextOpen: boolean, reason?: string) => {
    setNestedOpen(nextOpen);
    addLog(nextOpen ? "nested opened" : `nested closed${reason ? ` by ${reason}` : ""}`);
  };

  return {
    state: {
      controlled,
      open,
      nestedOpen,
      disabled,
      keepMounted,
      closeOnEscape,
      closeOnBackdropClick,
      portalDisabled,
      customContainer,
      triggerComposition,
      closeComposition,
      blockTriggerEvent,
      blockCloseEvent,
      propCheck,
      customTriggerSlot,
      customTitleSlot,
      customDescriptionSlot,
      customCloseSlot,
      log,
    },
    actions: {
      setControlled,
      setOpen,
      setNestedOpen,
      setDisabled,
      setKeepMounted,
      setCloseOnEscape,
      setCloseOnBackdropClick,
      setPortalDisabled,
      setCustomContainer,
      setTriggerComposition,
      setCloseComposition,
      setBlockTriggerEvent,
      setBlockCloseEvent,
      setPropCheck,
      setCustomTriggerSlot,
      setCustomTitleSlot,
      setCustomDescriptionSlot,
      setCustomCloseSlot,
      handleOpenChange,
      handleNestedOpenChange,
      noteModalEvent: addLog,
      clearLog,
    },
  };
}

function useDrawerScenario() {
  const [controlled, setControlled] = useState(false);
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
  const [placement, setPlacement] = useState<OverlayPlacement>("end");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleOpenChange = (nextOpen: boolean, reason?: string) => {
    setOpen(nextOpen);
    addLog(nextOpen ? "opened" : `closed${reason ? ` by ${reason}` : ""}`);
  };

  return {
    state: { controlled, open, disabled, keepMounted, closeOnEscape, closeOnBackdropClick, placement, log },
    actions: {
      setControlled,
      setOpen,
      setDisabled,
      setKeepMounted,
      setCloseOnEscape,
      setCloseOnBackdropClick,
      setPlacement,
      handleOpenChange,
      clearLog,
    },
  };
}

function useMenubarScenario() {
  const [controlled, setControlled] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [loop, setLoop] = useState(true);
  const [closeOnSelect, setCloseOnSelect] = useState(false);
  const [fileDisabled, setFileDisabled] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [density, setDensity] = useState("comfortable");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (nextValue: string | null) => {
    setValue(nextValue);
    addLog(nextValue ? `opened ${nextValue}` : "closed");
  };

  return {
    state: { controlled, value, loop, closeOnSelect, fileDisabled, showGrid, density, log },
    actions: {
      setControlled,
      setValue,
      setLoop,
      setCloseOnSelect,
      setFileDisabled,
      setShowGrid,
      setDensity,
      handleValueChange,
      clearLog,
      noteSelect: (label: string) => addLog(`selected ${label}`),
    },
  };
}

function useNavigationMenuScenario() {
  const [controlled, setControlled] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [dir, setDir] = useState<TextDirection>("ltr");
  const [disabledItem, setDisabledItem] = useState(true);
  const [showIndicator, setShowIndicator] = useState(true);
  const [showViewport, setShowViewport] = useState(true);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (nextValue: string | null) => {
    setValue(nextValue);
    addLog(nextValue ? `opened ${nextValue}` : "closed");
  };

  return {
    state: { controlled, value, orientation, dir, disabledItem, showIndicator, showViewport, log },
    actions: {
      setControlled,
      setValue,
      setOrientation,
      setDir,
      setDisabledItem,
      setShowIndicator,
      setShowViewport,
      handleValueChange,
      clearLog,
      noteLink: (label: string) => addLog(`link ${label}`),
    },
  };
}

function useSidebarScenario() {
  const [controlled, setControlled] = useState(false);
  const [state, setState] = useState<SidebarStateValue>("expanded");
  const [collapsedState, setCollapsedState] = useState<"rail" | "offcanvas">("rail");
  const [side, setSide] = useState<SidebarSideValue>("left");
  const [disabled, setDisabled] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleStateChange = (nextState: SidebarStateValue) => {
    setState(nextState);
    addLog(`state ${nextState}`);
  };

  return {
    state: { controlled, state, collapsedState, side, disabled, log },
    actions: {
      setControlled,
      setState: handleStateChange,
      setCollapsedState,
      setSide,
      setDisabled,
      clearLog,
    },
  };
}

function useSwipeableItemScenario() {
  const [controlled, setControlled] = useState(false);
  const [openSide, setOpenSide] = useState<"start" | "end" | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [dir, setDir] = useState<TextDirection>("ltr");
  const [fullSwipe, setFullSwipe] = useState(true);
  const [closeOnActionClick, setCloseOnActionClick] = useState(true);
  const [threshold, setThreshold] = useState("0.35");
  const [fullSwipeThreshold, setFullSwipeThreshold] = useState("0.6");
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [contentComposition, setContentComposition] = useState<CompositionMode>("default");
  const [actionsComposition, setActionsComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customContentSlot, setCustomContentSlot] = useState(false);
  const [customActionsSlot, setCustomActionsSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleOpenSideChange = (nextSide: "start" | "end" | null) => {
    setOpenSide(nextSide);
    addLog(`open side ${nextSide ?? "none"}`);
  };

  return {
    state: { controlled, openSide, disabled, readOnly, dir, fullSwipe, closeOnActionClick, threshold, fullSwipeThreshold, composition, contentComposition, actionsComposition, propCheck, customRootSlot, customContentSlot, customActionsSlot, log },
    actions: {
      setControlled,
      setOpenSide: handleOpenSideChange,
      setDisabled,
      setReadOnly,
      setDir,
      setFullSwipe,
      setCloseOnActionClick,
      setThreshold,
      setFullSwipeThreshold,
      setComposition,
      setContentComposition,
      setActionsComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomContentSlot,
      setCustomActionsSlot,
      clearLog,
      noteFullSwipe: (side: "start" | "end") => addLog(`full swipe ${side}`),
      noteAction: (label: string) => addLog(`action ${label}`),
    },
  };
}

function useToastScenario() {
  const [type, setType] = useState<ToastKind>("default");
  const [position, setPosition] = useState<ToastPositionValue>("bottom-right");
  const [closeButton, setCloseButton] = useState(true);
  const [action, setAction] = useState(true);
  const [duration, setDuration] = useState<"short" | "infinite">("infinite");
  const { log, addLog, clearLog } = useScenarioLog();

  const showToast = () => {
    const options = {
      title: `${formatOption(type)} toast`,
      description: "Playground notification body.",
      duration: duration === "infinite" ? Infinity : 3500,
      closeButton,
      action: action ? { label: "Undo", onClick: () => addLog("toast action") } : undefined,
      cancel: action ? { label: "Dismiss", onClick: () => addLog("toast cancel") } : undefined,
    };

    if (type === "success") toast.success("Success toast", options);
    else if (type === "error") toast.error("Error toast", options);
    else if (type === "warning") toast.warning("Warning toast", options);
    else if (type === "info") toast.info("Info toast", options);
    else if (type === "loading") toast.loading("Loading toast", options);
    else toast({ type, ...options });
    addLog(`toast ${type}`);
  };

  const dismissAll = () => {
    toast.dismiss();
    addLog("dismiss all");
  };

  return {
    state: { type, position, closeButton, action, duration, log },
    actions: { setType, setPosition, setCloseButton, setAction, setDuration, showToast, dismissAll, clearLog },
  };
}

function useProgressScenario() {
  const [mode, setMode] = useState<ProgressMode>("determinate");
  const [value, setValue] = useState(42);
  const [customLabel, setCustomLabel] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [indicatorComposition, setIndicatorComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customIndicatorSlot, setCustomIndicatorSlot] = useState(false);
  const [rootRef, setRootRef] = useState("none");
  const [indicatorRef, setIndicatorRef] = useState("none");
  const { log, clearLog } = useScenarioLog();
  const markRootRef = useCallback((node: HTMLElement | null) => {
    setRootRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markIndicatorRef = useCallback((node: HTMLElement | null) => {
    setIndicatorRef(node?.tagName.toLowerCase() ?? "none");
  }, []);

  return {
    state: { mode, value, customLabel, composition, indicatorComposition, propCheck, customRootSlot, customIndicatorSlot, rootRef, indicatorRef, log },
    actions: { setMode, setValue, setCustomLabel, setComposition, setIndicatorComposition, setPropCheck, setCustomRootSlot, setCustomIndicatorSlot, markRootRef, markIndicatorRef, clearLog },
  };
}

function usePressableScenario() {
  const rootElementRef = useRef<HTMLElement | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [blockClick, setBlockClick] = useState(false);
  const [showPointerCancelHelper, setShowPointerCancelHelper] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [pressCount, setPressCount] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [rootRef, setRootRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();
  const markRootRef = useCallback((node: HTMLElement | null) => {
    rootElementRef.current = node;
    setRootRef(node?.tagName.toLowerCase() ?? "none");
  }, []);

  const note = (text: string) => addLog(text);
  const handlePress = () => {
    setPressCount((count) => count + 1);
    addLog("pressed");
  };
  const testPointerCancel = () => {
    const root = rootElementRef.current;
    if (!root) {
      addLog("pointer cancel unavailable");
      return;
    }

    setPressed(true);
    root.dispatchEvent(new PointerEvent("pointercancel", {
      bubbles: true,
      pointerId: 1,
    }));
  };

  return {
    state: { disabled, blockClick, showPointerCancelHelper, composition, propCheck, customRootSlot, pressCount, pressed, rootRef, log },
    actions: { setDisabled, setBlockClick, setShowPointerCancelHelper, setComposition, setPropCheck, setCustomRootSlot, setPressed, markRootRef, handlePress, testPointerCancel, note, clearLog },
  };
}

function useVisuallyHiddenScenario() {
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [customStyle, setCustomStyle] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const { log, clearLog } = useScenarioLog();

  return {
    state: { composition, customStyle, propCheck, customRootSlot, log },
    actions: { setComposition, setCustomStyle, setPropCheck, setCustomRootSlot, clearLog },
  };
}

function useSkipLinkScenario() {
  const [focusTarget, setFocusTarget] = useState(true);
  const [targetMode, setTargetMode] = useState<SkipLinkTargetMode>("valid");
  const [blockClick, setBlockClick] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [targetComposition, setTargetComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customTargetSlot, setCustomTargetSlot] = useState(false);
  const [rootRef, setRootRef] = useState("none");
  const [targetRef, setTargetRef] = useState("none");
  const [defaultPrevented, setDefaultPrevented] = useState("not clicked");
  const [hash, setHash] = useState(() => window.location.hash || "none");
  const { log, addLog, clearLog } = useScenarioLog();
  const markRootRef = useCallback((node: HTMLAnchorElement | null) => {
    setRootRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markTargetRef = useCallback((node: HTMLElement | null) => {
    setTargetRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const noteClickResult = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    window.setTimeout(() => {
      const prevented = event.defaultPrevented ? "true" : "false";
      const nextHash = window.location.hash || "none";
      setDefaultPrevented(prevented);
      setHash(nextHash);
      addLog(`skip link clicked defaultPrevented ${prevented} hash ${nextHash}`);
    }, 0);
  }, [addLog]);
  const noteBlocked = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.setTimeout(() => {
      const nextHash = window.location.hash || "none";
      setDefaultPrevented("true");
      setHash(nextHash);
      addLog(`skip link blocked hash ${nextHash}`);
    }, 0);
  }, [addLog]);

  return {
    state: { focusTarget, targetMode, blockClick, composition, targetComposition, propCheck, customRootSlot, customTargetSlot, rootRef, targetRef, defaultPrevented, hash, log },
    actions: {
      setFocusTarget,
      setTargetMode,
      setBlockClick,
      setComposition,
      setTargetComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomTargetSlot,
      markRootRef,
      markTargetRef,
      clearLog,
      noteClickResult,
      noteBlocked,
      noteFocus: () => addLog("target focused"),
    },
  };
}

function useCollapsibleScenario() {
  const [controlled, setControlled] = useState(false);
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const [contentComposition, setContentComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    addLog(nextOpen ? "opened" : "closed");
  };

  return {
    state: {
      controlled,
      open,
      disabled,
      keepMounted,
      composition,
      triggerComposition,
      contentComposition,
      log,
    },
    actions: {
      setControlled,
      setOpen,
      setDisabled,
      setKeepMounted,
      setComposition,
      setTriggerComposition,
      setContentComposition,
      handleOpenChange,
      clearLog,
    },
  };
}

function useToolbarScenario() {
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [dir, setDir] = useState<TextDirection>("ltr");
  const [loop, setLoop] = useState(true);
  const [disabledButton, setDisabledButton] = useState(true);
  const [disabledLink, setDisabledLink] = useState(false);
  const [toggleType, setToggleType] = useState<ToggleType>("multiple");
  const [toggleValue, setToggleValue] = useState<string | string[]>(["bold"]);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleToggleType = (nextType: ToggleType) => {
    setToggleType(nextType);
    setToggleValue(nextType === "single" ? "bold" : ["bold"]);
  };

  const handleValueChange = (nextValue: string | string[]) => {
    setToggleValue(nextValue);
    const value = Array.isArray(nextValue) ? nextValue.join(", ") || "none" : nextValue || "none";
    addLog(`value changed ${value}`);
  };

  return {
    state: { orientation, dir, loop, disabledButton, disabledLink, toggleType, toggleValue, log },
    actions: {
      setOrientation,
      setDir,
      setLoop,
      setDisabledButton,
      setDisabledLink,
      setToggleType: handleToggleType,
      setToggleValue,
      handleValueChange,
      clearLog,
      note: (text: string) => addLog(text),
    },
  };
}

function usePortalScenario() {
  const [mounted, setMounted] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [customContainer, setCustomContainer] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { mounted, disabled, customContainer, propCheck, log },
    actions: {
      setMounted,
      setDisabled,
      setCustomContainer,
      setPropCheck,
      clearLog,
      noteMount: (nextMounted: boolean) => {
        setMounted(nextMounted);
        addLog(nextMounted ? "mounted content" : "unmounted content");
      },
    },
  };
}

function useCollectionScenario() {
  const collection = useCollection<string, HTMLButtonElement, { label: string; order: number }>();
  const [activeValue, setActiveValue] = useState("alpha");
  const [loop, setLoop] = useState(true);
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [disabledItem, setDisabledItem] = useState(true);
  const [reverseOrder, setReverseOrder] = useState(false);
  const [duplicateValue, setDuplicateValue] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const move = (direction: "next" | "previous") => {
    const next = collection.getNextItem(activeValue, direction, { loop, includeDisabled });
    if (!next) {
      addLog(`no ${direction} item`);
      return;
    }

    setActiveValue(next.value);
    next.element.focus();
    addLog(`${direction} ${activeValue} -> ${next.value}`);
  };

  const first = (includeDisabledItems = includeDisabled) => {
    const item = collection.getFirstItem(includeDisabledItems);
    if (!item) return;
    setActiveValue(item.value);
    item.element.focus();
    addLog(`first ${item.value}`);
  };

  const last = (includeDisabledItems = includeDisabled) => {
    const item = collection.getLastItem(includeDisabledItems);
    if (!item) return;
    setActiveValue(item.value);
    item.element.focus();
    addLog(`last ${item.value}`);
  };

  return {
    state: { activeValue, loop, includeDisabled, disabledItem, reverseOrder, duplicateValue, collection, log },
    actions: {
      setActiveValue,
      setLoop,
      setIncludeDisabled,
      setDisabledItem,
      setReverseOrder,
      setDuplicateValue,
      move,
      first,
      last,
      clearLog,
    },
  };
}

function useVirtualizerScenario() {
  const [count, setCount] = useState(40);
  const [overscan, setOverscan] = useState(2);
  const [variableSize, setVariableSize] = useState(false);
  const [zeroSize, setZeroSize] = useState(false);
  const [align, setAlign] = useState<VirtualizerAlignValue>("start");
  const { log, addLog, clearLog } = useScenarioLog();

  const estimateSize = useCallback(
    (index: number) => {
      return getVirtualizerDemoItemSize(index, { variableSize, zeroSize });
    },
    [variableSize, zeroSize],
  );

  const virtualizer = useVirtualizer({
    count,
    estimateSize,
    overscan,
    getItemKey: useCallback((index: number) => `row-${index + 1}`, []),
  });

  const scrollToIndex = (index: number) => {
    virtualizer.scrollToIndex(index, { align });
    addLog(`scroll to item ${index + 1} (${align})`);
  };

  const scrollToOffset = (offset: number) => {
    virtualizer.scrollToOffset(offset);
    addLog(`scroll to offset ${offset}`);
  };

  return {
    state: { count, overscan, variableSize, zeroSize, align, virtualizer, log },
    actions: {
      setCount,
      setOverscan,
      setVariableSize,
      setZeroSize,
      setAlign,
      scrollToIndex,
      scrollToOffset,
      clearLog,
    },
  };
}

export type UtilityPrimitiveScenarios = ReturnType<typeof useUtilityPrimitiveScenarios>;

function CompositionModeRadioGroup({
  value,
  onChange,
}: {
  value: CompositionMode;
  onChange: (value: CompositionMode) => void;
}) {
  const labels: Record<CompositionMode, string> = {
    default: "Default",
    asChild: "As Child",
    render: "Render",
  };

  return (
    <Menubar.RadioGroup
      className="toolbar-radio-group"
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as CompositionMode)}
    >
      {compositionOptions.map((option) => (
        <Menubar.RadioItem
          className="toolbar-menu-item"
          key={option}
          value={option}
        >
          <span>{labels[option]}</span>
          <span className="toolbar-menu-check" aria-hidden="true">
            {value === option ? "✓" : ""}
          </span>
        </Menubar.RadioItem>
      ))}
    </Menubar.RadioGroup>
  );
}

export function UtilityPrimitiveScenarioToolbar({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: UtilityPrimitiveScenarios;
}) {
  if (scenarioId === "direction") {
    const scenario = scenarios.direction;
    return (
      <ControlToolbar label="Direction controls">
        <ToolbarGroup title="State" value="state">
          <MenuRadioControl label="Direction" options={directionOptions} value={scenario.state.dir} onChange={scenario.actions.setDir} />
          <MenuCheckboxControl checked={scenario.state.nested} label="Nested override" value="nested" onChange={scenario.actions.setNested} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "modal") {
    const scenario = scenarios.modal;
    return (
      <ControlToolbar label="Modal controls">
        <ToolbarGroup title="State" value="state">
          <MenuSection label="Controlled State">
            <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          </MenuSection>
          {scenario.state.controlled ? (
            <MenuSection label="Controlled Value">
              <MenuCheckboxControl checked={scenario.state.open} label="Modal Open" value="open" onChange={scenario.actions.setOpen} />
            </MenuSection>
          ) : null}
          <MenuSection label="Root Options">
            <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
            <MenuCheckboxControl checked={scenario.state.keepMounted} label="Keep mounted" value="keep-mounted" onChange={scenario.actions.setKeepMounted} />
          </MenuSection>
        </ToolbarGroup>
        <ToolbarGroup title="Dismiss" value="dismiss">
          <MenuCheckboxControl checked={scenario.state.closeOnEscape} label="Escape closes" value="escape" onChange={scenario.actions.setCloseOnEscape} />
          <MenuCheckboxControl checked={scenario.state.closeOnBackdropClick} label="Backdrop closes" value="backdrop" onChange={scenario.actions.setCloseOnBackdropClick} />
        </ToolbarGroup>
        <ToolbarGroup title="Popup" value="popup">
          <MenuCheckboxControl checked={scenario.state.portalDisabled} label="Disable portal" value="disable-portal" onChange={scenario.actions.setPortalDisabled} />
          <MenuCheckboxControl checked={scenario.state.customContainer} label="Custom container" value="custom-container" onChange={scenario.actions.setCustomContainer} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuSection label="Trigger Element">
            <CompositionModeRadioGroup value={scenario.state.triggerComposition} onChange={scenario.actions.setTriggerComposition} />
          </MenuSection>
          <MenuSection label="Trigger Behavior">
            <MenuCheckboxControl checked={scenario.state.blockTriggerEvent} label="Prevent Trigger Click" value="block-trigger" onChange={scenario.actions.setBlockTriggerEvent} />
          </MenuSection>
          <MenuSection label="Close Element">
            <CompositionModeRadioGroup value={scenario.state.closeComposition} onChange={scenario.actions.setCloseComposition} />
          </MenuSection>
          <MenuSection label="Close Behavior">
            <MenuCheckboxControl checked={scenario.state.blockCloseEvent} label="Prevent Close Click" value="block-close" onChange={scenario.actions.setBlockCloseEvent} />
          </MenuSection>
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          customSlots={[
            {
              checked: scenario.state.customTriggerSlot,
              label: "Trigger Slot",
              value: "trigger-slot",
              onChange: scenario.actions.setCustomTriggerSlot,
            },
            {
              checked: scenario.state.customTitleSlot,
              label: "Title Slot",
              value: "title-slot",
              onChange: scenario.actions.setCustomTitleSlot,
            },
            {
              checked: scenario.state.customDescriptionSlot,
              label: "Description Slot",
              value: "description-slot",
              onChange: scenario.actions.setCustomDescriptionSlot,
            },
            {
              checked: scenario.state.customCloseSlot,
              label: "Close Slot",
              value: "close-slot",
              onChange: scenario.actions.setCustomCloseSlot,
            },
          ]}
          onPropCheckChange={scenario.actions.setPropCheck}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "drawer") {
    const scenario = scenarios.drawer;
    return (
      <ControlToolbar label="Drawer controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.open} label="Open" value="open" onChange={scenario.actions.setOpen} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.keepMounted} label="Keep mounted" value="keep-mounted" onChange={scenario.actions.setKeepMounted} />
        </ToolbarGroup>
        <ToolbarGroup title="Dismiss" value="dismiss">
          <MenuCheckboxControl checked={scenario.state.closeOnEscape} label="Escape closes" value="escape" onChange={scenario.actions.setCloseOnEscape} />
          <MenuCheckboxControl checked={scenario.state.closeOnBackdropClick} label="Backdrop closes" value="backdrop" onChange={scenario.actions.setCloseOnBackdropClick} />
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Placement" options={placementOptions} value={scenario.state.placement} onChange={(value) => scenario.actions.setPlacement(value as OverlayPlacement)} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  if (scenarioId === "menubar") {
    const scenario = scenarios.menubar;
    return (
      <ControlToolbar label="Menubar controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.closeOnSelect} label="Close on select" value="close-on-select" onChange={scenario.actions.setCloseOnSelect} />
          <MenuCheckboxControl checked={scenario.state.fileDisabled} label="File disabled" value="file-disabled" onChange={scenario.actions.setFileDisabled} />
        </ToolbarGroup>
        <ToolbarGroup title="Items" value="items">
          <MenuCheckboxControl checked={scenario.state.showGrid} label="Show grid" value="show-grid" onChange={scenario.actions.setShowGrid} />
          <MenuRadioControl label="Density" options={densityOptions} value={scenario.state.density} onChange={scenario.actions.setDensity} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  if (scenarioId === "navigation-menu") {
    const scenario = scenarios.navigationMenu;
    return (
      <ControlToolbar label="Navigation Menu controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.disabledItem} label="Docs disabled" value="docs-disabled" onChange={scenario.actions.setDisabledItem} />
          <MenuCheckboxControl checked={scenario.state.showIndicator} label="Show indicator" value="indicator" onChange={scenario.actions.setShowIndicator} />
          <MenuCheckboxControl checked={scenario.state.showViewport} label="Show viewport" value="viewport" onChange={scenario.actions.setShowViewport} />
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
          <MenuRadioControl label="Direction" options={directionOptions} value={scenario.state.dir} onChange={scenario.actions.setDir} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  if (scenarioId === "sidebar") {
    const scenario = scenarios.sidebar;
    return (
      <ControlToolbar label="Sidebar controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuRadioControl label="Value" options={sidebarStateOptions} value={scenario.state.state} onChange={scenario.actions.setState} />
          <MenuRadioControl label="Collapsed state" options={sidebarCollapsedStateOptions} value={scenario.state.collapsedState} onChange={scenario.actions.setCollapsedState} />
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Side" options={sidebarSideOptions} value={scenario.state.side} onChange={scenario.actions.setSide} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  if (scenarioId === "swipeable-item") {
    const scenario = scenarios.swipeableItem;
    return (
      <ControlToolbar label="Swipeable Item controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
          <MenuCheckboxControl checked={scenario.state.fullSwipe} label="Full swipe" value="full-swipe" onChange={scenario.actions.setFullSwipe} />
        </ToolbarGroup>
        <ToolbarGroup title="Behavior" value="behavior">
          <MenuCheckboxControl checked={scenario.state.closeOnActionClick} label="Action click closes" value="action-click-closes" onChange={scenario.actions.setCloseOnActionClick} />
          <MenuRadioControl label="Open threshold" options={swipeThresholdOptions} value={scenario.state.threshold} onChange={scenario.actions.setThreshold} />
          <MenuRadioControl label="Full-swipe threshold" options={swipeFullThresholdOptions} value={scenario.state.fullSwipeThreshold} onChange={scenario.actions.setFullSwipeThreshold} />
        </ToolbarGroup>
        <ToolbarGroup title="Open" value="open">
          <MenuRadioControl label="Side" options={swipeOpenSideOptions} value={scenario.state.openSide ?? "none"} onChange={(value) => scenario.actions.setOpenSide(value === "none" ? null : value)} />
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Direction" options={directionOptions} value={scenario.state.dir} onChange={scenario.actions.setDir} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.composition} onChange={scenario.actions.setComposition} />
          <MenuRadioControl label="Content" options={compositionOptions} value={scenario.state.contentComposition} onChange={scenario.actions.setContentComposition} />
          <MenuRadioControl label="Actions" options={compositionOptions} value={scenario.state.actionsComposition} onChange={scenario.actions.setActionsComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customContentSlot, label: "Content", value: "content-slot", onChange: scenario.actions.setCustomContentSlot },
            { checked: scenario.state.customActionsSlot, label: "Actions", value: "actions-slot", onChange: scenario.actions.setCustomActionsSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "toast") {
    const scenario = scenarios.toast;
    return (
      <ControlToolbar label="Toast controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.closeButton} label="Close button" value="close-button" onChange={scenario.actions.setCloseButton} />
          <MenuCheckboxControl checked={scenario.state.action} label="Action buttons" value="action" onChange={scenario.actions.setAction} />
          <MenuRadioControl label="Duration" options={toastDurationOptions} value={scenario.state.duration} onChange={scenario.actions.setDuration} />
        </ToolbarGroup>
        <ToolbarGroup title="Type" value="type">
          <MenuRadioControl label="Kind" options={toastKindOptions} value={scenario.state.type} onChange={scenario.actions.setType} />
        </ToolbarGroup>
        <ToolbarGroup title="Position" value="position">
          <MenuRadioControl label="Viewport" options={toastPositionOptions} value={scenario.state.position} onChange={scenario.actions.setPosition} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  if (scenarioId === "progress") {
    const scenario = scenarios.progress;
    return (
      <ControlToolbar label="Progress controls">
        <ToolbarGroup title="State" value="state">
          <MenuRadioControl label="Mode" options={progressModeOptions} value={scenario.state.mode} onChange={scenario.actions.setMode} />
          <MenuRadioControl label="Value" options={progressValueOptions} value={String(scenario.state.value)} onChange={(value) => scenario.actions.setValue(Number(value))} />
          <MenuCheckboxControl checked={scenario.state.customLabel} label="Custom value text" value="custom-label" onChange={scenario.actions.setCustomLabel} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.composition} onChange={scenario.actions.setComposition} />
          <MenuRadioControl label="Indicator" options={compositionOptions} value={scenario.state.indicatorComposition} onChange={scenario.actions.setIndicatorComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customIndicatorSlot, label: "Indicator Slot", value: "indicator-slot", onChange: scenario.actions.setCustomIndicatorSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "pressable") {
    const scenario = scenarios.pressable;
    return (
      <ControlToolbar label="Pressable controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
        </ToolbarGroup>
        <ToolbarGroup title="Events" value="events">
          <MenuCheckboxControl checked={scenario.state.blockClick} label="Block click" value="block-click" onChange={scenario.actions.setBlockClick} />
          <MenuCheckboxControl checked={scenario.state.showPointerCancelHelper} label="Show pointer cancel helper" value="show-pointer-cancel-helper" onChange={scenario.actions.setShowPointerCancelHelper} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "visually-hidden") {
    const scenario = scenarios.visuallyHidden;
    return (
      <ControlToolbar label="Visually Hidden controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.customStyle} label="Custom style" value="custom-style" onChange={scenario.actions.setCustomStyle} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "skip-link") {
    const scenario = scenarios.skipLink;
    return (
      <ControlToolbar label="Skip Link controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.focusTarget} label="Focus target" value="focus-target" onChange={scenario.actions.setFocusTarget} />
          <MenuCheckboxControl checked={scenario.state.blockClick} label="Block click" value="block-click" onChange={scenario.actions.setBlockClick} />
        </ToolbarGroup>
        <ToolbarGroup title="Target" value="target">
          <MenuRadioControl
            label="Href"
            options={[
              { label: "Valid", value: "valid" },
              { label: "Missing", value: "missing" },
              { label: "Malformed", value: "malformed" },
            ]}
            value={scenario.state.targetMode}
            onChange={(value) => scenario.actions.setTargetMode(value as SkipLinkTargetMode)}
          />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.composition} onChange={scenario.actions.setComposition} />
          <MenuRadioControl label="Target" options={compositionOptions} value={scenario.state.targetComposition} onChange={scenario.actions.setTargetComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customTargetSlot, label: "Target Slot", value: "target-slot", onChange: scenario.actions.setCustomTargetSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "collapsible") {
    const scenario = scenarios.collapsible;
    return (
      <ControlToolbar label="Collapsible controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.open} label="Open" value="open" onChange={scenario.actions.setOpen} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.keepMounted} label="Keep mounted" value="keep-mounted" onChange={scenario.actions.setKeepMounted} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.composition} onChange={scenario.actions.setComposition} />
          <MenuRadioControl label="Trigger" options={compositionOptions} value={scenario.state.triggerComposition} onChange={scenario.actions.setTriggerComposition} />
          <MenuRadioControl label="Content" options={compositionOptions} value={scenario.state.contentComposition} onChange={scenario.actions.setContentComposition} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  if (scenarioId === "toolbar") {
    const scenario = scenarios.toolbar;
    return (
      <ControlToolbar label="Toolbar controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.disabledButton} label="Redo disabled" value="disabled-button" onChange={scenario.actions.setDisabledButton} />
          <MenuCheckboxControl checked={scenario.state.disabledLink} label="Link disabled" value="disabled-link" onChange={scenario.actions.setDisabledLink} />
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
          <MenuRadioControl label="Direction" options={directionOptions} value={scenario.state.dir} onChange={scenario.actions.setDir} />
        </ToolbarGroup>
        <ToolbarGroup title="Toggles" value="toggles">
          <MenuRadioControl label="Type" options={toggleTypeOptions} value={scenario.state.toggleType} onChange={scenario.actions.setToggleType} />
          <MenuRadioControl label="Value" options={toolbarValueOptions} value={getToolbarValue(scenario.state.toggleValue)} onChange={(value) => scenario.actions.setToggleValue(scenario.state.toggleType === "single" ? value : [value])} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  if (scenarioId === "portal") {
    const scenario = scenarios.portal;
    return (
      <ControlToolbar label="Portal controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.mounted} label="Mounted" value="mounted" onChange={scenario.actions.noteMount} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disable portal" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.customContainer} label="Custom container" value="custom-container" onChange={scenario.actions.setCustomContainer} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "collection") {
    const scenario = scenarios.collection;
    return (
      <ControlToolbar label="Collection controls">
        <ToolbarGroup title="Navigation" value="navigation">
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.includeDisabled} label="Include disabled" value="include-disabled" onChange={scenario.actions.setIncludeDisabled} />
        </ToolbarGroup>
        <ToolbarGroup title="Items" value="items">
          <MenuCheckboxControl checked={scenario.state.disabledItem} label="Beta disabled" value="beta-disabled" onChange={scenario.actions.setDisabledItem} />
          <MenuCheckboxControl checked={scenario.state.reverseOrder} label="Reverse DOM order" value="reverse-order" onChange={scenario.actions.setReverseOrder} />
          <MenuCheckboxControl checked={scenario.state.duplicateValue} label="Duplicate alpha" value="duplicate-alpha" onChange={scenario.actions.setDuplicateValue} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  if (scenarioId === "virtualizer") {
    const scenario = scenarios.virtualizer;
    return (
      <ControlToolbar label="Virtualizer controls">
        <ToolbarGroup title="Items" value="items">
          <MenuRadioControl label="Count" options={virtualizerCountOptions} value={String(scenario.state.count)} onChange={(value) => scenario.actions.setCount(Number(value))} />
          <MenuCheckboxControl checked={scenario.state.variableSize} label="Variable size" value="variable-size" onChange={scenario.actions.setVariableSize} />
          <MenuCheckboxControl checked={scenario.state.zeroSize} label="Zero-size rows" value="zero-size" onChange={scenario.actions.setZeroSize} />
        </ToolbarGroup>
        <ToolbarGroup title="Scroll" value="scroll">
          <MenuRadioControl label="Overscan" options={virtualizerOverscanOptions} value={String(scenario.state.overscan)} onChange={(value) => scenario.actions.setOverscan(Number(value))} />
          <MenuRadioControl label="Align" options={virtualizerAlignOptions} value={scenario.state.align} onChange={(value) => scenario.actions.setAlign(value as VirtualizerAlignValue)} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  return null;
}

export function UtilityPrimitiveScenarioCanvas({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: UtilityPrimitiveScenarios;
}) {
  if (scenarioId === "direction") return <DirectionScenarioCanvas scenario={scenarios.direction} />;
  if (scenarioId === "modal") return <ModalScenarioCanvas scenario={scenarios.modal} />;
  if (scenarioId === "drawer") return <DrawerScenarioCanvas scenario={scenarios.drawer} />;
  if (scenarioId === "menubar") return <MenubarScenarioCanvas scenario={scenarios.menubar} />;
  if (scenarioId === "navigation-menu") return <NavigationMenuScenarioCanvas scenario={scenarios.navigationMenu} />;
  if (scenarioId === "sidebar") return <SidebarScenarioCanvas scenario={scenarios.sidebar} />;
  if (scenarioId === "swipeable-item") return <SwipeableItemScenarioCanvas scenario={scenarios.swipeableItem} />;
  if (scenarioId === "toast") return <ToastScenarioCanvas scenario={scenarios.toast} />;
  if (scenarioId === "progress") return <ProgressScenarioCanvas scenario={scenarios.progress} />;
  if (scenarioId === "pressable") return <PressableScenarioCanvas scenario={scenarios.pressable} />;
  if (scenarioId === "visually-hidden") return <VisuallyHiddenScenarioCanvas scenario={scenarios.visuallyHidden} />;
  if (scenarioId === "skip-link") return <SkipLinkScenarioCanvas scenario={scenarios.skipLink} />;
  if (scenarioId === "collapsible") return <CollapsibleScenarioCanvas scenario={scenarios.collapsible} />;
  if (scenarioId === "toolbar") return <ToolbarScenarioCanvas scenario={scenarios.toolbar} />;
  if (scenarioId === "portal") return <PortalScenarioCanvas scenario={scenarios.portal} />;
  if (scenarioId === "collection") return <CollectionScenarioCanvas scenario={scenarios.collection} />;
  if (scenarioId === "virtualizer") return <VirtualizerScenarioCanvas scenario={scenarios.virtualizer} />;
  return null;
}

export function UtilityPrimitiveScenarioAnatomy({
  scenarioId,
  scenarios,
  openGroups,
  onOpenGroupsChange,
}: {
  scenarioId: string;
  scenarios: UtilityPrimitiveScenarios;
  openGroups: Record<string, boolean>;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const sections = getUtilityPrimitiveSections(scenarioId, scenarios);
  return (
    <AnatomyPanel
      footer={`${sections.length} ${sections.length === 1 ? "part" : "parts"}`}
      openGroups={openGroups}
      sections={sections}
      onOpenGroupsChange={onOpenGroupsChange}
    />
  );
}

export function UtilityPrimitiveScenarioLog({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: UtilityPrimitiveScenarios;
}) {
  const log = getUtilityPrimitiveLog(scenarioId, scenarios);
  return <ScenarioEventLog log={log} />;
}

export function getUtilityPrimitiveEventCount(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
) {
  return getUtilityPrimitiveLog(scenarioId, scenarios).length;
}

export function clearUtilityPrimitiveLog(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
) {
  getUtilityPrimitiveActions(scenarioId, scenarios)?.clearLog();
}

export function getUtilityPrimitiveCanvasFooter(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
) {
  if (scenarioId === "direction") {
    const state = scenarios.direction.state;
    return `Direction ${state.dir} | Nested ${state.nested}`;
  }

  if (scenarioId === "modal") {
    const state = scenarios.modal.state;
    return `${state.open ? "Open" : "Closed"} | ${state.controlled ? "Controlled" : "Uncontrolled"} | Keep mounted ${state.keepMounted}`;
  }

  if (scenarioId === "drawer") {
    const state = scenarios.drawer.state;
    return `${state.open ? "Open" : "Closed"} | ${state.placement} | ${state.controlled ? "Controlled" : "Uncontrolled"}`;
  }

  if (scenarioId === "menubar") {
    const state = scenarios.menubar.state;
    return `Open ${state.value ?? "none"} | Loop ${state.loop} | Density ${state.density}`;
  }

  if (scenarioId === "navigation-menu") {
    const state = scenarios.navigationMenu.state;
    return `Open ${state.value ?? "none"} | ${state.orientation} | ${state.dir}`;
  }

  if (scenarioId === "sidebar") {
    const state = scenarios.sidebar.state;
    return `${state.state} | ${state.side} | Collapses to ${state.collapsedState}`;
  }

  if (scenarioId === "swipeable-item") {
    const state = scenarios.swipeableItem.state;
    return `Open ${state.openSide ?? "none"} | Direction ${state.dir} | Read only ${state.readOnly}`;
  }

  if (scenarioId === "toast") {
    const state = scenarios.toast.state;
    return `${state.type} | ${state.position} | ${state.duration}`;
  }

  if (scenarioId === "progress") {
    const state = scenarios.progress.state;
    return `Mode ${state.mode} | Value ${getProgressValue(state.mode, state.value) ?? "null"}`;
  }

  if (scenarioId === "pressable") {
    const state = scenarios.pressable.state;
    return `Pressed ${state.pressCount} | Disabled ${state.disabled} | ${state.composition}`;
  }

  if (scenarioId === "visually-hidden") {
    const state = scenarios.visuallyHidden.state;
    return `Hidden text | Custom style ${state.customStyle} | ${state.composition}`;
  }

  if (scenarioId === "skip-link") {
    const state = scenarios.skipLink.state;
    return `Focus target ${state.focusTarget} | Prevented ${state.defaultPrevented} | Hash ${state.hash}`;
  }

  if (scenarioId === "collapsible") {
    const state = scenarios.collapsible.state;
    return `${state.open ? "Open" : "Closed"} | ${state.controlled ? "Controlled" : "Uncontrolled"} | Keep mounted ${state.keepMounted}`;
  }

  if (scenarioId === "toolbar") {
    const state = scenarios.toolbar.state;
    return `${state.orientation} | ${state.dir} | Loop ${state.loop} | Value ${getToolbarValue(state.toggleValue)}`;
  }

  if (scenarioId === "portal") {
    const state = scenarios.portal.state;
    return `Mounted ${state.mounted} | Disable portal ${state.disabled} | Custom container ${state.customContainer}`;
  }

  if (scenarioId === "collection") {
    const state = scenarios.collection.state;
    const values = state.collection.getValues().join(", ") || "none";
    return `Active ${state.activeValue} | Values ${values} | Duplicate ${state.duplicateValue}`;
  }

  if (scenarioId === "virtualizer") {
    const state = scenarios.virtualizer.state;
    const range = getVirtualizerRangeLabel(state.virtualizer.items);
    return `Range ${range} | Total ${formatPx(state.virtualizer.totalSize)} | Offset ${formatPx(state.virtualizer.scrollOffset)}`;
  }

  return "";
}

export function getUtilityPrimitiveSource(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
) {
  if (scenarioId === "direction") {
    const state = scenarios.direction.state;
    const nestedDir = state.dir === "ltr" ? "rtl" : "ltr";
    const regionProps = sourceProps([
      state.propCheck ? `data-prop-check="region"` : null,
    ]);
    const nestedProps = sourceProps([
      state.propCheck ? `data-prop-check="nested"` : null,
    ]);
    return `<Direction.Provider dir="${state.dir}">
  <div dir="${state.dir}"${regionProps}>
    Outer direction: ${state.dir}
    ${state.nested ? `<Direction.Provider dir="${nestedDir}">
      <div dir="${nestedDir}"${nestedProps}>
        Nested direction: ${nestedDir}
      </div>
    </Direction.Provider>` : ""}
  </div>
</Direction.Provider>`;
  }

  if (scenarioId === "modal") {
    const state = scenarios.modal.state;
    const rootProps = [
      state.controlled ? "open={open}" : null,
      state.disabled ? "disabled" : null,
      state.keepMounted ? "keepMounted" : null,
      state.closeOnEscape ? null : "closeOnEscape={false}",
      state.closeOnBackdropClick ? null : "closeOnBackdropClick={false}",
      "onOpenChange={handleOpenChange}",
    ].filter(Boolean);
    const portalProps = sourceProps([
      state.portalDisabled ? "disabled" : null,
      state.customContainer ? "container={customContainer}" : null,
    ]);
    const triggerSource = getModalTriggerSource(state);
    const closeSource = getModalCloseSource(state);
    return `<Modal.Root${rootProps.length > 0 ? `\n  ${rootProps.join("\n  ")}\n` : ""}>
${indent(triggerSource, 2)}
  <Modal.Portal${portalProps}>
    <ModalContent>
      <Modal.Title${sourceProps([
        state.customTitleSlot ? `data-slot="modal-title-custom"` : null,
        state.propCheck ? `data-prop-check="title"` : null,
      ])}>Modal foundation</Modal.Title>
      <Modal.Description${sourceProps([
        state.customDescriptionSlot ? `data-slot="modal-description-custom"` : null,
        state.propCheck ? `data-prop-check="description"` : null,
      ])}>
        Shared modal IDs and controls.
      </Modal.Description>
      <Modal.Root open={nestedOpen} onOpenChange={handleNestedOpenChange}>
        <Modal.Trigger>Open Nested</Modal.Trigger>
        <Modal.Portal disabled>
          <ModalContent ariaLabel="Nested modal">
            <Modal.Close>Close Nested</Modal.Close>
          </ModalContent>
        </Modal.Portal>
      </Modal.Root>
${indent(closeSource, 6)}
    </ModalContent>
  </Modal.Portal>
</Modal.Root>`;
  }

  if (scenarioId === "drawer") {
    const state = scenarios.drawer.state;
    return `<Drawer.Root
  ${state.controlled ? "open={open}" : "defaultOpen={false}"}
  disabled={${state.disabled}}
  keepMounted={${state.keepMounted}}
  onOpenChange={handleOpenChange}
>
  <Drawer.Trigger>Open Drawer</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay />
    <Drawer.Content placement="${state.placement}">
      <Drawer.Title>Project drawer</Drawer.Title>
      <Drawer.Description>Drawer content with focus behavior.</Drawer.Description>
      <Drawer.Close>Close</Drawer.Close>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>`;
  }

  if (scenarioId === "menubar") {
    const state = scenarios.menubar.state;
    return `<Menubar.Root
  ${state.controlled ? "value={value}" : ""}
  loop={${state.loop}}
  onValueChange={handleValueChange}
>
  <Menubar.Menu value="file" closeOnSelect={${state.closeOnSelect}}>
    <Menubar.Trigger>File</Menubar.Trigger>
    <Menubar.Content>
      <Menubar.Item>New project</Menubar.Item>
      <Menubar.CheckboxItem checked={showGrid}>Show grid</Menubar.CheckboxItem>
    </Menubar.Content>
  </Menubar.Menu>
</Menubar.Root>`;
  }

  if (scenarioId === "navigation-menu") {
    const state = scenarios.navigationMenu.state;
    return `<NavigationMenu.Root
  orientation="${state.orientation}"
  dir="${state.dir}"
  ${state.controlled ? "value={value}" : ""}
  onValueChange={handleValueChange}
>
  <NavigationMenu.List>
    <NavigationMenu.Item value="products">
      <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
      <NavigationMenu.Content>Product links</NavigationMenu.Content>
    </NavigationMenu.Item>
    <NavigationMenu.Item value="docs">
      <NavigationMenu.Trigger disabled={${state.disabledItem}}>Docs</NavigationMenu.Trigger>
      <NavigationMenu.Content>Documentation links</NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
  ${state.showIndicator ? "<NavigationMenu.Indicator />" : ""}
  ${state.showViewport ? "<NavigationMenu.Viewport />" : ""}
</NavigationMenu.Root>`;
  }

  if (scenarioId === "sidebar") {
    const state = scenarios.sidebar.state;
    return `<Sidebar.Root
  ${state.controlled ? "state={state}" : `defaultState="${state.state}"`}
  collapsedState="${state.collapsedState}"
  side="${state.side}"
  disabled={${state.disabled}}
  onStateChange={setState}
>
  <Sidebar.Panel aria-label="Project navigation" />
  <Sidebar.Main>
    <Sidebar.Trigger>Toggle Sidebar</Sidebar.Trigger>
  </Sidebar.Main>
</Sidebar.Root>`;
  }

  if (scenarioId === "swipeable-item") {
    const state = scenarios.swipeableItem.state;
    const rootProps = sourceProps([
      state.controlled ? "openSide={openSide}" : state.openSide ? `defaultOpenSide="${state.openSide}"` : null,
      state.disabled ? "disabled" : null,
      state.readOnly ? "readOnly" : null,
      state.threshold !== "0.35" ? `threshold={${state.threshold}}` : null,
      state.fullSwipeThreshold !== "0.6" ? `fullSwipeThreshold={${state.fullSwipeThreshold}}` : null,
      state.customRootSlot ? `data-slot="swipeable-item-root-custom"` : "",
      state.propCheck ? `data-prop-check="root"` : "",
      "onOpenSideChange={setOpenSide}",
      state.fullSwipe ? "onFullSwipe={handleFullSwipe}" : "",
    ]);
    const contentExtras = sourceProps([
      state.customContentSlot ? `data-slot="swipeable-item-content-custom"` : "",
      state.propCheck ? `data-prop-check="content"` : "",
    ]);
    const actionsExtras = (side: "start" | "end") => sourceProps([
      state.closeOnActionClick ? "" : "closeOnClick={false}",
      state.customActionsSlot ? `data-slot="swipeable-item-actions-custom"` : "",
      state.propCheck ? `data-prop-check="actions-${side}"` : "",
    ]);
    const contentSource = state.contentComposition === "asChild"
      ? `<SwipeableItem.Content${contentExtras} asChild>
    <article>Swipeable message</article>
  </SwipeableItem.Content>`
      : state.contentComposition === "render"
        ? `<SwipeableItem.Content${contentExtras} render={(props) => <article {...props}>Swipeable message</article>} />`
        : `<SwipeableItem.Content${contentExtras}>Swipeable message</SwipeableItem.Content>`;
    const actionSource = (side: "start" | "end", label: string) => {
      const props = ` side="${side}"${actionsExtras(side)}`;
      if (state.actionsComposition === "asChild") {
        return `<SwipeableItem.Actions${props} asChild>
    <aside>${label}</aside>
  </SwipeableItem.Actions>`;
      }
      if (state.actionsComposition === "render") {
        return `<SwipeableItem.Actions${props} render={(props) => <aside {...props}>${label}</aside>} />`;
      }
      return `<SwipeableItem.Actions${props}>${label}</SwipeableItem.Actions>`;
    };
    const rootOpen = state.composition === "asChild"
      ? `<SwipeableItem.Root${rootProps} asChild>\n  <section>`
      : `<SwipeableItem.Root${rootProps}>`;
    const rootClose = state.composition === "asChild" ? `  </section>\n</SwipeableItem.Root>` : `</SwipeableItem.Root>`;
    const source = state.composition === "render"
      ? `<SwipeableItem.Root${rootProps} render={(props) => (
  <section {...props}>
    ${indent(actionSource("start", "Archive"), 4).trim()}
    ${indent(contentSource, 4).trim()}
    ${indent(actionSource("end", "Delete"), 4).trim()}
  </section>
)} />`
      : `${rootOpen}
  ${indent(actionSource("start", "Archive"), 2).trim()}
  ${indent(contentSource, 2).trim()}
  ${indent(actionSource("end", "Delete"), 2).trim()}
${rootClose}`;

    return state.dir === "rtl" ? `<Direction.Provider dir="rtl">\n${source}\n</Direction.Provider>` : source;
  }

  if (scenarioId === "toast") {
    const state = scenarios.toast.state;
    const toastCall = state.type === "default"
      ? `toast({ type: "default", title: "Default toast" })`
      : `toast.${state.type}("${formatOption(state.type)} toast")`;
    return `<Toast.Provider closeButton={${state.closeButton}} maxVisible={3}>
  <button onClick={() => ${toastCall}}>
    Show Toast
  </button>
  <Toast.Viewport position="${state.position}" />
</Toast.Provider>`;
  }

  if (scenarioId === "progress") {
    const state = scenarios.progress.state;
    const value = getProgressValue(state.mode, state.value);
    const min = getProgressMin(state.mode);
    const max = getProgressMax(state.mode);
    const rootProps = [
      `aria-label="Task progress"`,
      `value={${String(value)}}`,
      min !== 0 ? `min={${min}}` : "",
      max !== 100 ? `max={${max}}` : "",
      state.customLabel ? `getValueLabel={(value, min, max) => \`\${value - min} of \${max - min} steps\`}` : "",
      state.customRootSlot ? `data-slot="progress-custom"` : "",
      state.propCheck ? `data-prop-check="root"` : "",
    ].filter(Boolean);
    const rootOpen = `<Progress.Root${rootProps.length ? `\n  ${rootProps.join("\n  ")}` : ""}`;
    const indicator = getProgressIndicatorSource(state);

    if (state.composition === "asChild") {
      return `${rootOpen}
  asChild
>
  <section>
${indent(indicator, 4)}
  </section>
</Progress.Root>`;
    }

    if (state.composition === "render") {
      return `${rootOpen}
  render={(props) => (
    <section {...props}>
${indent(indicator, 6)}
    </section>
  )}
/>`;
    }

    return `${rootOpen}>
${indent(indicator, 2)}
</Progress.Root>`;
  }

  if (scenarioId === "pressable") {
    const state = scenarios.pressable.state;
    const disabledProp = state.disabled ? " disabled" : "";
    const clickHandler = state.blockClick ? " onClick={(event) => event.preventDefault()}" : "";
    const rootProps = sourceProps([
      state.customRootSlot ? `data-slot="pressable-root-custom"` : null,
      state.propCheck ? `data-prop-check="root"` : null,
    ]);

    if (state.composition === "asChild") {
      return `<Pressable.Root${rootProps}${disabledProp}${clickHandler}
  asChild
  onKeyUp={handleKeyUp}
  onPointerCancel={handlePointerCancel}
  onPress={handlePress}
>
  <article>
    <strong>Project Alpha</strong>
    <span>Open project details</span>
  </article>
</Pressable.Root>`;
    }

    if (state.composition === "render") {
      return `<Pressable.Root${rootProps}${disabledProp}${clickHandler}
  render={(props) => (
    <div {...props}>
      <strong>Project Alpha</strong>
      <span>Open project details</span>
    </div>
  )}
  onKeyUp={handleKeyUp}
  onPointerCancel={handlePointerCancel}
  onPress={handlePress}
/>`;
    }

    return `<Pressable.Root${rootProps}${disabledProp}${clickHandler}
  onKeyUp={handleKeyUp}
  onPointerCancel={handlePointerCancel}
  onPress={handlePress}
>
  <strong>Project Alpha</strong>
  <span>Open project details</span>
</Pressable.Root>`;
  }

  if (scenarioId === "visually-hidden") {
    const state = scenarios.visuallyHidden.state;
    const rootProps = sourceProps([
      state.customRootSlot ? `data-slot="visually-hidden-custom"` : null,
      state.propCheck ? `data-prop-check="root"` : null,
    ]);
    const visuallyHiddenSource = state.composition === "asChild"
      ? `<VisuallyHidden.Root${rootProps} asChild>
    <strong>Search the workspace</strong>
  </VisuallyHidden.Root>`
      : state.composition === "render"
        ? `<VisuallyHidden.Root${rootProps}
    render={(props) => <em {...props}>Search the workspace</em>}
  />`
        : `<VisuallyHidden.Root${rootProps}>Search the workspace</VisuallyHidden.Root>`;

    return `<button type="button">
  Search
  ${visuallyHiddenSource}
</button>`;
  }

  if (scenarioId === "skip-link") {
    const state = scenarios.skipLink.state;
    const href = state.targetMode === "missing" ? "#missing-target" : state.targetMode === "malformed" ? "#bad%EA" : "#playground-skip-target";
    const rootProps = sourceProps([
      state.customRootSlot ? `data-slot="skip-link-custom"` : null,
      state.propCheck ? `data-prop-check="root"` : null,
    ]);
    const targetProps = sourceProps([
      state.customTargetSlot ? `data-slot="skip-link-target-custom"` : null,
      state.propCheck ? `data-prop-check="target"` : null,
    ]);
    const rootSource = state.composition === "asChild"
      ? `<SkipLink.Root href="${href}" focusTarget={${state.focusTarget}}${rootProps} asChild>
  <a>Skip to content</a>
</SkipLink.Root>`
      : state.composition === "render"
        ? `<SkipLink.Root
  href="${href}"
  focusTarget={${state.focusTarget}}
  ${rootProps.trim()}
  render={(props) => <a {...props}>Skip to content</a>}
/>`
        : `<SkipLink.Root href="${href}" focusTarget={${state.focusTarget}}${rootProps}>
  Skip to content
</SkipLink.Root>`;
    const targetSource = state.targetComposition === "asChild"
      ? `<SkipLink.Target id="playground-skip-target"${targetProps} asChild>
  <section>Main content</section>
</SkipLink.Target>`
      : state.targetComposition === "render"
        ? `<SkipLink.Target
  id="playground-skip-target"
  ${targetProps.trim()}
  render={(props) => <section {...props}>Main content</section>}
/>`
        : `<SkipLink.Target id="playground-skip-target"${targetProps}>
  Main content
</SkipLink.Target>`;
    return `${rootSource}
${targetSource}`;
  }

  if (scenarioId === "collapsible") {
    const state = scenarios.collapsible.state;
    return `<Collapsible.Root
  ${state.controlled ? `open={open}` : `defaultOpen={false}`}
  disabled={${state.disabled}}
  onOpenChange={setOpen}
>
  <Collapsible.Trigger>Details</Collapsible.Trigger>
  <Collapsible.Content keepMounted={${state.keepMounted}}>
    More information
  </Collapsible.Content>
</Collapsible.Root>`;
  }

  if (scenarioId === "toolbar") {
    const state = scenarios.toolbar.state;
    return `<Toolbar.Root
  ariaLabel="Formatting"
  orientation="${state.orientation}"
  dir="${state.dir}"
  loop={${state.loop}}
>
  <Toolbar.Button>Undo</Toolbar.Button>
  <Toolbar.Button disabled={${state.disabledButton}}>Redo</Toolbar.Button>
  <Toolbar.Separator />
  <Toolbar.ToggleGroup type="${state.toggleType}" value={value}>
    <Toolbar.ToggleItem value="bold">B</Toolbar.ToggleItem>
    <Toolbar.ToggleItem value="italic">I</Toolbar.ToggleItem>
  </Toolbar.ToggleGroup>
  <Toolbar.Link href="#toolbar-link" disabled={${state.disabledLink}}>Help</Toolbar.Link>
</Toolbar.Root>`;
  }

  if (scenarioId === "portal") {
    const state = scenarios.portal.state;
    const contentProps = sourceProps([
      state.propCheck ? `data-prop-check="content"` : null,
    ]);
    return `<Portal
  disabled={${state.disabled}}
  container={${state.customContainer ? "containerElement" : "undefined"}}
>
  <div${contentProps}>Portaled content</div>
</Portal>`;
  }

  if (scenarioId === "collection") {
    const state = scenarios.collection.state;
    return `const collection = useCollection<string, HTMLButtonElement>();

const next = collection.getNextItem(activeValue, "next", {
  loop: ${state.loop},
  includeDisabled: ${state.includeDisabled},
});

<button
  ref={(element) => {
    if (element) collection.registerItem("alpha", element);
    else collection.unregisterItem("alpha");
  }}
>
  Alpha
</button>`;
  }

  if (scenarioId === "virtualizer") {
    const state = scenarios.virtualizer.state;
    return `const virtualizer = useVirtualizer({
  count: ${state.count},
  estimateSize: (index) => {
    ${state.zeroSize ? "if (index % 11 === 0) return 0;" : ""}
    ${state.variableSize ? "if (index % 5 === 0) return 64;\n    if (index % 3 === 0) return 52;\n    return 40;" : "return 44;"}
  },
  overscan: ${state.overscan},
  getItemKey: (index) => \`row-\${index + 1}\`,
});

<div ref={virtualizer.scrollRef} tabIndex={0}>
  <div style={{ height: virtualizer.totalSize }}>
    {virtualizer.items.map((virtualItem) => (
      <div
        key={virtualItem.key}
        ref={virtualizer.getItemRef(virtualItem.index)}
      >
        Row {virtualItem.index + 1}
      </div>
    ))}
  </div>
</div>`;
  }

  return "// No source example for this scenario yet.";
}

function DirectionScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useDirectionScenario> }) {
  return (
    <div className="utility-primitive-stage">
      <Direction.Provider dir={scenario.state.dir}>
        <div
          className="utility-direction-demo"
          dir={scenario.state.dir}
          data-direction-region=""
          data-playground-inspect=""
          data-prop-check={scenario.state.propCheck ? "region" : undefined}
          onClick={() => scenario.actions.noteDirection(scenario.state.dir)}
        >
          <DirectionValueProbe label="Outer direction" />
          {scenario.state.nested ? (
            <Direction.Provider dir={scenario.state.dir === "ltr" ? "rtl" : "ltr"}>
              <div
                className="utility-direction-nested"
                dir={scenario.state.dir === "ltr" ? "rtl" : "ltr"}
                data-direction-nested=""
                data-playground-inspect=""
                data-prop-check={scenario.state.propCheck ? "nested" : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  scenario.actions.noteDirection(scenario.state.dir === "ltr" ? "rtl" : "ltr");
                }}
              >
                <DirectionValueProbe label="Nested direction" />
              </div>
            </Direction.Provider>
          ) : null}
        </div>
      </Direction.Provider>
    </div>
  );
}

function DirectionValueProbe({ label }: { label: string }) {
  const dir = useDirection();
  return (
    <span data-direction-value="" data-playground-inspect="">
      {label}: {dir}
    </span>
  );
}

function ModalScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useModalScenario> }) {
  const [customContainerNode, setCustomContainerNode] = useState<HTMLDivElement | null>(null);
  const rootProps = {
    disabled: scenario.state.disabled,
    keepMounted: scenario.state.keepMounted,
    closeOnEscape: scenario.state.closeOnEscape,
    closeOnBackdropClick: scenario.state.closeOnBackdropClick,
    onOpenChange: scenario.actions.handleOpenChange,
    ...(scenario.state.controlled ? { open: scenario.state.open } : { defaultOpen: false }),
  };
  const portalProps = {
    disabled: scenario.state.portalDisabled,
    container: scenario.state.customContainer ? customContainerNode : undefined,
  };

  return (
    <div className="utility-primitive-stage">
      {scenario.state.customContainer ? (
        <div
          className="utility-modal-container"
          data-modal-container=""
          data-playground-inspect=""
          ref={setCustomContainerNode}
        />
      ) : null}
      <Modal.Root {...rootProps}>
        <ModalTriggerDemo scenario={scenario} />
        <Modal.Portal {...portalProps}>
          <ModalScenarioContent scenario={scenario} />
        </Modal.Portal>
      </Modal.Root>
    </div>
  );
}

function ModalTriggerDemo({ scenario }: { scenario: ReturnType<typeof useModalScenario> }) {
  const triggerProps = {
    className: "atom-button",
    "data-modal-trigger": "",
    "data-playground-inspect": "",
    onClick: scenario.state.blockTriggerEvent
      ? (event: MouseEvent<HTMLElement>) => {
          event.preventDefault();
          scenario.actions.noteModalEvent("trigger event prevented");
        }
      : undefined,
    ...partProps("trigger", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customTriggerSlot }, "modal-trigger-custom"),
  };

  if (scenario.state.triggerComposition === "asChild") {
    return (
      <Modal.Trigger {...triggerProps} asChild>
        <span className="atom-button">Open Modal</span>
      </Modal.Trigger>
    );
  }

  if (scenario.state.triggerComposition === "render") {
    return (
      <Modal.Trigger
        {...triggerProps}
        render={(props: Record<string, unknown>) => (
          <button {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} type="button">
            Open Modal
          </button>
        )}
      >
        Open Modal
      </Modal.Trigger>
    );
  }

  return (
    <Modal.Trigger {...triggerProps}>
      Open Modal
    </Modal.Trigger>
  );
}

function ModalScenarioContent({ scenario }: { scenario: ReturnType<typeof useModalScenario> }) {
  const {
    isPresent,
    isHidden,
    dataState,
    contentProps,
    presenceRef,
    onClose,
    closeOnBackdropClick,
  } = useModalContent({ role: "dialog" });

  if (!isPresent) return null;

  const content = (
    <section
      {...contentProps}
      className="utility-modal-surface"
      data-modal-surface=""
      data-playground-inspect=""
      data-state={dataState}
      ref={presenceRef}
      hidden={isHidden}
      aria-hidden={isHidden ? "true" : undefined}
    >
      <Modal.Title
        className="utility-modal-title"
        data-modal-title=""
        data-playground-inspect=""
        {...partProps("title", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customTitleSlot }, "modal-title-custom")}
      >
        Modal foundation
      </Modal.Title>
      <Modal.Description
        className="utility-modal-description"
        data-modal-description=""
        data-playground-inspect=""
        {...partProps("description", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customDescriptionSlot }, "modal-description-custom")}
      >
        Shared state, IDs, portal, title, description, and close behavior.
      </Modal.Description>
      <Modal.Root
        open={scenario.state.nestedOpen}
        onOpenChange={scenario.actions.handleNestedOpenChange}
      >
        <Modal.Trigger className="atom-button secondary" data-modal-nested-trigger="" data-playground-inspect="">
          Open Nested
        </Modal.Trigger>
        <Modal.Portal disabled>
          <ModalNestedContent />
        </Modal.Portal>
      </Modal.Root>
      <div className="utility-modal-actions">
        <button className="atom-button secondary" data-modal-cancel="" data-playground-inspect="" type="button" onClick={() => onClose("cancelClick")}>
          Cancel
        </button>
        <button className="atom-button secondary" data-modal-action="" data-playground-inspect="" type="button" onClick={() => onClose("actionClick")}>
          Save
        </button>
        <ModalCloseDemo scenario={scenario} />
      </div>
    </section>
  );

  if (isHidden) {
    return (
      <div hidden aria-hidden="true" data-modal-hidden-wrapper="">
        {content}
      </div>
    );
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="utility-modal-overlay"
        data-modal-overlay=""
        data-playground-inspect=""
        data-state={dataState}
        onClick={() => {
          if (closeOnBackdropClick) onClose("backdropClick");
        }}
      />
      {content}
    </>
  );
}

function ModalCloseDemo({ scenario }: { scenario: ReturnType<typeof useModalScenario> }) {
  const closeProps = {
    className: "atom-button secondary",
    "data-modal-close": "",
    "data-playground-inspect": "",
    onClick: scenario.state.blockCloseEvent
      ? (event: MouseEvent<HTMLElement>) => {
          event.preventDefault();
          scenario.actions.noteModalEvent("close event prevented");
        }
      : undefined,
    ...partProps("close", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customCloseSlot }, "modal-close-custom"),
  };

  if (scenario.state.closeComposition === "asChild") {
    return (
      <Modal.Close {...closeProps} asChild>
        <span className="atom-button secondary">Close Modal</span>
      </Modal.Close>
    );
  }

  if (scenario.state.closeComposition === "render") {
    return (
      <Modal.Close
        {...closeProps}
        render={(props: Record<string, unknown>) => (
          <button {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} type="button">
            Close Modal
          </button>
        )}
      >
        Close Modal
      </Modal.Close>
    );
  }

  return (
    <Modal.Close {...closeProps}>
      Close Modal
    </Modal.Close>
  );
}

function ModalNestedContent() {
  const { isPresent, dataState, contentProps, presenceRef, onClose } = useModalContent({ role: "dialog", ariaLabel: "Nested modal" });

  if (!isPresent) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="utility-modal-overlay nested"
        data-modal-nested-overlay=""
        data-playground-inspect=""
        data-state={dataState}
        onClick={() => onClose("backdropClick")}
      />
      <section
        {...contentProps}
        className="utility-modal-surface nested"
        data-modal-nested-surface=""
        data-playground-inspect=""
        data-state={dataState}
        ref={presenceRef}
      >
        <h3 className="utility-modal-title">Nested modal</h3>
        <p className="utility-modal-description">Use Escape to confirm the nested layer closes before the parent.</p>
        <Modal.Close className="atom-button secondary" data-modal-nested-close="" data-playground-inspect="">
          Close Nested
        </Modal.Close>
      </section>
    </>
  );
}

function DrawerScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useDrawerScenario> }) {
  const rootProps = {
    disabled: scenario.state.disabled,
    keepMounted: scenario.state.keepMounted,
    closeOnEscape: scenario.state.closeOnEscape,
    closeOnBackdropClick: scenario.state.closeOnBackdropClick,
    onOpenChange: scenario.actions.handleOpenChange,
    ...(scenario.state.controlled ? { open: scenario.state.open } : { defaultOpen: false }),
  };

  return (
    <div className="utility-primitive-stage">
      <Drawer.Root {...rootProps}>
        <Drawer.Trigger className="atom-button" data-drawer-trigger="" data-playground-inspect="" data-prop-check="trigger">
          Open Drawer
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="utility-drawer-overlay" data-drawer-overlay="" data-playground-inspect="" />
          <Drawer.Content
            ariaLabel="Project drawer"
            className={`utility-drawer-content ${scenario.state.placement}`}
            data-drawer-content=""
            data-playground-inspect=""
            data-prop-check="content"
            placement={scenario.state.placement}
          >
            <Drawer.Title className="utility-modal-title" data-playground-inspect="">Project drawer</Drawer.Title>
            <Drawer.Description className="utility-modal-description" data-playground-inspect="">
              Change a project setting, then close the drawer.
            </Drawer.Description>
            <button className="atom-button secondary" type="button">Focusable action</button>
            <Drawer.Close className="atom-button" data-drawer-close="" data-playground-inspect="" data-prop-check="close">
              Close Drawer
            </Drawer.Close>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function MenubarScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useMenubarScenario> }) {
  const rootProps = {
    className: "utility-menubar",
    "data-menubar-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    loop: scenario.state.loop,
    onValueChange: scenario.actions.handleValueChange,
    ...(scenario.state.controlled ? { value: scenario.state.value } : {}),
  };

  return (
    <div className="utility-primitive-stage">
      <Menubar.Root {...rootProps}>
        <Menubar.Menu value="file" closeOnSelect={scenario.state.closeOnSelect}>
          <Menubar.Trigger className="utility-menubar-trigger" data-menubar-trigger-file="" data-playground-inspect="" disabled={scenario.state.fileDisabled}>
            File
          </Menubar.Trigger>
          <Menubar.Content className="playground-menu-content" ariaLabel="File menu" data-menubar-content-file="" data-playground-inspect="">
            <Menubar.Item className="playground-menu-item" value="new" data-menubar-item-new="" data-playground-inspect="" onSelect={() => scenario.actions.noteSelect("new")}>
              New project
            </Menubar.Item>
            <Menubar.Separator className="playground-menu-separator" data-menubar-separator="" />
            <Menubar.CheckboxItem className="playground-menu-item" checked={scenario.state.showGrid} value="grid" data-menubar-checkbox="" data-playground-inspect="" onCheckedChange={scenario.actions.setShowGrid}>
              <span>Show grid</span>
              <span className="playground-menu-check" aria-hidden="true" />
            </Menubar.CheckboxItem>
          </Menubar.Content>
        </Menubar.Menu>
        <Menubar.Menu value="view" closeOnSelect={false}>
          <Menubar.Trigger className="utility-menubar-trigger" data-menubar-trigger-view="" data-playground-inspect="">
            View
          </Menubar.Trigger>
          <Menubar.Content className="playground-menu-content" ariaLabel="View menu" data-menubar-content-view="" data-playground-inspect="">
            <Menubar.RadioGroup value={scenario.state.density} onValueChange={scenario.actions.setDensity}>
              <Menubar.RadioItem className="playground-menu-item" value="compact" data-menubar-radio="" data-playground-inspect="">
                <span>Compact</span>
                <span className="playground-menu-radio" aria-hidden="true" />
              </Menubar.RadioItem>
              <Menubar.RadioItem className="playground-menu-item" value="comfortable" data-menubar-radio="" data-playground-inspect="">
                <span>Comfortable</span>
                <span className="playground-menu-radio" aria-hidden="true" />
              </Menubar.RadioItem>
            </Menubar.RadioGroup>
          </Menubar.Content>
        </Menubar.Menu>
      </Menubar.Root>
    </div>
  );
}

function NavigationMenuScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useNavigationMenuScenario> }) {
  const rootProps = {
    className: `utility-navigation-menu ${scenario.state.orientation}`,
    "data-navigation-menu-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    dir: scenario.state.dir,
    orientation: scenario.state.orientation,
    onValueChange: scenario.actions.handleValueChange,
    ...(scenario.state.controlled ? { value: scenario.state.value } : {}),
  };

  return (
    <div className="utility-primitive-stage">
      <NavigationMenu.Root {...rootProps}>
        <NavigationMenu.List className="utility-navigation-list" data-navigation-menu-list="" data-playground-inspect="">
          <NavigationMenu.Item value="products" data-navigation-menu-item="products" data-playground-inspect="" data-prop-check="item-products">
            <NavigationMenu.Trigger className="utility-navigation-trigger" data-navigation-menu-trigger="products" data-playground-inspect="" data-prop-check="trigger">
              Products
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="utility-navigation-content" data-navigation-menu-content="products" data-playground-inspect="" data-prop-check="content">
              <div className="utility-navigation-panel">
                <NavigationMenu.Link className="utility-navigation-link" href="#components" data-navigation-menu-link="components" data-playground-inspect="" data-prop-check="link" onSelect={() => scenario.actions.noteLink("components")}>
                  Components
                </NavigationMenu.Link>
                <NavigationMenu.Link className="utility-navigation-link" href="#templates" data-navigation-menu-link="templates" data-playground-inspect="" onSelect={() => scenario.actions.noteLink("templates")}>
                  Templates
                </NavigationMenu.Link>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item value="docs" data-navigation-menu-item="docs" data-playground-inspect="">
            <NavigationMenu.Trigger className="utility-navigation-trigger" data-navigation-menu-trigger="docs" data-playground-inspect="" disabled={scenario.state.disabledItem}>
              Docs
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="utility-navigation-content" data-navigation-menu-content="docs" data-playground-inspect="">
              <div className="utility-navigation-panel">
                <NavigationMenu.Link className="utility-navigation-link" href="#guide" data-navigation-menu-link="guide" data-playground-inspect="" active onSelect={() => scenario.actions.noteLink("guide")}>
                  Guide
                </NavigationMenu.Link>
                <NavigationMenu.Link className="utility-navigation-link" href="#api" data-navigation-menu-link="api" data-playground-inspect="" onSelect={() => scenario.actions.noteLink("api")}>
                  API Reference
                </NavigationMenu.Link>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          {scenario.state.showIndicator ? (
            <NavigationMenu.Indicator className="utility-navigation-indicator" data-navigation-menu-indicator="" data-playground-inspect="" data-prop-check="indicator" />
          ) : null}
        </NavigationMenu.List>
        {scenario.state.showViewport ? (
          <NavigationMenu.Viewport className="utility-navigation-viewport" data-navigation-menu-viewport="" data-playground-inspect="" data-prop-check="viewport" />
        ) : null}
      </NavigationMenu.Root>
    </div>
  );
}

function SidebarScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useSidebarScenario> }) {
  const rootProps = {
    className: `utility-sidebar ${scenario.state.side}`,
    "data-sidebar-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    collapsedState: scenario.state.collapsedState,
    disabled: scenario.state.disabled,
    side: scenario.state.side,
    onStateChange: scenario.actions.setState,
    ...(scenario.state.controlled ? { state: scenario.state.state } : { defaultState: scenario.state.state }),
  };

  return (
    <div className="utility-primitive-stage utility-sidebar-stage">
      <Sidebar.Root {...rootProps}>
        <Sidebar.Panel className="utility-sidebar-panel" aria-label="Project navigation" data-sidebar-panel="" data-playground-inspect="" data-prop-check="panel">
          <strong>Project</strong>
          <a href="#overview">Overview</a>
          <a href="#settings">Settings</a>
          <a href="#activity">Activity</a>
        </Sidebar.Panel>
        <Sidebar.Main className="utility-sidebar-main" data-sidebar-main="" data-playground-inspect="" data-prop-check="main">
          <Sidebar.Trigger className="atom-button" data-sidebar-trigger="" data-playground-inspect="" data-prop-check="trigger">
            Toggle Sidebar
          </Sidebar.Trigger>
          <div className="utility-sidebar-actions">
            <Sidebar.Trigger className="atom-button secondary" toState="expanded" data-sidebar-trigger-expand="" data-playground-inspect="">
              Expand
            </Sidebar.Trigger>
            <Sidebar.Trigger className="atom-button secondary" toState={scenario.state.collapsedState} data-sidebar-trigger-collapse="" data-playground-inspect="">
              Collapse
            </Sidebar.Trigger>
          </div>
        </Sidebar.Main>
      </Sidebar.Root>
    </div>
  );
}

function SwipeableItemScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useSwipeableItemScenario> }) {
  const rootProps = {
    className: "utility-swipeable",
    "data-swipeable-root": "",
    "data-playground-inspect": "",
    ...partProps("root", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customRootSlot }, "swipeable-item-root-custom"),
    disabled: scenario.state.disabled,
    readOnly: scenario.state.readOnly,
    onFullSwipe: scenario.state.fullSwipe ? scenario.actions.noteFullSwipe : undefined,
    threshold: Number(scenario.state.threshold),
    fullSwipeThreshold: Number(scenario.state.fullSwipeThreshold),
    onOpenSideChange: scenario.actions.setOpenSide,
    ...(scenario.state.controlled ? { openSide: scenario.state.openSide } : { defaultOpenSide: scenario.state.openSide }),
  };

  const startActions = (
    <SwipeableActionsExample
      className="utility-swipe-actions start"
      customSlot={scenario.state.customActionsSlot}
      closeOnClick={scenario.state.closeOnActionClick}
      mode={scenario.state.actionsComposition}
      onAction={() => scenario.actions.noteAction("archive")}
      propCheck={scenario.state.propCheck}
      side="start"
    >
      Archive
    </SwipeableActionsExample>
  );
  const content = (
    <SwipeableContentExample
      customSlot={scenario.state.customContentSlot}
      mode={scenario.state.contentComposition}
      propCheck={scenario.state.propCheck}
    />
  );
  const endActions = (
    <SwipeableActionsExample
      className="utility-swipe-actions end"
      customSlot={scenario.state.customActionsSlot}
      closeOnClick={scenario.state.closeOnActionClick}
      mode={scenario.state.actionsComposition}
      onAction={() => scenario.actions.noteAction("delete")}
      propCheck={scenario.state.propCheck}
      side="end"
    >
      Delete
    </SwipeableActionsExample>
  );
  const children = (
    <>
      {startActions}
      {content}
      {endActions}
    </>
  );

  return (
    <div className="utility-primitive-stage">
      <SwipeableDirectionProvider dir={scenario.state.dir}>
        {scenario.state.composition === "asChild" ? (
          <SwipeableItem.Root {...rootProps} asChild>
            <section>{children}</section>
          </SwipeableItem.Root>
        ) : scenario.state.composition === "render" ? (
          <SwipeableItem.Root {...rootProps} render={(renderProps) => <section {...renderProps}>{children}</section>} />
        ) : (
          <SwipeableItem.Root {...rootProps}>{children}</SwipeableItem.Root>
        )}
      </SwipeableDirectionProvider>
    </div>
  );
}

function SwipeableDirectionProvider({ children, dir }: { children: ReactNode; dir: TextDirection }) {
  if (dir === "ltr") return <>{children}</>;
  return <Direction.Provider dir="rtl">{children}</Direction.Provider>;
}

function SwipeableContentExample({
  customSlot,
  mode,
  propCheck,
}: {
  customSlot: boolean;
  mode: CompositionMode;
  propCheck: boolean;
}) {
  const props = {
    className: "utility-swipe-content",
    "data-canvas-focus": "",
    "data-swipeable-content": "",
    "data-playground-inspect": "",
    ...partProps("content", { propCheck, customSlot }, "swipeable-item-content-custom"),
  };
  const children = (
    <>
      <strong>Design review</strong>
      <span>Swipe horizontally or use ArrowLeft and ArrowRight.</span>
    </>
  );

  if (mode === "asChild") {
    return (
      <SwipeableItem.Content {...props} asChild>
        <article>{children}</article>
      </SwipeableItem.Content>
    );
  }
  if (mode === "render") {
    return <SwipeableItem.Content {...props} render={(renderProps) => <article {...renderProps}>{children}</article>} />;
  }
  return <SwipeableItem.Content {...props}>{children}</SwipeableItem.Content>;
}

function SwipeableActionsExample({
  children,
  className,
  customSlot,
  closeOnClick,
  mode,
  onAction,
  propCheck,
  side,
}: {
  children: string;
  className: string;
  customSlot: boolean;
  closeOnClick: boolean;
  mode: CompositionMode;
  onAction: () => void;
  propCheck: boolean;
  side: "start" | "end";
}) {
  const inspectAttr = side === "start" ? { "data-swipeable-actions-start": "" } : { "data-swipeable-actions-end": "" };
  const props = {
    className,
    closeOnClick,
    side,
    "data-playground-inspect": "",
    ...inspectAttr,
    ...partProps(`actions-${side}`, { propCheck, customSlot }, "swipeable-item-actions-custom"),
  };
  const actionButton = <button className="atom-button secondary" type="button" onClick={onAction}>{children}</button>;

  if (mode === "asChild") {
    return (
      <SwipeableItem.Actions {...props} asChild>
        <aside>{actionButton}</aside>
      </SwipeableItem.Actions>
    );
  }
  if (mode === "render") {
    return <SwipeableItem.Actions {...props} render={(renderProps) => <aside {...renderProps}>{actionButton}</aside>} />;
  }
  return <SwipeableItem.Actions {...props}>{actionButton}</SwipeableItem.Actions>;
}

function ToastScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useToastScenario> }) {
  return (
    <Toast.Provider closeButton={scenario.state.closeButton} maxVisible={3}>
      <div className="utility-primitive-stage">
        <div className="utility-toast-stage" data-toast-stage="" data-playground-inspect="">
          <button className="atom-button" type="button" data-toast-show="" data-playground-inspect="" onClick={scenario.actions.showToast}>
            Show Toast
          </button>
          <button className="atom-button secondary" type="button" data-toast-dismiss-all="" data-playground-inspect="" onClick={scenario.actions.dismissAll}>
            Dismiss All
          </button>
          <ToastCountProbe />
        </div>
        <Toast.Viewport
          className="utility-toast-viewport"
          data-toast-viewport=""
          data-playground-inspect=""
          data-prop-check="viewport"
          position={scenario.state.position}
          renderToast={({ toast: toastData, index, expanded }) => (
            <Toast.Root className="utility-toast" toast={toastData} index={index} expanded={expanded} data-toast-root="" data-playground-inspect="" data-prop-check="root">
              <Toast.Title className="utility-toast-title" data-toast-title="" data-playground-inspect="" data-prop-check="title" />
              <Toast.Description className="utility-toast-description" data-toast-description="" data-playground-inspect="" data-prop-check="description" />
              <div className="utility-toast-actions">
                <Toast.Action className="atom-button secondary" data-toast-action="" data-playground-inspect="" data-prop-check="action" />
                <Toast.Cancel className="atom-button secondary" data-toast-cancel="" data-playground-inspect="" data-prop-check="cancel" />
                <Toast.Close className="atom-button secondary" data-toast-close="" data-playground-inspect="" data-prop-check="close">Close</Toast.Close>
              </div>
            </Toast.Root>
          )}
        />
      </div>
    </Toast.Provider>
  );
}

function ToastCountProbe() {
  const toasts = useToastStore();
  return (
    <span className="utility-toast-count" data-toast-count="" data-playground-inspect="">
      {toasts.length} {toasts.length === 1 ? "toast" : "toasts"}
    </span>
  );
}

function ProgressScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useProgressScenario> }) {
  const value = getProgressValue(scenario.state.mode, scenario.state.value);
  const min = getProgressMin(scenario.state.mode);
  const max = getProgressMax(scenario.state.mode);
  const props = {
    className: "utility-progress",
    "data-progress-root": "",
    "data-playground-inspect": "",
    "aria-label": "Task progress",
    value,
    min,
    max,
    getValueLabel: scenario.state.customLabel
      ? (nextValue: number, nextMin: number, nextMax: number) => `${nextValue - nextMin} of ${nextMax - nextMin} steps`
      : undefined,
    ref: scenario.actions.markRootRef,
    ...partProps("root", { customSlot: scenario.state.customRootSlot, propCheck: scenario.state.propCheck }, "progress-custom"),
  };
  const indicator = (
    <ProgressIndicatorExample
      customSlot={scenario.state.customIndicatorSlot}
      mode={scenario.state.indicatorComposition}
      onRef={scenario.actions.markIndicatorRef}
      percent={getProgressVisualPercent(value, min, max)}
      propCheck={scenario.state.propCheck}
    />
  );

  return (
    <div className="utility-primitive-stage">
      {scenario.state.composition === "asChild" ? (
        <Progress.Root {...props} asChild>
          <section>{indicator}</section>
        </Progress.Root>
      ) : scenario.state.composition === "render" ? (
        <Progress.Root {...props} render={(renderProps) => <section {...renderProps}>{indicator}</section>} />
      ) : (
        <Progress.Root {...props}>{indicator}</Progress.Root>
      )}
    </div>
  );
}

function ProgressIndicatorExample({
  customSlot,
  mode,
  onRef,
  percent,
  propCheck,
}: {
  customSlot: boolean;
  mode: CompositionMode;
  onRef: (node: HTMLElement | null) => void;
  percent: number | null;
  propCheck: boolean;
}) {
  const props = {
    className: "utility-progress-indicator",
    "data-progress-indicator": "",
    "data-playground-inspect": "",
    ref: onRef,
    style: percent === null ? undefined : { width: `${percent}%` },
    ...partProps("indicator", { customSlot, propCheck }, "progress-indicator-custom"),
  };

  if (mode === "asChild") {
    return (
      <Progress.Indicator {...props} asChild>
        <span />
      </Progress.Indicator>
    );
  }

  if (mode === "render") {
    return <Progress.Indicator {...props} render={(renderProps) => <span {...renderProps} />} />;
  }

  return <Progress.Indicator {...props} />;
}

function PressableScenarioCanvas({ scenario }: { scenario: ReturnType<typeof usePressableScenario> }) {
  const getKeyName = (event: KeyboardEvent<HTMLElement>) => event.key === " " ? "Space" : event.key;
  const props = {
    className: "utility-pressable",
    "data-pressable-root": "",
    "data-playground-inspect": "",
    ...partProps("root", { customSlot: scenario.state.customRootSlot, propCheck: scenario.state.propCheck }, "pressable-root-custom"),
    disabled: scenario.state.disabled,
    ref: scenario.actions.markRootRef,
    onClick: (event: MouseEvent<HTMLElement>) => {
      scenario.actions.note("user onClick");
      if (scenario.state.blockClick) {
        event.preventDefault();
        scenario.actions.note("user onClick blocked press");
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => scenario.actions.note(`user onKeyDown ${getKeyName(event)}`),
    onKeyUp: (event: KeyboardEvent<HTMLElement>) => scenario.actions.note(`user onKeyUp ${getKeyName(event)}`),
    onPointerDown: () => {
      scenario.actions.setPressed(true);
      scenario.actions.note("user pointerdown");
    },
    onPointerUp: () => {
      scenario.actions.setPressed(false);
      scenario.actions.note("user pointerup");
    },
    onPointerCancel: () => {
      scenario.actions.setPressed(false);
      scenario.actions.note("user pointercancel");
    },
    onLostPointerCapture: () => {
      scenario.actions.setPressed(false);
      scenario.actions.note("user lostpointercapture");
    },
    onPress: scenario.actions.handlePress,
  };

  return (
    <div className="utility-primitive-stage utility-pressable-stage">
      {scenario.state.showPointerCancelHelper ? (
        <button
          className="atom-button secondary utility-pressable-cancel-button"
          type="button"
          onClick={scenario.actions.testPointerCancel}
        >
          Pointer cancel
        </button>
      ) : null}
      {scenario.state.composition === "asChild" ? (
        <Pressable.Root {...props} asChild>
          <article>
            <strong>Project Alpha</strong>
            <span>Open project details</span>
          </article>
        </Pressable.Root>
      ) : scenario.state.composition === "render" ? (
        <Pressable.Root
          {...props}
          render={(renderProps) => (
            <div {...renderProps}>
              <strong>Project Alpha</strong>
              <span>Open project details</span>
            </div>
          )}
        />
      ) : (
        <Pressable.Root {...props}>
          <strong>Project Alpha</strong>
          <span>Open project details</span>
        </Pressable.Root>
      )}
    </div>
  );
}

function VisuallyHiddenScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useVisuallyHiddenScenario> }) {
  const hiddenProps = {
    "data-playground-inspect": "",
    "data-visually-hidden-root": "",
    ...partProps("root", { customSlot: scenario.state.customRootSlot, propCheck: scenario.state.propCheck }, "visually-hidden-custom"),
    style: scenario.state.customStyle ? { color: "red", width: 12 } : undefined,
  };

  return (
    <div className="utility-primitive-stage">
      <button className="utility-visible-button" type="button" data-playground-inspect="" data-visible-button="">
        Search
        {scenario.state.composition === "asChild" ? (
          <VisuallyHidden.Root {...hiddenProps} asChild>
            <strong>Search the workspace</strong>
          </VisuallyHidden.Root>
        ) : scenario.state.composition === "render" ? (
          <VisuallyHidden.Root {...hiddenProps} render={(renderProps) => <em {...renderProps}>Search the workspace</em>} />
        ) : (
          <VisuallyHidden.Root {...hiddenProps}>Search the workspace</VisuallyHidden.Root>
        )}
      </button>
    </div>
  );
}

function SkipLinkScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useSkipLinkScenario> }) {
  const href = scenario.state.targetMode === "missing"
    ? "#missing-target"
    : scenario.state.targetMode === "malformed"
      ? "#bad%EA"
      : "#playground-skip-target";
  const rootProps = {
    className: "utility-skip-link",
    "data-playground-inspect": "",
    "data-skip-link-root": "",
    ...partProps("root", { customSlot: scenario.state.customRootSlot, propCheck: scenario.state.propCheck }, "skip-link-custom"),
    ref: scenario.actions.markRootRef,
    focusTarget: scenario.state.focusTarget,
    href: href as `#${string}`,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (scenario.state.blockClick) {
        scenario.actions.noteBlocked(event);
        return;
      }
      scenario.actions.noteClickResult(event);
    },
  };
  const targetProps = {
    className: "utility-skip-target",
    "data-playground-inspect": "",
    "data-skip-link-target": "",
    ...partProps("target", { customSlot: scenario.state.customTargetSlot, propCheck: scenario.state.propCheck }, "skip-link-target-custom"),
    id: "playground-skip-target",
    ref: scenario.actions.markTargetRef,
    onFocus: scenario.actions.noteFocus,
  };

  return (
    <div className="utility-primitive-stage skip-link-stage">
      {scenario.state.composition === "asChild" ? (
        <SkipLink.Root {...rootProps} asChild>
          <a>Skip to content</a>
        </SkipLink.Root>
      ) : scenario.state.composition === "render" ? (
        <SkipLink.Root {...rootProps} render={(renderProps) => <a {...renderProps}>Skip to content</a>} />
      ) : (
        <SkipLink.Root {...rootProps}>Skip to content</SkipLink.Root>
      )}
      {scenario.state.targetComposition === "asChild" ? (
        <SkipLink.Target {...targetProps} asChild>
          <section>Main content target</section>
        </SkipLink.Target>
      ) : scenario.state.targetComposition === "render" ? (
        <SkipLink.Target {...targetProps} render={(renderProps) => <section {...renderProps}>Main content target</section>} />
      ) : (
        <SkipLink.Target {...targetProps}>Main content target</SkipLink.Target>
      )}
    </div>
  );
}

function CollapsibleScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useCollapsibleScenario> }) {
  const rootProps = {
    className: "utility-collapsible",
    "data-collapsible-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    disabled: scenario.state.disabled,
    ...(scenario.state.controlled
      ? { open: scenario.state.open, onOpenChange: scenario.actions.handleOpenChange }
      : { defaultOpen: false, onOpenChange: scenario.actions.handleOpenChange }),
  };
  const trigger = <CollapsibleTriggerExample mode={scenario.state.triggerComposition} />;
  const content = (
    <CollapsibleContentExample
      keepMounted={scenario.state.keepMounted}
      mode={scenario.state.contentComposition}
    />
  );

  return (
    <div className="utility-primitive-stage">
      {scenario.state.composition === "asChild" ? (
        <Collapsible.Root {...rootProps} asChild>
          <section>{trigger}{content}</section>
        </Collapsible.Root>
      ) : scenario.state.composition === "render" ? (
        <Collapsible.Root {...rootProps} render={(renderProps) => <section {...renderProps}>{trigger}{content}</section>} />
      ) : (
        <Collapsible.Root {...rootProps}>{trigger}{content}</Collapsible.Root>
      )}
    </div>
  );
}

function CollapsibleTriggerExample({ mode }: { mode: CompositionMode }) {
  const props = {
    className: "utility-collapsible-trigger",
    "data-collapsible-trigger": "",
    "data-playground-inspect": "",
    "data-prop-check": "trigger",
  };

  if (mode === "asChild") {
    return (
      <Collapsible.Trigger {...props} asChild>
        <span>Details</span>
      </Collapsible.Trigger>
    );
  }

  if (mode === "render") {
    return <Collapsible.Trigger {...props} render={(renderProps) => <div {...renderProps}>Details</div>} />;
  }

  return <Collapsible.Trigger {...props}>Details</Collapsible.Trigger>;
}

function CollapsibleContentExample({
  keepMounted,
  mode,
}: {
  keepMounted: boolean;
  mode: CompositionMode;
}) {
  const props = {
    className: "utility-collapsible-content",
    "data-collapsible-content": "",
    "data-playground-inspect": "",
    "data-prop-check": "content",
    keepMounted,
  };

  if (mode === "asChild") {
    return (
      <Collapsible.Content {...props} asChild>
        <section>More information about this setting.</section>
      </Collapsible.Content>
    );
  }

  if (mode === "render") {
    return <Collapsible.Content {...props} render={(renderProps) => <section {...renderProps}>More information about this setting.</section>} />;
  }

  return <Collapsible.Content {...props}>More information about this setting.</Collapsible.Content>;
}

function ToolbarScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useToolbarScenario> }) {
  const rootProps = {
    className: `utility-toolbar ${scenario.state.orientation}`,
    "data-playground-inspect": "",
    "data-prop-check": "root",
    "data-toolbar-root": "",
    ariaLabel: "Formatting",
    dir: scenario.state.dir,
    loop: scenario.state.loop,
    orientation: scenario.state.orientation,
  };
  const value = scenario.state.toggleValue;

  return (
    <div className="utility-primitive-stage">
      <Toolbar.Root {...rootProps}>
        <Toolbar.Button
          className="utility-toolbar-item"
          data-playground-inspect=""
          data-prop-check="button"
          data-toolbar-button=""
          onClick={() => scenario.actions.note("undo clicked")}
        >
          Undo
        </Toolbar.Button>
        <Toolbar.Button
          className="utility-toolbar-item"
          data-playground-inspect=""
          data-toolbar-disabled-button=""
          disabled={scenario.state.disabledButton}
          onClick={() => scenario.actions.note("redo clicked")}
        >
          Redo
        </Toolbar.Button>
        <Toolbar.Separator
          className="utility-toolbar-separator"
          data-playground-inspect=""
          data-toolbar-separator=""
          orientation={scenario.state.orientation === "horizontal" ? "vertical" : "horizontal"}
        />
        <Toolbar.ToggleGroup
          className="utility-toolbar-toggle-group"
          data-playground-inspect=""
          data-prop-check="toggle-group"
          data-toolbar-toggle-group=""
          type={scenario.state.toggleType}
          value={value}
          onValueChange={scenario.actions.handleValueChange}
          ariaLabel="Text style"
        >
          <Toolbar.ToggleItem
            className="utility-toolbar-item"
            data-playground-inspect=""
            data-prop-check="toggle-item"
            data-toolbar-toggle-item=""
            value="bold"
          >
            B
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="utility-toolbar-item"
            data-playground-inspect=""
            data-toolbar-toggle-item-secondary=""
            value="italic"
          >
            I
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
        <Toolbar.Link
          className="utility-toolbar-item"
          data-playground-inspect=""
          data-prop-check="link"
          data-toolbar-link=""
          disabled={scenario.state.disabledLink}
          href="#toolbar-link"
          onClick={() => scenario.actions.note("help clicked")}
        >
          Help
        </Toolbar.Link>
      </Toolbar.Root>
    </div>
  );
}

function PortalScenarioCanvas({ scenario }: { scenario: ReturnType<typeof usePortalScenario> }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [bodyPortalPosition, setBodyPortalPosition] = useState({ left: 0, top: 0, width: 220 });
  const bodyPortal = !scenario.state.customContainer && !scenario.state.disabled;

  useEffect(() => {
    if (!bodyPortal || !container) return undefined;

    const updatePosition = () => {
      const rect = container.getBoundingClientRect();
      setBodyPortalPosition({
        left: rect.left,
        top: rect.bottom + 12,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [bodyPortal, container]);

  const content = scenario.state.mounted ? (
    <div
      className={`utility-portal-content${bodyPortal ? " body-portal" : ""}`}
      data-playground-inspect=""
      data-portal-content=""
      data-prop-check={scenario.state.propCheck ? "content" : undefined}
      role="region"
      aria-label="Portaled content preview"
      style={bodyPortal ? {
        "--portal-left": `${bodyPortalPosition.left}px`,
        "--portal-top": `${bodyPortalPosition.top}px`,
        "--portal-width": `${bodyPortalPosition.width}px`,
      } as CSSProperties : undefined}
    >
      Portaled content
    </div>
  ) : null;

  return (
    <div className="utility-primitive-stage">
      <div className="utility-portal-demo" data-playground-inspect="" data-portal-stage="">
        <div className="utility-portal-inline-zone" data-playground-inspect="" data-portal-inline-zone="">
          Inline zone
          <Portal
            container={scenario.state.customContainer ? container : undefined}
            disabled={scenario.state.disabled}
          >
            {content}
          </Portal>
        </div>
        <div
          className="utility-portal-container"
          data-playground-inspect=""
          data-portal-custom-container=""
          ref={setContainer}
        >
          Custom container
        </div>
      </div>
    </div>
  );
}

function CollectionScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useCollectionScenario> }) {
  const baseItems = [
    { value: "alpha", label: "Alpha", disabled: false },
    { value: "beta", label: "Beta", disabled: scenario.state.disabledItem },
    { value: "gamma", label: "Gamma", disabled: false },
  ];
  const orderedItems = scenario.state.reverseOrder ? [...baseItems].reverse() : baseItems;
  const items = scenario.state.duplicateValue
    ? [...orderedItems, { value: "alpha", label: "Duplicate alpha", disabled: false }]
    : orderedItems;
  const activeIndex = items.reduce((foundIndex, item, index) => (
    item.value === scenario.state.activeValue ? index : foundIndex
  ), -1);

  return (
    <div className="utility-primitive-stage">
      <div className="utility-collection-demo" data-collection-demo="" data-playground-inspect="">
        <div className="utility-collection-actions">
          <button className="utility-visible-button" type="button" onClick={() => scenario.actions.first()}>
            First
          </button>
          <button className="utility-visible-button" type="button" onClick={() => scenario.actions.move("previous")}>
            Previous
          </button>
          <button className="utility-visible-button" type="button" onClick={() => scenario.actions.move("next")}>
            Next
          </button>
          <button className="utility-visible-button" type="button" onClick={() => scenario.actions.last()}>
            Last
          </button>
        </div>
        <div className="utility-collection-items" data-collection-items="" data-playground-inspect="">
          {items.map((item, index) => (
            <CollectionDemoItem
              active={activeIndex === index}
              collection={scenario.state.collection}
              disabled={item.disabled}
              index={index}
              key={`${item.value}-${index}`}
              label={item.label}
              onSelect={scenario.actions.setActiveValue}
              registryVersion={`${scenario.state.duplicateValue}-${scenario.state.reverseOrder}`}
              value={item.value}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CollectionDemoItem({
  active,
  collection,
  disabled,
  index,
  label,
  onSelect,
  registryVersion,
  value,
}: {
  active: boolean;
  collection: UseCollectionReturn<string, HTMLButtonElement, { label: string; order: number }>;
  disabled: boolean;
  index: number;
  label: string;
  onSelect: (value: string) => void;
  registryVersion: string;
  value: string;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) return undefined;
    collection.registerItem(value, element, { disabled, data: { label, order: index } });
    return () => collection.unregisterItem(value);
  }, [collection.registerItem, collection.unregisterItem, disabled, index, label, registryVersion, value]);

  useEffect(() => {
    collection.updateItem(value, { disabled, data: { label, order: index } });
  }, [collection.updateItem, disabled, index, label, value]);

  return (
    <button
      aria-current={active ? "true" : undefined}
      className="utility-collection-item"
      data-active={active ? "" : undefined}
      data-collection-item={value}
      data-disabled={disabled ? "" : undefined}
      data-playground-inspect=""
      disabled={disabled}
      onClick={() => onSelect(value)}
      ref={buttonRef}
      type="button"
      value={value}
    >
      {label}
    </button>
  );
}

function VirtualizerScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useVirtualizerScenario> }) {
  const virtualizer = scenario.state.virtualizer;

  return (
    <div className="utility-primitive-stage">
      <div className="utility-virtualizer-demo" data-playground-inspect="" data-virtualizer-demo="">
        <div className="utility-collection-actions">
          <button className="utility-visible-button" type="button" onClick={() => scenario.actions.scrollToOffset(0)}>
            Top
          </button>
          <button className="utility-visible-button" type="button" onClick={() => scenario.actions.scrollToIndex(Math.floor(scenario.state.count / 2))}>
            Middle
          </button>
          <button className="utility-visible-button" type="button" onClick={() => scenario.actions.scrollToIndex(scenario.state.count - 1)}>
            End
          </button>
        </div>
        <div
          className="utility-virtualizer-scroll"
          data-playground-inspect=""
          data-virtualizer-scroll=""
          ref={(element) => {
            virtualizer.scrollRef(element);
          }}
          tabIndex={0}
        >
          <div
            aria-label="Virtualized rows"
            className="utility-virtualizer-spacer"
            data-playground-inspect=""
            data-virtualizer-spacer=""
            role="list"
            style={{ height: virtualizer.totalSize }}
          >
            {virtualizer.items.map((virtualItem) => (
              <div
                aria-posinset={virtualItem.index + 1}
                aria-setsize={scenario.state.count}
                className="utility-virtualizer-item"
                data-index={virtualItem.index}
                data-playground-inspect=""
                data-size={Math.round(virtualItem.size)}
                data-start={Math.round(virtualItem.start)}
                data-virtualizer-item=""
                key={virtualItem.key}
                ref={(element) => {
                  virtualizer.getItemRef(virtualItem.index)(element);
                }}
                role="listitem"
                style={{
                  height: `${getVirtualizerDemoItemSize(virtualItem.index, {
                    variableSize: scenario.state.variableSize,
                    zeroSize: scenario.state.zeroSize,
                  })}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                Row {virtualItem.index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getUtilityPrimitiveSections(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
): AnatomySection[] {
  if (scenarioId === "direction") {
    const region = document.querySelector<HTMLElement>("[data-direction-region]");
    const nested = document.querySelector<HTMLElement>("[data-direction-nested]");
    return [
      {
        title: "Provider",
        selector: "[data-direction-region]",
        summary: scenarios.direction.state.dir,
        rows: [
          { label: "Renders wrapper", value: "false", category: "presence" },
          { label: "Context value", value: scenarios.direction.state.dir, category: "state" },
          { label: "DOM dir", value: region?.dir ?? "not rendered", category: "identity" },
        ],
      },
      {
        title: "Nested Provider",
        selector: "[data-direction-nested]",
        inactive: !nested,
        summary: nested?.dir ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!nested), category: "presence" },
          { label: "Enabled", value: bool(scenarios.direction.state.nested), category: "state" },
        ],
      },
    ];
  }

  if (scenarioId === "modal") {
    const trigger = document.querySelector<HTMLElement>("[data-modal-trigger]");
    const overlay = document.querySelector<HTMLElement>("[data-modal-overlay]");
    const surface = document.querySelector<HTMLElement>("[data-modal-surface]");
    const title = document.querySelector<HTMLElement>("[data-modal-title]");
    const description = document.querySelector<HTMLElement>("[data-modal-description]");
    const close = document.querySelector<HTMLElement>("[data-modal-close]");
    return [
      {
        title: "Root",
        summary: scenarios.modal.state.controlled ? "controlled" : "uncontrolled",
        rows: [
          { label: "Mode", value: scenarios.modal.state.controlled ? "controlled" : "uncontrolled", category: "state" },
          { label: "Open", value: bool(scenarios.modal.state.open), category: "state" },
          { label: "Disabled", value: bool(scenarios.modal.state.disabled), category: "state" },
          { label: "Keep mounted", value: bool(scenarios.modal.state.keepMounted), category: "behavior" },
          { label: "Escape closes", value: bool(scenarios.modal.state.closeOnEscape), category: "behavior" },
          { label: "Backdrop closes", value: bool(scenarios.modal.state.closeOnBackdropClick), category: "behavior" },
          { label: "Nested open", value: bool(scenarios.modal.state.nestedOpen), category: "state" },
        ],
      },
      {
        title: "Trigger",
        selector: "[data-modal-trigger]",
        summary: trigger?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!trigger), category: "presence" },
          { label: "Disabled", value: bool(scenarios.modal.state.disabled), category: "state" },
          { label: "Composition", value: scenarios.modal.state.triggerComposition, category: "composition" },
          { label: "Block event", value: bool(scenarios.modal.state.blockTriggerEvent), category: "behavior" },
        ],
      },
      {
        title: "Portal",
        inactive: !surface,
        summary: surface?.parentElement === document.body ? "body" : surface?.parentElement?.matches("[data-modal-container]") ? "custom container" : surface ? "inline" : "not rendered",
        rows: [
          { label: "Content rendered", value: bool(!!surface), category: "presence" },
          { label: "Parent", value: surface?.parentElement === document.body ? "body" : surface?.parentElement?.matches("[data-modal-container]") ? "custom container" : surface?.parentElement?.tagName.toLowerCase() ?? "not rendered", category: "behavior" },
          { label: "Disable portal", value: bool(scenarios.modal.state.portalDisabled), category: "behavior" },
          { label: "Custom container", value: bool(scenarios.modal.state.customContainer), category: "behavior" },
          { label: "Backdrop rendered", value: bool(!!overlay), category: "presence" },
        ],
        groups: [
          {
            title: "Content DOM",
            selector: "[data-modal-surface]",
            rows: [{ label: "Exists", value: bool(!!surface), category: "presence" }],
          },
          {
            title: "Backdrop DOM",
            selector: "[data-modal-overlay]",
            rows: [
              { label: "Exists", value: bool(!!overlay), category: "presence" },
              { label: "Backdrop closes", value: bool(scenarios.modal.state.closeOnBackdropClick), category: "behavior" },
            ],
          },
        ],
      },
      {
        title: "Title",
        selector: "[data-modal-title]",
        inactive: !title,
        summary: title?.id ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!title), category: "presence" },
        ],
      },
      {
        title: "Description",
        selector: "[data-modal-description]",
        inactive: !description,
        summary: description?.id ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!description), category: "presence" },
        ],
      },
      {
        title: "Close",
        selector: "[data-modal-close]",
        inactive: !close,
        summary: close?.tagName.toLowerCase() ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!close), category: "presence" },
          { label: "Composition", value: scenarios.modal.state.closeComposition, category: "composition" },
          { label: "Block event", value: bool(scenarios.modal.state.blockCloseEvent), category: "behavior" },
        ],
      },
    ];
  }

  if (scenarioId === "drawer") {
    const trigger = document.querySelector<HTMLElement>("[data-drawer-trigger]");
    const overlay = document.querySelector<HTMLElement>("[data-drawer-overlay]");
    const content = document.querySelector<HTMLElement>("[data-drawer-content]");
    const title = document.querySelector<HTMLElement>("[data-slot='drawer-title']");
    const description = document.querySelector<HTMLElement>("[data-slot='drawer-description']");
    const close = document.querySelector<HTMLElement>("[data-drawer-close]");
    return [
      {
        title: "Root",
        selector: "[data-drawer-trigger]",
        summary: scenarios.drawer.state.controlled ? "controlled" : "uncontrolled",
        rows: [
          { label: "Mode", value: scenarios.drawer.state.controlled ? "controlled" : "uncontrolled", category: "state" },
          { label: "Open", value: bool(scenarios.drawer.state.open), category: "state" },
          { label: "Disabled", value: bool(scenarios.drawer.state.disabled), category: "state" },
          { label: "Keep mounted", value: bool(scenarios.drawer.state.keepMounted), category: "behavior" },
        ],
      },
      { title: "Trigger", selector: "[data-drawer-trigger]", summary: trigger?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!trigger), category: "presence" }] },
      { title: "Overlay", selector: "[data-drawer-overlay]", inactive: !overlay, summary: overlay?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!overlay), category: "presence" }] },
      {
        title: "Content",
        selector: "[data-drawer-content]",
        inactive: !content,
        summary: content?.dataset.placement ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!content), category: "presence" },
          { label: "Placement", value: scenarios.drawer.state.placement, category: "state" },
          { label: "State", value: content?.dataset.state ?? "not rendered", category: "state" },
        ],
      },
      { title: "Title", selector: "[data-slot='drawer-title']", inactive: !title, summary: title?.id ?? "not rendered", rows: [{ label: "Exists", value: bool(!!title), category: "presence" }] },
      { title: "Description", selector: "[data-slot='drawer-description']", inactive: !description, summary: description?.id ?? "not rendered", rows: [{ label: "Exists", value: bool(!!description), category: "presence" }] },
      { title: "Close", selector: "[data-drawer-close]", inactive: !close, summary: close?.tagName.toLowerCase() ?? "not rendered", rows: [{ label: "Exists", value: bool(!!close), category: "presence" }] },
    ];
  }

  if (scenarioId === "menubar") {
    const root = document.querySelector<HTMLElement>("[data-menubar-root]");
    const fileTrigger = document.querySelector<HTMLElement>("[data-menubar-trigger-file]");
    const viewTrigger = document.querySelector<HTMLElement>("[data-menubar-trigger-view]");
    const fileContent = document.querySelector<HTMLElement>("[data-menubar-content-file]");
    const checked = document.querySelector<HTMLElement>("[data-menubar-checkbox]");
    const radio = document.querySelector<HTMLElement>("[data-menubar-radio][data-checked]");
    return [
      {
        title: "Root",
        selector: "[data-menubar-root]",
        summary: scenarios.menubar.state.value ?? "closed",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Mode", value: scenarios.menubar.state.controlled ? "controlled" : "uncontrolled", category: "state" },
          { label: "Loop", value: bool(scenarios.menubar.state.loop), category: "behavior" },
        ],
      },
      {
        title: "Trigger",
        selector: "[data-menubar-trigger-file]",
        summary: fileTrigger?.dataset.state ?? "not rendered",
        groups: [
          { title: "File Trigger", selector: "[data-menubar-trigger-file]", rows: [{ label: "Exists", value: bool(!!fileTrigger), category: "presence" }, { label: "Disabled", value: bool(scenarios.menubar.state.fileDisabled), category: "state" }] },
          { title: "View Trigger", selector: "[data-menubar-trigger-view]", rows: [{ label: "Exists", value: bool(!!viewTrigger), category: "presence" }] },
        ],
      },
      { title: "Content", selector: "[data-menubar-content-file]", inactive: !fileContent, summary: fileContent?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!fileContent), category: "presence" }] },
      { title: "Checkbox Item", selector: "[data-menubar-checkbox]", inactive: !checked, summary: scenarios.menubar.state.showGrid ? "checked" : "unchecked", rows: [{ label: "Checked", value: bool(scenarios.menubar.state.showGrid), category: "state" }] },
      { title: "Radio Item", selector: "[data-menubar-radio][data-checked]", inactive: !radio, summary: scenarios.menubar.state.density, rows: [{ label: "Value", value: scenarios.menubar.state.density, category: "state" }] },
    ];
  }

  if (scenarioId === "navigation-menu") {
    const root = document.querySelector<HTMLElement>("[data-navigation-menu-root]");
    const list = document.querySelector<HTMLElement>("[data-navigation-menu-list]");
    const productsTrigger = document.querySelector<HTMLElement>("[data-navigation-menu-trigger='products']");
    const docsTrigger = document.querySelector<HTMLElement>("[data-navigation-menu-trigger='docs']");
    const content = document.querySelector<HTMLElement>("[data-slot='navigation-menu-content']");
    const viewport = document.querySelector<HTMLElement>("[data-navigation-menu-viewport]");
    const indicator = document.querySelector<HTMLElement>("[data-navigation-menu-indicator]");
    const link = document.querySelector<HTMLElement>("[data-navigation-menu-link]");
    return [
      {
        title: "Root",
        selector: "[data-navigation-menu-root]",
        summary: scenarios.navigationMenu.state.value ?? "closed",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Mode", value: scenarios.navigationMenu.state.controlled ? "controlled" : "uncontrolled", category: "state" },
          { label: "Value", value: scenarios.navigationMenu.state.value ?? "none", category: "state" },
          { label: "Orientation", value: scenarios.navigationMenu.state.orientation, category: "state" },
          { label: "Direction", value: scenarios.navigationMenu.state.dir, category: "state" },
        ],
      },
      { title: "List", selector: "[data-navigation-menu-list]", summary: list ? "rendered" : "not rendered", rows: [{ label: "Exists", value: bool(!!list), category: "presence" }] },
      {
        title: "Item",
        selector: "[data-navigation-menu-item='products']",
        summary: "products",
        groups: [
          { title: "Products item", selector: "[data-navigation-menu-item='products']", rows: [{ label: "Exists", value: "true", category: "presence" }] },
          { title: "Docs item", selector: "[data-navigation-menu-item='docs']", rows: [{ label: "Exists", value: "true", category: "presence" }] },
        ],
      },
      {
        title: "Trigger",
        selector: "[data-navigation-menu-trigger='products']",
        summary: productsTrigger?.dataset.state ?? "not rendered",
        groups: [
          {
            title: "Products trigger",
            selector: "[data-navigation-menu-trigger='products']",
            rows: [
              { label: "Exists", value: bool(!!productsTrigger), category: "presence" },
              { label: "State", value: productsTrigger?.dataset.state ?? "not rendered", category: "state" },
            ],
          },
          {
            title: "Docs trigger",
            selector: "[data-navigation-menu-trigger='docs']",
            rows: [
              { label: "Exists", value: bool(!!docsTrigger), category: "presence" },
              { label: "Disabled", value: bool(scenarios.navigationMenu.state.disabledItem), category: "state" },
              { label: "State", value: docsTrigger?.dataset.state ?? "not rendered", category: "state" },
            ],
          },
        ],
      },
      { title: "Content", selector: "[data-slot='navigation-menu-content']", inactive: !content, summary: content?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!content), category: "presence" }] },
      { title: "Link", selector: "[data-navigation-menu-link]", inactive: !link, summary: link?.textContent?.trim() || "not rendered", rows: [{ label: "Exists", value: bool(!!link), category: "presence" }] },
      { title: "Indicator", selector: "[data-navigation-menu-indicator]", inactive: !indicator, summary: indicator?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!indicator), category: "presence" }] },
      { title: "Viewport", selector: "[data-navigation-menu-viewport]", inactive: !viewport, summary: viewport?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!viewport), category: "presence" }] },
    ];
  }

  if (scenarioId === "sidebar") {
    const root = document.querySelector<HTMLElement>("[data-sidebar-root]");
    const panel = document.querySelector<HTMLElement>("[data-sidebar-panel]");
    const main = document.querySelector<HTMLElement>("[data-sidebar-main]");
    const trigger = document.querySelector<HTMLElement>("[data-sidebar-trigger]");
    return [
      {
        title: "Root",
        selector: "[data-sidebar-root]",
        summary: scenarios.sidebar.state.state,
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Mode", value: scenarios.sidebar.state.controlled ? "controlled" : "uncontrolled", category: "state" },
          { label: "State", value: scenarios.sidebar.state.state, category: "state" },
          { label: "Collapsed state", value: scenarios.sidebar.state.collapsedState, category: "state" },
          { label: "Side", value: scenarios.sidebar.state.side, category: "state" },
          { label: "Disabled", value: bool(scenarios.sidebar.state.disabled), category: "state" },
        ],
      },
      { title: "Trigger", selector: "[data-sidebar-trigger]", summary: trigger?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!trigger), category: "presence" }] },
      {
        title: "Panel",
        selector: "[data-sidebar-panel]",
        summary: panel?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!panel), category: "presence" },
          { label: "Hidden", value: bool(panel?.getAttribute("aria-hidden") === "true"), category: "state" },
        ],
      },
      { title: "Main", selector: "[data-sidebar-main]", summary: main?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!main), category: "presence" }] },
    ];
  }

  if (scenarioId === "swipeable-item") {
    const root = document.querySelector<HTMLElement>("[data-swipeable-root]");
    const content = document.querySelector<HTMLElement>("[data-swipeable-content]");
    const startActions = document.querySelector<HTMLElement>("[data-swipeable-actions-start]");
    const endActions = document.querySelector<HTMLElement>("[data-swipeable-actions-end]");
    return [
      {
        title: "Root",
        selector: "[data-swipeable-root]",
        summary: scenarios.swipeableItem.state.openSide ?? "closed",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Mode", value: scenarios.swipeableItem.state.controlled ? "controlled" : "uncontrolled", category: "state" },
          { label: "Open side", value: scenarios.swipeableItem.state.openSide ?? "none", category: "state" },
          { label: "Direction", value: scenarios.swipeableItem.state.dir, category: "state" },
          { label: "Disabled", value: bool(scenarios.swipeableItem.state.disabled), category: "state" },
          { label: "Read only", value: bool(scenarios.swipeableItem.state.readOnly), category: "state" },
          { label: "Full swipe", value: bool(scenarios.swipeableItem.state.fullSwipe), category: "behavior" },
          { label: "Action click closes", value: bool(scenarios.swipeableItem.state.closeOnActionClick), category: "behavior" },
          { label: "Threshold", value: scenarios.swipeableItem.state.threshold, category: "behavior" },
          { label: "Full swipe threshold", value: scenarios.swipeableItem.state.fullSwipeThreshold, category: "behavior" },
          { label: "Mode", value: scenarios.swipeableItem.state.composition, category: "composition" },
        ],
      },
      {
        title: "Action: Start",
        selector: "[data-swipeable-actions-start]",
        summary: startActions?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!startActions), category: "presence" },
          { label: "Mode", value: scenarios.swipeableItem.state.actionsComposition, category: "composition" },
        ],
      },
      { title: "Content", selector: "[data-swipeable-content]", summary: content?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!content), category: "presence" }, { label: "Mode", value: scenarios.swipeableItem.state.contentComposition, category: "composition" }] },
      {
        title: "Action: End",
        selector: "[data-swipeable-actions-end]",
        summary: endActions?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!endActions), category: "presence" },
          { label: "Mode", value: scenarios.swipeableItem.state.actionsComposition, category: "composition" },
        ],
      },
    ];
  }

  if (scenarioId === "toast") {
    const viewport = document.querySelector<HTMLElement>("[data-toast-viewport]");
    const root = document.querySelector<HTMLElement>("[data-toast-root]");
    const title = document.querySelector<HTMLElement>("[data-toast-title]");
    const description = document.querySelector<HTMLElement>("[data-toast-description]");
    const action = document.querySelector<HTMLElement>("[data-toast-action]");
    const cancel = document.querySelector<HTMLElement>("[data-toast-cancel]");
    const close = document.querySelector<HTMLElement>("[data-toast-close]");
    const count = document.querySelector<HTMLElement>("[data-toast-count]");
    return [
      {
        title: "Provider",
        selector: "[data-toast-stage]",
        summary: scenarios.toast.state.type,
        rows: [
          { label: "Type", value: scenarios.toast.state.type, category: "state" },
          { label: "Close button", value: bool(scenarios.toast.state.closeButton), category: "state" },
          { label: "Action buttons", value: bool(scenarios.toast.state.action), category: "state" },
          { label: "Duration", value: scenarios.toast.state.duration, category: "state" },
        ],
      },
      { title: "Viewport", selector: "[data-toast-viewport]", inactive: !viewport, summary: viewport?.dataset.position ?? "not rendered", rows: [{ label: "Exists", value: bool(!!viewport), category: "presence" }] },
      { title: "Toast", selector: "[data-toast-root]", inactive: !root, summary: root?.dataset.type ?? "not rendered", rows: [{ label: "Exists", value: bool(!!root), category: "presence" }] },
      { title: "Title", selector: "[data-toast-title]", inactive: !title, summary: title?.textContent?.trim() || "not rendered", rows: [{ label: "Exists", value: bool(!!title), category: "presence" }] },
      { title: "Description", selector: "[data-toast-description]", inactive: !description, summary: description?.textContent?.trim() || "not rendered", rows: [{ label: "Exists", value: bool(!!description), category: "presence" }] },
      { title: "Action", selector: "[data-toast-action]", inactive: !action, summary: action?.textContent?.trim() || "not rendered", rows: [{ label: "Exists", value: bool(!!action), category: "presence" }] },
      { title: "Cancel", selector: "[data-toast-cancel]", inactive: !cancel, summary: cancel?.textContent?.trim() || "not rendered", rows: [{ label: "Exists", value: bool(!!cancel), category: "presence" }] },
      { title: "Close", selector: "[data-toast-close]", inactive: !close, summary: close?.textContent?.trim() || "not rendered", rows: [{ label: "Exists", value: bool(!!close), category: "presence" }] },
      { title: "Store", selector: "[data-toast-count]", summary: count?.textContent?.trim() || "0 toasts", rows: [{ label: "Count", value: count?.textContent?.trim() || "0 toasts", category: "state" }] },
    ];
  }

  if (scenarioId === "progress") {
    const root = document.querySelector<HTMLElement>("[data-progress-root]");
    const indicator = document.querySelector<HTMLElement>("[data-progress-indicator]");
    return [
      {
        title: "Root",
        selector: "[data-progress-root]",
        summary: root?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Ref target", value: scenarios.progress.state.rootRef, category: "identity" },
          { label: "Mode", value: scenarios.progress.state.mode, category: "state" },
          { label: "Value", value: String(getProgressValue(scenarios.progress.state.mode, scenarios.progress.state.value)), category: "state" },
          { label: "Custom label", value: bool(scenarios.progress.state.customLabel), category: "behavior" },
          { label: "Composition", value: scenarios.progress.state.composition, category: "composition" },
        ],
      },
      {
        title: "Indicator",
        selector: "[data-progress-indicator]",
        summary: indicator?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!indicator), category: "presence" },
          { label: "Ref target", value: scenarios.progress.state.indicatorRef, category: "identity" },
          { label: "Composition", value: scenarios.progress.state.indicatorComposition, category: "composition" },
        ],
      },
    ];
  }

  if (scenarioId === "pressable") {
    const root = document.querySelector<HTMLElement>("[data-pressable-root]");
    return [{
      title: "Root",
      selector: "[data-pressable-root]",
      summary: scenarios.pressable.state.composition,
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Ref target", value: scenarios.pressable.state.rootRef, category: "identity" },
          { label: "Disabled", value: bool(scenarios.pressable.state.disabled), category: "state" },
          { label: "Pressed", value: bool(scenarios.pressable.state.pressed), category: "state" },
          { label: "Block click", value: bool(scenarios.pressable.state.blockClick), category: "behavior" },
          { label: "Pointer cancel helper", value: bool(scenarios.pressable.state.showPointerCancelHelper), category: "behavior" },
          { label: "Press count", value: String(scenarios.pressable.state.pressCount), category: "behavior" },
          { label: "Composition", value: scenarios.pressable.state.composition, category: "composition" },
        ],
    }];
  }

  if (scenarioId === "visually-hidden") {
    const root = document.querySelector<HTMLElement>("[data-visually-hidden-root]");
    return [
      {
        title: "Root",
        selector: "[data-visually-hidden-root]",
        summary: root ? "visually hidden" : "not rendered",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Custom style", value: bool(scenarios.visuallyHidden.state.customStyle), category: "state" },
          { label: "Composition", value: scenarios.visuallyHidden.state.composition, category: "composition" },
        ],
      },
    ];
  }

  if (scenarioId === "skip-link") {
    const root = document.querySelector<HTMLElement>("[data-skip-link-root]");
    const target = document.querySelector<HTMLElement>("[data-skip-link-target]");
    return [
      {
        title: "Root",
        selector: "[data-skip-link-root]",
        summary: root?.getAttribute("href") ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Ref target", value: scenarios.skipLink.state.rootRef, category: "identity" },
          { label: "Href", value: root?.getAttribute("href") ?? "none", category: "state" },
          { label: "Focus target", value: bool(scenarios.skipLink.state.focusTarget), category: "behavior" },
          { label: "Block click", value: bool(scenarios.skipLink.state.blockClick), category: "behavior" },
          { label: "Default prevented", value: scenarios.skipLink.state.defaultPrevented, category: "behavior" },
          { label: "Hash", value: scenarios.skipLink.state.hash, category: "state" },
          { label: "Target mode", value: scenarios.skipLink.state.targetMode, category: "state" },
          { label: "Composition", value: scenarios.skipLink.state.composition, category: "composition" },
        ],
      },
      {
        title: "Target",
        selector: "[data-skip-link-target]",
        summary: target?.id ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!target), category: "presence" },
          { label: "Ref target", value: scenarios.skipLink.state.targetRef, category: "identity" },
          { label: "Matches href", value: bool(root?.getAttribute("href") === `#${target?.id}`), category: "behavior" },
          { label: "Composition", value: scenarios.skipLink.state.targetComposition, category: "composition" },
        ],
      },
    ];
  }

  if (scenarioId === "collapsible") {
    const root = document.querySelector<HTMLElement>("[data-collapsible-root]");
    const trigger = document.querySelector<HTMLElement>("[data-collapsible-trigger]");
    const content = document.querySelector<HTMLElement>("[data-collapsible-content]");
    return [
      {
        title: "Root",
        selector: "[data-collapsible-root]",
        summary: root?.dataset.state ?? "closed",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Mode", value: scenarios.collapsible.state.controlled ? "controlled" : "uncontrolled", category: "state" },
          { label: "Open", value: bool(scenarios.collapsible.state.open), category: "state" },
          { label: "Disabled", value: bool(scenarios.collapsible.state.disabled), category: "state" },
          { label: "Composition", value: scenarios.collapsible.state.composition, category: "composition" },
        ],
      },
      {
        title: "Trigger",
        selector: "[data-collapsible-trigger]",
        summary: trigger?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!trigger), category: "presence" },
          { label: "Controls match", value: bool(!!trigger && !!content && trigger.getAttribute("aria-controls") === content.id), category: "behavior" },
          { label: "Composition", value: scenarios.collapsible.state.triggerComposition, category: "composition" },
        ],
      },
      {
        title: "Content",
        selector: "[data-collapsible-content]",
        inactive: !content,
        summary: content?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!content), category: "presence" },
          { label: "Keep mounted", value: bool(scenarios.collapsible.state.keepMounted), category: "behavior" },
          { label: "Labelledby match", value: bool(!!trigger && !!content && content.getAttribute("aria-labelledby") === trigger.id), category: "behavior" },
          { label: "Composition", value: scenarios.collapsible.state.contentComposition, category: "composition" },
        ],
      },
    ];
  }

  if (scenarioId === "toolbar") {
    const root = document.querySelector<HTMLElement>("[data-toolbar-root]");
    const button = document.querySelector<HTMLElement>("[data-toolbar-button]");
    const disabledButton = document.querySelector<HTMLElement>("[data-toolbar-disabled-button]");
    const separator = document.querySelector<HTMLElement>("[data-toolbar-separator]");
    const toggleGroup = document.querySelector<HTMLElement>("[data-toolbar-toggle-group]");
    const selectedToggle = document.querySelector<HTMLElement>("[data-toolbar-toggle-item][data-state='on']");
    const link = document.querySelector<HTMLElement>("[data-toolbar-link]");
    return [
      {
        title: "Root",
        selector: "[data-toolbar-root]",
        summary: scenarios.toolbar.state.orientation,
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Orientation", value: scenarios.toolbar.state.orientation, category: "state" },
          { label: "Direction", value: scenarios.toolbar.state.dir, category: "state" },
          { label: "Loop", value: bool(scenarios.toolbar.state.loop), category: "behavior" },
        ],
      },
      {
        title: "Button",
        selector: "[data-toolbar-button]",
        summary: button?.textContent?.trim() || "not rendered",
        groups: [
          {
            title: "Primary button",
            selector: "[data-toolbar-button]",
            rows: [
              { label: "Exists", value: bool(!!button), category: "presence" },
            ],
          },
          {
            title: "Disabled button",
            selector: "[data-toolbar-disabled-button]",
            rows: [
              { label: "Exists", value: bool(!!disabledButton), category: "presence" },
              { label: "Disabled", value: bool(scenarios.toolbar.state.disabledButton), category: "state" },
            ],
          },
        ],
      },
      {
        title: "Separator",
        selector: "[data-toolbar-separator]",
        summary: separator?.dataset.orientation ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!separator), category: "presence" },
        ],
      },
      {
        title: "Toggle Group",
        selector: "[data-toolbar-toggle-group]",
        summary: scenarios.toolbar.state.toggleType,
        rows: [
          { label: "Exists", value: bool(!!toggleGroup), category: "presence" },
          { label: "Type", value: scenarios.toolbar.state.toggleType, category: "state" },
          { label: "Value", value: getToolbarValue(scenarios.toolbar.state.toggleValue), category: "state" },
        ],
      },
      {
        title: "Toggle Item",
        selector: "[data-toolbar-toggle-item][data-state='on']",
        summary: selectedToggle?.dataset.value ?? "none",
        rows: [
          { label: "Exists", value: bool(!!selectedToggle), category: "presence" },
        ],
      },
      {
        title: "Link",
        selector: "[data-toolbar-link]",
        summary: link?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!link), category: "presence" },
          { label: "Disabled", value: bool(scenarios.toolbar.state.disabledLink), category: "state" },
        ],
      },
    ];
  }

  if (scenarioId === "portal") {
    const content = document.querySelector<HTMLElement>("[data-portal-content]");
    const customContainer = document.querySelector<HTMLElement>("[data-portal-custom-container]");
    const inlineZone = document.querySelector<HTMLElement>("[data-portal-inline-zone]");
    const parent = content?.parentElement;
    const parentLabel = !content
      ? "not rendered"
      : parent === document.body
        ? "body"
        : parent === customContainer
          ? "custom container"
          : parent === inlineZone
            ? "inline zone"
            : parent?.tagName.toLowerCase() ?? "unknown";

    return [
      {
        title: "Portal",
        summary: parentLabel,
        rows: [
          { label: "Mounted", value: bool(scenarios.portal.state.mounted), category: "state" },
          { label: "Disable portal", value: bool(scenarios.portal.state.disabled), category: "state" },
          { label: "Custom container", value: bool(scenarios.portal.state.customContainer), category: "state" },
          { label: "Parent", value: parentLabel, category: "behavior" },
        ],
      },
    ];
  }

  if (scenarioId === "collection") {
    const state = scenarios.collection.state;
    const items = state.collection.getItems();
    const activeItem = state.collection.getItem(state.activeValue);
    const firstItem = state.collection.getFirstItem(state.includeDisabled);
    const lastItem = state.collection.getLastItem(state.includeDisabled);
    const nextItem = state.collection.getNextItem(state.activeValue, "next", {
      loop: state.loop,
      includeDisabled: state.includeDisabled,
    });
    const previousItem = state.collection.getNextItem(state.activeValue, "previous", {
      loop: state.loop,
      includeDisabled: state.includeDisabled,
    });

    return [
      {
        title: "Collection",
        selector: "[data-collection-demo]",
        summary: `${items.length} items`,
        rows: [
          { label: "Version", value: String(state.collection.version), category: "state" },
          { label: "Values", value: state.collection.getValues().join(", ") || "none", category: "state" },
          { label: "Enabled values", value: state.collection.getEnabledItems().map((item) => item.value).join(", ") || "none", category: "state" },
          { label: "Loop", value: bool(state.loop), category: "behavior" },
          { label: "Include disabled", value: bool(state.includeDisabled), category: "behavior" },
          { label: "Duplicate value", value: bool(state.duplicateValue), category: "behavior" },
        ],
      },
      {
        title: "Lookup",
        selector: `[data-collection-item='${state.activeValue}']`,
        summary: state.activeValue,
        rows: [
          { label: "Active value", value: state.activeValue, category: "state" },
          { label: "Active exists", value: bool(!!activeItem), category: "presence" },
          { label: "First", value: firstItem?.value ?? "none", category: "state" },
          { label: "Previous", value: previousItem?.value ?? "none", category: "state" },
          { label: "Next", value: nextItem?.value ?? "none", category: "state" },
          { label: "Last", value: lastItem?.value ?? "none", category: "state" },
        ],
      },
      {
        title: "Items",
        selector: "[data-collection-items]",
        summary: state.reverseOrder ? "reversed" : "normal",
        groups: items.map((item) => ({
          title: item.data.label,
          selector: `[data-collection-item='${item.value}']`,
          rows: [
            { label: "Value", value: item.value, category: "state" },
            { label: "Disabled", value: bool(item.disabled), category: "state" },
            { label: "Order", value: String(item.data.order), category: "state" },
          ],
        })),
      },
    ];
  }

  if (scenarioId === "virtualizer") {
    const state = scenarios.virtualizer.state;
    const virtualizer = state.virtualizer;
    const firstItem = virtualizer.items[0];
    const lastItem = virtualizer.items[virtualizer.items.length - 1];

    return [
      {
        title: "Virtualizer",
        selector: "[data-virtualizer-demo]",
        summary: getVirtualizerRangeLabel(virtualizer.items),
        rows: [
          { label: "Count", value: String(state.count), category: "state" },
          { label: "Overscan", value: String(state.overscan), category: "state" },
          { label: "Variable size", value: bool(state.variableSize), category: "state" },
          { label: "Zero-size rows", value: bool(state.zeroSize), category: "state" },
          { label: "Align", value: state.align, category: "state" },
          { label: "Visible count", value: String(virtualizer.items.length), category: "state" },
        ],
      },
      {
        title: "Scroll Container",
        selector: "[data-virtualizer-scroll]",
        summary: formatPx(virtualizer.viewportSize),
        rows: [
          { label: "Scroll element", value: bool(!!virtualizer.scrollElement), category: "presence" },
          { label: "Offset", value: formatPx(virtualizer.scrollOffset), category: "state" },
          { label: "Viewport size", value: formatPx(virtualizer.viewportSize), category: "state" },
          { label: "Total size", value: formatPx(virtualizer.totalSize), category: "state" },
        ],
      },
      {
        title: "Visible Range",
        selector: "[data-virtualizer-item]",
        inactive: virtualizer.items.length === 0,
        summary: getVirtualizerRangeLabel(virtualizer.items),
        rows: [
          { label: "First rendered index", value: firstItem ? String(firstItem.index) : "none", category: "state" },
          { label: "First start", value: firstItem ? formatPx(firstItem.start) : "none", category: "state" },
          { label: "Last rendered index", value: lastItem ? String(lastItem.index) : "none", category: "state" },
          { label: "Last end", value: lastItem ? formatPx(lastItem.end) : "none", category: "state" },
        ],
      },
    ];
  }

  return [];
}

function getUtilityPrimitiveLog(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
) {
  if (scenarioId === "direction") return scenarios.direction.state.log;
  if (scenarioId === "modal") return scenarios.modal.state.log;
  if (scenarioId === "drawer") return scenarios.drawer.state.log;
  if (scenarioId === "menubar") return scenarios.menubar.state.log;
  if (scenarioId === "navigation-menu") return scenarios.navigationMenu.state.log;
  if (scenarioId === "sidebar") return scenarios.sidebar.state.log;
  if (scenarioId === "swipeable-item") return scenarios.swipeableItem.state.log;
  if (scenarioId === "toast") return scenarios.toast.state.log;
  if (scenarioId === "progress") return scenarios.progress.state.log;
  if (scenarioId === "pressable") return scenarios.pressable.state.log;
  if (scenarioId === "visually-hidden") return scenarios.visuallyHidden.state.log;
  if (scenarioId === "skip-link") return scenarios.skipLink.state.log;
  if (scenarioId === "collapsible") return scenarios.collapsible.state.log;
  if (scenarioId === "toolbar") return scenarios.toolbar.state.log;
  if (scenarioId === "portal") return scenarios.portal.state.log;
  if (scenarioId === "collection") return scenarios.collection.state.log;
  if (scenarioId === "virtualizer") return scenarios.virtualizer.state.log;
  return [];
}

function getUtilityPrimitiveActions(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
) {
  if (scenarioId === "direction") return scenarios.direction.actions;
  if (scenarioId === "modal") return scenarios.modal.actions;
  if (scenarioId === "drawer") return scenarios.drawer.actions;
  if (scenarioId === "menubar") return scenarios.menubar.actions;
  if (scenarioId === "navigation-menu") return scenarios.navigationMenu.actions;
  if (scenarioId === "sidebar") return scenarios.sidebar.actions;
  if (scenarioId === "swipeable-item") return scenarios.swipeableItem.actions;
  if (scenarioId === "toast") return scenarios.toast.actions;
  if (scenarioId === "progress") return scenarios.progress.actions;
  if (scenarioId === "pressable") return scenarios.pressable.actions;
  if (scenarioId === "visually-hidden") return scenarios.visuallyHidden.actions;
  if (scenarioId === "skip-link") return scenarios.skipLink.actions;
  if (scenarioId === "collapsible") return scenarios.collapsible.actions;
  if (scenarioId === "toolbar") return scenarios.toolbar.actions;
  if (scenarioId === "portal") return scenarios.portal.actions;
  if (scenarioId === "collection") return scenarios.collection.actions;
  if (scenarioId === "virtualizer") return scenarios.virtualizer.actions;
  return null;
}

function CompositionToolbarGroup({
  value,
  onChange,
}: {
  value: CompositionMode;
  onChange: (value: CompositionMode) => void;
}) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      <MenuRadioControl label="Root" options={compositionOptions} value={value} onChange={onChange} />
    </ToolbarGroup>
  );
}

function getProgressValue(mode: ProgressMode, value: number) {
  if (mode === "indeterminate") return null;
  if (mode === "complete") return 100;
  if (mode === "invalid") return value;
  return value;
}

function getProgressMin(mode: ProgressMode) {
  return mode === "invalid" ? 10 : 0;
}

function getProgressMax(mode: ProgressMode) {
  return mode === "invalid" ? 0 : 100;
}

function getProgressVisualPercent(value: number | null, min: number, max: number) {
  if (value === null) return null;
  const normalizedMax = max > min ? max : min + 100;
  const clampedValue = Math.min(Math.max(value, min), normalizedMax);
  return ((clampedValue - min) / (normalizedMax - min)) * 100;
}

function getProgressIndicatorSource(state: ReturnType<typeof useProgressScenario>["state"]) {
  const props = sourceProps([
    state.customIndicatorSlot ? `data-slot="progress-indicator-custom"` : null,
    state.propCheck ? `data-prop-check="indicator"` : null,
  ]);

  if (state.indicatorComposition === "asChild") {
    return `<Progress.Indicator${props} asChild>
  <span />
</Progress.Indicator>`;
  }

  if (state.indicatorComposition === "render") {
    return `<Progress.Indicator${props} render={(props) => <span {...props} />} />`;
  }

  return `<Progress.Indicator${props} />`;
}

function getModalTriggerSource(state: ReturnType<typeof useModalScenario>["state"]) {
  const props = sourceProps([
    state.customTriggerSlot ? `data-slot="modal-trigger-custom"` : null,
    state.propCheck ? `data-prop-check="trigger"` : null,
    state.blockTriggerEvent ? `onClick={(event) => event.preventDefault()}` : null,
  ]);

  if (state.triggerComposition === "asChild") {
    return `<Modal.Trigger${props} asChild>
  <span>Open Modal</span>
</Modal.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<Modal.Trigger${props}
  render={(props) => <button {...props}>Open Modal</button>}
/>`;
  }

  return `<Modal.Trigger${props}>Open Modal</Modal.Trigger>`;
}

function getModalCloseSource(state: ReturnType<typeof useModalScenario>["state"]) {
  const props = sourceProps([
    state.customCloseSlot ? `data-slot="modal-close-custom"` : null,
    state.propCheck ? `data-prop-check="close"` : null,
    state.blockCloseEvent ? `onClick={(event) => event.preventDefault()}` : null,
  ]);

  if (state.closeComposition === "asChild") {
    return `<Modal.Close${props} asChild>
  <span>Close Modal</span>
</Modal.Close>`;
  }

  if (state.closeComposition === "render") {
    return `<Modal.Close${props}
  render={(props) => <button {...props}>Close Modal</button>}
/>`;
  }

  return `<Modal.Close${props}>Close Modal</Modal.Close>`;
}

function indent(source: string, spaces: number) {
  const prefix = " ".repeat(spaces);
  return source.split("\n").map((line) => `${prefix}${line}`).join("\n");
}

function sourceProps(props: Array<string | null | undefined | false>) {
  const visibleProps = props.filter(Boolean);
  return visibleProps.length > 0 ? ` ${visibleProps.join(" ")}` : "";
}

function getToolbarValue(value: string | string[]) {
  return Array.isArray(value) ? value.join(", ") || "none" : value || "none";
}

function getVirtualizerRangeLabel(items: Array<{ index: number }>) {
  if (items.length === 0) return "none";
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return "none";
  return `${first.index + 1}-${last.index + 1}`;
}

function getVirtualizerDemoItemSize(
  index: number,
  {
    variableSize,
    zeroSize,
  }: {
    variableSize: boolean;
    zeroSize: boolean;
  },
) {
  if (zeroSize && index % 11 === 0) return 0;
  if (!variableSize) return 44;
  if (index % 5 === 0) return 64;
  if (index % 3 === 0) return 52;
  return 40;
}

function formatPx(value: number) {
  return `${Math.round(value)}px`;
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

function formatOption(value: string) {
  if (value === "asChild") return "As Child";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const compositionOptions = ["default", "asChild", "render"] as const;
const progressModeOptions = ["determinate", "complete", "indeterminate", "invalid"] as const;
const progressValueOptions = ["0", "42", "75"] as const;
const orientationOptions = ["horizontal", "vertical"] as const;
const directionOptions = ["ltr", "rtl"] as const;
const placementOptions = ["start", "end", "top", "bottom"] as const;
const densityOptions = ["compact", "comfortable"] as const;
const toggleTypeOptions = ["single", "multiple"] as const;
const toolbarValueOptions = ["bold", "italic"] as const;
const sidebarStateOptions = ["expanded", "rail", "offcanvas"] as const;
const sidebarCollapsedStateOptions = ["rail", "offcanvas"] as const;
const sidebarSideOptions = ["left", "right"] as const;
const swipeOpenSideOptions = ["none", "start", "end"] as const;
const swipeThresholdOptions = ["0.2", "0.35", "0.6"] as const;
const swipeFullThresholdOptions = ["0.4", "0.6", "0.8"] as const;
const toastKindOptions = ["default", "success", "error", "warning", "info", "loading"] as const;
const toastPositionOptions = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"] as const;
const toastDurationOptions = ["short", "infinite"] as const;
const virtualizerCountOptions = ["12", "40", "100"] as const;
const virtualizerOverscanOptions = ["0", "1", "2", "5"] as const;
const virtualizerAlignOptions = ["start", "center", "end", "auto"] as const;
