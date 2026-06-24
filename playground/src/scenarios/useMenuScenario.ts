import { useCallback, useEffect, useRef, useState } from "react";

export type MenuLogEntry = {
  id: number;
  text: string;
  time: string;
};

export type MenuSide = "top" | "right" | "bottom" | "left";
export type MenuAlign = "start" | "center" | "end";
export type MenuItemCompositionMode = "default" | "asChild" | "render";
export type MenuAnchorPoint = {
  x: number;
  y: number;
  localX: number;
  localY: number;
};

export type MenuRefPart =
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

export type MenuRefSnapshot = Record<MenuRefPart, string>;

export type MenuPartsSnapshot = {
  rootMode: string;
  defaultOpen: string;
  open: string;
  modal: string;
  closeOnSelect: string;
  loop: string;
  closeOnEscape: string;
  contentExists: string;
  contentRef: string;
  contentParent: string;
  contentRole: string;
  contentOrientation: string;
  contentTabIndex: string;
  contentSlot: string;
  contentState: string;
  contentSide: string;
  contentAlign: string;
  contentPositioned: string;
  contentLabel: string;
  contentLabelledBy: string;
  contentLoop: string;
  contentSideOffset: string;
  groupExists: string;
  groupRef: string;
  groupRole: string;
  groupSlot: string;
  itemExists: string;
  itemRef: string;
  itemRole: string;
  itemSlot: string;
  itemValue: string;
  itemHighlighted: string;
  disabledItemExists: string;
  disabledItemRef: string;
  disabledItemDisabled: string;
  checkboxExists: string;
  checkboxRef: string;
  checkboxChecked: string;
  checkboxDataChecked: string;
  radioGroupExists: string;
  radioGroupRef: string;
  radioGroupRole: string;
  radioGroupValue: string;
  radioItemExists: string;
  radioItemRef: string;
  radioItemValue: string;
  radioItemChecked: string;
  radioItemDataChecked: string;
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
  nestedSubContentRole: string;
  nestedSubContentState: string;
  nestedSubItemExists: string;
  nestedSubItemRef: string;
};

export type MenuScenarioState = {
  controlled: boolean;
  defaultOpen: boolean;
  open: boolean;
  modal: boolean;
  closeOnSelect: boolean;
  closeOnEscape: boolean;
  loop: boolean;
  contentAriaLabel: boolean;
  side: MenuSide;
  align: MenuAlign;
  sideOffset: number;
  contentLoopOff: boolean;
  insideDialog: boolean;
  useAnchorPoint: boolean;
  anchorPoint: MenuAnchorPoint | null;
  checkboxChecked: boolean;
  radioValue: string;
  radioValueSecondary: string;
  showDisabledItem: boolean;
  itemComposition: MenuItemCompositionMode;
  blockItemSelect: boolean;
  closeCheckboxOnSelect: boolean;
  closeRadioOnSelect: boolean;
  showSubmenu: boolean;
  disableSecondSubmenu: boolean;
  controlledSubmenu: boolean;
  subOpen: boolean;
  subContentAriaLabel: boolean;
  subSideOffset: number;
  showNestedSubmenu: boolean;
  logPointer: boolean;
  log: MenuLogEntry[];
  refs: MenuRefSnapshot;
  parts: MenuPartsSnapshot;
};

export type MenuScenarioActions = {
  setControlled: (value: boolean) => void;
  setDefaultOpen: (value: boolean) => void;
  setControlledOpen: (value: boolean) => void;
  setModal: (value: boolean) => void;
  setCloseOnSelect: (value: boolean) => void;
  setCloseOnEscape: (value: boolean) => void;
  setLoop: (value: boolean) => void;
  setContentAriaLabel: (value: boolean) => void;
  setSide: (value: MenuSide) => void;
  setAlign: (value: MenuAlign) => void;
  setUseAnchorPoint: (value: boolean) => void;
  setAnchorPoint: (value: MenuAnchorPoint) => void;
  setSideOffset: (value: number) => void;
  setContentLoopOff: (value: boolean) => void;
  setInsideDialog: (value: boolean) => void;
  setCheckboxChecked: (value: boolean) => void;
  setRadioValue: (value: string) => void;
  setRadioValueSecondary: (value: string) => void;
  setShowDisabledItem: (value: boolean) => void;
  setItemComposition: (value: MenuItemCompositionMode) => void;
  setBlockItemSelect: (value: boolean) => void;
  setCloseCheckboxOnSelect: (value: boolean) => void;
  setCloseRadioOnSelect: (value: boolean) => void;
  setShowSubmenu: (value: boolean) => void;
  setDisableSecondSubmenu: (value: boolean) => void;
  setControlledSubmenu: (value: boolean) => void;
  setControlledSubmenuOpen: (value: boolean) => void;
  setSubContentAriaLabel: (value: boolean) => void;
  setSubSideOffset: (value: number) => void;
  setShowNestedSubmenu: (value: boolean) => void;
  setLogPointer: (value: boolean) => void;
  handleOpenChange: (open: boolean) => void;
  handleSubOpenChange: (open: boolean) => void;
  handleCheckboxChange: (checked: boolean) => void;
  handleRadioChange: (value: string) => void;
  handleRadioSecondaryChange: (value: string) => void;
  handleActionSelect: (value: string) => void;
  handleActionClick: (value: string) => (event: { preventDefault: () => void }) => void;
  handlePointer: (value: string, phase: "enter" | "leave") => void;
  clearLog: () => void;
  markPartRef: (part: MenuRefPart, element: HTMLElement | null) => void;
};

