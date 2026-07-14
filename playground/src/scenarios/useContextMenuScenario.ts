import { useCallback, useEffect, useRef, useState } from "react";
import type { DirectionValue } from "@flowstack-ui/atom/direction";

export type ContextMenuLogEntry = {
  id: number;
  text: string;
  time: string;
};

export type ContextMenuSide = "top" | "right" | "bottom" | "left";
export type ContextMenuAlign = "start" | "center" | "end";
export type ContextMenuItemCompositionMode = "default" | "asChild" | "render";
export type ContextMenuAnchorPoint = {
  x: number;
  y: number;
  localX: number;
  localY: number;
};

export type ContextMenuRefPart =
  | "content"
  | "group"
  | "item"
  | "disabledItem"
  | "checkboxItem"
  | "radioGroup"
  | "radioItem"
  | "radioGroupSecondary"
  | "radioItemSecondary"
  | "separator"
  | "subTrigger"
  | "subContent"
  | "subItem"
  | "subTriggerSecondary"
  | "subContentSecondary"
  | "subItemSecondary"
  | "nestedSubTrigger"
  | "nestedSubContent"
  | "nestedSubItem";

export type ContextMenuRefSnapshot = Record<ContextMenuRefPart, string>;

export type ContextMenuPartsSnapshot = {
  rootMode: string;
  defaultOpen: string;
  open: string;
  modal: string;
  closeOnSelect: string;
  loop: string;
  closeOnEscape: string;
  triggerExists: string;
  triggerRef: string;
  triggerTag: string;
  triggerType: string;
  triggerRole: string;
  triggerTabIndex: string;
  triggerSlot: string;
  triggerState: string;
  triggerDataPropCheck: string;
  triggerDisabled: string;
  triggerAriaDisabled: string;
  triggerHasPopup: string;
  triggerExpanded: string;
  triggerControls: string;
  triggerControlsMatch: string;
  contentExists: string;
  contentRef: string;
  contentParent: string;
  contentRole: string;
  contentOrientation: string;
  contentSlot: string;
  contentState: string;
  contentSide: string;
  contentAlign: string;
  contentPositioned: string;
  contentLabel: string;
  contentLabelledBy: string;
  contentLoop: string;
  contentSideOffset: string;
  contentDataPropCheck: string;
  groupExists: string;
  groupRef: string;
  groupRole: string;
  groupSlot: string;
  groupDataPropCheck: string;
  itemExists: string;
  itemRef: string;
  itemRole: string;
  itemSlot: string;
  itemValue: string;
  itemHighlighted: string;
  itemDataPropCheck: string;
  disabledItemExists: string;
  disabledItemRef: string;
  disabledItemDisabled: string;
  checkboxExists: string;
  checkboxRef: string;
  checkboxChecked: string;
  checkboxDataChecked: string;
  checkboxDisabled: string;
  radioGroupExists: string;
  radioGroupRef: string;
  radioGroupRole: string;
  radioGroupValue: string;
  radioGroupDataPropCheck: string;
  radioItemExists: string;
  radioItemRef: string;
  radioItemValue: string;
  radioItemChecked: string;
  radioItemDataChecked: string;
  radioItemDisabledExists: string;
  radioItemDisabledSkipped: string;
  radioGroupSecondaryExists: string;
  radioGroupSecondaryRef: string;
  radioGroupSecondaryRole: string;
  radioGroupSecondaryValue: string;
  radioItemSecondaryExists: string;
  radioItemSecondaryRef: string;
  radioItemSecondaryValue: string;
  radioItemSecondaryChecked: string;
  radioItemSecondaryDataChecked: string;
  separatorExists: string;
  separatorRef: string;
  separatorRole: string;
  separatorOrientation: string;
  subTriggerExists: string;
  subTriggerRef: string;
  subTriggerExpanded: string;
  subTriggerState: string;
  subContentExists: string;
  subContentRef: string;
  subContentParent: string;
  subContentRole: string;
  subContentLabel: string;
  subContentLabelledBy: string;
  subContentState: string;
  subContentSide: string;
  subContentPositioned: string;
  subItemExists: string;
  subItemRef: string;
  subTriggerSecondaryExists: string;
  subTriggerSecondaryRef: string;
  subTriggerSecondaryExpanded: string;
  subTriggerSecondaryState: string;
  subTriggerSecondaryDisabled: string;
  subContentSecondaryExists: string;
  subContentSecondaryRef: string;
  subContentSecondaryParent: string;
  subContentSecondaryRole: string;
  subContentSecondaryState: string;
  subItemSecondaryExists: string;
  subItemSecondaryRef: string;
  nestedSubTriggerExists: string;
  nestedSubTriggerRef: string;
  nestedSubTriggerExpanded: string;
  nestedSubTriggerState: string;
  nestedSubContentExists: string;
  nestedSubContentRef: string;
  nestedSubContentParent: string;
  nestedSubContentRole: string;
  nestedSubContentState: string;
  nestedSubItemExists: string;
  nestedSubItemRef: string;
};

