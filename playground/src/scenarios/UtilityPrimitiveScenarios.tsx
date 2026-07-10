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
import { Toast, getToasts, toast, useToastStore } from "@flowstack-ui/atom/toast";
import { Toolbar } from "@flowstack-ui/atom/toolbar";
import { useVirtualizer } from "@flowstack-ui/atom/virtualizer";
import { VisuallyHidden } from "@flowstack-ui/atom/visually-hidden";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ButtonHTMLAttributes,
  type Dispatch,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { AnatomyPanel, type AnatomySection } from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps, type WorkbenchOption } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type ProgressMode = "determinate" | "complete" | "indeterminate" | "invalid";
type Orientation = "horizontal" | "vertical";
type TextDirection = "ltr" | "rtl";
type ToolbarDirectionMode = "default" | "provider-rtl" | "local-ltr" | "local-rtl";
type ToggleType = "single" | "multiple";
type ToolbarValue = "none" | "bold" | "italic";
type OverlayPlacement = "start" | "end" | "top" | "bottom";
type DrawerTitleLevel = "h2" | "h3" | "h4";
type SidebarStateValue = "expanded" | "rail" | "offcanvas";
type SidebarSideValue = "left" | "right";
type ToastKind = "default" | "success" | "error" | "warning" | "info" | "loading";
type ToastPositionValue = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type ToastRenderMode = "imperative" | "declarative";
type ToastViewportPortalMode = "body" | "local" | "disabled";
type VirtualizerAlignValue = "start" | "center" | "end" | "auto";
type SkipLinkTargetMode = "valid" | "missing" | "malformed";
type MenubarSide = "bottom" | "top" | "right" | "left";
type MenubarAlign = "start" | "center" | "end";
type MenubarValueOption = "none" | "file" | "view";
type MenubarDirectionMode = "provider" | "root";

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
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
  const [overlayDisabled, setOverlayDisabled] = useState(false);
  const [portalDisabled, setPortalDisabled] = useState(false);
  const [customContainer, setCustomContainer] = useState(false);
  const [placement, setPlacement] = useState<OverlayPlacement>("end");
  const [titleAs, setTitleAs] = useState<DrawerTitleLevel>("h2");
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const [closeComposition, setCloseComposition] = useState<CompositionMode>("default");
  const [blockTriggerEvent, setBlockTriggerEvent] = useState(false);
  const [blockCloseEvent, setBlockCloseEvent] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customOverlaySlot, setCustomOverlaySlot] = useState(false);
  const [customContentSlot, setCustomContentSlot] = useState(false);
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

  const handleDefaultOpenChange = (nextDefaultOpen: boolean) => {
    setDefaultOpen(nextDefaultOpen);
    if (!controlled) setOpen(nextDefaultOpen);
  };

  return {
    state: {
      controlled,
      open,
      defaultOpen,
      nestedOpen,
      disabled,
      keepMounted,
      closeOnEscape,
      closeOnBackdropClick,
      overlayDisabled,
      portalDisabled,
      customContainer,
      placement,
      titleAs,
      triggerComposition,
      closeComposition,
      blockTriggerEvent,
      blockCloseEvent,
      propCheck,
      customTriggerSlot,
      customOverlaySlot,
      customContentSlot,
      customTitleSlot,
      customDescriptionSlot,
      customCloseSlot,
      log,
    },
    actions: {
      setControlled,
      setOpen,
      setDefaultOpen: handleDefaultOpenChange,
      setNestedOpen,
      setDisabled,
      setKeepMounted,
      setCloseOnEscape,
      setCloseOnBackdropClick,
      setOverlayDisabled,
      setPortalDisabled,
      setCustomContainer,
      setPlacement,
      setTitleAs,
      setTriggerComposition,
      setCloseComposition,
      setBlockTriggerEvent,
      setBlockCloseEvent,
      setPropCheck,
      setCustomTriggerSlot,
      setCustomOverlaySlot,
      setCustomContentSlot,
      setCustomTitleSlot,
      setCustomDescriptionSlot,
      setCustomCloseSlot,
      handleOpenChange,
      handleNestedOpenChange,
      noteDrawerEvent: addLog,
      clearLog,
    },
  };
}