export function useMenuScenario() {
  const [revision, setRevision] = useState(0);
  const [controlled, setControlled] = useState(true);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(true);
  const [closeOnSelect, setCloseOnSelect] = useState(true);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [loop, setLoop] = useState(true);
  const [contentAriaLabel, setContentAriaLabel] = useState(false);
  const [side, setSide] = useState<MenuSide>("bottom");
  const [align, setAlign] = useState<MenuAlign>("start");
  const [sideOffset, setSideOffset] = useState(4);
  const [contentLoopOff, setContentLoopOff] = useState(false);
  const [insideDialog, setInsideDialog] = useState(false);
  const [useAnchorPoint, setUseAnchorPoint] = useState(true);
  const [anchorPoint, setAnchorPointState] = useState<MenuAnchorPoint | null>(null);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioValue, setRadioValue] = useState("comfortable");
  const [radioValueSecondary, setRadioValueSecondary] = useState("compact");
  const [showDisabledItem, setShowDisabledItem] = useState(false);
  const [itemComposition, setItemComposition] = useState<MenuItemCompositionMode>("default");
  const [blockItemSelect, setBlockItemSelect] = useState(false);
  const [closeCheckboxOnSelect, setCloseCheckboxOnSelect] = useState(false);
  const [closeRadioOnSelect, setCloseRadioOnSelect] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(true);
  const [disableSecondSubmenu, setDisableSecondSubmenu] = useState(false);
  const [controlledSubmenu, setControlledSubmenu] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [subContentAriaLabel, setSubContentAriaLabel] = useState(false);
  const [subSideOffset, setSubSideOffset] = useState(4);
  const [showNestedSubmenu, setShowNestedSubmenu] = useState(false);
  const [logPointer, setLogPointer] = useState(false);
  const [log, setLog] = useState<MenuLogEntry[]>([]);
  const [refs, setRefs] = useState<MenuRefSnapshot>(emptyMenuRefs);
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

  const markPartRef = useCallback((part: MenuRefPart, element: HTMLElement | null) => {
    if (!element) return;
    setRefs((current) => {
      const next = formatRef(element);
      return current[part] === next ? current : { ...current, [part]: next };
    });
  }, []);

  const setAnchorPoint = useCallback((value: MenuAnchorPoint) => {
    setAnchorPointState(value);
    setOpen(true);
    addLog("anchor point set");
    bump();
  }, [addLog, bump]);

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

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevision((current) => current + 1));
    return () => cancelAnimationFrame(frame);
  }, [open, subOpen, checkboxChecked, radioValue, radioValueSecondary]);

  const parts = getMenuParts({
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

  const state: MenuScenarioState = {
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
    sideOffset,
    contentLoopOff,
    insideDialog,
    useAnchorPoint,
    anchorPoint,
    checkboxChecked,
    radioValue,
    radioValueSecondary,
    showDisabledItem,
    itemComposition,
    blockItemSelect,
    closeCheckboxOnSelect,
    closeRadioOnSelect,
    showSubmenu,
    disableSecondSubmenu,
    controlledSubmenu,
    subOpen,
    subContentAriaLabel,
    subSideOffset,
    showNestedSubmenu,
    logPointer,
    log,
    refs,
    parts,
  };

  const actions: MenuScenarioActions = {
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
    setUseAnchorPoint,
    setAnchorPoint,
    setSideOffset,
    setContentLoopOff,
    setInsideDialog,
    setCheckboxChecked,
    setRadioValue,
    setRadioValueSecondary,
    setShowDisabledItem,
    setItemComposition,
    setBlockItemSelect,
    setCloseCheckboxOnSelect,
    setCloseRadioOnSelect,
    setShowSubmenu,
    setDisableSecondSubmenu,
    setControlledSubmenu,
    setControlledSubmenuOpen,
    setSubContentAriaLabel,
    setSubSideOffset,
    setShowNestedSubmenu,
    setLogPointer,
    handleOpenChange,
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

function getMenuParts({
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
  refs: MenuRefSnapshot;
}): MenuPartsSnapshot {
  const content = document.querySelector<HTMLElement>("[data-menu-content]");
  const group = document.querySelector<HTMLElement>("[data-menu-group]");
  const item = document.querySelector<HTMLElement>("[data-menu-item-primary]");
  const disabledItem = document.querySelector<HTMLElement>("[data-menu-item-disabled]");
  const checkbox = document.querySelector<HTMLElement>("[data-menu-checkbox]");
  const radioGroup = document.querySelector<HTMLElement>("[data-menu-radio-group]");
  const radioItem = document.querySelector<HTMLElement>("[data-menu-radio-item][aria-checked='true']");
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

  return {
    rootMode: controlled ? "controlled" : "uncontrolled",
    defaultOpen: defaultOpen ? "yes" : "no",
    open: open ? "yes" : "no",
    modal: modal ? "yes" : "no",
    closeOnSelect: closeOnSelect ? "yes" : "no",
    loop: loop ? "yes" : "no",
    closeOnEscape: closeOnEscape ? "yes" : "no",
    contentExists: yesNo(content),
    contentRef: content ? formatRef(content) : "none",
    contentParent: parentName(content),
    contentRole: attr(content, "role"),
    contentOrientation: attr(content, "aria-orientation"),
    contentTabIndex: attr(content, "tabindex"),
    contentSlot: attr(content, "data-slot"),
    contentState: attr(content, "data-state"),
    contentSide: attr(content, "data-side"),
    contentAlign: attr(content, "data-align"),
    contentPositioned: content?.hasAttribute("data-positioned") ? "yes" : "no",
    contentLabel: attr(content, "aria-label"),
    contentLabelledBy: attr(content, "aria-labelledby"),
    contentLoop: contentLoopOff ? "off" : "root",
    contentSideOffset: String(sideOffset),
    groupExists: yesNo(group),
    groupRef: group ? formatRef(group) : "none",
    groupRole: attr(group, "role"),
    groupSlot: attr(group, "data-slot"),
    itemExists: yesNo(item),
    itemRef: item ? formatRef(item) : "none",
    itemRole: attr(item, "role"),
    itemSlot: attr(item, "data-slot"),
    itemValue: attr(item, "data-value"),
    itemHighlighted: item?.hasAttribute("data-highlighted") ? "yes" : "no",
    disabledItemExists: yesNo(disabledItem),
    disabledItemRef: disabledItem ? formatRef(disabledItem) : "none",
    disabledItemDisabled: disabledItem?.hasAttribute("data-disabled") ? "yes" : "no",
    checkboxExists: yesNo(checkbox),
    checkboxRef: checkbox ? formatRef(checkbox) : "none",
    checkboxChecked: attr(checkbox, "aria-checked"),
    checkboxDataChecked: checkbox?.hasAttribute("data-checked") ? "yes" : "no",
    radioGroupExists: yesNo(radioGroup),
    radioGroupRef: radioGroup ? formatRef(radioGroup) : "none",
    radioGroupRole: attr(radioGroup, "role"),
    radioGroupValue: radioGroup ? attr(radioItem, "data-value") : "none",
    radioItemExists: yesNo(radioItem),
    radioItemRef: radioItem ? formatRef(radioItem) : "none",
    radioItemValue: attr(radioItem, "data-value"),
    radioItemChecked: attr(radioItem, "aria-checked"),
    radioItemDataChecked: radioItem?.hasAttribute("data-checked") ? "yes" : "no",
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
    nestedSubContentRole: attr(nestedSubContent, "role"),
    nestedSubContentState: attr(nestedSubContent, "data-state"),
    nestedSubItemExists: yesNo(nestedSubItem),
    nestedSubItemRef: nestedSubItem ? formatRef(nestedSubItem) : "none",
  };
}

function formatRef(element: HTMLElement) {
  return element.id || element.getAttribute("data-value") || element.getAttribute("data-slot") || element.tagName.toLowerCase();
}

function attr(element: HTMLElement | null, name: string) {
  return element?.getAttribute(name) ?? "none";
}

function yesNo(element: HTMLElement | null) {
  return element ? "yes" : "no";
}

function parentName(element: HTMLElement | null) {
  if (!element?.parentElement) return "none";
  return element.parentElement === document.body ? "body" : element.parentElement.tagName.toLowerCase();
}

const emptyMenuRefs: MenuRefSnapshot = {
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