export type ContextMenuScenarioState = {
  controlled: boolean;
  defaultOpen: boolean;
  open: boolean;
  modal: boolean;
  closeOnSelect: boolean;
  closeOnEscape: boolean;
  loop: boolean;
  contentAriaLabel: boolean;
  side: ContextMenuSide;
  align: ContextMenuAlign;
  dir: DirectionValue;
  sideOffset: number;
  contentLoopOff: boolean;
  insideDialog: boolean;
  triggerDisabled: boolean;
  propCheck: boolean;
  customTriggerSlot: boolean;
  customContentSlot: boolean;
  customGroupSlot: boolean;
  customItemSlot: boolean;
  customCheckboxItemSlot: boolean;
  customRadioGroupSlot: boolean;
  customRadioItemSlot: boolean;
  customSeparatorSlot: boolean;
  customSubTriggerSlot: boolean;
  customSubContentSlot: boolean;
  customSubItemSlot: boolean;
  triggerComposition: ContextMenuItemCompositionMode;
  blockTriggerEvent: boolean;
  blockContentKeyDown: boolean;
  checkboxChecked: boolean;
  checkboxDisabled: boolean;
  radioValue: string;
  radioValueSecondary: string;
  radioItemDisabled: boolean;
  showDisabledItem: boolean;
  itemComposition: ContextMenuItemCompositionMode;
  blockItemSelect: boolean;
  closeCheckboxOnSelect: boolean;
  closeRadioOnSelect: boolean;
  showSubmenu: boolean;
  disableSecondSubmenu: boolean;
  controlledSubmenu: boolean;
  defaultSubmenuOpen: boolean;
  subOpen: boolean;
  subContentAriaLabel: boolean;
  subSideOffset: number;
  subContentLoopOff: boolean;
  showNestedSubmenu: boolean;
  logPointer: boolean;
  log: ContextMenuLogEntry[];
  refs: ContextMenuRefSnapshot;
  parts: ContextMenuPartsSnapshot;
};