function useMenubarScenario() {
  const [controlled, setControlled] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [defaultValue, setDefaultValue] = useState<MenubarValueOption>("none");
  const [loop, setLoop] = useState(true);
  const [menuLoop, setMenuLoop] = useState(true);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [closeOnSelect, setCloseOnSelect] = useState(true);
  const [fileDisabled, setFileDisabled] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [density, setDensity] = useState("comfortable");
  const [dir, setDir] = useState<TextDirection>("ltr");
  const [dirMode, setDirMode] = useState<MenubarDirectionMode>("provider");
  const [side, setSide] = useState<MenubarSide>("bottom");
  const [align, setAlign] = useState<MenubarAlign>("start");
  const [sideOffset, setSideOffset] = useState(4);
  const [contentAriaLabel, setContentAriaLabel] = useState(true);
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customContentSlot, setCustomContentSlot] = useState(false);
  const [customGroupSlot, setCustomGroupSlot] = useState(false);
  const [customItemSlot, setCustomItemSlot] = useState(false);
  const [customCheckboxItemSlot, setCustomCheckboxItemSlot] = useState(false);
  const [customRadioGroupSlot, setCustomRadioGroupSlot] = useState(false);
  const [customRadioItemSlot, setCustomRadioItemSlot] = useState(false);
  const [customSeparatorSlot, setCustomSeparatorSlot] = useState(false);
  const [customSubTriggerSlot, setCustomSubTriggerSlot] = useState(false);
  const [customSubContentSlot, setCustomSubContentSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (nextValue: string | null) => {
    setValue(nextValue);
    addLog(nextValue ? `opened ${nextValue}` : "closed");
  };

  const setControlledValue = (nextValue: string | null) => {
    setValue(nextValue);
    addLog(nextValue ? `controlled open ${nextValue}` : "controlled close");
  };

  return {
    state: {
      controlled,
      value,
      defaultValue,
      loop,
      menuLoop,
      closeOnEscape,
      closeOnSelect,
      fileDisabled,
      showGrid,
      density,
      dir,
      dirMode,
      side,
      align,
      sideOffset,
      contentAriaLabel,
      propCheck,
      customRootSlot,
      customTriggerSlot,
      customContentSlot,
      customGroupSlot,
      customItemSlot,
      customCheckboxItemSlot,
      customRadioGroupSlot,
      customRadioItemSlot,
      customSeparatorSlot,
      customSubTriggerSlot,
      customSubContentSlot,
      log,
    },
    actions: {
      setControlled,
      setValue,
      setControlledValue,
      setDefaultValue,
      setLoop,
      setMenuLoop,
      setCloseOnEscape,
      setCloseOnSelect,
      setFileDisabled,
      setShowGrid,
      setDensity,
      setDir,
      setDirMode,
      setSide,
      setAlign,
      setSideOffset,
      setContentAriaLabel,
      setPropCheck,
      setCustomRootSlot,
      setCustomTriggerSlot,
      setCustomContentSlot,
      setCustomGroupSlot,
      setCustomItemSlot,
      setCustomCheckboxItemSlot,
      setCustomRadioGroupSlot,
      setCustomRadioItemSlot,
      setCustomSeparatorSlot,
      setCustomSubTriggerSlot,
      setCustomSubContentSlot,
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
  const [initialState, setInitialState] = useState<SidebarStateValue>("expanded");
  const [collapsedState, setCollapsedState] = useState<"rail" | "offcanvas">("offcanvas");
  const [side, setSide] = useState<SidebarSideValue>("left");
  const [disabled, setDisabled] = useState(false);
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const [panelComposition, setPanelComposition] = useState<CompositionMode>("default");
  const [mainComposition, setMainComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customPanelSlot, setCustomPanelSlot] = useState(false);
  const [customMainSlot, setCustomMainSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleStateChange = (nextState: SidebarStateValue) => {
    setState(nextState);
    addLog(`state ${nextState}`);
  };

  const handleInitialStateChange = (nextState: SidebarStateValue) => {
    setInitialState(nextState);
    setState(nextState);
    addLog(`initial state ${nextState}`);
  };

  return {
    state: {
      controlled,
      state,
      initialState,
      collapsedState,
      side,
      disabled,
      rootComposition,
      triggerComposition,
      panelComposition,
      mainComposition,
      propCheck,
      customRootSlot,
      customTriggerSlot,
      customPanelSlot,
      customMainSlot,
      log,
    },
    actions: {
      setControlled,
      setInitialState: handleInitialStateChange,
      setState: handleStateChange,
      setCollapsedState,
      setSide,
      setDisabled,
      setRootComposition,
      setTriggerComposition,
      setPanelComposition,
      setMainComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomTriggerSlot,
      setCustomPanelSlot,
      setCustomMainSlot,
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
  const [renderMode, setRenderMode] = useState<ToastRenderMode>("imperative");
  const [declarativeVisible, setDeclarativeVisible] = useState(false);
  const [type, setType] = useState<ToastKind>("default");
  const [position, setPosition] = useState<ToastPositionValue>("bottom-right");
  const [maxVisible, setMaxVisible] = useState("3");
  const [closeButton, setCloseButton] = useState(true);
  const [action, setAction] = useState(true);
  const [duration, setDuration] = useState<"short" | "infinite">("infinite");
  const [dismissible, setDismissible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [forceMount, setForceMount] = useState(false);
  const [expandOnHover, setExpandOnHover] = useState(true);
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const [pauseOnFocusLoss, setPauseOnFocusLoss] = useState(true);
  const [portalMode, setPortalMode] = useState<ToastViewportPortalMode>("body");
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [titleComposition, setTitleComposition] = useState<CompositionMode>("default");
  const [descriptionComposition, setDescriptionComposition] = useState<CompositionMode>("default");
  const [actionComposition, setActionComposition] = useState<CompositionMode>("default");
  const [cancelComposition, setCancelComposition] = useState<CompositionMode>("default");
  const [closeComposition, setCloseComposition] = useState<CompositionMode>("default");
  const [viewportComposition, setViewportComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customViewportSlot, setCustomViewportSlot] = useState(false);
  const [customTitleSlot, setCustomTitleSlot] = useState(false);
  const [customDescriptionSlot, setCustomDescriptionSlot] = useState(false);
  const [customActionSlot, setCustomActionSlot] = useState(false);
  const [customCancelSlot, setCustomCancelSlot] = useState(false);
  const [customCloseSlot, setCustomCloseSlot] = useState(false);
  const [rootRef, setRootRef] = useState("none");
  const [viewportRef, setViewportRef] = useState("none");
  const [titleRef, setTitleRef] = useState("none");
  const [descriptionRef, setDescriptionRef] = useState("none");
  const [actionRef, setActionRef] = useState("none");
  const [cancelRef, setCancelRef] = useState("none");
  const [closeRef, setCloseRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();
  const handleRenderModeChange = (nextMode: ToastRenderMode) => {
    setRenderMode(nextMode);
    addLog(`rendering ${nextMode}`);
  };
  const markRootRef = useCallback((node: HTMLElement | null) => {
    setRootRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markViewportRef = useCallback((node: HTMLElement | null) => {
    setViewportRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markTitleRef = useCallback((node: HTMLElement | null) => {
    setTitleRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markDescriptionRef = useCallback((node: HTMLElement | null) => {
    setDescriptionRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markActionRef = useCallback((node: HTMLElement | null) => {
    setActionRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markCancelRef = useCallback((node: HTMLElement | null) => {
    setCancelRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markCloseRef = useCallback((node: HTMLElement | null) => {
    setCloseRef(node?.tagName.toLowerCase() ?? "none");
  }, []);

  const showToast = () => {
    const options = {
      title: `${formatOption(type)} toast`,
      description: "Playground notification body.",
      duration: duration === "infinite" ? Infinity : 3500,
      dismissible,
      onDismiss: () => addLog("toast dismissed"),
      onAutoClose: () => addLog("toast auto closed"),
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
    setDeclarativeVisible(false);
    addLog("dismiss all");
  };

  const showDeclarative = () => {
    setDeclarativeVisible(true);
    addLog("declarative show");
  };

  const hideDeclarative = () => {
    setDeclarativeVisible(false);
    addLog("declarative hide");
  };

  return {
    state: {
      renderMode,
      declarativeVisible,
      type,
      position,
      maxVisible,
      closeButton,
      action,
      duration,
      dismissible,
      paused,
      forceMount,
      expandOnHover,
      pauseOnHover,
      pauseOnFocusLoss,
      portalMode,
      rootComposition,
      titleComposition,
      descriptionComposition,
      actionComposition,
      cancelComposition,
      closeComposition,
      viewportComposition,
      propCheck,
      customRootSlot,
      customViewportSlot,
      customTitleSlot,
      customDescriptionSlot,
      customActionSlot,
      customCancelSlot,
      customCloseSlot,
      rootRef,
      viewportRef,
      titleRef,
      descriptionRef,
      actionRef,
      cancelRef,
      closeRef,
      log,
    },
    actions: {
      setRenderMode: handleRenderModeChange,
      setType,
      setPosition,
      setMaxVisible,
      setCloseButton,
      setAction,
      setDuration,
      setDismissible,
      setPaused,
      setForceMount,
      setExpandOnHover,
      setPauseOnHover,
      setPauseOnFocusLoss,
      setPortalMode,
      setRootComposition,
      setTitleComposition,
      setDescriptionComposition,
      setActionComposition,
      setCancelComposition,
      setCloseComposition,
      setViewportComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomViewportSlot,
      setCustomTitleSlot,
      setCustomDescriptionSlot,
      setCustomActionSlot,
      setCustomCancelSlot,
      setCustomCloseSlot,
      markRootRef,
      markViewportRef,
      markTitleRef,
      markDescriptionRef,
      markActionRef,
      markCancelRef,
      markCloseRef,
      noteRootAutoClose: () => addLog("root auto closed"),
      noteRootDismiss: () => addLog("root dismissed"),
      noteDeclarativeAutoClose: () => {
        if (!forceMount) setDeclarativeVisible(false);
        addLog("declarative auto closed");
      },
      noteDeclarativeDismiss: () => {
        if (!forceMount) setDeclarativeVisible(false);
        addLog("declarative dismissed");
      },
      showToast,
      showDeclarative,
      hideDeclarative,
      dismissAll,
      clearLog,
    },
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
  const [blockTriggerEvent, setBlockTriggerEvent] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const [contentComposition, setContentComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customContentSlot, setCustomContentSlot] = useState(false);
  const [rootRef, setRootRef] = useState("none");
  const [triggerRef, setTriggerRef] = useState("none");
  const [contentRef, setContentRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();
  const markRootRef = useCallback((node: HTMLElement | null) => {
    setRootRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markTriggerRef = useCallback((node: HTMLElement | null) => {
    setTriggerRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markContentRef = useCallback((node: HTMLElement | null) => {
    setContentRef(node?.tagName.toLowerCase() ?? "none");
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    addLog(nextOpen ? "opened" : "closed");
  };

  const handleBlockedTrigger = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    addLog("trigger click blocked");
  };

  return {
    state: {
      controlled,
      open,
      disabled,
      keepMounted,
      blockTriggerEvent,
      composition,
      triggerComposition,
      contentComposition,
      propCheck,
      customRootSlot,
      customTriggerSlot,
      customContentSlot,
      rootRef,
      triggerRef,
      contentRef,
      log,
    },
    actions: {
      setControlled,
      setOpen,
      setDisabled,
      setKeepMounted,
      setBlockTriggerEvent,
      setComposition,
      setTriggerComposition,
      setContentComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomTriggerSlot,
      setCustomContentSlot,
      markRootRef,
      markTriggerRef,
      markContentRef,
      handleOpenChange,
      handleBlockedTrigger,
      clearLog,
    },
  };
}

function useToolbarScenario() {
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [directionMode, setDirectionMode] = useState<ToolbarDirectionMode>("default");
  const [loop, setLoop] = useState(true);
  const [disabledButton, setDisabledButton] = useState(false);
  const [disabledLink, setDisabledLink] = useState(false);
  const [disabledToggleGroup, setDisabledToggleGroup] = useState(false);
  const [disabledToggleItem, setDisabledToggleItem] = useState(false);
  const [toggleType, setToggleType] = useState<ToggleType>("single");
  const [toggleControlled, setToggleControlled] = useState(false);
  const [defaultToggleValue, setDefaultToggleValue] = useState<ToolbarValue>("none");
  const [toggleValue, setToggleValue] = useState<string | string[]>("");
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [buttonComposition, setButtonComposition] = useState<CompositionMode>("default");
  const [linkComposition, setLinkComposition] = useState<CompositionMode>("default");
  const [separatorComposition, setSeparatorComposition] = useState<CompositionMode>("default");
  const [toggleGroupComposition, setToggleGroupComposition] = useState<CompositionMode>("default");
  const [toggleItemComposition, setToggleItemComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customButtonSlot, setCustomButtonSlot] = useState(false);
  const [customLinkSlot, setCustomLinkSlot] = useState(false);
  const [customSeparatorSlot, setCustomSeparatorSlot] = useState(false);
  const [customToggleGroupSlot, setCustomToggleGroupSlot] = useState(false);
  const [customToggleItemSlot, setCustomToggleItemSlot] = useState(false);
  const [rootRef, setRootRef] = useState("none");
  const [buttonRef, setButtonRef] = useState("none");
  const [linkRef, setLinkRef] = useState("none");
  const [toggleItemRef, setToggleItemRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleToggleType = (nextType: ToggleType) => {
    setToggleType(nextType);
    setDefaultToggleValue("none");
    setToggleValue(nextType === "single" ? "" : []);
  };

  const toTypedValue = (value: ToolbarValue, type = toggleType): string | string[] => {
    if (type === "single") return value === "none" ? "" : value;
    return value === "none" ? [] : [value];
  };

  const handleValueChange = (nextValue: string | string[]) => {
    setToggleValue(nextValue);
    const value = Array.isArray(nextValue) ? nextValue.join(", ") || "none" : nextValue || "none";
    addLog(`value changed ${value}`);
  };
  const markPartRef = (setter: Dispatch<SetStateAction<string>>, fallback: string) => (element: HTMLElement | null) => {
    setter(element?.tagName.toLowerCase() ?? fallback);
  };

  return {
    state: {
      orientation,
      directionMode,
      loop,
      disabledButton,
      disabledLink,
      disabledToggleGroup,
      disabledToggleItem,
      toggleType,
      toggleControlled,
      defaultToggleValue,
      toggleValue,
      rootComposition,
      buttonComposition,
      linkComposition,
      separatorComposition,
      toggleGroupComposition,
      toggleItemComposition,
      propCheck,
      customRootSlot,
      customButtonSlot,
      customLinkSlot,
      customSeparatorSlot,
      customToggleGroupSlot,
      customToggleItemSlot,
      rootRef,
      buttonRef,
      linkRef,
      toggleItemRef,
      log,
    },
    actions: {
      setOrientation,
      setDirectionMode,
      setLoop,
      setDisabledButton,
      setDisabledLink,
      setDisabledToggleGroup,
      setDisabledToggleItem,
      setToggleType: handleToggleType,
      setToggleControlled,
      setDefaultToggleValue,
      setToggleValue: (value: ToolbarValue) => setToggleValue(toTypedValue(value)),
      setRootComposition,
      setButtonComposition,
      setLinkComposition,
      setSeparatorComposition,
      setToggleGroupComposition,
      setToggleItemComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomButtonSlot,
      setCustomLinkSlot,
      setCustomSeparatorSlot,
      setCustomToggleGroupSlot,
      setCustomToggleItemSlot,
      markRootRef: markPartRef(setRootRef, "none"),
      markButtonRef: markPartRef(setButtonRef, "none"),
      markLinkRef: markPartRef(setLinkRef, "none"),
      markToggleItemRef: markPartRef(setToggleItemRef, "none"),
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
          {scenario.state.controlled ? (
            <MenuCheckboxControl checked={scenario.state.open} label="Open" value="open" onChange={scenario.actions.setOpen} />
          ) : (
            <MenuCheckboxControl checked={scenario.state.defaultOpen} label="Default open" value="default-open" onChange={scenario.actions.setDefaultOpen} />
          )}
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.keepMounted} label="Keep mounted" value="keep-mounted" onChange={scenario.actions.setKeepMounted} />
        </ToolbarGroup>
        <ToolbarGroup title="Popup" value="popup">
          <MenuCheckboxControl checked={scenario.state.portalDisabled} label="Disable Portal" value="portal-disabled" onChange={scenario.actions.setPortalDisabled} />
          <MenuCheckboxControl checked={scenario.state.customContainer} label="Custom Container" value="custom-container" onChange={scenario.actions.setCustomContainer} />
          <MenuRadioControl label="Placement" options={placementOptions} value={scenario.state.placement} onChange={(value) => scenario.actions.setPlacement(value as OverlayPlacement)} />
        </ToolbarGroup>
        <ToolbarGroup title="Content" value="content">
          <MenuRadioControl label="Title Element" options={drawerTitleLevelOptions} value={scenario.state.titleAs} onChange={(value) => scenario.actions.setTitleAs(value as DrawerTitleLevel)} />
        </ToolbarGroup>
        <ToolbarGroup title="Dismiss" value="dismiss">
          <MenuCheckboxControl checked={scenario.state.closeOnEscape} label="Escape closes" value="escape" onChange={scenario.actions.setCloseOnEscape} />
          <MenuCheckboxControl checked={scenario.state.closeOnBackdropClick} label="Backdrop closes" value="backdrop" onChange={scenario.actions.setCloseOnBackdropClick} />
          <MenuCheckboxControl checked={scenario.state.overlayDisabled} label="Disable Overlay" value="overlay-disabled" onChange={scenario.actions.setOverlayDisabled} />
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
              checked: scenario.state.customOverlaySlot,
              label: "Overlay Slot",
              value: "overlay-slot",
              onChange: scenario.actions.setCustomOverlaySlot,
            },
            {
              checked: scenario.state.customContentSlot,
              label: "Content Slot",
              value: "content-slot",
              onChange: scenario.actions.setCustomContentSlot,
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

  if (scenarioId === "menubar") {
    const scenario = scenarios.menubar;
    return (
      <ControlToolbar label="Menubar controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.menuLoop} label="Menu loop" value="menu-loop" onChange={scenario.actions.setMenuLoop} />
          <MenuCheckboxControl checked={scenario.state.closeOnSelect} label="Close on select" value="close-on-select" onChange={scenario.actions.setCloseOnSelect} />
          <MenuCheckboxControl checked={scenario.state.closeOnEscape} label="Escape closes" value="escape-closes" onChange={scenario.actions.setCloseOnEscape} />
          <MenuCheckboxControl checked={scenario.state.fileDisabled} label="File disabled" value="file-disabled" onChange={scenario.actions.setFileDisabled} />
          <MenuRadioControl label="Default value" options={menubarValueOptions} value={scenario.state.defaultValue} onChange={scenario.actions.setDefaultValue} />
          <MenuSection label="Controlled value">
            <Menubar.Item className="toolbar-menu-item" disabled={!scenario.state.controlled} value="open-file" onSelect={() => scenario.actions.setControlledValue("file")}>
              <span>Open File</span>
            </Menubar.Item>
            <Menubar.Item className="toolbar-menu-item" disabled={!scenario.state.controlled} value="open-view" onSelect={() => scenario.actions.setControlledValue("view")}>
              <span>Open View</span>
            </Menubar.Item>
            <Menubar.Item className="toolbar-menu-item" disabled={!scenario.state.controlled} value="close-menubar" onSelect={() => scenario.actions.setControlledValue(null)}>
              <span>Close</span>
            </Menubar.Item>
          </MenuSection>
        </ToolbarGroup>
        <ToolbarGroup title="Popup" value="popup">
          <MenuRadioControl label="Direction" options={directionOptions} value={scenario.state.dir} onChange={scenario.actions.setDir} />
          <MenuRadioControl label="Direction mode" options={menubarDirectionModeOptions} value={scenario.state.dirMode} onChange={scenario.actions.setDirMode} />
          <MenuSection label="Content">
            <MenuCheckboxControl checked={scenario.state.contentAriaLabel} label="Content ariaLabel" value="content-aria-label" onChange={scenario.actions.setContentAriaLabel} />
          </MenuSection>
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customTriggerSlot, label: "Trigger Slot", value: "trigger-slot", onChange: scenario.actions.setCustomTriggerSlot },
            { checked: scenario.state.customContentSlot, label: "Content Slot", value: "content-slot", onChange: scenario.actions.setCustomContentSlot },
            { checked: scenario.state.customItemSlot, label: "Item Slot", value: "item-slot", onChange: scenario.actions.setCustomItemSlot },
            { checked: scenario.state.customSubContentSlot, label: "Sub Content Slot", value: "sub-content-slot", onChange: scenario.actions.setCustomSubContentSlot },
          ]}
          onPropCheckChange={scenario.actions.setPropCheck}
        />
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
          {!scenario.state.controlled ? (
            <MenuRadioControl label="Initial state" options={sidebarStateOptions} value={scenario.state.initialState} onChange={scenario.actions.setInitialState} />
          ) : null}
          <MenuRadioControl label="Collapsed state" options={sidebarCollapsedStateOptions} value={scenario.state.collapsedState} onChange={scenario.actions.setCollapsedState} />
        </ToolbarGroup>
        {scenario.state.controlled ? (
          <ToolbarGroup title="Controlled Value" value="controlled-value">
            <MenuRadioControl label="State" options={sidebarStateOptions} value={scenario.state.state} onChange={scenario.actions.setState} />
          </ToolbarGroup>
        ) : null}
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Side" options={sidebarSideOptions} value={scenario.state.side} onChange={scenario.actions.setSide} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Trigger" options={compositionOptions} value={scenario.state.triggerComposition} onChange={scenario.actions.setTriggerComposition} />
          <MenuRadioControl label="Panel" options={compositionOptions} value={scenario.state.panelComposition} onChange={scenario.actions.setPanelComposition} />
          <MenuRadioControl label="Main" options={compositionOptions} value={scenario.state.mainComposition} onChange={scenario.actions.setMainComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customTriggerSlot, label: "Trigger Slot", value: "trigger-slot", onChange: scenario.actions.setCustomTriggerSlot },
            { checked: scenario.state.customPanelSlot, label: "Panel Slot", value: "panel-slot", onChange: scenario.actions.setCustomPanelSlot },
            { checked: scenario.state.customMainSlot, label: "Main Slot", value: "main-slot", onChange: scenario.actions.setCustomMainSlot },
          ]}
          onPropCheckChange={scenario.actions.setPropCheck}
        />
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
        <ToolbarGroup title="Rendering" value="rendering">
          <MenuRadioControl label="Mode" options={toastRenderModeOptions} value={scenario.state.renderMode} onChange={scenario.actions.setRenderMode} />
        </ToolbarGroup>
        <ToolbarGroup title="State" value="state">
          <MenuSection label="Root">
            <MenuCheckboxControl checked={scenario.state.dismissible} label="Dismissible" value="dismissible" onChange={scenario.actions.setDismissible} />
            <MenuCheckboxControl checked={scenario.state.paused} label="Paused" value="paused" onChange={scenario.actions.setPaused} />
            <MenuCheckboxControl checked={scenario.state.forceMount} label="Force mount" value="force-mount" onChange={scenario.actions.setForceMount} />
          </MenuSection>
          <MenuSection label="Children">
            <MenuCheckboxControl checked={scenario.state.action} label="Action buttons" value="action" onChange={scenario.actions.setAction} />
          </MenuSection>
        </ToolbarGroup>
        <ToolbarGroup title="Provider" value="provider">
          <MenuCheckboxControl checked={scenario.state.closeButton} label="Close button" value="close-button" onChange={scenario.actions.setCloseButton} />
          <MenuCheckboxControl checked={scenario.state.expandOnHover} label="Expand on hover" value="expand-on-hover" onChange={scenario.actions.setExpandOnHover} />
          <MenuCheckboxControl checked={scenario.state.pauseOnHover} label="Pause on hover" value="pause-on-hover" onChange={scenario.actions.setPauseOnHover} />
          <MenuCheckboxControl checked={scenario.state.pauseOnFocusLoss} label="Pause on focus loss" value="pause-on-focus-loss" onChange={scenario.actions.setPauseOnFocusLoss} />
          <MenuRadioControl label="Max visible" options={toastMaxVisibleOptions} value={scenario.state.maxVisible} onChange={scenario.actions.setMaxVisible} />
        </ToolbarGroup>
        <ToolbarGroup title="Message" value="message">
          <MenuRadioControl label="Type" options={toastKindOptions} value={scenario.state.type} onChange={scenario.actions.setType} />
          <MenuRadioControl label="Duration" options={toastDurationOptions} value={scenario.state.duration} onChange={scenario.actions.setDuration} />
        </ToolbarGroup>
        <ToolbarGroup title="Position" value="position">
          <MenuRadioControl label="Side" options={toastPositionOptions} value={scenario.state.position} onChange={scenario.actions.setPosition} />
          <MenuRadioControl label="Portal" options={toastPortalModeOptions} value={scenario.state.portalMode} onChange={scenario.actions.setPortalMode} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Title" options={compositionOptions} value={scenario.state.titleComposition} onChange={scenario.actions.setTitleComposition} />
          <MenuRadioControl label="Description" options={compositionOptions} value={scenario.state.descriptionComposition} onChange={scenario.actions.setDescriptionComposition} />
          <MenuRadioControl label="Action" options={compositionOptions} value={scenario.state.actionComposition} onChange={scenario.actions.setActionComposition} />
          <MenuRadioControl label="Cancel" options={compositionOptions} value={scenario.state.cancelComposition} onChange={scenario.actions.setCancelComposition} />
          <MenuRadioControl label="Close" options={compositionOptions} value={scenario.state.closeComposition} onChange={scenario.actions.setCloseComposition} />
          <MenuRadioControl label="Viewport" options={toastViewportCompositionOptions} value={scenario.state.viewportComposition} onChange={scenario.actions.setViewportComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customViewportSlot, label: "Viewport", value: "viewport-slot", onChange: scenario.actions.setCustomViewportSlot },
            { checked: scenario.state.customTitleSlot, label: "Title", value: "title-slot", onChange: scenario.actions.setCustomTitleSlot },
            { checked: scenario.state.customDescriptionSlot, label: "Description", value: "description-slot", onChange: scenario.actions.setCustomDescriptionSlot },
            { checked: scenario.state.customActionSlot, label: "Action", value: "action-slot", onChange: scenario.actions.setCustomActionSlot },
            { checked: scenario.state.customCancelSlot, label: "Cancel", value: "cancel-slot", onChange: scenario.actions.setCustomCancelSlot },
            { checked: scenario.state.customCloseSlot, label: "Close", value: "close-slot", onChange: scenario.actions.setCustomCloseSlot },
          ]}
        />
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
          <MenuSection label="Root State">
            <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          </MenuSection>
          {scenario.state.controlled ? (
            <MenuSection label="Controlled Value">
              <MenuCheckboxControl checked={scenario.state.open} label="Open" value="open" onChange={scenario.actions.setOpen} />
            </MenuSection>
          ) : null}
          <MenuSection label="Availability">
            <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          </MenuSection>
          <MenuSection label="Behavior">
            <MenuCheckboxControl checked={scenario.state.keepMounted} label="Keep mounted" value="keep-mounted" onChange={scenario.actions.setKeepMounted} />
            <MenuCheckboxControl checked={scenario.state.blockTriggerEvent} label="Block trigger" value="block-trigger" onChange={scenario.actions.setBlockTriggerEvent} />
          </MenuSection>
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.composition} onChange={scenario.actions.setComposition} />
          <MenuRadioControl label="Trigger" options={compositionOptions} value={scenario.state.triggerComposition} onChange={scenario.actions.setTriggerComposition} />
          <MenuRadioControl label="Content" options={compositionOptions} value={scenario.state.contentComposition} onChange={scenario.actions.setContentComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customTriggerSlot, label: "Trigger Slot", value: "trigger-slot", onChange: scenario.actions.setCustomTriggerSlot },
            { checked: scenario.state.customContentSlot, label: "Content Slot", value: "content-slot", onChange: scenario.actions.setCustomContentSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "toolbar") {
    const scenario = scenarios.toolbar;
    return (
      <ControlToolbar label="Toolbar controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.disabledButton} label="Disable Button" value="disabled-button" onChange={scenario.actions.setDisabledButton} />
          <MenuCheckboxControl checked={scenario.state.disabledLink} label="Disable Link" value="disabled-link" onChange={scenario.actions.setDisabledLink} />
          <MenuCheckboxControl checked={scenario.state.disabledToggleGroup} label="Disable Toggle Group" value="disabled-toggle-group" onChange={scenario.actions.setDisabledToggleGroup} />
          <MenuCheckboxControl checked={scenario.state.disabledToggleItem} label="Disable Toggle Item" value="disabled-toggle-item" onChange={scenario.actions.setDisabledToggleItem} />
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
          <MenuRadioControl<ToolbarDirectionMode> label="Direction" options={toolbarDirectionModeOptions} value={scenario.state.directionMode} onChange={scenario.actions.setDirectionMode} />
        </ToolbarGroup>
        <ToolbarGroup title="Toggles" value="toggles">
          <MenuRadioControl label="Type" options={toggleTypeOptions} value={scenario.state.toggleType} onChange={scenario.actions.setToggleType} />
          <MenuCheckboxControl checked={scenario.state.toggleControlled} label="Controlled" value="toggle-controlled" onChange={scenario.actions.setToggleControlled} />
          <MenuRadioControl label="Default Value" options={toolbarValueOptions} value={scenario.state.defaultToggleValue} onChange={scenario.actions.setDefaultToggleValue} />
          {scenario.state.toggleControlled ? (
            <MenuRadioControl label="Value" options={toolbarValueOptions} value={getToolbarValue(scenario.state.toggleValue) as ToolbarValue} onChange={scenario.actions.setToggleValue} />
          ) : null}
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Button" options={compositionOptions} value={scenario.state.buttonComposition} onChange={scenario.actions.setButtonComposition} />
          <MenuRadioControl label="Link" options={compositionOptions} value={scenario.state.linkComposition} onChange={scenario.actions.setLinkComposition} />
          <MenuRadioControl label="Separator" options={compositionOptions} value={scenario.state.separatorComposition} onChange={scenario.actions.setSeparatorComposition} />
          <MenuRadioControl label="Toggle Group" options={compositionOptions} value={scenario.state.toggleGroupComposition} onChange={scenario.actions.setToggleGroupComposition} />
          <MenuRadioControl label="Toggle Item" options={compositionOptions} value={scenario.state.toggleItemComposition} onChange={scenario.actions.setToggleItemComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customButtonSlot, label: "Button Slot", value: "button-slot", onChange: scenario.actions.setCustomButtonSlot },
            { checked: scenario.state.customLinkSlot, label: "Link Slot", value: "link-slot", onChange: scenario.actions.setCustomLinkSlot },
            { checked: scenario.state.customSeparatorSlot, label: "Separator Slot", value: "separator-slot", onChange: scenario.actions.setCustomSeparatorSlot },
            { checked: scenario.state.customToggleGroupSlot, label: "Toggle Group Slot", value: "toggle-group-slot", onChange: scenario.actions.setCustomToggleGroupSlot },
            { checked: scenario.state.customToggleItemSlot, label: "Toggle Item Slot", value: "toggle-item-slot", onChange: scenario.actions.setCustomToggleItemSlot },
          ]}
        />
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
    return `${state.renderMode} | ${state.type} | ${state.position} | ${state.duration}`;
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
    const resolvedDir = getToolbarResolvedDirection(state.directionMode);
    return `${state.orientation} | ${resolvedDir} | Loop ${state.loop} | Value ${getToolbarValue(state.toggleValue)}`;
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
    const rootProps = [
      state.controlled ? "open={open}" : state.defaultOpen ? "defaultOpen" : null,
      state.disabled ? "disabled" : null,
      state.keepMounted ? "keepMounted" : null,
      state.closeOnEscape ? null : "closeOnEscape={false}",
      state.closeOnBackdropClick ? null : "closeOnBackdropClick={false}",
      "onOpenChange={handleOpenChange}",
    ];
    const portalProps = [
      state.portalDisabled ? "disabled" : null,
      state.customContainer ? "container={containerNode}" : null,
    ];
    const overlayProps = [
      state.overlayDisabled ? "disabled" : null,
      state.customOverlaySlot ? `data-slot="drawer-overlay-custom"` : null,
      state.propCheck ? `data-prop-check="overlay"` : null,
    ];
    const contentProps = [
      `placement="${state.placement}"`,
      `ariaLabel="Project drawer"`,
      state.customContentSlot ? `data-slot="drawer-content-custom"` : null,
      state.propCheck ? `data-prop-check="content"` : null,
    ];
    const titleProps = [
      state.titleAs !== "h2" ? `as="${state.titleAs}"` : null,
      state.customTitleSlot ? `data-slot="drawer-title-custom"` : null,
      state.propCheck ? `data-prop-check="title"` : null,
    ];
    const descriptionProps = [
      state.customDescriptionSlot ? `data-slot="drawer-description-custom"` : null,
      state.propCheck ? `data-prop-check="description"` : null,
    ];
    const triggerProps = [
      state.triggerComposition === "asChild" ? "asChild" : null,
      state.blockTriggerEvent ? "onClick={(event) => event.preventDefault()}" : null,
      state.customTriggerSlot ? `data-slot="drawer-trigger-custom"` : null,
      state.propCheck ? `data-prop-check="trigger"` : null,
    ];
    const closeProps = [
      state.closeComposition === "asChild" ? "asChild" : null,
      state.blockCloseEvent ? "onClick={(event) => event.preventDefault()}" : null,
      state.customCloseSlot ? `data-slot="drawer-close-custom"` : null,
      state.propCheck ? `data-prop-check="close"` : null,
    ];
    const triggerSource =
      state.triggerComposition === "render"
        ? `<Drawer.Trigger${sourceProps(triggerProps)}
  render={(props) => <button {...props}>Open Drawer</button>}
>
  Open Drawer
</Drawer.Trigger>`
        : state.triggerComposition === "asChild"
          ? `<Drawer.Trigger${sourceProps(triggerProps)}>
  <span>Open Drawer</span>
</Drawer.Trigger>`
          : `<Drawer.Trigger${sourceProps(triggerProps)}>Open Drawer</Drawer.Trigger>`;
    const closeSource =
      state.closeComposition === "render"
        ? `<Drawer.Close${sourceProps(closeProps)}
        render={(props) => <button {...props}>Close Drawer</button>}
      >
        Close Drawer
      </Drawer.Close>`
        : state.closeComposition === "asChild"
          ? `<Drawer.Close${sourceProps(closeProps)}>
        <span>Close Drawer</span>
      </Drawer.Close>`
          : `<Drawer.Close${sourceProps(closeProps)}>Close Drawer</Drawer.Close>`;

    return `<Drawer.Root${rootProps.length > 0 ? `\n  ${rootProps.filter(Boolean).join("\n  ")}\n` : ""}>
${indent(triggerSource, 2)}
  <Drawer.Portal${sourceProps(portalProps)}>
    <Drawer.Overlay${sourceProps(overlayProps)} />
    <Drawer.Content${sourceProps(contentProps)}>
      <Drawer.Title${sourceProps(titleProps)}>Project drawer</Drawer.Title>
      <Drawer.Description${sourceProps(descriptionProps)}>
        Change a project setting, then close the drawer.
      </Drawer.Description>
      <Drawer.Root open={nestedOpen} onOpenChange={handleNestedOpenChange}>
        <Drawer.Trigger>Open Nested</Drawer.Trigger>
        <Drawer.Portal disabled>
          <Drawer.Content ariaLabel="Nested drawer" placement="bottom">
            <Drawer.Title>Nested drawer</Drawer.Title>
            <Drawer.Close>Close Nested</Drawer.Close>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      ${closeSource}
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>`;
  }

  if (scenarioId === "menubar") {
    const state = scenarios.menubar.state;
    const rootProps = sourceProps([
      state.controlled ? "value={value}" : null,
      !state.controlled && state.defaultValue !== "none" ? `defaultValue="${state.defaultValue}"` : null,
      state.loop ? null : "loop={false}",
      state.dirMode === "root" ? `dir="${state.dir}"` : null,
      state.customRootSlot ? `data-slot="menubar-root-custom"` : null,
      state.propCheck ? `data-prop-check="root"` : null,
      "onValueChange={handleValueChange}",
    ]);
    const menuProps = sourceProps([
      `value="file"`,
      state.closeOnSelect ? null : "closeOnSelect={false}",
      state.closeOnEscape ? null : "closeOnEscape={false}",
      state.menuLoop ? null : "loop={false}",
    ]);
    const viewMenuProps = sourceProps([
      `value="view"`,
      state.closeOnSelect ? null : "closeOnSelect={false}",
      state.closeOnEscape ? null : "closeOnEscape={false}",
      state.menuLoop ? null : "loop={false}",
    ]);
    const triggerProps = sourceProps([
      state.fileDisabled ? "disabled" : null,
      state.customTriggerSlot ? `data-slot="menubar-trigger-custom"` : null,
      state.propCheck ? `data-prop-check="trigger"` : null,
    ]);
    const contentProps = sourceProps([
      state.contentAriaLabel ? `ariaLabel="File menu"` : null,
      state.side !== "bottom" ? `side="${state.side}"` : null,
      state.align !== "start" ? `align="${state.align}"` : null,
      state.sideOffset !== 4 ? `sideOffset={${state.sideOffset}}` : null,
      state.customContentSlot ? `data-slot="menubar-content-custom"` : null,
      state.propCheck ? `data-prop-check="content"` : null,
    ]);
    const viewContentProps = sourceProps([
      state.contentAriaLabel ? `ariaLabel="View menu"` : null,
      state.side !== "bottom" ? `side="${state.side}"` : null,
      state.align !== "start" ? `align="${state.align}"` : null,
      state.sideOffset !== 4 ? `sideOffset={${state.sideOffset}}` : null,
    ]);
    const directionOpen = state.dirMode === "provider" && state.dir === "rtl" ? `<Direction.Provider dir="rtl">\n  ` : "";
    const directionClose = state.dirMode === "provider" && state.dir === "rtl" ? "\n</Direction.Provider>" : "";
    return `${directionOpen}<Menubar.Root${rootProps}>
  <Menubar.Menu${menuProps}>
    <Menubar.Trigger${triggerProps}>File</Menubar.Trigger>
    <Menubar.Content${contentProps}>
      <Menubar.Group${sourceProps([
        state.customGroupSlot ? `data-slot="menubar-group-custom"` : null,
        state.propCheck ? `data-prop-check="group"` : null,
      ])}>
        <Menubar.Item${sourceProps([
          state.customItemSlot ? `data-slot="menubar-item-custom"` : null,
          state.propCheck ? `data-prop-check="item"` : null,
        ])}>
          New project
        </Menubar.Item>
      </Menubar.Group>
      <Menubar.Separator${sourceProps([
        state.customSeparatorSlot ? `data-slot="menubar-separator-custom"` : null,
        state.propCheck ? `data-prop-check="separator"` : null,
      ])} />
      <Menubar.CheckboxItem${sourceProps([
        "checked={showGrid}",
        state.customCheckboxItemSlot ? `data-slot="menubar-checkbox-item-custom"` : null,
        state.propCheck ? `data-prop-check="checkbox-item"` : null,
      ])}>
        Show grid
      </Menubar.CheckboxItem>
      <Menubar.Sub>
        <Menubar.SubTrigger${sourceProps([
          state.customSubTriggerSlot ? `data-slot="menubar-sub-trigger-custom"` : null,
          state.propCheck ? `data-prop-check="sub-trigger"` : null,
        ])}>
          Share
        </Menubar.SubTrigger>
        <Menubar.SubContent${sourceProps([
          state.customSubContentSlot ? `data-slot="menubar-sub-content-custom"` : null,
          state.propCheck ? `data-prop-check="sub-content"` : null,
        ])}>
          <Menubar.Item>Copy link</Menubar.Item>
        </Menubar.SubContent>
      </Menubar.Sub>
    </Menubar.Content>
  </Menubar.Menu>
  <Menubar.Menu${viewMenuProps}>
    <Menubar.Trigger>View</Menubar.Trigger>
    <Menubar.Content${viewContentProps}>
      <Menubar.RadioGroup${sourceProps([
        "value={density}",
        state.customRadioGroupSlot ? `data-slot="menubar-radio-group-custom"` : null,
        state.propCheck ? `data-prop-check="radio-group"` : null,
      ])}>
        <Menubar.RadioItem${sourceProps([
          `value="compact"`,
          state.customRadioItemSlot ? `data-slot="menubar-radio-item-custom"` : null,
          state.propCheck ? `data-prop-check="radio-item"` : null,
        ])}>
          Compact
        </Menubar.RadioItem>
        <Menubar.RadioItem value="comfortable">Comfortable</Menubar.RadioItem>
      </Menubar.RadioGroup>
    </Menubar.Content>
  </Menubar.Menu>
</Menubar.Root>${directionClose}`;
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
    const rootProps = sourceProps([
      state.controlled ? "state={state}" : state.initialState !== "expanded" ? `defaultState="${state.initialState}"` : "",
      state.collapsedState !== "offcanvas" ? `collapsedState="${state.collapsedState}"` : "",
      state.side !== "left" ? `side="${state.side}"` : "",
      state.disabled ? "disabled" : "",
      state.customRootSlot ? `data-slot="sidebar-custom"` : "",
      state.propCheck ? `data-prop-check="root"` : "",
      "onStateChange={setState}",
    ]);
    const triggerProps = sourceProps([
      state.customTriggerSlot ? `data-slot="sidebar-trigger-custom"` : "",
      state.propCheck ? `data-prop-check="trigger"` : "",
    ]);
    const panelProps = sourceProps([
      `aria-label="Project navigation"`,
      state.customPanelSlot ? `data-slot="sidebar-panel-custom"` : "",
      state.propCheck ? `data-prop-check="panel"` : "",
    ]);
    const mainProps = sourceProps([
      state.customMainSlot ? `data-slot="sidebar-main-custom"` : "",
      state.propCheck ? `data-prop-check="main"` : "",
    ]);
    const triggerSource = state.triggerComposition === "asChild"
      ? `<Sidebar.Trigger${triggerProps} asChild>
      <span>Toggle Sidebar</span>
    </Sidebar.Trigger>`
      : state.triggerComposition === "render"
        ? `<Sidebar.Trigger${triggerProps} render={(props) => <button {...props}>Toggle Sidebar</button>} />`
        : `<Sidebar.Trigger${triggerProps}>Toggle Sidebar</Sidebar.Trigger>`;
    const panelSource = state.panelComposition === "asChild"
      ? `<Sidebar.Panel${panelProps} asChild>
    <nav>Project navigation</nav>
  </Sidebar.Panel>`
      : state.panelComposition === "render"
        ? `<Sidebar.Panel${panelProps} render={(props) => <nav {...props}>Project navigation</nav>} />`
        : `<Sidebar.Panel${panelProps}>Project navigation</Sidebar.Panel>`;
    const mainChildren = indent(triggerSource, 4).trim();
    const mainSource = state.mainComposition === "asChild"
      ? `<Sidebar.Main${mainProps} asChild>
    <section>
      ${mainChildren}
    </section>
  </Sidebar.Main>`
      : state.mainComposition === "render"
        ? `<Sidebar.Main${mainProps} render={(props) => (
    <section {...props}>
      ${mainChildren}
    </section>
  )} />`
        : `<Sidebar.Main${mainProps}>
    ${mainChildren}
  </Sidebar.Main>`;
    const children = `${indent(panelSource, 2).trim()}
  ${indent(mainSource, 2).trim()}`;

    if (state.rootComposition === "asChild") {
      return `<Sidebar.Root${rootProps} asChild>
  <section>
    ${children}
  </section>
</Sidebar.Root>`;
    }

    if (state.rootComposition === "render") {
      return `<Sidebar.Root${rootProps} render={(props) => (
  <section {...props}>
    ${children}
  </section>
)} />`;
    }

    return `<Sidebar.Root${rootProps}>
  ${children}
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
    const providerProps = sourceProps([
      state.closeButton ? `closeButton` : "",
      state.maxVisible !== "3" ? `maxVisible={${state.maxVisible}}` : "",
      !state.expandOnHover ? `expandOnHover={false}` : "",
      !state.pauseOnHover ? `pauseOnHover={false}` : "",
      !state.pauseOnFocusLoss ? `pauseOnFocusLoss={false}` : "",
    ]);
    const toastOptions = [
      state.duration === "short" ? `duration: 3500` : "",
      !state.dismissible ? `dismissible: false` : "",
      state.action ? `action: { label: "Undo", onClick: handleUndo }` : "",
      state.action ? `cancel: { label: "Dismiss", onClick: handleCancel }` : "",
    ].filter(Boolean);
    const toastCall = state.type === "default"
      ? `toast({
    title: "Default toast"${toastOptions.length ? `,\n    ${toastOptions.join(",\n    ")}` : ""}
  })`
      : `toast.${state.type}("` + `${formatOption(state.type)} toast` + `"${toastOptions.length ? `, {\n    ${toastOptions.join(",\n    ")}\n  }` : ""})`;
    const showToastHandler = `const handleShowToast = () => {
  ${toastCall}
};`;
    const rootProps = sourceProps([
      state.customRootSlot ? `data-slot="toast-custom"` : "",
      state.propCheck ? `data-prop-check="root"` : "",
      state.renderMode === "declarative" && state.type !== "default" ? `type="${state.type}"` : "",
      state.renderMode === "declarative" && state.duration === "short" ? `duration={3500}` : "",
      state.paused ? `paused` : "",
      !state.dismissible ? `dismissible={false}` : "",
      state.closeButton ? `closeButton` : "",
      state.forceMount ? `forceMount` : "",
    ]);
    const viewportProps = sourceProps([
      state.customViewportSlot ? `data-slot="toast-viewport-custom"` : "",
      state.propCheck ? `data-prop-check="viewport"` : "",
      state.position !== "bottom-right" ? `position="${state.position}"` : "",
      state.portalMode === "disabled" ? `portalDisabled` : "",
      state.portalMode === "local" ? `container={localContainer}` : "",
      state.viewportComposition === "asChild" ? `asChild` : "",
      state.viewportComposition === "render" ? `render={(props) => <section {...props} />}` : "",
    ]);
    const title = getToastTitleSource(state);
    const description = getToastDescriptionSource(state);
    const action = state.action ? `\n    ${getToastActionSource(state)}\n    ${getToastCancelSource(state)}` : "";
    const close = getToastCloseSource(state);
    const children = `${title}
    ${description}${action}
    ${close}`;
    const root = getToastRootSource(state, rootProps, children);
    if (state.renderMode === "declarative") {
      return `<Toast.Provider${providerProps}>
  <button onClick={() => setDeclarativeVisible(true)}>
    Show Declarative
  </button>
  <button onClick={() => setDeclarativeVisible(false)}>
    Hide Declarative
  </button>
  {declarativeVisible ? (
    ${root}
  ) : null}
  ${getToastViewportSource(state, viewportProps)}
</Toast.Provider>`;
    }
    const renderedRoot = getToastRootSource(
      state,
      sourceProps([
        `toast={toastData}`,
        `index={index}`,
        `expanded={expanded}`,
        state.customRootSlot ? `data-slot="toast-custom"` : "",
        state.propCheck ? `data-prop-check="root"` : "",
        state.paused ? `paused` : "",
        state.closeButton ? `closeButton` : "",
        state.forceMount ? `forceMount` : "",
      ]),
      children,
    );
    return `${showToastHandler}

<Toast.Provider${providerProps}>
  <button onClick={handleShowToast}>
    Show Toast
  </button>
  ${getToastViewportSource(state, viewportProps, `renderToast={({ toast: toastData, index, expanded }) => (
    ${renderedRoot}
  )}`)}
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
    const rootProps = [
      state.controlled ? `open={open}` : `defaultOpen={false}`,
      state.disabled ? `disabled` : "",
      `onOpenChange={setOpen}`,
      state.customRootSlot ? `data-slot="collapsible-root-custom"` : "",
      state.propCheck ? `data-prop-check="root"` : "",
    ].filter(Boolean);
    const rootOpen = `<Collapsible.Root${rootProps.length ? `\n  ${rootProps.join("\n  ")}` : ""}`;
    const trigger = getCollapsibleTriggerSource(state);
    const content = getCollapsibleContentSource(state);

    if (state.composition === "asChild") {
      return `${rootOpen}
  asChild
>
  <section>
${indent(trigger, 4)}
${indent(content, 4)}
  </section>
</Collapsible.Root>`;
    }

    if (state.composition === "render") {
      return `${rootOpen}
  render={(props) => (
    <section {...props}>
${indent(trigger, 6)}
${indent(content, 6)}
    </section>
  )}
/>`;
    }

    return `${rootOpen}>
${indent(trigger, 2)}
${indent(content, 2)}
</Collapsible.Root>`;
  }

  if (scenarioId === "toolbar") {
    const state = scenarios.toolbar.state;
    const rootProps = sourceProps([
      `ariaLabel="Formatting"`,
      state.orientation !== "horizontal" ? `orientation="${state.orientation}"` : null,
      ...getToolbarDirectionSourceProps(state.directionMode),
      state.loop !== true ? `loop={false}` : null,
      state.propCheck ? `data-prop-check="root"` : null,
      state.customRootSlot ? `data-slot="toolbar-root-custom"` : null,
    ]);
    const undoButtonProps = sourceProps([
      state.propCheck ? `data-prop-check="button"` : null,
      state.customButtonSlot ? `data-slot="toolbar-button-custom"` : null,
    ]);
    const redoButtonProps = sourceProps([
      state.disabledButton ? "disabled" : null,
      state.propCheck ? `data-prop-check="button-secondary"` : null,
      state.customButtonSlot ? `data-slot="toolbar-button-custom"` : null,
    ]);
    const separatorProps = sourceProps([
      state.orientation === "vertical" ? `orientation="horizontal"` : null,
      state.propCheck ? `data-prop-check="separator"` : null,
      state.customSeparatorSlot ? `data-slot="toolbar-separator-custom"` : null,
    ]);
    const toggleGroupValue = state.toggleControlled
      ? getToolbarSourceValue("value", state.toggleValue)
      : getToolbarSourceValue("defaultValue", state.defaultToggleValue);
    const toggleGroupProps = sourceProps([
      state.toggleType !== "single" ? `type="${state.toggleType}"` : null,
      toggleGroupValue,
      state.disabledToggleGroup ? "disabled" : null,
      `ariaLabel="Text style"`,
      state.propCheck ? `data-prop-check="toggle-group"` : null,
      state.customToggleGroupSlot ? `data-slot="toolbar-toggle-group-custom"` : null,
    ]);
    const boldProps = sourceProps([
      `value="bold"`,
      state.propCheck ? `data-prop-check="toggle-item"` : null,
      state.customToggleItemSlot ? `data-slot="toolbar-toggle-item-custom"` : null,
    ]);
    const italicProps = sourceProps([
      `value="italic"`,
      state.disabledToggleItem ? "disabled" : null,
      state.propCheck ? `data-prop-check="toggle-item-secondary"` : null,
      state.customToggleItemSlot ? `data-slot="toolbar-toggle-item-custom"` : null,
    ]);
    const linkProps = sourceProps([
      `href="#toolbar-link"`,
      state.disabledLink ? "disabled" : null,
      state.propCheck ? `data-prop-check="link"` : null,
      state.customLinkSlot ? `data-slot="toolbar-link-custom"` : null,
    ]);
    const toggleItems = [
      getToolbarToggleItemSource("B", boldProps, state.toggleItemComposition),
      getToolbarToggleItemSource("I", italicProps, state.toggleItemComposition),
    ].join("\n");
    const toolbarChildren = [
      getToolbarButtonSource("Undo", undoButtonProps, state.buttonComposition),
      getToolbarButtonSource("Redo", redoButtonProps, state.buttonComposition),
      getToolbarLinkSource(linkProps, state.linkComposition),
      getToolbarSeparatorSource(separatorProps, state.separatorComposition),
      getToolbarToggleGroupSource(toggleGroupProps, toggleItems, state.toggleGroupComposition),
    ].join("\n");
    const source = getToolbarRootSource(rootProps, toolbarChildren, state.rootComposition);
    return shouldWrapToolbarDirectionProvider(state.directionMode)
      ? `<Direction.Provider dir="rtl">\n${indent(source, 2)}\n</Direction.Provider>`
      : source;
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
  const [customContainerNode, setCustomContainerNode] = useState<HTMLDivElement | null>(null);
  const rootProps = {
    disabled: scenario.state.disabled,
    keepMounted: scenario.state.keepMounted,
    closeOnEscape: scenario.state.closeOnEscape,
    closeOnBackdropClick: scenario.state.closeOnBackdropClick,
    onOpenChange: scenario.actions.handleOpenChange,
    ...(scenario.state.controlled ? { open: scenario.state.open } : { defaultOpen: scenario.state.defaultOpen }),
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
          data-drawer-container=""
          data-playground-inspect=""
          ref={setCustomContainerNode}
        />
      ) : null}
      <Drawer.Root key={`${scenario.state.controlled}-${scenario.state.defaultOpen}`} {...rootProps}>
        <DrawerTriggerDemo scenario={scenario} />
        <Drawer.Portal {...portalProps}>
          <Drawer.Overlay
            className="utility-drawer-overlay"
            data-drawer-overlay=""
            data-playground-inspect=""
            disabled={scenario.state.overlayDisabled}
            {...partProps("overlay", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customOverlaySlot }, "drawer-overlay-custom")}
          />
          <Drawer.Content
            ariaLabel="Project drawer"
            className={`utility-drawer-content ${scenario.state.placement}`}
            data-drawer-content=""
            data-playground-inspect=""
            placement={scenario.state.placement}
            {...partProps("content", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customContentSlot }, "drawer-content-custom")}
          >
            <Drawer.Title
              as={scenario.state.titleAs}
              className="utility-modal-title"
              data-drawer-title=""
              data-playground-inspect=""
              {...partProps("title", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customTitleSlot }, "drawer-title-custom")}
            >
              Project drawer
            </Drawer.Title>
            <Drawer.Description
              className="utility-modal-description"
              data-drawer-description=""
              data-playground-inspect=""
              {...partProps("description", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customDescriptionSlot }, "drawer-description-custom")}
            >
              Change a project setting, then close the drawer.
            </Drawer.Description>
            <button className="atom-button secondary" type="button">Focusable action</button>
            <Drawer.Root
              open={scenario.state.nestedOpen}
              onOpenChange={scenario.actions.handleNestedOpenChange}
            >
              <Drawer.Trigger className="atom-button secondary" data-drawer-nested-trigger="" data-playground-inspect="">
                Open Nested
              </Drawer.Trigger>
              <Drawer.Portal disabled>
                <Drawer.Content
                  ariaLabel="Nested drawer"
                  className="utility-drawer-content bottom nested"
                  data-drawer-nested-content=""
                  data-playground-inspect=""
                  placement="bottom"
                >
                  <Drawer.Title className="utility-modal-title" data-drawer-nested-title="" data-playground-inspect="">
                    Nested drawer
                  </Drawer.Title>
                  <Drawer.Close className="atom-button" data-drawer-nested-close="" data-playground-inspect="">
                    Close Nested
                  </Drawer.Close>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
            <DrawerCloseDemo scenario={scenario} />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function DrawerTriggerDemo({ scenario }: { scenario: ReturnType<typeof useDrawerScenario> }) {
  const triggerProps = {
    className: "atom-button",
    "data-drawer-trigger": "",
    "data-playground-inspect": "",
    onClick: scenario.state.blockTriggerEvent
      ? (event: MouseEvent<HTMLElement>) => {
          event.preventDefault();
          scenario.actions.noteDrawerEvent("trigger event prevented");
        }
      : undefined,
    ...partProps("trigger", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customTriggerSlot }, "drawer-trigger-custom"),
  };

  if (scenario.state.triggerComposition === "asChild") {
    return (
      <Drawer.Trigger {...triggerProps} asChild>
        <span className="atom-button">Open Drawer</span>
      </Drawer.Trigger>
    );
  }

  if (scenario.state.triggerComposition === "render") {
    return (
      <Drawer.Trigger
        {...triggerProps}
        render={(props: Record<string, unknown>) => (
          <button {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} type="button">
            Open Drawer
          </button>
        )}
      >
        Open Drawer
      </Drawer.Trigger>
    );
  }

  return (
    <Drawer.Trigger {...triggerProps}>
      Open Drawer
    </Drawer.Trigger>
  );
}

function DrawerCloseDemo({ scenario }: { scenario: ReturnType<typeof useDrawerScenario> }) {
  const closeProps = {
    className: "atom-button",
    "data-drawer-close": "",
    "data-playground-inspect": "",
    onClick: scenario.state.blockCloseEvent
      ? (event: MouseEvent<HTMLElement>) => {
          event.preventDefault();
          scenario.actions.noteDrawerEvent("close event prevented");
        }
      : undefined,
    ...partProps("close", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customCloseSlot }, "drawer-close-custom"),
  };

  if (scenario.state.closeComposition === "asChild") {
    return (
      <Drawer.Close {...closeProps} asChild>
        <span className="atom-button">Close Drawer</span>
      </Drawer.Close>
    );
  }

  if (scenario.state.closeComposition === "render") {
    return (
      <Drawer.Close
        {...closeProps}
        render={(props: Record<string, unknown>) => (
          <button {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} type="button">
            Close Drawer
          </button>
        )}
      >
        Close Drawer
      </Drawer.Close>
    );
  }

  return (
    <Drawer.Close {...closeProps}>
      Close Drawer
    </Drawer.Close>
  );
}

function MenubarScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useMenubarScenario> }) {
  const rootProps = {
    className: "utility-menubar",
    "data-menubar-root": "",
    "data-playground-inspect": "",
    ...partProps("root", { customSlot: scenario.state.customRootSlot, propCheck: scenario.state.propCheck }, "menubar-root-custom"),
    loop: scenario.state.loop,
    dir: scenario.state.dirMode === "root" ? scenario.state.dir : undefined,
    onValueChange: scenario.actions.handleValueChange,
    ...(scenario.state.controlled
      ? { value: scenario.state.value }
      : scenario.state.defaultValue !== "none"
        ? { defaultValue: scenario.state.defaultValue }
        : {}),
  };
  const rootKey = scenario.state.controlled
    ? "controlled"
    : `uncontrolled-${scenario.state.defaultValue}`;
  const menubar = (
    <Menubar.Root key={rootKey} {...rootProps}>
      <Menubar.Menu
        value="file"
        closeOnSelect={scenario.state.closeOnSelect}
        closeOnEscape={scenario.state.closeOnEscape}
        loop={scenario.state.menuLoop}
      >
        <Menubar.Trigger
          className="utility-menubar-trigger"
          data-menubar-trigger-file=""
          data-playground-inspect=""
          disabled={scenario.state.fileDisabled}
          {...partProps("trigger", { customSlot: scenario.state.customTriggerSlot, propCheck: scenario.state.propCheck }, "menubar-trigger-custom")}
        >
          File
        </Menubar.Trigger>
        <Menubar.Content
          className="playground-menu-content"
          ariaLabel={scenario.state.contentAriaLabel ? "File menu" : undefined}
          data-menubar-content-file=""
          data-playground-inspect=""
          side={scenario.state.side}
          align={scenario.state.align}
          sideOffset={scenario.state.sideOffset}
          {...partProps("content", { customSlot: scenario.state.customContentSlot, propCheck: scenario.state.propCheck }, "menubar-content-custom")}
        >
          <Menubar.Group
            className="playground-menu-group"
            data-menubar-group=""
            {...partProps("group", { customSlot: scenario.state.customGroupSlot, propCheck: scenario.state.propCheck }, "menubar-group-custom")}
          >
            <Menubar.Item
              className="playground-menu-item"
              value="new"
              data-menubar-item-new=""
              data-playground-inspect=""
              {...partProps("item", { customSlot: scenario.state.customItemSlot, propCheck: scenario.state.propCheck }, "menubar-item-custom")}
              onSelect={() => scenario.actions.noteSelect("new")}
            >
              New project
            </Menubar.Item>
            <Menubar.Item
              className="playground-menu-item"
              value="open"
              data-menubar-item-open=""
              onSelect={() => scenario.actions.noteSelect("open")}
            >
              Open project
            </Menubar.Item>
          </Menubar.Group>
          <Menubar.Separator
            className="playground-menu-separator"
            data-menubar-separator=""
            {...partProps("separator", { customSlot: scenario.state.customSeparatorSlot, propCheck: scenario.state.propCheck }, "menubar-separator-custom")}
          />
          <Menubar.CheckboxItem
            className="playground-menu-item"
            checked={scenario.state.showGrid}
            value="grid"
            data-menubar-checkbox=""
            data-playground-inspect=""
            {...partProps("checkbox-item", { customSlot: scenario.state.customCheckboxItemSlot, propCheck: scenario.state.propCheck }, "menubar-checkbox-item-custom")}
            onCheckedChange={scenario.actions.setShowGrid}
          >
            <span>Show grid</span>
            <span className="playground-menu-check" aria-hidden="true" />
          </Menubar.CheckboxItem>
          <Menubar.Separator className="playground-menu-separator" data-menubar-sub-separator="" />
          <Menubar.Sub>
            <Menubar.SubTrigger
              className="playground-menu-item"
              value="share"
              textValue="Share"
              data-menubar-sub-trigger=""
              data-playground-inspect=""
              {...partProps("sub-trigger", { customSlot: scenario.state.customSubTriggerSlot, propCheck: scenario.state.propCheck }, "menubar-sub-trigger-custom")}
            >
              <span>Share</span>
              <span className="playground-menu-sub-arrow" aria-hidden="true">›</span>
            </Menubar.SubTrigger>
            <Menubar.SubContent
              className="playground-menu-content playground-submenu-content"
              ariaLabel="Share"
              sideOffset={scenario.state.sideOffset}
              data-menubar-sub-content=""
              data-playground-inspect=""
              {...partProps("sub-content", { customSlot: scenario.state.customSubContentSlot, propCheck: scenario.state.propCheck }, "menubar-sub-content-custom")}
            >
              <Menubar.Item
                className="playground-menu-item"
                value="copy-link"
                data-menubar-sub-item=""
                {...partProps("sub-item", { customSlot: scenario.state.customItemSlot, propCheck: scenario.state.propCheck }, "menubar-item-custom")}
                onSelect={() => scenario.actions.noteSelect("copy-link")}
              >
                Copy link
              </Menubar.Item>
            </Menubar.SubContent>
          </Menubar.Sub>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu
        value="view"
        closeOnSelect={scenario.state.closeOnSelect}
        closeOnEscape={scenario.state.closeOnEscape}
        loop={scenario.state.menuLoop}
      >
        <Menubar.Trigger
          className="utility-menubar-trigger"
          data-menubar-trigger-view=""
          data-playground-inspect=""
          {...partProps("trigger-secondary", { customSlot: scenario.state.customTriggerSlot, propCheck: scenario.state.propCheck }, "menubar-trigger-custom")}
        >
          View
        </Menubar.Trigger>
        <Menubar.Content
          className="playground-menu-content"
          ariaLabel={scenario.state.contentAriaLabel ? "View menu" : undefined}
          data-menubar-content-view=""
          data-playground-inspect=""
          side={scenario.state.side}
          align={scenario.state.align}
          sideOffset={scenario.state.sideOffset}
          {...partProps("content-secondary", { customSlot: scenario.state.customContentSlot, propCheck: scenario.state.propCheck }, "menubar-content-custom")}
        >
          <Menubar.RadioGroup
            className="playground-menu-radio-group"
            value={scenario.state.density}
            data-menubar-radio-group=""
            {...partProps("radio-group", { customSlot: scenario.state.customRadioGroupSlot, propCheck: scenario.state.propCheck }, "menubar-radio-group-custom")}
            onValueChange={scenario.actions.setDensity}
          >
            <Menubar.RadioItem
              className="playground-menu-item"
              value="compact"
              data-menubar-radio=""
              data-playground-inspect=""
              {...partProps("radio-item", { customSlot: scenario.state.customRadioItemSlot, propCheck: scenario.state.propCheck }, "menubar-radio-item-custom")}
            >
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
  );

  return (
    <div className="utility-primitive-stage">
      {scenario.state.dirMode === "provider" ? (
        <Direction.Provider dir={scenario.state.dir}>
          {menubar}
        </Direction.Provider>
      ) : menubar}
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
    ...partProps("root", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customRootSlot }, "sidebar-custom"),
    collapsedState: scenario.state.collapsedState,
    disabled: scenario.state.disabled,
    side: scenario.state.side,
    onStateChange: scenario.actions.setState,
    ...(scenario.state.controlled ? { state: scenario.state.state } : { defaultState: scenario.state.initialState }),
  };
  const content = (
    <>
      <SidebarPanelDemo scenario={scenario} />
      <SidebarMainDemo scenario={scenario} />
    </>
  );

  return (
    <div className="utility-primitive-stage utility-sidebar-stage">
      {scenario.state.rootComposition === "asChild" ? (
        <Sidebar.Root key={getSidebarScenarioKey(scenario)} {...rootProps} asChild>
          <section>{content}</section>
        </Sidebar.Root>
      ) : scenario.state.rootComposition === "render" ? (
        <Sidebar.Root
          key={getSidebarScenarioKey(scenario)}
          {...rootProps}
          render={(props: Record<string, unknown>) => (
            <section {...(props as ComponentPropsWithRef<"section">)}>{content}</section>
          )}
        />
      ) : (
        <Sidebar.Root key={getSidebarScenarioKey(scenario)} {...rootProps}>{content}</Sidebar.Root>
      )}
    </div>
  );
}

function getSidebarScenarioKey(scenario: ReturnType<typeof useSidebarScenario>) {
  return scenario.state.controlled ? "controlled" : `uncontrolled-${scenario.state.initialState}`;
}

function SidebarPanelDemo({ scenario }: { scenario: ReturnType<typeof useSidebarScenario> }) {
  const isRail = scenario.state.state === "rail";
  const links = [
    { href: "#overview", label: "Overview", token: "O" },
    { href: "#settings", label: "Settings", token: "S" },
    { href: "#activity", label: "Activity", token: "A" },
  ];
  const panelProps = {
    className: "utility-sidebar-panel",
    "aria-label": "Project navigation",
    "data-sidebar-panel": "",
    "data-playground-inspect": "",
    ...partProps("panel", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customPanelSlot }, "sidebar-panel-custom"),
  };
  const content = (
    <>
      <strong>Project</strong>
      {links.map((link) => (
        <a href={link.href} key={link.href} aria-label={isRail ? link.label : undefined}>
          <span className="utility-sidebar-rail-token" aria-hidden="true">{link.token}</span>
          <span className="utility-sidebar-link-label">{link.label}</span>
        </a>
      ))}
    </>
  );

  if (scenario.state.panelComposition === "asChild") {
    return (
      <Sidebar.Panel {...panelProps} asChild>
        <nav>{content}</nav>
      </Sidebar.Panel>
    );
  }

  if (scenario.state.panelComposition === "render") {
    return (
      <Sidebar.Panel
        {...panelProps}
        render={(props: Record<string, unknown>) => (
          <nav {...(props as ComponentPropsWithRef<"nav">)}>{content}</nav>
        )}
      />
    );
  }

  return <Sidebar.Panel {...panelProps}>{content}</Sidebar.Panel>;
}

function SidebarMainDemo({ scenario }: { scenario: ReturnType<typeof useSidebarScenario> }) {
  const mainProps = {
    className: "utility-sidebar-main",
    "data-sidebar-main": "",
    "data-playground-inspect": "",
    ...partProps("main", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customMainSlot }, "sidebar-main-custom"),
  };
  const content = (
    <>
      <SidebarTriggerDemo scenario={scenario} />
    </>
  );

  if (scenario.state.mainComposition === "asChild") {
    return (
      <Sidebar.Main {...mainProps} asChild>
        <section>{content}</section>
      </Sidebar.Main>
    );
  }

  if (scenario.state.mainComposition === "render") {
    return (
      <Sidebar.Main
        {...mainProps}
        render={(props: Record<string, unknown>) => (
          <section {...(props as ComponentPropsWithRef<"section">)}>{content}</section>
        )}
      />
    );
  }

  return <Sidebar.Main {...mainProps}>{content}</Sidebar.Main>;
}

function SidebarTriggerDemo({ scenario }: { scenario: ReturnType<typeof useSidebarScenario> }) {
  const triggerProps = {
    className: "atom-button",
    "data-sidebar-trigger": "",
    "data-playground-inspect": "",
    ...partProps("trigger", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customTriggerSlot }, "sidebar-trigger-custom"),
  };

  if (scenario.state.triggerComposition === "asChild") {
    return (
      <Sidebar.Trigger {...triggerProps} asChild>
        <span>Toggle Sidebar</span>
      </Sidebar.Trigger>
    );
  }

  if (scenario.state.triggerComposition === "render") {
    return (
      <Sidebar.Trigger
        {...triggerProps}
        render={(props: Record<string, unknown>) => (
          <button {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} type="button">
            Toggle Sidebar
          </button>
        )}
      />
    );
  }

  return <Sidebar.Trigger {...triggerProps}>Toggle Sidebar</Sidebar.Trigger>;
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

type ToastScenarioState = ReturnType<typeof useToastScenario>["state"];
type ToastEvidenceProps = Record<`data-${string}`, string | undefined>;
type ToastRootPartProps = ComponentPropsWithRef<typeof Toast.Root> & ToastEvidenceProps;
type ToastViewportPartProps = ComponentPropsWithRef<typeof Toast.Viewport> & ToastEvidenceProps;
type ToastTitlePartProps = ComponentPropsWithRef<typeof Toast.Title> & ToastEvidenceProps;
type ToastDescriptionPartProps = ComponentPropsWithRef<typeof Toast.Description> & ToastEvidenceProps;
type ToastActionPartProps = ComponentPropsWithRef<typeof Toast.Action> & ToastEvidenceProps;
type ToastCancelPartProps = ComponentPropsWithRef<typeof Toast.Cancel> & ToastEvidenceProps;
type ToastClosePartProps = ComponentPropsWithRef<typeof Toast.Close> & ToastEvidenceProps;

function ToastScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useToastScenario> }) {
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const providerProps = {
    closeButton: scenario.state.closeButton,
    expandOnHover: scenario.state.expandOnHover,
    maxVisible: Number(scenario.state.maxVisible),
    pauseOnFocusLoss: scenario.state.pauseOnFocusLoss,
    pauseOnHover: scenario.state.pauseOnHover,
  };
  const viewportProps = {
    ...partProps("viewport", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customViewportSlot }, "toast-viewport-custom"),
    className: "utility-toast-viewport",
    container: scenario.state.portalMode === "local" ? portalContainerRef.current : undefined,
    "data-toast-viewport": "",
    "data-playground-inspect": "",
    portalDisabled: scenario.state.portalMode === "disabled",
    position: scenario.state.position,
    ref: scenario.actions.markViewportRef,
  } satisfies ToastViewportPartProps;

  return (
    <Toast.Provider {...providerProps}>
      <div className="utility-primitive-stage">
        <div ref={portalContainerRef} className="utility-toast-stage" data-toast-stage="" data-playground-inspect="">
          {scenario.state.renderMode === "imperative" ? (
            <div className="utility-toast-command-row">
              <button className="atom-button" type="button" data-toast-show="" data-playground-inspect="" onClick={scenario.actions.showToast}>
                Show Toast
              </button>
              <button className="atom-button secondary" type="button" data-toast-dismiss-all="" data-playground-inspect="" onClick={scenario.actions.dismissAll}>
                Dismiss All
              </button>
              <ToastCountProbe />
            </div>
          ) : (
            <>
              <div className="utility-toast-command-row">
                <button className="atom-button" type="button" data-toast-show-declarative="" data-playground-inspect="" onClick={scenario.actions.showDeclarative}>
                  Show Declarative
                </button>
                <button className="atom-button secondary" type="button" data-toast-hide-declarative="" data-playground-inspect="" onClick={scenario.actions.hideDeclarative}>
                  Hide Declarative
                </button>
                <button className="atom-button secondary" type="button" data-toast-dismiss-all="" data-playground-inspect="" onClick={scenario.actions.dismissAll}>
                  Dismiss All
                </button>
              </div>
              <div className="utility-toast-declarative-preview">
                {scenario.state.declarativeVisible ? <ToastScenarioRoot scenario={scenario} /> : null}
              </div>
            </>
          )}
        </div>
        <ToastScenarioViewport scenario={scenario} viewportProps={viewportProps} />
      </div>
    </Toast.Provider>
  );
}

function ToastScenarioViewport({
  scenario,
  viewportProps,
}: {
  scenario: ReturnType<typeof useToastScenario>;
  viewportProps: ToastViewportPartProps;
}) {
  if (scenario.state.viewportComposition === "asChild") {
    return (
      <Toast.Viewport
        {...viewportProps}
        asChild
        renderToast={({ toast: toastData, index, expanded }) => (
          <ToastScenarioRoot scenario={scenario} toastData={toastData} index={index} expanded={expanded} />
        )}
      >
        <section />
      </Toast.Viewport>
    );
  }

  if (scenario.state.viewportComposition === "render") {
    return (
      <Toast.Viewport
        {...viewportProps}
        render={(renderProps) => <section {...renderProps}>{renderProps.children as ReactNode}</section>}
        renderToast={({ toast: toastData, index, expanded }) => (
          <ToastScenarioRoot scenario={scenario} toastData={toastData} index={index} expanded={expanded} />
        )}
      />
    );
  }

  return (
    <Toast.Viewport
      {...viewportProps}
      renderToast={({ toast: toastData, index, expanded }) => (
        <ToastScenarioRoot scenario={scenario} toastData={toastData} index={index} expanded={expanded} />
      )}
    />
  );
}

function ToastScenarioRoot({
  scenario,
  toastData,
  index,
  expanded,
}: {
  scenario: ReturnType<typeof useToastScenario>;
  toastData?: NonNullable<Parameters<NonNullable<ToastViewportPartProps["renderToast"]>>[0]["toast"]>;
  index?: number;
  expanded?: boolean;
}) {
  const rootProps = {
    ...partProps("root", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customRootSlot }, "toast-custom"),
    className: "utility-toast",
    "data-toast-root": "",
    "data-playground-inspect": "",
    closeButton: scenario.state.closeButton,
    dismissible: toastData ? undefined : scenario.state.dismissible,
    duration: toastData ? undefined : getToastDuration(scenario.state.duration),
    expanded,
    forceMount: scenario.state.forceMount,
    index,
    onAutoClose: toastData ? scenario.actions.noteRootAutoClose : scenario.actions.noteDeclarativeAutoClose,
    onDismiss: toastData ? scenario.actions.noteRootDismiss : scenario.actions.noteDeclarativeDismiss,
    paused: scenario.state.paused || undefined,
    ref: scenario.actions.markRootRef,
    removeDelay: 200,
    toast: toastData,
    type: toastData ? undefined : scenario.state.type,
  } satisfies ToastRootPartProps;
  const content = <ToastScenarioParts state={scenario.state} actions={scenario.actions} toastData={toastData} />;

  if (scenario.state.rootComposition === "asChild") {
    return (
      <Toast.Root {...rootProps} asChild>
        <section>{content}</section>
      </Toast.Root>
    );
  }

  if (scenario.state.rootComposition === "render") {
    return (
      <Toast.Root {...rootProps} render={(renderProps) => <section {...renderProps}>{renderProps.children as ReactNode}</section>}>
        {content}
      </Toast.Root>
    );
  }

  return <Toast.Root {...rootProps}>{content}</Toast.Root>;
}

function ToastScenarioParts({
  state,
  actions,
  toastData,
}: {
  state: ToastScenarioState;
  actions: ReturnType<typeof useToastScenario>["actions"];
  toastData?: NonNullable<Parameters<NonNullable<ToastViewportPartProps["renderToast"]>>[0]["toast"]>;
}) {
  const showAction = state.action;
  return (
    <>
      <ToastScenarioTitle state={state} markRef={actions.markTitleRef} title={toastData?.title} />
      <ToastScenarioDescription state={state} markRef={actions.markDescriptionRef} description={toastData?.description} />
      <div className="utility-toast-actions">
        {showAction ? (
          <>
            <ToastScenarioAction state={state} markRef={actions.markActionRef} label={toastData?.action?.label} />
            <ToastScenarioCancel state={state} markRef={actions.markCancelRef} label={toastData?.cancel?.label} />
          </>
        ) : null}
        <ToastScenarioClose state={state} markRef={actions.markCloseRef} />
      </div>
    </>
  );
}

function ToastScenarioTitle({ state, markRef, title }: { state: ToastScenarioState; markRef: (node: HTMLElement | null) => void; title?: ReactNode }) {
  const content = title ?? `${formatOption(state.type)} toast`;
  const props = {
    ...partProps("title", { propCheck: state.propCheck, customSlot: state.customTitleSlot }, "toast-title-custom"),
    className: "utility-toast-title",
    "data-toast-title": "",
    "data-playground-inspect": "",
    ref: markRef,
  } satisfies ToastTitlePartProps;

  if (state.titleComposition === "asChild") {
    return (
      <Toast.Title {...props} asChild>
        <h3>{content}</h3>
      </Toast.Title>
    );
  }

  if (state.titleComposition === "render") {
    return <Toast.Title {...props} render={(renderProps) => <h3 {...renderProps}>{renderProps.children as ReactNode}</h3>} />;
  }

  return <Toast.Title {...props}>{content}</Toast.Title>;
}

function ToastScenarioDescription({ state, markRef, description }: { state: ToastScenarioState; markRef: (node: HTMLElement | null) => void; description?: ReactNode }) {
  const content = description ?? "Playground notification body.";
  const props = {
    ...partProps("description", { propCheck: state.propCheck, customSlot: state.customDescriptionSlot }, "toast-description-custom"),
    className: "utility-toast-description",
    "data-toast-description": "",
    "data-playground-inspect": "",
    ref: markRef,
  } satisfies ToastDescriptionPartProps;

  if (state.descriptionComposition === "asChild") {
    return (
      <Toast.Description {...props} asChild>
        <p>{content}</p>
      </Toast.Description>
    );
  }

  if (state.descriptionComposition === "render") {
    return <Toast.Description {...props} render={(renderProps) => <p {...renderProps}>{renderProps.children as ReactNode}</p>} />;
  }

  return <Toast.Description {...props}>{content}</Toast.Description>;
}

function ToastScenarioAction({ state, markRef, label }: { state: ToastScenarioState; markRef: (node: HTMLElement | null) => void; label?: ReactNode }) {
  const content = label ?? "Undo";
  const props = {
    ...partProps("action", { propCheck: state.propCheck, customSlot: state.customActionSlot }, "toast-action-custom"),
    altText: "Undo change",
    className: "atom-button secondary",
    "data-toast-action": "",
    "data-playground-inspect": "",
    ref: markRef,
  } satisfies ToastActionPartProps;

  if (state.actionComposition === "asChild") {
    return (
      <Toast.Action {...props} asChild>
        <button type="button">{content}</button>
      </Toast.Action>
    );
  }

  if (state.actionComposition === "render") {
    return <Toast.Action {...props} render={(renderProps) => <button {...renderProps}>{renderProps.children as ReactNode}</button>} />;
  }

  return <Toast.Action {...props}>{content}</Toast.Action>;
}

function ToastScenarioCancel({ state, markRef, label }: { state: ToastScenarioState; markRef: (node: HTMLElement | null) => void; label?: ReactNode }) {
  const content = label ?? "Dismiss";
  const props = {
    ...partProps("cancel", { propCheck: state.propCheck, customSlot: state.customCancelSlot }, "toast-cancel-custom"),
    altText: "Dismiss undo",
    className: "atom-button secondary",
    "data-toast-cancel": "",
    "data-playground-inspect": "",
    ref: markRef,
  } satisfies ToastCancelPartProps;

  if (state.cancelComposition === "asChild") {
    return (
      <Toast.Cancel {...props} asChild>
        <button type="button">{content}</button>
      </Toast.Cancel>
    );
  }

  if (state.cancelComposition === "render") {
    return <Toast.Cancel {...props} render={(renderProps) => <button {...renderProps}>{renderProps.children as ReactNode}</button>} />;
  }

  return <Toast.Cancel {...props}>{content}</Toast.Cancel>;
}

function ToastScenarioClose({ state, markRef }: { state: ToastScenarioState; markRef: (node: HTMLElement | null) => void }) {
  const props = {
    ...partProps("close", { propCheck: state.propCheck, customSlot: state.customCloseSlot }, "toast-close-custom"),
    "aria-label": "Dismiss notification",
    className: "atom-button secondary",
    "data-toast-close": "",
    "data-playground-inspect": "",
    ref: markRef,
  } satisfies ToastClosePartProps;

  if (state.closeComposition === "asChild") {
    return (
      <Toast.Close {...props} asChild>
        <button type="button">Close</button>
      </Toast.Close>
    );
  }

  if (state.closeComposition === "render") {
    return <Toast.Close {...props} render={(renderProps) => <button {...renderProps}>{renderProps.children as ReactNode}</button>}>Close</Toast.Close>;
  }

  return <Toast.Close {...props}>Close</Toast.Close>;
}

function ToastCountProbe() {
  const toasts = useToastStore();
  const pausedCount = toasts.filter((toastData) => toastData.paused).length;
  return (
    <span className="utility-toast-count" data-toast-count="" data-playground-inspect="">
      {toasts.length} {toasts.length === 1 ? "toast" : "toasts"}
      {pausedCount > 0 ? ` · ${pausedCount} paused` : ""}
    </span>
  );
}

function getToastDuration(duration: ToastScenarioState["duration"]) {
  return duration === "infinite" ? Infinity : 3500;
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
    disabled: scenario.state.disabled,
    ref: scenario.actions.markRootRef,
    ...partProps("root", { customSlot: scenario.state.customRootSlot, propCheck: scenario.state.propCheck }, "collapsible-root-custom"),
    ...(scenario.state.controlled
      ? { open: scenario.state.open, onOpenChange: scenario.actions.handleOpenChange }
      : { defaultOpen: false, onOpenChange: scenario.actions.handleOpenChange }),
  };
  const trigger = (
    <CollapsibleTriggerExample
      blockTriggerEvent={scenario.state.blockTriggerEvent}
      customSlot={scenario.state.customTriggerSlot}
      mode={scenario.state.triggerComposition}
      onBlockedTrigger={scenario.actions.handleBlockedTrigger}
      onRef={scenario.actions.markTriggerRef}
      propCheck={scenario.state.propCheck}
    />
  );
  const content = (
    <CollapsibleContentExample
      customSlot={scenario.state.customContentSlot}
      keepMounted={scenario.state.keepMounted}
      mode={scenario.state.contentComposition}
      onRef={scenario.actions.markContentRef}
      propCheck={scenario.state.propCheck}
    />
  );

  return (
    <div className="utility-primitive-stage utility-collapsible-stage">
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

function CollapsibleTriggerExample({
  blockTriggerEvent,
  customSlot,
  mode,
  onBlockedTrigger,
  onRef,
  propCheck,
}: {
  blockTriggerEvent: boolean;
  customSlot: boolean;
  mode: CompositionMode;
  onBlockedTrigger: (event: MouseEvent<HTMLElement>) => void;
  onRef: (node: HTMLElement | null) => void;
  propCheck: boolean;
}) {
  const props = {
    className: "utility-collapsible-trigger",
    "data-collapsible-trigger": "",
    "data-playground-inspect": "",
    onClick: blockTriggerEvent ? onBlockedTrigger : undefined,
    ref: onRef,
    ...partProps("trigger", { customSlot, propCheck }, "collapsible-trigger-custom"),
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
  customSlot,
  keepMounted,
  mode,
  onRef,
  propCheck,
}: {
  customSlot: boolean;
  keepMounted: boolean;
  mode: CompositionMode;
  onRef: (node: HTMLElement | null) => void;
  propCheck: boolean;
}) {
  const props = {
    className: "utility-collapsible-content",
    "data-collapsible-content": "",
    "data-playground-inspect": "",
    keepMounted,
    ref: onRef,
    ...partProps("content", { customSlot, propCheck }, "collapsible-content-custom"),
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
    "data-toolbar-root": "",
    ariaLabel: "Formatting",
    ...getToolbarRootDirectionProps(scenario.state.directionMode),
    loop: scenario.state.loop,
    orientation: scenario.state.orientation,
    ref: scenario.actions.markRootRef,
    ...partProps("root", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customRootSlot }, "toolbar-root-custom"),
  };
  const valueProps = scenario.state.toggleControlled
    ? { value: scenario.state.toggleValue }
    : scenario.state.defaultToggleValue === "none"
      ? {}
      : { defaultValue: toToolbarTypedValue(scenario.state.defaultToggleValue, scenario.state.toggleType) };
  const toolbarChildren = (
    <>
      {renderToolbarButton(scenario, "undo")}
      {renderToolbarButton(scenario, "redo")}
      {renderToolbarLink(scenario)}
      {renderToolbarSeparator(scenario)}
      {renderToolbarToggleGroup(scenario, valueProps)}
    </>
  );
  const toolbar = renderToolbarRoot(scenario, rootProps, toolbarChildren);

  return (
    <div className="utility-primitive-stage">
      {shouldWrapToolbarDirectionProvider(scenario.state.directionMode) ? (
        <Direction.Provider dir="rtl">{toolbar}</Direction.Provider>
      ) : (
        toolbar
      )}
    </div>
  );
}

function renderToolbarRoot(
  scenario: ReturnType<typeof useToolbarScenario>,
  rootProps: Record<string, unknown>,
  children: ReactNode,
) {
  if (scenario.state.rootComposition === "asChild") {
    return (
      <Toolbar.Root {...rootProps} asChild>
        <section>{children}</section>
      </Toolbar.Root>
    );
  }

  if (scenario.state.rootComposition === "render") {
    return (
      <Toolbar.Root
        {...rootProps}
        render={(renderProps) => (
          <section {...renderProps}>{renderProps.children as ReactNode}</section>
        )}
      >
        {children}
      </Toolbar.Root>
    );
  }

  return <Toolbar.Root {...rootProps}>{children}</Toolbar.Root>;
}

function renderToolbarButton(
  scenario: ReturnType<typeof useToolbarScenario>,
  kind: "undo" | "redo",
) {
  const isUndo = kind === "undo";
  const label = isUndo ? "Undo" : "Redo";
  const props = {
    className: "utility-toolbar-item",
    "data-playground-inspect": "",
    [isUndo ? "data-toolbar-button" : "data-toolbar-disabled-button"]: "",
    ...(isUndo ? { ref: scenario.actions.markButtonRef } : {}),
    ...(isUndo ? {} : { disabled: scenario.state.disabledButton }),
    onClick: () => scenario.actions.note(isUndo ? "undo clicked" : "redo clicked"),
    ...partProps(
      isUndo ? "button" : "button-secondary",
      { propCheck: scenario.state.propCheck, customSlot: scenario.state.customButtonSlot },
      "toolbar-button-custom",
    ),
  };

  if (scenario.state.buttonComposition === "asChild") {
    return (
      <Toolbar.Button {...props} asChild>
        <span>{label}</span>
      </Toolbar.Button>
    );
  }

  if (scenario.state.buttonComposition === "render") {
    return (
      <Toolbar.Button
        {...props}
        render={(renderProps) => (
          <span {...renderProps}>{renderProps.children as ReactNode}</span>
        )}
      >
        {label}
      </Toolbar.Button>
    );
  }

  return <Toolbar.Button {...props}>{label}</Toolbar.Button>;
}

function renderToolbarLink(scenario: ReturnType<typeof useToolbarScenario>) {
  const props = {
    className: "utility-toolbar-item",
    "data-playground-inspect": "",
    "data-toolbar-link": "",
    disabled: scenario.state.disabledLink,
    href: "#toolbar-link",
    ref: scenario.actions.markLinkRef,
    onClick: () => scenario.actions.note("help clicked"),
    ...partProps("link", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customLinkSlot }, "toolbar-link-custom"),
  };

  if (scenario.state.linkComposition === "asChild") {
    return (
      <Toolbar.Link {...props} asChild>
        <a>Help</a>
      </Toolbar.Link>
    );
  }

  if (scenario.state.linkComposition === "render") {
    return (
      <Toolbar.Link
        {...props}
        render={(renderProps) => (
          <a {...renderProps}>{renderProps.children as ReactNode}</a>
        )}
      >
        Help
      </Toolbar.Link>
    );
  }

  return <Toolbar.Link {...props}>Help</Toolbar.Link>;
}

function renderToolbarSeparator(scenario: ReturnType<typeof useToolbarScenario>) {
  const props = {
    className: "utility-toolbar-separator",
    "data-playground-inspect": "",
    "data-toolbar-separator": "",
    orientation: scenario.state.orientation === "horizontal" ? "vertical" as const : "horizontal" as const,
    ...partProps("separator", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customSeparatorSlot }, "toolbar-separator-custom"),
  };

  if (scenario.state.separatorComposition === "asChild") {
    return (
      <Toolbar.Separator {...props} asChild>
        <div />
      </Toolbar.Separator>
    );
  }

  if (scenario.state.separatorComposition === "render") {
    return <Toolbar.Separator {...props} render={(renderProps) => <hr {...renderProps} />} />;
  }

  return <Toolbar.Separator {...props} />;
}

function renderToolbarToggleGroup(
  scenario: ReturnType<typeof useToolbarScenario>,
  valueProps: Record<string, unknown>,
) {
  const remountKey = scenario.state.toggleControlled
    ? "controlled"
    : `uncontrolled-${scenario.state.toggleType}-${scenario.state.defaultToggleValue}`;
  const props = {
    className: "utility-toolbar-toggle-group",
    "data-playground-inspect": "",
    "data-toolbar-toggle-group": "",
    type: scenario.state.toggleType,
    disabled: scenario.state.disabledToggleGroup,
    onValueChange: scenario.actions.handleValueChange,
    ariaLabel: "Text style",
    ...valueProps,
    ...partProps("toggle-group", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customToggleGroupSlot }, "toolbar-toggle-group-custom"),
  };
  const items = (
    <>
      {renderToolbarToggleItem(scenario, "bold")}
      {renderToolbarToggleItem(scenario, "italic")}
    </>
  );

  if (scenario.state.toggleGroupComposition === "asChild") {
    return (
      <Toolbar.ToggleGroup key={remountKey} {...props} asChild>
        <section>{items}</section>
      </Toolbar.ToggleGroup>
    );
  }

  if (scenario.state.toggleGroupComposition === "render") {
    return (
      <Toolbar.ToggleGroup
        key={remountKey}
        {...props}
        render={(renderProps) => (
          <section {...renderProps}>{renderProps.children as ReactNode}</section>
        )}
      >
        {items}
      </Toolbar.ToggleGroup>
    );
  }

  return <Toolbar.ToggleGroup key={remountKey} {...props}>{items}</Toolbar.ToggleGroup>;
}

function renderToolbarToggleItem(
  scenario: ReturnType<typeof useToolbarScenario>,
  value: "bold" | "italic",
) {
  const isBold = value === "bold";
  const props = {
    className: "utility-toolbar-item",
    "data-playground-inspect": "",
    [isBold ? "data-toolbar-toggle-item" : "data-toolbar-toggle-item-secondary"]: "",
    ...(isBold ? { ref: scenario.actions.markToggleItemRef } : {}),
    ...(isBold ? {} : { disabled: scenario.state.disabledToggleItem }),
    value,
    ...partProps(
      isBold ? "toggle-item" : "toggle-item-secondary",
      { propCheck: scenario.state.propCheck, customSlot: scenario.state.customToggleItemSlot },
      "toolbar-toggle-item-custom",
    ),
  };
  const label = isBold ? "B" : "I";

  if (scenario.state.toggleItemComposition === "asChild") {
    return (
      <Toolbar.ToggleItem {...props} asChild>
        <span>{label}</span>
      </Toolbar.ToggleItem>
    );
  }

  if (scenario.state.toggleItemComposition === "render") {
    return (
      <Toolbar.ToggleItem
        {...props}
        render={(renderProps) => (
          <span {...renderProps}>{renderProps.children as ReactNode}</span>
        )}
      >
        {label}
      </Toolbar.ToggleItem>
    );
  }

  return <Toolbar.ToggleItem {...props}>{label}</Toolbar.ToggleItem>;
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
    const container = document.querySelector<HTMLElement>("[data-drawer-container]");
    const trigger = document.querySelector<HTMLElement>("[data-drawer-trigger]");
    const overlay = document.querySelector<HTMLElement>("[data-drawer-overlay]");
    const content = document.querySelector<HTMLElement>("[data-drawer-content]");
    const title = document.querySelector<HTMLElement>("[data-drawer-title]");
    const description = document.querySelector<HTMLElement>("[data-drawer-description]");
    const close = document.querySelector<HTMLElement>("[data-drawer-close]");
    const nestedContent = document.querySelector<HTMLElement>("[data-drawer-nested-content]");
    const contentParent = content?.parentElement;
    const contentParentLabel = !content
      ? "not rendered"
      : contentParent === document.body
        ? "body"
        : contentParent === container
          ? "custom container"
          : content.closest(".canvas")
            ? "inline"
            : contentParent?.tagName.toLowerCase() ?? "unknown";
    return [
      {
        title: "Root",
        selector: "[data-drawer-trigger]",
        summary: scenarios.drawer.state.controlled ? "controlled" : "uncontrolled",
        rows: [
          { label: "Mode", value: scenarios.drawer.state.controlled ? "controlled" : "uncontrolled", category: "state" },
          { label: "Open", value: bool(scenarios.drawer.state.open), category: "state" },
          { label: "Default open", value: bool(scenarios.drawer.state.defaultOpen), category: "state" },
          { label: "Disabled", value: bool(scenarios.drawer.state.disabled), category: "state" },
          { label: "Keep mounted", value: bool(scenarios.drawer.state.keepMounted), category: "behavior" },
          { label: "Escape closes", value: bool(scenarios.drawer.state.closeOnEscape), category: "behavior" },
          { label: "Backdrop closes", value: bool(scenarios.drawer.state.closeOnBackdropClick), category: "behavior" },
        ],
      },
      {
        title: "Trigger",
        selector: "[data-drawer-trigger]",
        summary: trigger?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!trigger), category: "presence" },
          { label: "Composition", value: scenarios.drawer.state.triggerComposition, category: "composition" },
          { label: "Block event", value: bool(scenarios.drawer.state.blockTriggerEvent), category: "behavior" },
        ],
      },
      {
        title: "Portal",
        selector: "[data-drawer-container]",
        inactive: !container,
        summary: contentParentLabel,
        rows: [
          { label: "Content rendered", value: bool(!!content), category: "presence" },
          { label: "Parent", value: contentParentLabel, category: "behavior" },
          { label: "Inside canvas", value: bool(!!content?.closest(".canvas")), category: "behavior" },
          { label: "In custom target", value: bool(!!content && contentParent === container), category: "behavior" },
          { label: "Disabled", value: bool(scenarios.drawer.state.portalDisabled), category: "state" },
          { label: "Custom container", value: bool(scenarios.drawer.state.customContainer), category: "state" },
          { label: "Container rendered", value: bool(!!container), category: "presence" },
        ],
      },
      {
        title: "Overlay",
        selector: "[data-drawer-overlay]",
        inactive: !overlay,
        summary: overlay?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!overlay), category: "presence" },
          { label: "Disabled", value: bool(scenarios.drawer.state.overlayDisabled), category: "state" },
        ],
      },
      {
        title: "Content",
        selector: "[data-drawer-content]",
        inactive: !content,
        summary: content?.dataset.placement ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!content), category: "presence" },
          { label: "Placement", value: scenarios.drawer.state.placement, category: "state" },
          { label: "State", value: content?.dataset.state ?? "not rendered", category: "state" },
          { label: "Nested open", value: bool(scenarios.drawer.state.nestedOpen), category: "state" },
          { label: "Nested content", value: bool(!!nestedContent), category: "presence" },
        ],
      },
      {
        title: "Title",
        selector: "[data-drawer-title]",
        inactive: !title,
        summary: title?.tagName.toLowerCase() ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!title), category: "presence" },
          { label: "Element", value: scenarios.drawer.state.titleAs, category: "identity" },
        ],
      },
      { title: "Description", selector: "[data-drawer-description]", inactive: !description, summary: description?.id ?? "not rendered", rows: [{ label: "Exists", value: bool(!!description), category: "presence" }] },
      {
        title: "Close",
        selector: "[data-drawer-close]",
        inactive: !close,
        summary: close?.tagName.toLowerCase() ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!close), category: "presence" },
          { label: "Composition", value: scenarios.drawer.state.closeComposition, category: "composition" },
          { label: "Block event", value: bool(scenarios.drawer.state.blockCloseEvent), category: "behavior" },
        ],
      },
    ];
  }

  if (scenarioId === "menubar") {
    const root = document.querySelector<HTMLElement>("[data-menubar-root]");
    const fileTrigger = document.querySelector<HTMLElement>("[data-menubar-trigger-file]");
    const viewTrigger = document.querySelector<HTMLElement>("[data-menubar-trigger-view]");
    const fileContent = document.querySelector<HTMLElement>("[data-menubar-content-file]");
    const viewContent = document.querySelector<HTMLElement>("[data-menubar-content-view]");
    const group = document.querySelector<HTMLElement>("[data-menubar-group]");
    const item = document.querySelector<HTMLElement>("[data-menubar-item-new]");
    const checked = document.querySelector<HTMLElement>("[data-menubar-checkbox]");
    const separator = document.querySelector<HTMLElement>("[data-menubar-separator]");
    const subTrigger = document.querySelector<HTMLElement>("[data-menubar-sub-trigger]");
    const subContent = document.querySelector<HTMLElement>("[data-menubar-sub-content]");
    const radio = document.querySelector<HTMLElement>("[data-menubar-radio][data-checked]");
    return [
      {
        title: "Root",
        selector: "[data-menubar-root]",
        summary: scenarios.menubar.state.value ?? "closed",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Mode", value: scenarios.menubar.state.controlled ? "controlled" : "uncontrolled", category: "state" },
          { label: "Controlled value", value: scenarios.menubar.state.value ?? "none", category: "state" },
          { label: "Default value", value: scenarios.menubar.state.defaultValue, category: "state" },
          { label: "Loop", value: bool(scenarios.menubar.state.loop), category: "behavior" },
          { label: "Direction", value: scenarios.menubar.state.dir, category: "state" },
          { label: "Direction mode", value: scenarios.menubar.state.dirMode, category: "state" },
          { label: "DOM dir", value: root?.getAttribute("dir") ?? "not rendered", category: "identity" },
          { label: "data-slot", value: root?.dataset.slot ?? "not rendered", category: "data" },
        ],
      },
      {
        title: "Menu",
        summary: scenarios.menubar.state.value ?? "closed",
        rows: [
          { label: "File value", value: "file", category: "state" },
          { label: "View value", value: "view", category: "state" },
          { label: "Close on select", value: bool(scenarios.menubar.state.closeOnSelect), category: "behavior" },
          { label: "Escape closes", value: bool(scenarios.menubar.state.closeOnEscape), category: "behavior" },
          { label: "Menu loop", value: bool(scenarios.menubar.state.menuLoop), category: "behavior" },
        ],
      },
      {
        title: "Trigger",
        selector: "[data-menubar-trigger-file]",
        summary: fileTrigger?.dataset.state ?? "not rendered",
        groups: [
          {
            title: "File Trigger",
            selector: "[data-menubar-trigger-file]",
            rows: [
              { label: "Exists", value: bool(!!fileTrigger), category: "presence" },
              { label: "Disabled", value: bool(scenarios.menubar.state.fileDisabled), category: "state" },
              { label: "role", value: fileTrigger?.getAttribute("role") ?? "not rendered", category: "aria" },
              { label: "aria-expanded", value: fileTrigger?.getAttribute("aria-expanded") ?? "not rendered", category: "aria" },
              { label: "aria-controls", value: fileTrigger?.getAttribute("aria-controls") ?? "not rendered", category: "aria" },
              { label: "data-state", value: fileTrigger?.dataset.state ?? "not rendered", category: "data" },
              { label: "data-slot", value: fileTrigger?.dataset.slot ?? "not rendered", category: "data" },
            ],
          },
          {
            title: "View Trigger",
            selector: "[data-menubar-trigger-view]",
            rows: [
              { label: "Exists", value: bool(!!viewTrigger), category: "presence" },
              { label: "role", value: viewTrigger?.getAttribute("role") ?? "not rendered", category: "aria" },
              { label: "aria-expanded", value: viewTrigger?.getAttribute("aria-expanded") ?? "not rendered", category: "aria" },
              { label: "data-state", value: viewTrigger?.dataset.state ?? "not rendered", category: "data" },
            ],
          },
        ],
      },
      {
        title: "Content",
        selector: "[data-menubar-content-file]",
        inactive: !fileContent,
        summary: fileContent?.dataset.state ?? "not rendered",
        groups: [
          {
            title: "File Content",
            selector: "[data-menubar-content-file]",
            rows: [
              { label: "Exists", value: bool(!!fileContent), category: "presence" },
              { label: "role", value: fileContent?.getAttribute("role") ?? "not rendered", category: "aria" },
              { label: "aria-label", value: fileContent?.getAttribute("aria-label") ?? "not rendered", category: "aria" },
              { label: "data-state", value: fileContent?.dataset.state ?? "not rendered", category: "data" },
              { label: "data-side", value: fileContent?.dataset.side ?? "not rendered", category: "data" },
              { label: "data-align", value: fileContent?.dataset.align ?? "not rendered", category: "data" },
              { label: "data-positioned", value: fileContent?.dataset.positioned ?? "not rendered", category: "data" },
              { label: "data-slot", value: fileContent?.dataset.slot ?? "not rendered", category: "data" },
            ],
          },
          {
            title: "View Content",
            selector: "[data-menubar-content-view]",
            rows: [
              { label: "Exists", value: bool(!!viewContent), category: "presence" },
              { label: "role", value: viewContent?.getAttribute("role") ?? "not rendered", category: "aria" },
              { label: "data-state", value: viewContent?.dataset.state ?? "not rendered", category: "data" },
            ],
          },
        ],
      },
      { title: "Group", selector: "[data-menubar-group]", inactive: !group, summary: group?.getAttribute("role") ?? "not rendered", rows: [{ label: "Exists", value: bool(!!group), category: "presence" }, { label: "role", value: group?.getAttribute("role") ?? "not rendered", category: "aria" }, { label: "data-slot", value: group?.dataset.slot ?? "not rendered", category: "data" }] },
      { title: "Item", selector: "[data-menubar-item-new]", inactive: !item, summary: item?.dataset.value ?? "not rendered", rows: [{ label: "Exists", value: bool(!!item), category: "presence" }, { label: "role", value: item?.getAttribute("role") ?? "not rendered", category: "aria" }, { label: "data-value", value: item?.dataset.value ?? "not rendered", category: "data" }, { label: "data-slot", value: item?.dataset.slot ?? "not rendered", category: "data" }] },
      { title: "Checkbox Item", selector: "[data-menubar-checkbox]", inactive: !checked, summary: scenarios.menubar.state.showGrid ? "checked" : "unchecked", rows: [{ label: "Exists", value: bool(!!checked), category: "presence" }, { label: "Checked", value: bool(scenarios.menubar.state.showGrid), category: "state" }, { label: "aria-checked", value: checked?.getAttribute("aria-checked") ?? "not rendered", category: "aria" }, { label: "data-slot", value: checked?.dataset.slot ?? "not rendered", category: "data" }] },
      { title: "Radio Group", selector: "[data-menubar-radio-group]", inactive: !radio, summary: scenarios.menubar.state.density, rows: [{ label: "Value", value: scenarios.menubar.state.density, category: "state" }] },
      { title: "Radio Item", selector: "[data-menubar-radio][data-checked]", inactive: !radio, summary: scenarios.menubar.state.density, rows: [{ label: "Exists", value: bool(!!radio), category: "presence" }, { label: "Value", value: scenarios.menubar.state.density, category: "state" }, { label: "aria-checked", value: radio?.getAttribute("aria-checked") ?? "not rendered", category: "aria" }, { label: "data-slot", value: radio?.dataset.slot ?? "not rendered", category: "data" }] },
      { title: "Separator", selector: "[data-menubar-separator]", inactive: !separator, summary: separator?.getAttribute("role") ?? "not rendered", rows: [{ label: "Exists", value: bool(!!separator), category: "presence" }, { label: "role", value: separator?.getAttribute("role") ?? "not rendered", category: "aria" }, { label: "data-slot", value: separator?.dataset.slot ?? "not rendered", category: "data" }] },
      { title: "Sub", inactive: !subTrigger, summary: subTrigger?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!subTrigger), category: "presence" }] },
      { title: "Sub Trigger", selector: "[data-menubar-sub-trigger]", inactive: !subTrigger, summary: subTrigger?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!subTrigger), category: "presence" }, { label: "aria-expanded", value: subTrigger?.getAttribute("aria-expanded") ?? "not rendered", category: "aria" }, { label: "data-state", value: subTrigger?.dataset.state ?? "not rendered", category: "data" }, { label: "data-slot", value: subTrigger?.dataset.slot ?? "not rendered", category: "data" }] },
      { title: "Sub Content", selector: "[data-menubar-sub-content]", inactive: !subContent, summary: subContent?.dataset.state ?? "not rendered", rows: [{ label: "Exists", value: bool(!!subContent), category: "presence" }, { label: "role", value: subContent?.getAttribute("role") ?? "not rendered", category: "aria" }, { label: "aria-label", value: subContent?.getAttribute("aria-label") ?? "not rendered", category: "aria" }, { label: "data-state", value: subContent?.dataset.state ?? "not rendered", category: "data" }, { label: "data-side", value: subContent?.dataset.side ?? "not rendered", category: "data" }, { label: "data-slot", value: subContent?.dataset.slot ?? "not rendered", category: "data" }] },
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
        summary: root?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Mode", value: scenarios.sidebar.state.controlled ? "controlled" : "uncontrolled", category: "state" },
          { label: "State", value: root?.dataset.state ?? "not rendered", category: "state" },
          { label: "Collapsed state", value: root?.dataset.collapsedState ?? "not rendered", category: "state" },
          { label: "Side", value: root?.dataset.side ?? "not rendered", category: "state" },
          { label: "Disabled", value: bool(scenarios.sidebar.state.disabled), category: "state" },
          { label: "Composition", value: formatOption(scenarios.sidebar.state.rootComposition), category: "composition" },
        ],
      },
      {
        title: "Trigger",
        selector: "[data-sidebar-trigger]",
        summary: trigger?.dataset.targetState ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!trigger), category: "presence" },
          { label: "Target state", value: trigger?.dataset.targetState ?? "not rendered", category: "state" },
          { label: "Composition", value: formatOption(scenarios.sidebar.state.triggerComposition), category: "composition" },
        ],
      },
      {
        title: "Panel",
        selector: "[data-sidebar-panel]",
        summary: panel?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!panel), category: "presence" },
          { label: "Hidden", value: bool(panel?.getAttribute("aria-hidden") === "true"), category: "state" },
          { label: "Inert", value: bool(panel?.hasAttribute("inert") ?? false), category: "state" },
          { label: "Composition", value: formatOption(scenarios.sidebar.state.panelComposition), category: "composition" },
        ],
      },
      {
        title: "Main",
        selector: "[data-sidebar-main]",
        summary: main?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!main), category: "presence" },
          { label: "Composition", value: formatOption(scenarios.sidebar.state.mainComposition), category: "composition" },
        ],
      },
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
    const storeToasts = getToasts();
    const pausedCount = storeToasts.filter((toastData) => toastData.paused).length;
    return [
      {
        title: "Provider",
        selector: "[data-toast-stage]",
        summary: `max ${scenarios.toast.state.maxVisible}`,
        rows: [
          { label: "Rendering", value: scenarios.toast.state.renderMode, category: "state" },
          { label: "Type", value: scenarios.toast.state.type, category: "state" },
          { label: "Max visible", value: scenarios.toast.state.maxVisible, category: "state" },
          { label: "Close button", value: bool(scenarios.toast.state.closeButton), category: "state" },
          { label: "Action buttons", value: bool(scenarios.toast.state.action), category: "state" },
          { label: "Dismissible", value: bool(scenarios.toast.state.dismissible), category: "state" },
          { label: "Paused", value: bool(scenarios.toast.state.paused), category: "state" },
          { label: "Force mount", value: bool(scenarios.toast.state.forceMount), category: "state" },
          { label: "Duration", value: scenarios.toast.state.duration, category: "state" },
          { label: "Expand on hover", value: bool(scenarios.toast.state.expandOnHover), category: "state" },
          { label: "Pause on hover", value: bool(scenarios.toast.state.pauseOnHover), category: "state" },
          { label: "Pause on focus loss", value: bool(scenarios.toast.state.pauseOnFocusLoss), category: "state" },
        ],
      },
      {
        title: "Root",
        selector: "[data-toast-root]",
        inactive: !root,
        summary: root?.dataset.type ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Mode", value: scenarios.toast.state.rootComposition, category: "composition" },
          { label: "Expanded", value: bool(root?.dataset.expanded !== undefined), category: "state" },
          { label: "Ref", value: scenarios.toast.state.rootRef, category: "behavior" },
        ],
      },
      {
        title: "Title",
        selector: "[data-toast-title]",
        inactive: !title,
        summary: title?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!title), category: "presence" },
          { label: "Mode", value: scenarios.toast.state.titleComposition, category: "composition" },
          { label: "Ref", value: scenarios.toast.state.titleRef, category: "behavior" },
        ],
      },
      {
        title: "Description",
        selector: "[data-toast-description]",
        inactive: !description,
        summary: description?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!description), category: "presence" },
          { label: "Mode", value: scenarios.toast.state.descriptionComposition, category: "composition" },
          { label: "Ref", value: scenarios.toast.state.descriptionRef, category: "behavior" },
        ],
      },
      {
        title: "Action",
        selector: "[data-toast-action]",
        inactive: !action,
        summary: action?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!action), category: "presence" },
          { label: "Mode", value: scenarios.toast.state.actionComposition, category: "composition" },
          { label: "Ref", value: scenarios.toast.state.actionRef, category: "behavior" },
        ],
      },
      {
        title: "Cancel",
        selector: "[data-toast-cancel]",
        inactive: !cancel,
        summary: cancel?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!cancel), category: "presence" },
          { label: "Mode", value: scenarios.toast.state.cancelComposition, category: "composition" },
          { label: "Ref", value: scenarios.toast.state.cancelRef, category: "behavior" },
        ],
      },
      {
        title: "Close",
        selector: "[data-toast-close]",
        inactive: !close,
        summary: close?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!close), category: "presence" },
          { label: "Mode", value: scenarios.toast.state.closeComposition, category: "composition" },
          { label: "Ref", value: scenarios.toast.state.closeRef, category: "behavior" },
        ],
      },
      {
        title: "Viewport",
        selector: "[data-toast-viewport]",
        inactive: !viewport,
        summary: viewport?.dataset.position ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!viewport), category: "presence" },
          { label: "Mode", value: scenarios.toast.state.viewportComposition, category: "composition" },
          { label: "Portal", value: scenarios.toast.state.portalMode, category: "state" },
          { label: "Expanded", value: bool(viewport?.dataset.expanded !== undefined), category: "state" },
          { label: "Ref", value: scenarios.toast.state.viewportRef, category: "behavior" },
        ],
      },
      {
        title: "Announcer: Polite",
        selector: "[data-slot='toast-announcer-polite']",
        summary: "live region",
        rows: [{ label: "Exists", value: bool(!!document.querySelector("[data-slot='toast-announcer-polite']")), category: "presence" }],
      },
      {
        title: "Announcer: Assertive",
        selector: "[data-slot='toast-announcer-assertive']",
        summary: "live region",
        rows: [{ label: "Exists", value: bool(!!document.querySelector("[data-slot='toast-announcer-assertive']")), category: "presence" }],
      },
      {
        title: "Store",
        selector: "[data-toast-count]",
        summary: count?.textContent?.trim() || "0 toasts",
        rows: [
          { label: "Count", value: String(storeToasts.length), category: "state" },
          { label: "Paused", value: String(pausedCount), category: "state" },
        ],
      },
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
          { label: "Ref target", value: scenarios.collapsible.state.rootRef, category: "identity" },
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
          { label: "Ref target", value: scenarios.collapsible.state.triggerRef, category: "identity" },
          { label: "Controls match", value: bool(!!trigger && !!content && trigger.getAttribute("aria-controls") === content.id), category: "behavior" },
          { label: "Composition", value: scenarios.collapsible.state.triggerComposition, category: "composition" },
          { label: "Block trigger", value: bool(scenarios.collapsible.state.blockTriggerEvent), category: "behavior" },
        ],
      },
      {
        title: "Content",
        selector: "[data-collapsible-content]",
        inactive: !content,
        summary: content?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!content), category: "presence" },
          { label: "Ref target", value: scenarios.collapsible.state.contentRef, category: "identity" },
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
    const link = document.querySelector<HTMLElement>("[data-toolbar-link]");
    const separator = document.querySelector<HTMLElement>("[data-toolbar-separator]");
    const toggleGroup = document.querySelector<HTMLElement>("[data-toolbar-toggle-group]");
    const toggleItem = document.querySelector<HTMLElement>("[data-toolbar-toggle-item]");
    const secondaryToggleItem = document.querySelector<HTMLElement>("[data-toolbar-toggle-item-secondary]");
    const resolvedDir = getToolbarResolvedDirection(scenarios.toolbar.state.directionMode);
    return [
      {
        title: "Root",
        selector: "[data-toolbar-root]",
        summary: `${scenarios.toolbar.state.orientation} ${resolvedDir}`,
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Orientation", value: scenarios.toolbar.state.orientation, category: "state" },
          { label: "Direction", value: scenarios.toolbar.state.directionMode, category: "state" },
          { label: "Root direction", value: root?.getAttribute("dir") ?? "none", category: "state" },
          { label: "Loop", value: bool(scenarios.toolbar.state.loop), category: "behavior" },
          { label: "Composition", value: scenarios.toolbar.state.rootComposition, category: "composition" },
          { label: "Ref target", value: scenarios.toolbar.state.rootRef, category: "identity" },
        ],
      },
      {
        title: "Button: Undo",
        selector: "[data-toolbar-button]",
        summary: button?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!button), category: "presence" },
          { label: "Composition", value: scenarios.toolbar.state.buttonComposition, category: "composition" },
          { label: "Ref target", value: scenarios.toolbar.state.buttonRef, category: "identity" },
        ],
      },
      {
        title: "Button: Redo",
        selector: "[data-toolbar-disabled-button]",
        summary: disabledButton?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!disabledButton), category: "presence" },
          { label: "Disabled", value: bool(scenarios.toolbar.state.disabledButton), category: "state" },
          { label: "Composition", value: scenarios.toolbar.state.buttonComposition, category: "composition" },
        ],
      },
      {
        title: "Link: Help",
        selector: "[data-toolbar-link]",
        summary: link?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!link), category: "presence" },
          { label: "Disabled", value: bool(scenarios.toolbar.state.disabledLink), category: "state" },
          { label: "Href", value: link?.getAttribute("href") ?? "none", category: "state" },
          { label: "Composition", value: scenarios.toolbar.state.linkComposition, category: "composition" },
          { label: "Ref target", value: scenarios.toolbar.state.linkRef, category: "identity" },
        ],
      },
      {
        title: "Separator",
        selector: "[data-toolbar-separator]",
        summary: separator?.dataset.orientation ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!separator), category: "presence" },
          { label: "Composition", value: scenarios.toolbar.state.separatorComposition, category: "composition" },
        ],
      },
      {
        title: "Toggle Group",
        selector: "[data-toolbar-toggle-group]",
        summary: scenarios.toolbar.state.toggleType,
        rows: [
          { label: "Exists", value: bool(!!toggleGroup), category: "presence" },
          { label: "Type", value: scenarios.toolbar.state.toggleType, category: "state" },
          { label: "Controlled", value: bool(scenarios.toolbar.state.toggleControlled), category: "state" },
          { label: "Value", value: getToolbarValue(scenarios.toolbar.state.toggleValue), category: "state" },
          { label: "Default value", value: scenarios.toolbar.state.defaultToggleValue, category: "state" },
          { label: "Disabled", value: bool(scenarios.toolbar.state.disabledToggleGroup), category: "state" },
          { label: "Composition", value: scenarios.toolbar.state.toggleGroupComposition, category: "composition" },
        ],
      },
      {
        title: "Toggle Item: Bold",
        selector: "[data-toolbar-toggle-item]",
        summary: toggleItem?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!toggleItem), category: "presence" },
          { label: "State", value: toggleItem?.dataset.state ?? "none", category: "state" },
          { label: "Value", value: toggleItem?.dataset.value ?? "none", category: "state" },
          { label: "Composition", value: scenarios.toolbar.state.toggleItemComposition, category: "composition" },
          { label: "Ref target", value: scenarios.toolbar.state.toggleItemRef, category: "identity" },
        ],
      },
      {
        title: "Toggle Item: Italic",
        selector: "[data-toolbar-toggle-item-secondary]",
        summary: secondaryToggleItem?.dataset.state ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!secondaryToggleItem), category: "presence" },
          { label: "State", value: secondaryToggleItem?.dataset.state ?? "none", category: "state" },
          { label: "Value", value: secondaryToggleItem?.dataset.value ?? "none", category: "state" },
          { label: "Disabled", value: bool(scenarios.toolbar.state.disabledToggleItem), category: "state" },
          { label: "Composition", value: scenarios.toolbar.state.toggleItemComposition, category: "composition" },
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