export type ContextMenuScenarioActions = {
  setControlled: (value: boolean) => void;
  setDefaultOpen: (value: boolean) => void;
  setControlledOpen: (value: boolean) => void;
  setModal: (value: boolean) => void;
  setCloseOnSelect: (value: boolean) => void;
  setCloseOnEscape: (value: boolean) => void;
  setLoop: (value: boolean) => void;
  setContentAriaLabel: (value: boolean) => void;
  setSide: (value: ContextMenuSide) => void;
  setAlign: (value: ContextMenuAlign) => void;
  setDir: (value: DirectionValue) => void;
  setSideOffset: (value: number) => void;
  setContentLoopOff: (value: boolean) => void;
  setInsideDialog: (value: boolean) => void;
  setTriggerDisabled: (value: boolean) => void;
  setPropCheck: (value: boolean) => void;
  setCustomTriggerSlot: (value: boolean) => void;
  setCustomContentSlot: (value: boolean) => void;
  setCustomGroupSlot: (value: boolean) => void;
  setCustomItemSlot: (value: boolean) => void;
  setCustomCheckboxItemSlot: (value: boolean) => void;
  setCustomRadioGroupSlot: (value: boolean) => void;
  setCustomRadioItemSlot: (value: boolean) => void;
  setCustomSeparatorSlot: (value: boolean) => void;
  setCustomSubTriggerSlot: (value: boolean) => void;
  setCustomSubContentSlot: (value: boolean) => void;
  setCustomSubItemSlot: (value: boolean) => void;
  setTriggerComposition: (value: ContextMenuItemCompositionMode) => void;
  setBlockTriggerEvent: (value: boolean) => void;
  setBlockContentKeyDown: (value: boolean) => void;
  setCheckboxChecked: (value: boolean) => void;
  setCheckboxDisabled: (value: boolean) => void;
  setRadioValue: (value: string) => void;
  setRadioValueSecondary: (value: string) => void;
  setRadioItemDisabled: (value: boolean) => void;
  setShowDisabledItem: (value: boolean) => void;
  setItemComposition: (value: ContextMenuItemCompositionMode) => void;
  setBlockItemSelect: (value: boolean) => void;
  setCloseCheckboxOnSelect: (value: boolean) => void;
  setCloseRadioOnSelect: (value: boolean) => void;
  setShowSubmenu: (value: boolean) => void;
  setDisableSecondSubmenu: (value: boolean) => void;
  setControlledSubmenu: (value: boolean) => void;
  setDefaultSubmenuOpen: (value: boolean) => void;
  setControlledSubmenuOpen: (value: boolean) => void;
  setSubContentAriaLabel: (value: boolean) => void;
  setSubSideOffset: (value: number) => void;
  setSubContentLoopOff: (value: boolean) => void;
  setShowNestedSubmenu: (value: boolean) => void;
  setLogPointer: (value: boolean) => void;
  handleOpenChange: (open: boolean) => void;
  handleTriggerContextMenu: (event: { preventDefault: () => void }) => void;
  handleTriggerKeyDown: (event: { key: string; shiftKey?: boolean; preventDefault: () => void }) => void;
  handleContentKeyDownCapture: (event: { key: string; preventDefault: () => void }) => void;
  handleSubOpenChange: (open: boolean) => void;
  handleCheckboxChange: (checked: boolean) => void;
  handleRadioChange: (value: string) => void;
  handleRadioSecondaryChange: (value: string) => void;
  handleActionSelect: (value: string) => void;
  handleActionClick: (value: string) => (event: { preventDefault: () => void }) => void;
  handlePointer: (value: string, phase: "enter" | "leave") => void;
  clearLog: () => void;
  markPartRef: (part: ContextMenuRefPart, element: HTMLElement | null) => void;
};