function getCollapsibleTriggerSource(state: ReturnType<typeof useCollapsibleScenario>["state"]) {
  const props = sourceProps([
    state.customTriggerSlot ? `data-slot="collapsible-trigger-custom"` : null,
    state.propCheck ? `data-prop-check="trigger"` : null,
    state.blockTriggerEvent ? `onClick={(event) => event.preventDefault()}` : null,
  ]);

  if (state.triggerComposition === "asChild") {
    return `<Collapsible.Trigger${props} asChild>
  <span>Details</span>
</Collapsible.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<Collapsible.Trigger${props}
  render={(props) => <div {...props}>Details</div>}
/>`;
  }

  return `<Collapsible.Trigger${props}>Details</Collapsible.Trigger>`;
}

function getCollapsibleContentSource(state: ReturnType<typeof useCollapsibleScenario>["state"]) {
  const props = sourceProps([
    state.keepMounted ? `keepMounted` : null,
    state.customContentSlot ? `data-slot="collapsible-content-custom"` : null,
    state.propCheck ? `data-prop-check="content"` : null,
  ]);

  if (state.contentComposition === "asChild") {
    return `<Collapsible.Content${props} asChild>
  <section>More information</section>
</Collapsible.Content>`;
  }

  if (state.contentComposition === "render") {
    return `<Collapsible.Content${props}
  render={(props) => <section {...props}>More information</section>}
/>`;
  }

  return `<Collapsible.Content${props}>More information</Collapsible.Content>`;
}

function getToastRootSource(state: ToastScenarioState, props: string, children: string) {
  if (state.rootComposition === "asChild") {
    return `<Toast.Root${props} asChild>
  <section>
${indent(children, 4)}
  </section>
</Toast.Root>`;
  }

  if (state.rootComposition === "render") {
    return `<Toast.Root${props} render={(props) => <section {...props} />}>
${indent(children, 2)}
</Toast.Root>`;
  }

  return `<Toast.Root${props}>
${indent(children, 2)}
</Toast.Root>`;
}

function getToastViewportSource(state: ToastScenarioState, props: string, renderToast?: string) {
  const renderToastBlock = renderToast ? `\n  ${renderToast}` : "";

  if (state.viewportComposition === "asChild") {
    return `<Toast.Viewport${props}${renderToastBlock}>
  <section />
</Toast.Viewport>`;
  }

  return `<Toast.Viewport${props}${renderToastBlock} />`;
}

function getToastTitleSource(state: ToastScenarioState) {
  const props = sourceProps([
    state.customTitleSlot ? `data-slot="toast-title-custom"` : null,
    state.propCheck ? `data-prop-check="title"` : null,
    state.titleComposition === "asChild" ? "asChild" : null,
    state.titleComposition === "render" ? `render={(props) => <h3 {...props} />}` : null,
  ]);

  if (state.titleComposition === "asChild") {
    return `<Toast.Title${props}><h3>${formatOption(state.type)} toast</h3></Toast.Title>`;
  }

  return `<Toast.Title${props}>${formatOption(state.type)} toast</Toast.Title>`;
}