export function useContextMenuScenario() {
  const [revision, setRevision] = useState(0);
  const [controlled, setControlled] = useState(false);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(true);
  const [closeOnSelect, setCloseOnSelect] = useState(true);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [loop, setLoop] = useState(true);
  const [contentAriaLabel, setContentAriaLabel] = useState(false);
  const [side, setSide] = useState<ContextMenuSide>("bottom");
  const [align, setAlign] = useState<ContextMenuAlign>("start");
  const [dir, setDir] = useState<DirectionValue>("ltr");
  const [sideOffset, setSideOffset] = useState(4);
  const [contentLoopOff, setContentLoopOff] = useState(false);
  const [insideDialog, setInsideDialog] = useState(false);
  const [triggerDisabled, setTriggerDisabled] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
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
  const [customSubItemSlot, setCustomSubItemSlot] = useState(false);
  const [triggerComposition, setTriggerComposition] = useState<ContextMenuItemCompositionMode>("default");
  const [blockTriggerEvent, setBlockTriggerEvent] = useState(false);
  const [blockContentKeyDown, setBlockContentKeyDown] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [checkboxDisabled, setCheckboxDisabled] = useState(false);
  const [radioValue, setRadioValue] = useState("comfortable");
  const [radioValueSecondary, setRadioValueSecondary] = useState("compact");
  const [radioItemDisabled, setRadioItemDisabled] = useState(false);
  const [showDisabledItem, setShowDisabledItem] = useState(false);
  const [itemComposition, setItemComposition] = useState<ContextMenuItemCompositionMode>("default");
  const [blockItemSelect, setBlockItemSelect] = useState(false);
  const [closeCheckboxOnSelect, setCloseCheckboxOnSelect] = useState(false);
  const [closeRadioOnSelect, setCloseRadioOnSelect] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(true);
  const [disableSecondSubmenu, setDisableSecondSubmenu] = useState(false);
  const [controlledSubmenu, setControlledSubmenu] = useState(false);
  const [defaultSubmenuOpen, setDefaultSubmenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [subContentAriaLabel, setSubContentAriaLabel] = useState(false);
  const [subSideOffset, setSubSideOffset] = useState(4);
  const [subContentLoopOff, setSubContentLoopOff] = useState(false);
  const [showNestedSubmenu, setShowNestedSubmenu] = useState(false);
  const [logPointer, setLogPointer] = useState(false);
  const [log, setLog] = useState<ContextMenuLogEntry[]>([]);
  const [refs, setRefs] = useState<ContextMenuRefSnapshot>(emptyContextMenuRefs);
  const logId = useRef(0);

  const addLog = useCallback((text: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    setLog((current) => [{ id: ++logId.current, text, time }, ...current].slice(0, 40));
  }, []);

  const bump = useCallback(() => {
    requestAnimationFrame(() => setRevision((current) => current + 1));
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    addLog(nextOpen ? "opened" : "closed");
    bump();
  }, [addLog, bump]);

  const handleSubOpenChange = useCallback((nextOpen: boolean) => {
    setSubOpen(nextOpen);
    addLog(nextOpen ? "submenu opened" : "submenu closed");
    bump();
  }, [addLog, bump]);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    setCheckboxChecked(checked);
    addLog(`checkbox ${checked ? "checked" : "unchecked"}`);
    bump();
  }, [addLog, bump]);

  const handleRadioChange = useCallback((value: string) => {
    setRadioValue(value);
    addLog(`radio group 1 changed to ${value}`);
    bump();
  }, [addLog, bump]);

  const handleRadioSecondaryChange = useCallback((value: string) => {
    setRadioValueSecondary(value);
    addLog(`radio group 2 changed to ${value}`);
    bump();
  }, [addLog, bump]);

  const handleActionSelect = useCallback((value: string) => {
    addLog(`selected ${value}`);
    bump();
  }, [addLog, bump]);

  const handleActionClick = useCallback((value: string) => (event: { preventDefault: () => void }) => {
    addLog(`item user onClick ${value}`);
    if (blockItemSelect) {
      event.preventDefault();
      addLog(`blocked ${value}`);
    }
    bump();
  }, [addLog, blockItemSelect, bump]);

  const handlePointer = useCallback((value: string, phase: "enter" | "leave") => {
    if (!logPointer) return;
    addLog(`pointer ${phase} ${value}`);
    bump();
  }, [addLog, bump, logPointer]);

  const markPartRef = useCallback((part: ContextMenuRefPart, element: HTMLElement | null) => {
    if (!element) return;
    setRefs((current) => {
      const next = formatRef(element);
      return current[part] === next ? current : { ...current, [part]: next };
    });
  }, []);

  const clearLog = useCallback(() => setLog([]), []);

  const setControlledOpen = useCallback((value: boolean) => {
    setOpen(value);
    addLog(value ? "opened" : "closed");
    bump();
  }, [addLog, bump]);

  const setControlledSubmenuOpen = useCallback((value: boolean) => {
    setSubOpen(value);
    addLog(value ? "submenu opened by external control" : "submenu closed by external control");
    bump();
  }, [addLog, bump]);

  const handleTriggerContextMenu = useCallback((event: { preventDefault: () => void }) => {
    addLog("trigger user onContextMenu");
    if (blockTriggerEvent) {
      event.preventDefault();
      addLog("trigger blocked");
    }
    bump();
  }, [addLog, blockTriggerEvent, bump]);

  const handleTriggerKeyDown = useCallback((event: { key: string; shiftKey?: boolean; preventDefault: () => void }) => {
    const isContextKey = event.key === "ContextMenu";
    const isShiftF10 = event.key === "F10" && event.shiftKey;
    if (!isContextKey && !isShiftF10) return;
    addLog(`trigger user onKeyDown ${isShiftF10 ? "Shift+F10" : "ContextMenu"}`);
    if (blockTriggerEvent) {
      event.preventDefault();
      addLog("trigger blocked");
    }
    bump();
  }, [addLog, blockTriggerEvent, bump]);

  const handleContentKeyDownCapture = useCallback((event: { key: string; preventDefault: () => void }) => {
    if (!blockContentKeyDown) return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    addLog(`content key blocked ${event.key}`);
    bump();
  }, [addLog, blockContentKeyDown, bump]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevision((current) => current + 1));
    return () => cancelAnimationFrame(frame);
  }, [open, subOpen, checkboxChecked, radioValue, radioValueSecondary]);

  const parts = getContextMenuParts({
    controlled,
    defaultOpen,
    open,
    modal,
    closeOnSelect,
    closeOnEscape,
    loop,
    sideOffset,
    contentLoopOff,
    refs,
  });

  const state: ContextMenuScenarioState = {
    controlled,
    defaultOpen,
    open,
    modal,
    closeOnSelect,
    closeOnEscape,
    loop,
    contentAriaLabel,
    side,
    align,
    dir,
    sideOffset,
    contentLoopOff,
    insideDialog,
    triggerDisabled,
    propCheck,
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
    customSubItemSlot,
    triggerComposition,
    blockTriggerEvent,
    blockContentKeyDown,
    checkboxChecked,
    checkboxDisabled,
    radioValue,
    radioValueSecondary,
    radioItemDisabled,
    showDisabledItem,
    itemComposition,
    blockItemSelect,
    closeCheckboxOnSelect,
    closeRadioOnSelect,
    showSubmenu,
    disableSecondSubmenu,
    controlledSubmenu,
    defaultSubmenuOpen,
    subOpen,
    subContentAriaLabel,
    subSideOffset,
    subContentLoopOff,
    showNestedSubmenu,
    logPointer,
    log,
    refs,
    parts,
  };

  const actions: ContextMenuScenarioActions = {
    setControlled,
    setDefaultOpen,
    setControlledOpen,
    setModal,
    setCloseOnSelect,
    setCloseOnEscape,
    setLoop,
    setContentAriaLabel,
    setSide,
    setAlign,
    setDir,
    setSideOffset,
    setContentLoopOff,
    setInsideDialog,
    setTriggerDisabled,
    setPropCheck,
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
    setCustomSubItemSlot,
    setTriggerComposition,
    setBlockTriggerEvent,
    setBlockContentKeyDown,
    setCheckboxChecked,
    setCheckboxDisabled,
    setRadioValue,
    setRadioValueSecondary,
    setRadioItemDisabled,
    setShowDisabledItem,
    setItemComposition,
    setBlockItemSelect,
    setCloseCheckboxOnSelect,
    setCloseRadioOnSelect,
    setShowSubmenu,
    setDisableSecondSubmenu,
    setControlledSubmenu,
    setDefaultSubmenuOpen,
    setControlledSubmenuOpen,
    setSubContentAriaLabel,
    setSubSideOffset,
    setSubContentLoopOff,
    setShowNestedSubmenu,
    setLogPointer,
    handleOpenChange,
    handleTriggerContextMenu,
    handleTriggerKeyDown,
    handleContentKeyDownCapture,
    handleSubOpenChange,
    handleCheckboxChange,
    handleRadioChange,
    handleRadioSecondaryChange,
    handleActionSelect,
    handleActionClick,
    handlePointer,
    clearLog,
    markPartRef,
  };

  return { state, actions };
}