function getToastDescriptionSource(state: ToastScenarioState) {
  const props = sourceProps([
    state.customDescriptionSlot ? `data-slot="toast-description-custom"` : null,
    state.propCheck ? `data-prop-check="description"` : null,
    state.descriptionComposition === "asChild" ? "asChild" : null,
    state.descriptionComposition === "render" ? `render={(props) => <p {...props} />}` : null,
  ]);

  if (state.descriptionComposition === "asChild") {
    return `<Toast.Description${props}><p>Playground notification body.</p></Toast.Description>`;
  }

  return `<Toast.Description${props}>Playground notification body.</Toast.Description>`;
}

function getToastActionSource(state: ToastScenarioState) {
  const props = sourceProps([
    state.customActionSlot ? `data-slot="toast-action-custom"` : null,
    state.propCheck ? `data-prop-check="action"` : null,
    `altText="Undo change"`,
    state.actionComposition === "asChild" ? "asChild" : null,
    state.actionComposition === "render" ? `render={(props) => <button {...props} />}` : null,
  ]);

  if (state.actionComposition === "asChild") {
    return `<Toast.Action${props}><button>Undo</button></Toast.Action>`;
  }

  return `<Toast.Action${props}>Undo</Toast.Action>`;
}

function getToastCancelSource(state: ToastScenarioState) {
  const props = sourceProps([
    state.customCancelSlot ? `data-slot="toast-cancel-custom"` : null,
    state.propCheck ? `data-prop-check="cancel"` : null,
    `altText="Dismiss undo"`,
    state.cancelComposition === "asChild" ? "asChild" : null,
    state.cancelComposition === "render" ? `render={(props) => <button {...props} />}` : null,
  ]);

  if (state.cancelComposition === "asChild") {
    return `<Toast.Cancel${props}><button>Dismiss</button></Toast.Cancel>`;
  }

  return `<Toast.Cancel${props}>Dismiss</Toast.Cancel>`;
}

function getToastCloseSource(state: ToastScenarioState) {
  const props = sourceProps([
    state.customCloseSlot ? `data-slot="toast-close-custom"` : null,
    state.propCheck ? `data-prop-check="close"` : null,
    state.closeComposition === "asChild" ? "asChild" : null,
    state.closeComposition === "render" ? `render={(props) => <button {...props} />}` : null,
  ]);

  if (state.closeComposition === "asChild") {
    return `<Toast.Close${props}><button>Close</button></Toast.Close>`;
  }

  return `<Toast.Close${props}>Close</Toast.Close>`;
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

function toToolbarTypedValue(value: ToolbarValue, type: ToggleType): string | string[] {
  if (type === "single") return value === "none" ? "" : value;
  return value === "none" ? [] : [value];
}

function getToolbarSourceValue(prop: "defaultValue" | "value", value: ToolbarValue | string | string[]) {
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return `${prop}={${JSON.stringify(value)}}`;
  }

  if (!value || value === "none") return null;
  return `${prop}="${value}"`;
}

function getToolbarRootSource(props: string, children: string, composition: CompositionMode) {
  if (composition === "asChild") {
    return `<Toolbar.Root${props} asChild>
  <section>
${indent(children, 4)}
  </section>
</Toolbar.Root>`;
  }

  if (composition === "render") {
    return `<Toolbar.Root${props} render={(props) => (
  <section {...props}>{props.children}</section>
)}>
${indent(children, 2)}
</Toolbar.Root>`;
  }

  return `<Toolbar.Root${props}>
${indent(children, 2)}
</Toolbar.Root>`;
}