function getContextMenuParts({
  controlled,
  defaultOpen,
  open,
  modal,
  closeOnSelect,
  closeOnEscape,
  loop,
  sideOffset,
  contentLoopOff,
  refs,
}: {
  controlled: boolean;
  defaultOpen: boolean;
  open: boolean;
  modal: boolean;
  closeOnSelect: boolean;
  closeOnEscape: boolean;
  loop: boolean;
  sideOffset: number;
  contentLoopOff: boolean;
  refs: ContextMenuRefSnapshot;
}): ContextMenuPartsSnapshot {
  const trigger = document.querySelector<HTMLElement>("[data-context-menu-trigger]");
  const content = document.querySelector<HTMLElement>("[data-menu-content]");
  const group = document.querySelector<HTMLElement>("[data-menu-group]");
  const item = document.querySelector<HTMLElement>("[data-menu-item-primary]");
  const disabledItem = document.querySelector<HTMLElement>("[data-menu-item-disabled]");
  const checkbox = document.querySelector<HTMLElement>("[data-menu-checkbox]");
  const radioGroup = document.querySelector<HTMLElement>("[data-menu-radio-group]");
  const radioItem = document.querySelector<HTMLElement>("[data-menu-radio-item][aria-checked='true']");
  const radioItemDisabled = document.querySelector<HTMLElement>("[data-menu-radio-item][data-value='compact']");
  const radioGroupSecondary = document.querySelector<HTMLElement>("[data-menu-radio-group-secondary]");
  const radioItemSecondary = document.querySelector<HTMLElement>("[data-menu-radio-item-secondary][aria-checked='true']");
  const separator = document.querySelector<HTMLElement>("[data-menu-separator]");
  const subTrigger = document.querySelector<HTMLElement>("[data-menu-sub-trigger]");
  const subContent = document.querySelector<HTMLElement>("[data-menu-sub-content]");
  const subItem = document.querySelector<HTMLElement>("[data-menu-sub-item]");
  const subTriggerSecondary = document.querySelector<HTMLElement>("[data-menu-sub-trigger-secondary]");
  const subContentSecondary = document.querySelector<HTMLElement>("[data-menu-sub-content-secondary]");
  const subItemSecondary = document.querySelector<HTMLElement>("[data-menu-sub-item-secondary]");
  const nestedSubTrigger = document.querySelector<HTMLElement>("[data-menu-nested-sub-trigger]");
  const nestedSubContent = document.querySelector<HTMLElement>("[data-menu-nested-sub-content]");
  const nestedSubItem = document.querySelector<HTMLElement>("[data-menu-nested-sub-item]");

  const triggerControls = attr(trigger, "aria-controls");
  const contentId = attr(content, "id");
  const expectedContentId = triggerControls;
  const triggerExpanded = trigger ? attr(trigger, "aria-expanded", String(open)) : "none";

  return {
    rootMode: controlled ? "controlled" : "uncontrolled",
    defaultOpen: defaultOpen ? "yes" : "no",
    open: open ? "yes" : "no",
    modal: modal ? "yes" : "no",
    closeOnSelect: closeOnSelect ? "yes" : "no",
    loop: loop ? "yes" : "no",
    closeOnEscape: closeOnEscape ? "yes" : "no",
    triggerExists: yesNo(trigger),
    triggerRef: trigger ? formatRef(trigger) : "none",
    triggerTag: trigger?.tagName.toLowerCase() ?? "none",
    triggerType: attr(trigger, "type"),
    triggerRole: attr(trigger, "role"),
    triggerTabIndex: trigger ? String(trigger.tabIndex) : "not rendered",
    triggerSlot: attr(trigger, "data-slot"),
    triggerState: attr(trigger, "data-state"),
    triggerDataPropCheck: attr(trigger, "data-prop-check"),
    triggerDisabled: trigger?.hasAttribute("disabled") || trigger?.hasAttribute("data-disabled") ? "yes" : "no",
    triggerAriaDisabled: attr(trigger, "aria-disabled"),
    triggerHasPopup: attr(trigger, "aria-haspopup"),
    triggerExpanded,
    triggerControls,
    triggerControlsMatch: triggerControls !== "none" && triggerControls === (contentId === "none" ? expectedContentId : contentId) ? "yes" : "no",
    contentExists: yesNo(content),
    contentRef: content ? formatRef(content) : "none",
    contentParent: parentName(content),
    contentRole: attr(content, "role"),
    contentOrientation: attr(content, "aria-orientation"),
    contentSlot: attr(content, "data-slot"),
    contentState: attr(content, "data-state"),
    contentSide: attr(content, "data-side"),
    contentAlign: attr(content, "data-align"),
    contentPositioned: content?.hasAttribute("data-positioned") ? "yes" : "no",
    contentLabel: attr(content, "aria-label"),
    contentLabelledBy: attr(content, "aria-labelledby"),
    contentLoop: contentLoopOff ? "off" : "root",
    contentSideOffset: String(sideOffset),
    contentDataPropCheck: attr(content, "data-prop-check"),
    groupExists: yesNo(group),
    groupRef: group ? formatRef(group) : "none",
    groupRole: attr(group, "role"),
    groupSlot: attr(group, "data-slot"),
    groupDataPropCheck: attr(group, "data-prop-check"),
    itemExists: yesNo(item),
    itemRef: item ? formatRef(item) : "none",
    itemRole: attr(item, "role"),
    itemSlot: attr(item, "data-slot"),
    itemValue: attr(item, "data-value"),
    itemHighlighted: item?.hasAttribute("data-highlighted") ? "yes" : "no",
    itemDataPropCheck: attr(item, "data-prop-check"),
    disabledItemExists: yesNo(disabledItem),
    disabledItemRef: disabledItem ? formatRef(disabledItem) : "none",
    disabledItemDisabled: disabledItem?.hasAttribute("data-disabled") ? "yes" : "no",
    checkboxExists: yesNo(checkbox),
    checkboxRef: checkbox ? formatRef(checkbox) : "none",
    checkboxChecked: attr(checkbox, "aria-checked"),
    checkboxDataChecked: checkbox?.hasAttribute("data-checked") ? "yes" : "no",
    checkboxDisabled: checkbox?.hasAttribute("data-disabled") ? "yes" : "no",
    radioGroupExists: yesNo(radioGroup),
    radioGroupRef: radioGroup ? formatRef(radioGroup) : "none",
    radioGroupRole: attr(radioGroup, "role"),
    radioGroupValue: radioGroup ? attr(radioItem, "data-value") : "none",
    radioGroupDataPropCheck: attr(radioGroup, "data-prop-check"),
    radioItemExists: yesNo(radioItem),
    radioItemRef: radioItem ? formatRef(radioItem) : "none",
    radioItemValue: attr(radioItem, "data-value"),
    radioItemChecked: attr(radioItem, "aria-checked"),
    radioItemDataChecked: radioItem?.hasAttribute("data-checked") ? "yes" : "no",
    radioItemDisabledExists: yesNo(radioItemDisabled),
    radioItemDisabledSkipped: radioItemDisabled?.hasAttribute("data-disabled") ? "yes" : "no",
    radioGroupSecondaryExists: yesNo(radioGroupSecondary),
    radioGroupSecondaryRef: radioGroupSecondary ? formatRef(radioGroupSecondary) : "none",
    radioGroupSecondaryRole: attr(radioGroupSecondary, "role"),
    radioGroupSecondaryValue: radioGroupSecondary ? attr(radioItemSecondary, "data-value") : "none",
    radioItemSecondaryExists: yesNo(radioItemSecondary),
    radioItemSecondaryRef: radioItemSecondary ? formatRef(radioItemSecondary) : "none",
    radioItemSecondaryValue: attr(radioItemSecondary, "data-value"),
    radioItemSecondaryChecked: attr(radioItemSecondary, "aria-checked"),
    radioItemSecondaryDataChecked: radioItemSecondary?.hasAttribute("data-checked") ? "yes" : "no",
    separatorExists: yesNo(separator),
    separatorRef: separator ? formatRef(separator) : "none",
    separatorRole: attr(separator, "role"),
    separatorOrientation: attr(separator, "aria-orientation"),
    subTriggerExists: yesNo(subTrigger),
    subTriggerRef: subTrigger ? formatRef(subTrigger) : "none",
    subTriggerExpanded: attr(subTrigger, "aria-expanded"),
    subTriggerState: attr(subTrigger, "data-state"),
    subContentExists: yesNo(subContent),
    subContentRef: subContent ? formatRef(subContent) : "none",
    subContentParent: parentName(subContent),
    subContentRole: attr(subContent, "role"),
    subContentLabel: attr(subContent, "aria-label"),
    subContentLabelledBy: attr(subContent, "aria-labelledby"),
    subContentState: attr(subContent, "data-state"),
    subContentSide: attr(subContent, "data-side"),
    subContentPositioned: subContent?.hasAttribute("data-positioned") ? "yes" : "no",
    subItemExists: yesNo(subItem),
    subItemRef: subItem ? formatRef(subItem) : "none",
    subTriggerSecondaryExists: yesNo(subTriggerSecondary),
    subTriggerSecondaryRef: subTriggerSecondary ? formatRef(subTriggerSecondary) : "none",
    subTriggerSecondaryExpanded: attr(subTriggerSecondary, "aria-expanded"),
    subTriggerSecondaryState: attr(subTriggerSecondary, "data-state"),
    subTriggerSecondaryDisabled: subTriggerSecondary?.hasAttribute("data-disabled") ? "yes" : "no",
    subContentSecondaryExists: yesNo(subContentSecondary),
    subContentSecondaryRef: subContentSecondary ? formatRef(subContentSecondary) : "none",
    subContentSecondaryParent: parentName(subContentSecondary),
    subContentSecondaryRole: attr(subContentSecondary, "role"),
    subContentSecondaryState: attr(subContentSecondary, "data-state"),
    subItemSecondaryExists: yesNo(subItemSecondary),
    subItemSecondaryRef: subItemSecondary ? formatRef(subItemSecondary) : "none",
    nestedSubTriggerExists: yesNo(nestedSubTrigger),
    nestedSubTriggerRef: nestedSubTrigger ? formatRef(nestedSubTrigger) : "none",
    nestedSubTriggerExpanded: attr(nestedSubTrigger, "aria-expanded"),
    nestedSubTriggerState: attr(nestedSubTrigger, "data-state"),
    nestedSubContentExists: yesNo(nestedSubContent),
    nestedSubContentRef: nestedSubContent ? formatRef(nestedSubContent) : "none",
    nestedSubContentParent: parentName(nestedSubContent),
    nestedSubContentRole: attr(nestedSubContent, "role"),
    nestedSubContentState: attr(nestedSubContent, "data-state"),
    nestedSubItemExists: yesNo(nestedSubItem),
    nestedSubItemRef: nestedSubItem ? formatRef(nestedSubItem) : "none",
  };
}

function formatRef(element: HTMLElement) {
  return element.id || element.getAttribute("data-value") || element.getAttribute("data-slot") || element.tagName.toLowerCase();
}

function attr(element: HTMLElement | null, name: string, fallback = "none") {
  return element?.getAttribute(name) ?? fallback;
}

function yesNo(element: HTMLElement | null) {
  return element ? "yes" : "no";
}

function parentName(element: HTMLElement | null) {
  if (!element?.parentElement) return "none";
  return element.parentElement === document.body ? "body" : element.parentElement.tagName.toLowerCase();
}

const emptyContextMenuRefs: ContextMenuRefSnapshot = {
  content: "none",
  group: "none",
  item: "none",
  disabledItem: "none",
  checkboxItem: "none",
  radioGroup: "none",
  radioItem: "none",
  radioGroupSecondary: "none",
  radioItemSecondary: "none",
  separator: "none",
  subTrigger: "none",
  subContent: "none",
  subItem: "none",
  subTriggerSecondary: "none",
  subContentSecondary: "none",
  subItemSecondary: "none",
  nestedSubTrigger: "none",
  nestedSubContent: "none",
  nestedSubItem: "none",
};