function getToolbarButtonSource(label: "Undo" | "Redo", props: string, composition: CompositionMode) {
  if (composition === "asChild") {
    return `<Toolbar.Button${props} asChild>
  <span>${label}</span>
</Toolbar.Button>`;
  }

  if (composition === "render") {
    return `<Toolbar.Button${props} render={(props) => <span {...props}>{props.children}</span>}>
  ${label}
</Toolbar.Button>`;
  }

  return `<Toolbar.Button${props}>${label}</Toolbar.Button>`;
}

function getToolbarLinkSource(props: string, composition: CompositionMode) {
  if (composition === "asChild") {
    return `<Toolbar.Link${props} asChild>
  <a>Help</a>
</Toolbar.Link>`;
  }

  if (composition === "render") {
    return `<Toolbar.Link${props} render={(props) => <a {...props}>{props.children}</a>}>
  Help
</Toolbar.Link>`;
  }

  return `<Toolbar.Link${props}>Help</Toolbar.Link>`;
}

function getToolbarSeparatorSource(props: string, composition: CompositionMode) {
  if (composition === "asChild") {
    return `<Toolbar.Separator${props} asChild>
  <div />
</Toolbar.Separator>`;
  }

  if (composition === "render") {
    return `<Toolbar.Separator${props} render={(props) => <hr {...props} />} />`;
  }

  return `<Toolbar.Separator${props} />`;
}

function getToolbarToggleGroupSource(props: string, items: string, composition: CompositionMode) {
  if (composition === "asChild") {
    return `<Toolbar.ToggleGroup${props} asChild>
  <section>
${indent(items, 4)}
  </section>
</Toolbar.ToggleGroup>`;
  }

  if (composition === "render") {
    return `<Toolbar.ToggleGroup${props} render={(props) => (
  <section {...props}>{props.children}</section>
)}>
${indent(items, 2)}
</Toolbar.ToggleGroup>`;
  }

  return `<Toolbar.ToggleGroup${props}>
${indent(items, 2)}
</Toolbar.ToggleGroup>`;
}

function getToolbarToggleItemSource(label: "B" | "I", props: string, composition: CompositionMode) {
  if (composition === "asChild") {
    return `<Toolbar.ToggleItem${props} asChild>
  <span>${label}</span>
</Toolbar.ToggleItem>`;
  }

  if (composition === "render") {
    return `<Toolbar.ToggleItem${props} render={(props) => <span {...props}>{props.children}</span>}>
  ${label}
</Toolbar.ToggleItem>`;
  }

  return `<Toolbar.ToggleItem${props}>${label}</Toolbar.ToggleItem>`;
}

function getToolbarRootDirectionProps(directionMode: ToolbarDirectionMode) {
  if (directionMode === "local-ltr") return { dir: "ltr" as const };
  if (directionMode === "local-rtl") return { dir: "rtl" as const };
  return {};
}

function getToolbarDirectionSourceProps(directionMode: ToolbarDirectionMode) {
  if (directionMode === "local-ltr") return [`dir="ltr"`];
  if (directionMode === "local-rtl") return [`dir="rtl"`];
  return [];
}

function shouldWrapToolbarDirectionProvider(directionMode: ToolbarDirectionMode) {
  return directionMode === "provider-rtl" || directionMode === "local-ltr";
}

function getToolbarResolvedDirection(directionMode: ToolbarDirectionMode): TextDirection {
  if (directionMode === "default" || directionMode === "local-ltr") return "ltr";
  return "rtl";
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
const menubarValueOptions: readonly MenubarValueOption[] = ["none", "file", "view"];
const menubarDirectionModeOptions: readonly MenubarDirectionMode[] = ["provider", "root"];
const drawerTitleLevelOptions = ["h2", "h3", "h4"] as const;
const densityOptions = ["compact", "comfortable"] as const;
const toggleTypeOptions = ["single", "multiple"] as const;
const toolbarDirectionModeOptions: readonly WorkbenchOption<ToolbarDirectionMode>[] = [
  { label: "Default", value: "default" },
  { label: "Provider RTL", value: "provider-rtl" },
  { label: "Local LTR", value: "local-ltr" },
  { label: "Local RTL", value: "local-rtl" },
];
const toolbarValueOptions: readonly ToolbarValue[] = ["none", "bold", "italic"];
const sidebarStateOptions = ["expanded", "rail", "offcanvas"] as const;
const sidebarCollapsedStateOptions = ["rail", "offcanvas"] as const;
const sidebarSideOptions = ["left", "right"] as const;
const swipeOpenSideOptions = ["none", "start", "end"] as const;
const swipeThresholdOptions = ["0.2", "0.35", "0.6"] as const;
const swipeFullThresholdOptions = ["0.4", "0.6", "0.8"] as const;
const toastRenderModeOptions = ["imperative", "declarative"] as const;
const toastKindOptions = ["default", "success", "error", "warning", "info", "loading"] as const;
const toastPositionOptions = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"] as const;
const toastDurationOptions = ["short", "infinite"] as const;
const toastMaxVisibleOptions = ["1", "3", "5"] as const;
const toastPortalModeOptions = ["body", "local", "disabled"] as const;
const toastViewportCompositionOptions = ["default", "asChild", "render"] as const;
const virtualizerCountOptions = ["12", "40", "100"] as const;
const virtualizerOverscanOptions = ["0", "1", "2", "5"] as const;
const virtualizerAlignOptions = ["start", "center", "end", "auto"] as const;
