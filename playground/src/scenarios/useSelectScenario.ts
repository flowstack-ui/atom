import { useCallback, useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";

export type SelectLogEntry = {
  id: number;
  text: string;
  time: string;
};

export type SelectCompositionMode = "default" | "asChild" | "render";
export type SelectRefPart =
  | "trigger"
  | "value"
  | "icon"
  | "arrow"
  | "listbox"
  | "viewport"
  | "group"
  | "label"
  | "selectedItem"
  | "rawItem"
  | "itemText"
  | "itemIndicator"
  | "disabledItem"
  | "separator"
  | "scrollUpButton"
  | "scrollDownButton";
export type SelectRefSnapshot = Record<SelectRefPart, string>;

export type SelectScenarioState = {
  valueControlled: boolean;
  openControlled: boolean;
  controlValue: string;
  value: string;
  open: boolean;
  disabled: boolean;
  required: boolean;
  fieldDisabled: boolean;
  fieldRequired: boolean;
  fieldWrapped: boolean;
  triggerAriaLabel: boolean;
  useTriggerIdProp: boolean;
  useAriaLabel: boolean;
  disablePortal: boolean;
  usePortalWrapper: boolean;
  useCustomContainer: boolean;
  longList: boolean;
  edgePosition: boolean;
  noValue: boolean;
  customValueChildren: boolean;
  rawItemText: boolean;
  forceMountIndicator: boolean;
  showScrollButtons: boolean;
  showArrow: boolean;
  useListboxAlias: boolean;
  propCheck: boolean;
  customTriggerSlot: boolean;
  customValueSlot: boolean;
  customIconSlot: boolean;
  customContentSlot: boolean;
  customViewportSlot: boolean;
  customGroupSlot: boolean;
  customLabelSlot: boolean;
  customItemSlot: boolean;
  customItemTextSlot: boolean;
  customIndicatorSlot: boolean;
  customSeparatorSlot: boolean;
  customArrowSlot: boolean;
  customScrollUpSlot: boolean;
  customScrollDownSlot: boolean;
  logItemPointer: boolean;
  insideDialog: boolean;
  triggerComposition: SelectCompositionMode;
  blockTriggerEvent: boolean;
  log: SelectLogEntry[];
  refs: SelectRefSnapshot;
  parts: SelectPartsSnapshot;
};

export type SelectPartsSnapshot = {
  rootMode: string;
  rootValueMode: string;
  rootOpenMode: string;
  value: string;
  valueLabel: string;
  open: string;
  disabled: string;
  required: string;
  fieldWrapped: string;
  fieldDisabled: string;
  fieldRequired: string;
  triggerExists: string;
  triggerRef: string;
  triggerProps: string;
  triggerId: string;
  triggerClass: string;
  triggerSlot: string;
  triggerComposition: string;
  triggerTag: string;
  triggerType: string;
  triggerRole: string;
  triggerState: string;
  triggerControls: string;
  triggerControlsMatch: string;
  triggerHasPopup: string;
  triggerExpanded: string;
  triggerActiveDescendant: string;
  triggerActiveDescendantMatch: string;
  triggerLabel: string;
  triggerLabelledBy: string;
  triggerDescribedBy: string;
  triggerRequired: string;
  triggerDataDisabled: string;
  triggerDisabled: string;
  valueExists: string;
  valueRef: string;
  valueProps: string;
  valueSlot: string;
  valueText: string;
  valuePlaceholder: string;
  iconExists: string;
  iconRef: string;
  iconProps: string;
  iconSlot: string;
  iconHidden: string;
  arrowExists: string;
  arrowRef: string;
  arrowProps: string;
  arrowSlot: string;
  arrowHidden: string;
  listboxExists: string;
  listboxRef: string;
  listboxAlias: string;
  listboxProps: string;
  listboxClass: string;
  listboxSlot: string;
  listboxParent: string;
  listboxInCanvas: string;
  listboxInCustomContainer: string;
  listboxId: string;
  listboxRole: string;
  listboxState: string;
  listboxPositioned: string;
  listboxLabel: string;
  listboxMinWidthMatch: string;
  viewportExists: string;
  viewportRef: string;
  viewportProps: string;
  viewportSlot: string;
  viewportScrollTop: string;
  groupExists: string;
  groupRef: string;
  groupProps: string;
  groupSlot: string;
  groupRole: string;
  groupLabelledBy: string;
  groupLabelMatch: string;
  labelExists: string;
  labelRef: string;
  labelProps: string;
  labelSlot: string;
  labelId: string;
  selectedItemExists: string;
  selectedItemRef: string;
  selectedItemProps: string;
  selectedItemClass: string;
  selectedItemSlot: string;
  selectedItemValue: string;
  selectedItemState: string;
  selectedItemSelected: string;
  selectedItemHighlighted: string;
  selectedItemLabelledBy: string;
  highlightedItemExists: string;
  highlightedItemValue: string;
  highlightedItemState: string;
  highlightedItemSelected: string;
  rawItemExists: string;
  rawItemRef: string;
  rawItemValue: string;
  rawItemLabelledBy: string;
  itemTextExists: string;
  itemTextRef: string;
  itemTextProps: string;
  itemTextSlot: string;
  itemIndicatorExists: string;
  itemIndicatorRef: string;
  itemIndicatorProps: string;
  itemIndicatorSlot: string;
  itemIndicatorState: string;
  itemIndicatorHidden: string;
  uncheckedIndicatorExists: string;
  disabledItemExists: string;
  disabledItemRef: string;
  disabledItemDisabled: string;
  disabledItemState: string;
  separatorExists: string;
  separatorRef: string;
  separatorProps: string;
  separatorSlot: string;
  separatorRole: string;
  separatorOrientation: string;
  scrollUpExists: string;
  scrollUpRef: string;
  scrollUpProps: string;
  scrollUpSlot: string;
  scrollUpHidden: string;
  scrollDownExists: string;
  scrollDownRef: string;
  scrollDownProps: string;
  scrollDownSlot: string;
  scrollDownHidden: string;
  hiddenInputExists: string;
  hiddenInputName: string;
  hiddenInputValue: string;
  hiddenInputForm: string;
  hiddenInputDisabled: string;
};

export type SelectScenarioActions = {
  setValueControlled: (value: boolean) => void;
  setOpenControlled: (value: boolean) => void;
  setValue: (value: string) => void;
  setControlledOpen: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
  setRequired: (value: boolean) => void;
  setFieldDisabled: (value: boolean) => void;
  setFieldRequired: (value: boolean) => void;
  setFieldWrapped: (value: boolean) => void;
  setTriggerAriaLabel: (value: boolean) => void;
  setUseTriggerIdProp: (value: boolean) => void;
  setUseAriaLabel: (value: boolean) => void;
  setDisablePortal: (value: boolean) => void;
  setUsePortalWrapper: (value: boolean) => void;
  setUseCustomContainer: (value: boolean) => void;
  setLongList: (value: boolean) => void;
  setEdgePosition: (value: boolean) => void;
  setNoValue: (value: boolean) => void;
  setCustomValueChildren: (value: boolean) => void;
  setRawItemText: (value: boolean) => void;
  setForceMountIndicator: (value: boolean) => void;
  setShowScrollButtons: (value: boolean) => void;
  setShowArrow: (value: boolean) => void;
  setUseListboxAlias: (value: boolean) => void;
  setPropCheck: (value: boolean) => void;
  setCustomTriggerSlot: (value: boolean) => void;
  setCustomValueSlot: (value: boolean) => void;
  setCustomIconSlot: (value: boolean) => void;
  setCustomContentSlot: (value: boolean) => void;
  setCustomViewportSlot: (value: boolean) => void;
  setCustomGroupSlot: (value: boolean) => void;
  setCustomLabelSlot: (value: boolean) => void;
  setCustomItemSlot: (value: boolean) => void;
  setCustomItemTextSlot: (value: boolean) => void;
  setCustomIndicatorSlot: (value: boolean) => void;
  setCustomSeparatorSlot: (value: boolean) => void;
  setCustomArrowSlot: (value: boolean) => void;
  setCustomScrollUpSlot: (value: boolean) => void;
  setCustomScrollDownSlot: (value: boolean) => void;
  setLogItemPointer: (value: boolean) => void;
  setInsideDialog: (value: boolean) => void;
  setTriggerComposition: (value: SelectCompositionMode) => void;
  setBlockTriggerEvent: (value: boolean) => void;
  handleOpenChange: (open: boolean) => void;
  handleValueChange: (value: string) => void;
  handleTriggerClick: (event: ReactMouseEvent<HTMLElement>) => void;
  handleTriggerKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  handleItemClick: (label: string) => (event: ReactMouseEvent<HTMLElement>) => void;
  handleItemPointerMove: (label: string) => () => void;
  handleItemPointerLeave: (label: string) => () => void;
  markPartRef: (part: SelectRefPart, element: HTMLElement | null) => void;
  addUserLog: (message: string) => void;
  clearLog: () => void;
};

export function useSelectScenario() {
  const nextLogId = useRef(1);
  const lastLoggedHighlight = useRef<string | null>(null);
  const lastLoggedPointerItem = useRef<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [valueControlled, setValueControlled] = useState(false);
  const [controlValue, setControlValue] = useState("pro");
  const [openControlled, setOpenControlled] = useState(false);
  const [value, setValue] = useState("pro");
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [required, setRequired] = useState(false);
  const [fieldDisabled, setFieldDisabled] = useState(false);
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldWrapped, setFieldWrapped] = useState(true);
  const [triggerAriaLabel, setTriggerAriaLabel] = useState(false);
  const [useTriggerIdProp, setUseTriggerIdProp] = useState(true);
  const [useAriaLabel, setUseAriaLabel] = useState(false);
  const [disablePortal, setDisablePortal] = useState(false);
  const [usePortalWrapper, setUsePortalWrapper] = useState(false);
  const [useCustomContainer, setUseCustomContainer] = useState(false);
  const [longList, setLongList] = useState(false);
  const [edgePosition, setEdgePosition] = useState(false);
  const [noValue, setNoValueState] = useState(false);
  const [customValueChildren, setCustomValueChildren] = useState(false);
  const [rawItemText, setRawItemText] = useState(false);
  const [forceMountIndicator, setForceMountIndicator] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [useListboxAlias, setUseListboxAlias] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customValueSlot, setCustomValueSlot] = useState(false);
  const [customIconSlot, setCustomIconSlot] = useState(false);
  const [customContentSlot, setCustomContentSlot] = useState(false);
  const [customViewportSlot, setCustomViewportSlot] = useState(false);
  const [customGroupSlot, setCustomGroupSlot] = useState(false);
  const [customLabelSlot, setCustomLabelSlot] = useState(false);
  const [customItemSlot, setCustomItemSlot] = useState(false);
  const [customItemTextSlot, setCustomItemTextSlot] = useState(false);
  const [customIndicatorSlot, setCustomIndicatorSlot] = useState(false);
  const [customSeparatorSlot, setCustomSeparatorSlot] = useState(false);
  const [customArrowSlot, setCustomArrowSlot] = useState(false);
  const [customScrollUpSlot, setCustomScrollUpSlot] = useState(false);
  const [customScrollDownSlot, setCustomScrollDownSlot] = useState(false);
  const [logItemPointer, setLogItemPointer] = useState(false);
  const [insideDialog, setInsideDialog] = useState(false);
  const [triggerComposition, setTriggerComposition] =
    useState<SelectCompositionMode>("default");
  const [blockTriggerEvent, setBlockTriggerEvent] = useState(false);
  const [log, setLog] = useState<SelectLogEntry[]>([]);
  const [refs, setRefs] = useState<SelectRefSnapshot>(emptySelectRefSnapshot);
  const parts = getSelectPartsSnapshot(revision, {
    fieldWrapped,
    fieldDisabled,
    fieldRequired,
    openControlled,
    required,
    valueControlled,
    useListboxAlias,
  });

  const addLog = useCallback((text: string) => {
    setLog((currentLog) => [
      { id: nextLogId.current++, text, time: getLogTime() },
      ...currentLog,
    ].slice(0, 8));
  }, []);

  const setControlledOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    addLog(`${nextOpen ? "opened" : "closed"} by external control`);
  };

  const setExternalValue = (nextValue: string) => {
    setControlValue(nextValue);
    if (!valueControlled) {
      addLog(`external value ignored while uncontrolled: ${nextValue}`);
      return;
    }

    setValue(nextValue);
    addLog(`value set externally to ${nextValue} (${getSelectLabel(nextValue)})`);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    addLog(nextOpen ? "opened from trigger" : "closed");
  };

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
    setControlValue(nextValue);
    addLog(`value changed to ${nextValue} (${getSelectLabel(nextValue)})`);
  };

  const handleTriggerClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (blockTriggerEvent) {
      event.preventDefault();
      addLog("trigger user onClick blocked toggle");
      return;
    }

    addLog("trigger user onClick");
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const trackedKeys = ["ArrowDown", "ArrowUp", "Enter", " ", "Home", "End", "Escape", "Tab"];
    if (!trackedKeys.includes(event.key) && event.key.length !== 1) return;

    const key = event.key === " " ? "Space" : event.key;
    if (blockTriggerEvent) {
      event.preventDefault();
      addLog(`trigger user onKeyDown blocked ${key}`);
      return;
    }

    addLog(`trigger user onKeyDown ${key}`);
  };

  const handleItemClick = (label: string) => () => {
    addLog(`item clicked ${label} (${getSelectLabel(label)})`);
  };
  const handleItemPointerMove = (label: string) => () => {
    if (!logItemPointer) return;
    if (lastLoggedPointerItem.current === label) return;
    lastLoggedPointerItem.current = label;
    addLog(`item pointer move ${label} (${getSelectLabel(label)})`);
  };
  const handleItemPointerLeave = (label: string) => () => {
    if (!logItemPointer) return;
    if (lastLoggedPointerItem.current !== label) return;
    lastLoggedPointerItem.current = null;
    addLog(`item pointer leave ${label} (${getSelectLabel(label)})`);
  };

  const markPartRef = useCallback((part: SelectRefPart, element: HTMLElement | null) => {
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

  useEffect(() => {
    let frame = 0;
    const updateRevision = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setRevision((currentRevision) => currentRevision + 1);
      });
    };
    const observer = new MutationObserver(updateRevision);

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: [
        "aria-activedescendant",
        "aria-controls",
        "aria-describedby",
        "aria-disabled",
        "aria-expanded",
        "aria-haspopup",
        "aria-hidden",
        "aria-label",
        "aria-labelledby",
        "aria-required",
        "aria-selected",
        "data-disabled",
        "data-highlighted",
        "data-placeholder",
        "data-positioned",
        "data-state",
        "data-slot",
        "data-value",
        "disabled",
        "form",
        "id",
        "name",
        "role",
        "tabindex",
        "type",
        "value",
      ],
    });

    updateRevision();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const highlightedValue = parts.highlightedItemValue === "none"
      ? null
      : parts.highlightedItemValue;
    if (!highlightedValue || highlightedValue === lastLoggedHighlight.current) return;

    lastLoggedHighlight.current = highlightedValue;
    addLog(`item highlighted ${highlightedValue} (${getSelectLabel(highlightedValue)})`);
  }, [addLog, parts.highlightedItemValue]);

  const state: SelectScenarioState = {
    valueControlled,
    openControlled,
    controlValue,
    value,
    open,
    disabled,
    required,
    fieldDisabled,
    fieldRequired,
    fieldWrapped,
    triggerAriaLabel,
    useTriggerIdProp,
    useAriaLabel,
    disablePortal,
    usePortalWrapper,
    useCustomContainer,
    longList,
    edgePosition,
    noValue,
    customValueChildren,
    rawItemText,
    forceMountIndicator,
    showScrollButtons,
    showArrow,
    useListboxAlias,
    propCheck,
    customTriggerSlot,
    customValueSlot,
    customIconSlot,
    customContentSlot,
    customViewportSlot,
    customGroupSlot,
    customLabelSlot,
    customItemSlot,
    customItemTextSlot,
    customIndicatorSlot,
    customSeparatorSlot,
    customArrowSlot,
    customScrollUpSlot,
    customScrollDownSlot,
    logItemPointer,
    insideDialog,
    triggerComposition,
    blockTriggerEvent,
    log,
    refs,
    parts,
  };

  const actions: SelectScenarioActions = {
    setValueControlled: (nextValueControlled) => {
      setValueControlled(nextValueControlled);
      if (nextValueControlled) {
        setValue(controlValue);
        addLog(`value control enabled at ${controlValue} (${getSelectLabel(controlValue)})`);
      } else {
        addLog("value control disabled");
      }
    },
    setOpenControlled,
    setValue: setExternalValue,
    setControlledOpen,
    setDisabled,
    setRequired,
    setFieldDisabled,
    setFieldRequired,
    setFieldWrapped,
    setTriggerAriaLabel,
    setUseTriggerIdProp,
    setUseAriaLabel,
    setDisablePortal,
    setUsePortalWrapper,
    setUseCustomContainer,
    setLongList,
    setEdgePosition,
    setNoValue: (nextNoValue) => {
      setNoValueState(nextNoValue);
      if (nextNoValue) {
        setValueControlled(false);
        setControlValue("pro");
        setValue("pro");
        addLog("value cleared to test placeholder");
      } else {
        setValue("pro");
        setControlValue("pro");
        addLog("value restored to pro");
      }
    },
    setCustomValueChildren,
    setRawItemText,
    setForceMountIndicator,
    setShowScrollButtons,
    setShowArrow,
    setUseListboxAlias,
    setPropCheck,
    setCustomTriggerSlot,
    setCustomValueSlot,
    setCustomIconSlot,
    setCustomContentSlot,
    setCustomViewportSlot,
    setCustomGroupSlot,
    setCustomLabelSlot,
    setCustomItemSlot,
    setCustomItemTextSlot,
    setCustomIndicatorSlot,
    setCustomSeparatorSlot,
    setCustomArrowSlot,
    setCustomScrollUpSlot,
    setCustomScrollDownSlot,
    setLogItemPointer,
    setInsideDialog,
    setTriggerComposition,
    setBlockTriggerEvent,
    handleOpenChange,
    handleValueChange,
    handleTriggerClick,
    handleTriggerKeyDown,
    handleItemClick,
    handleItemPointerMove,
    handleItemPointerLeave,
    markPartRef,
    addUserLog: addLog,
    clearLog: () => setLog([]),
  };

  return { state, actions };
}

function getSelectPartsSnapshot(
  revision: number,
  state: {
    fieldWrapped: boolean;
    fieldDisabled: boolean;
    fieldRequired: boolean;
    openControlled: boolean;
    required: boolean;
    valueControlled: boolean;
    useListboxAlias: boolean;
  },
): SelectPartsSnapshot {
  void revision;

  if (typeof document === "undefined") {
    return emptySelectPartsSnapshot;
  }

  const trigger = document.querySelector("[data-playground-select-trigger]");
  const value = document.querySelector("[data-playground-select-value]");
  const icon = document.querySelector("[data-playground-select-icon]");
  const arrow = document.querySelector("[data-playground-select-arrow]");
  const listbox = document.querySelector("[data-playground-select-listbox]");
  const viewport = document.querySelector("[data-playground-select-viewport]");
  const group = document.querySelector("[data-playground-select-group]");
  const label = document.querySelector("[data-playground-select-label]");
  const selectedItem = document.querySelector("[data-playground-select-item][data-state='checked']");
  const rawItem = document.querySelector("[data-playground-select-raw-item]");
  const itemText = document.querySelector("[data-playground-select-item-text]");
  const itemIndicator = document.querySelector("[data-playground-select-indicator][data-state='checked']");
  const uncheckedIndicator = document.querySelector("[data-playground-select-indicator][data-state='unchecked']");
  const disabledItem = document.querySelector("[data-playground-select-item][data-disabled]");
  const highlightedItem = document.querySelector("[data-playground-select-item][data-highlighted]");
  const separator = document.querySelector("[data-playground-select-separator]");
  const scrollUp = document.querySelector("[data-playground-select-scroll-up]");
  const scrollDown = document.querySelector("[data-playground-select-scroll-down]");
  const hiddenInput = document.querySelector<HTMLInputElement>("input[name='plan']");
  const canvas = document.querySelector(".canvas");
  const customContainer = document.querySelector("[data-playground-select-custom-container]");
  const triggerControls = trigger?.getAttribute("aria-controls") ?? "none";
  const listboxId = listbox?.id || "none";
  const activeDescendant = trigger?.getAttribute("aria-activedescendant") ?? "none";
  const groupLabelledBy = group?.getAttribute("aria-labelledby") ?? "none";
  const labelId = label?.id || "none";
  const listboxParent = listbox?.parentElement;
  const triggerRect = trigger?.getBoundingClientRect();
  const listboxRect = listbox?.getBoundingClientRect();
  const actualValue = hiddenInput?.getAttribute("value") || "none";
  const actualLabel = actualValue === "none" ? "none" : getSelectLabel(actualValue);

  return {
    rootMode: [
      state.valueControlled ? "value controlled" : "value uncontrolled",
      state.openControlled ? "open controlled" : "open uncontrolled",
    ].join(" / "),
    rootValueMode: state.valueControlled ? "controlled" : "uncontrolled",
    rootOpenMode: state.openControlled ? "controlled" : "uncontrolled",
    value: actualValue,
    valueLabel: actualLabel,
    open: trigger?.getAttribute("aria-expanded") === "true" ? "yes" : "no",
    disabled: trigger?.hasAttribute("disabled") || trigger?.hasAttribute("data-disabled")
      ? "yes"
      : "no",
    required: trigger?.getAttribute("aria-required") === "true" || state.required ? "yes" : "no",
    fieldWrapped: state.fieldWrapped ? "yes" : "no",
    fieldDisabled: state.fieldDisabled ? "yes" : "no",
    fieldRequired: state.fieldRequired ? "yes" : "no",
    triggerExists: trigger ? "yes" : "no",
    triggerRef: trigger?.tagName.toLowerCase() ?? "none",
    triggerProps: propsMatch(trigger, [
      ["id", "select-trigger-prop"],
      ["name", "select-trigger-name"],
      ["title", "trigger prop"],
      ["data-prop-check", "trigger"],
    ]),
    triggerId: trigger?.getAttribute("id") ?? "none",
    triggerClass: trigger?.classList.contains("atom-select-trigger") ? "passed" : "missing",
    triggerSlot: trigger?.getAttribute("data-slot") ?? "none",
    triggerComposition: "see toolbar",
    triggerTag: trigger?.tagName.toLowerCase() ?? "none",
    triggerType: trigger?.getAttribute("type") ?? "none",
    triggerRole: trigger?.getAttribute("role") ?? "none",
    triggerState: trigger?.getAttribute("data-state") ?? "none",
    triggerControls,
    triggerControlsMatch: triggerControls !== "none" && triggerControls === listboxId ? "yes" : "no",
    triggerHasPopup: trigger?.getAttribute("aria-haspopup") ?? "none",
    triggerExpanded: trigger?.getAttribute("aria-expanded") ?? "none",
    triggerActiveDescendant: activeDescendant,
    triggerActiveDescendantMatch: activeDescendant !== "none" && highlightedItem?.id === activeDescendant
      ? "yes"
      : "no",
    triggerLabel: trigger?.getAttribute("aria-label") ?? "none",
    triggerLabelledBy: trigger?.getAttribute("aria-labelledby") ?? "none",
    triggerDescribedBy: trigger?.getAttribute("aria-describedby") ?? "none",
    triggerRequired: trigger?.getAttribute("aria-required") ?? "none",
    triggerDataDisabled: trigger?.hasAttribute("data-disabled") ? "yes" : "no",
    triggerDisabled: trigger?.hasAttribute("disabled") || trigger?.hasAttribute("data-disabled")
      ? "yes"
      : "no",
    valueExists: value ? "yes" : "no",
    valueRef: value?.tagName.toLowerCase() ?? "none",
    valueProps: propsMatch(value, [
      ["title", "value prop"],
      ["data-prop-check", "value"],
    ]),
    valueSlot: value?.getAttribute("data-slot") ?? "none",
    valueText: value?.textContent?.trim() || "none",
    valuePlaceholder: value?.hasAttribute("data-placeholder") ? "yes" : "no",
    iconExists: icon ? "yes" : "no",
    iconRef: icon?.tagName.toLowerCase() ?? "none",
    iconProps: propsMatch(icon, [
      ["title", "icon prop"],
      ["data-prop-check", "icon"],
    ]),
    iconSlot: icon?.getAttribute("data-slot") ?? "none",
    iconHidden: icon?.getAttribute("aria-hidden") ?? "none",
    arrowExists: arrow ? "yes" : "no",
    arrowRef: arrow?.tagName.toLowerCase() ?? "none",
    arrowProps: propsMatch(arrow, [
      ["title", "arrow prop"],
      ["data-prop-check", "arrow"],
    ]),
    arrowSlot: arrow?.getAttribute("data-slot") ?? "none",
    arrowHidden: arrow?.getAttribute("aria-hidden") ?? "none",
    listboxExists: listbox ? "yes" : "no",
    listboxRef: listbox?.tagName.toLowerCase() ?? "none",
    listboxAlias: state.useListboxAlias ? "Listbox" : "Content",
    listboxProps: propsMatch(listbox, [
      ["title", "listbox prop"],
      ["data-prop-check", "listbox"],
    ]),
    listboxClass: listbox?.classList.contains("atom-select-content") ? "passed" : "missing",
    listboxSlot: listbox?.getAttribute("data-slot") ?? "none",
    listboxParent: listboxParent
      ? listboxParent === document.body
        ? "body"
        : listboxParent.tagName.toLowerCase()
      : "not rendered",
    listboxInCanvas: listbox && canvas?.contains(listbox) ? "yes" : "no",
    listboxInCustomContainer: listbox && customContainer?.contains(listbox) ? "yes" : "no",
    listboxId,
    listboxRole: listbox?.getAttribute("role") ?? "none",
    listboxState: listbox?.getAttribute("data-state") ?? "none",
    listboxPositioned: listbox
      ? listbox.hasAttribute("data-positioned")
        ? "yes"
        : "no"
      : "none",
    listboxLabel: listbox?.getAttribute("aria-label") ?? "none",
    listboxMinWidthMatch: triggerRect && listboxRect && listboxRect.width >= triggerRect.width
      ? "yes"
      : "no",
    viewportExists: viewport ? "yes" : "no",
    viewportRef: viewport?.tagName.toLowerCase() ?? "none",
    viewportProps: propsMatch(viewport, [
      ["title", "viewport prop"],
      ["data-prop-check", "viewport"],
    ]),
    viewportSlot: viewport?.getAttribute("data-slot") ?? "none",
    viewportScrollTop: viewport ? String(Math.round((viewport as HTMLElement).scrollTop)) : "none",
    groupExists: group ? "yes" : "no",
    groupRef: group?.tagName.toLowerCase() ?? "none",
    groupProps: propsMatch(group, [
      ["title", "group prop"],
      ["data-prop-check", "group"],
    ]),
    groupSlot: group?.getAttribute("data-slot") ?? "none",
    groupRole: group?.getAttribute("role") ?? "none",
    groupLabelledBy,
    groupLabelMatch: groupLabelledBy !== "none" && groupLabelledBy === labelId ? "yes" : "no",
    labelExists: label ? "yes" : "no",
    labelRef: label?.tagName.toLowerCase() ?? "none",
    labelProps: propsMatch(label, [
      ["title", "label prop"],
      ["data-prop-check", "label"],
    ]),
    labelSlot: label?.getAttribute("data-slot") ?? "none",
    labelId,
    selectedItemExists: selectedItem ? "yes" : "no",
    selectedItemRef: selectedItem?.tagName.toLowerCase() ?? "none",
    selectedItemProps: propsMatch(selectedItem, [
      ["title", `${getSelectLabel(selectedItem?.getAttribute("data-value") ?? "")} item prop`],
      ["data-prop-check", "item"],
    ]),
    selectedItemClass: selectedItem?.classList.contains("atom-select-item") ? "passed" : "missing",
    selectedItemSlot: selectedItem?.getAttribute("data-slot") ?? "none",
    selectedItemValue: selectedItem?.getAttribute("data-value") ?? "none",
    selectedItemState: selectedItem?.getAttribute("data-state") ?? "none",
    selectedItemSelected: selectedItem?.getAttribute("aria-selected") ?? "none",
    selectedItemHighlighted: selectedItem?.hasAttribute("data-highlighted") ? "yes" : "no",
    selectedItemLabelledBy: selectedItem?.getAttribute("aria-labelledby") ?? "none",
    highlightedItemExists: highlightedItem ? "yes" : "no",
    highlightedItemValue: highlightedItem?.getAttribute("data-value") ?? "none",
    highlightedItemState: highlightedItem?.getAttribute("data-state") ?? "none",
    highlightedItemSelected: highlightedItem?.getAttribute("aria-selected") ?? "none",
    rawItemExists: rawItem ? "yes" : "no",
    rawItemRef: rawItem?.tagName.toLowerCase() ?? "none",
    rawItemValue: rawItem?.getAttribute("data-value") ?? "none",
    rawItemLabelledBy: rawItem?.getAttribute("aria-labelledby") ?? "none",
    itemTextExists: itemText ? "yes" : "no",
    itemTextRef: itemText?.tagName.toLowerCase() ?? "none",
    itemTextProps: propsMatch(itemText, [
      ["title", "item text prop"],
      ["data-prop-check", "item-text"],
    ]),
    itemTextSlot: itemText?.getAttribute("data-slot") ?? "none",
    itemIndicatorExists: itemIndicator ? "yes" : "no",
    itemIndicatorRef: itemIndicator?.tagName.toLowerCase() ?? "none",
    itemIndicatorProps: propsMatch(itemIndicator, [
      ["title", "indicator prop"],
      ["data-prop-check", "indicator"],
    ]),
    itemIndicatorSlot: itemIndicator?.getAttribute("data-slot") ?? "none",
    itemIndicatorState: itemIndicator?.getAttribute("data-state") ?? "none",
    itemIndicatorHidden: itemIndicator?.getAttribute("aria-hidden") ?? "none",
    uncheckedIndicatorExists: uncheckedIndicator ? "yes" : "no",
    disabledItemExists: disabledItem ? "yes" : "no",
    disabledItemRef: disabledItem?.tagName.toLowerCase() ?? "none",
    disabledItemDisabled: disabledItem?.getAttribute("aria-disabled") ?? "none",
    disabledItemState: disabledItem?.getAttribute("data-state") ?? "none",
    separatorExists: separator ? "yes" : "no",
    separatorRef: separator?.tagName.toLowerCase() ?? "none",
    separatorProps: propsMatch(separator, [
      ["title", "separator prop"],
      ["data-prop-check", "separator"],
    ]),
    separatorSlot: separator?.getAttribute("data-slot") ?? "none",
    separatorRole: separator?.getAttribute("role") ?? "none",
    separatorOrientation: separator?.getAttribute("aria-orientation") ?? "none",
    scrollUpExists: scrollUp ? "yes" : "no",
    scrollUpRef: scrollUp?.tagName.toLowerCase() ?? "none",
    scrollUpProps: propsMatch(scrollUp, [
      ["title", "scroll up prop"],
      ["data-prop-check", "scroll-up"],
    ]),
    scrollUpSlot: scrollUp?.getAttribute("data-slot") ?? "none",
    scrollUpHidden: scrollUp?.getAttribute("aria-hidden") ?? "none",
    scrollDownExists: scrollDown ? "yes" : "no",
    scrollDownRef: scrollDown?.tagName.toLowerCase() ?? "none",
    scrollDownProps: propsMatch(scrollDown, [
      ["title", "scroll down prop"],
      ["data-prop-check", "scroll-down"],
    ]),
    scrollDownSlot: scrollDown?.getAttribute("data-slot") ?? "none",
    scrollDownHidden: scrollDown?.getAttribute("aria-hidden") ?? "none",
    hiddenInputExists: hiddenInput ? "yes" : "no",
    hiddenInputName: hiddenInput?.getAttribute("name") ?? "none",
    hiddenInputValue: hiddenInput?.getAttribute("value") ?? "none",
    hiddenInputForm: hiddenInput?.getAttribute("form") ?? "none",
    hiddenInputDisabled: hiddenInput?.hasAttribute("disabled") ? "yes" : "no",
  };
}

function propsMatch(
  element: Element | null | undefined,
  checks: [attribute: string, expectedValue: string][],
) {
  if (!element) return "not rendered";

  return checks.every(([attribute, expectedValue]) =>
    element.getAttribute(attribute) === expectedValue
  )
    ? "passed"
    : "missing";
}

function getLogTime() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  }).format(new Date());
}

const emptySelectRefSnapshot: SelectRefSnapshot = {
  trigger: "none",
  value: "none",
  icon: "none",
  arrow: "none",
  listbox: "none",
  viewport: "none",
  group: "none",
  label: "none",
  selectedItem: "none",
  rawItem: "none",
  itemText: "none",
  itemIndicator: "none",
  disabledItem: "none",
  separator: "none",
  scrollUpButton: "none",
  scrollDownButton: "none",
};

const emptySelectPartsSnapshot: SelectPartsSnapshot = {
  rootMode: "value uncontrolled / open uncontrolled",
  rootValueMode: "uncontrolled",
  rootOpenMode: "uncontrolled",
  value: "none",
  valueLabel: "none",
  open: "no",
  disabled: "no",
  required: "no",
  fieldWrapped: "no",
  fieldDisabled: "no",
  fieldRequired: "no",
  triggerExists: "no",
  triggerRef: "none",
  triggerProps: "not rendered",
  triggerId: "none",
  triggerClass: "missing",
  triggerSlot: "none",
  triggerComposition: "default",
  triggerTag: "none",
  triggerType: "none",
  triggerRole: "none",
  triggerState: "none",
  triggerControls: "none",
  triggerControlsMatch: "no",
  triggerHasPopup: "none",
  triggerExpanded: "none",
  triggerActiveDescendant: "none",
  triggerActiveDescendantMatch: "no",
  triggerLabel: "none",
  triggerLabelledBy: "none",
  triggerDescribedBy: "none",
  triggerRequired: "none",
  triggerDataDisabled: "no",
  triggerDisabled: "no",
  valueExists: "no",
  valueRef: "none",
  valueProps: "not rendered",
  valueSlot: "none",
  valueText: "none",
  valuePlaceholder: "no",
  iconExists: "no",
  iconRef: "none",
  iconProps: "not rendered",
  iconSlot: "none",
  iconHidden: "none",
  arrowExists: "no",
  arrowRef: "none",
  arrowProps: "not rendered",
  arrowSlot: "none",
  arrowHidden: "none",
  listboxExists: "no",
  listboxRef: "none",
  listboxAlias: "Content",
  listboxProps: "not rendered",
  listboxClass: "missing",
  listboxSlot: "none",
  listboxParent: "not rendered",
  listboxInCanvas: "no",
  listboxInCustomContainer: "no",
  listboxId: "none",
  listboxRole: "none",
  listboxState: "none",
  listboxPositioned: "none",
  listboxLabel: "none",
  listboxMinWidthMatch: "no",
  viewportExists: "no",
  viewportRef: "none",
  viewportProps: "not rendered",
  viewportSlot: "none",
  viewportScrollTop: "none",
  groupExists: "no",
  groupRef: "none",
  groupProps: "not rendered",
  groupSlot: "none",
  groupRole: "none",
  groupLabelledBy: "none",
  groupLabelMatch: "no",
  labelExists: "no",
  labelRef: "none",
  labelProps: "not rendered",
  labelSlot: "none",
  labelId: "none",
  selectedItemExists: "no",
  selectedItemRef: "none",
  selectedItemProps: "not rendered",
  selectedItemClass: "missing",
  selectedItemSlot: "none",
  selectedItemValue: "none",
  selectedItemState: "none",
  selectedItemSelected: "none",
  selectedItemHighlighted: "no",
  selectedItemLabelledBy: "none",
  highlightedItemExists: "no",
  highlightedItemValue: "none",
  highlightedItemState: "none",
  highlightedItemSelected: "none",
  rawItemExists: "no",
  rawItemRef: "none",
  rawItemValue: "none",
  rawItemLabelledBy: "none",
  itemTextExists: "no",
  itemTextRef: "none",
  itemTextProps: "not rendered",
  itemTextSlot: "none",
  itemIndicatorExists: "no",
  itemIndicatorRef: "none",
  itemIndicatorProps: "not rendered",
  itemIndicatorSlot: "none",
  itemIndicatorState: "none",
  itemIndicatorHidden: "none",
  uncheckedIndicatorExists: "no",
  disabledItemExists: "no",
  disabledItemRef: "none",
  disabledItemDisabled: "none",
  disabledItemState: "none",
  separatorExists: "no",
  separatorRef: "none",
  separatorProps: "not rendered",
  separatorSlot: "none",
  separatorRole: "none",
  separatorOrientation: "none",
  scrollUpExists: "no",
  scrollUpRef: "none",
  scrollUpProps: "not rendered",
  scrollUpSlot: "none",
  scrollUpHidden: "none",
  scrollDownExists: "no",
  scrollDownRef: "none",
  scrollDownProps: "not rendered",
  scrollDownSlot: "none",
  scrollDownHidden: "none",
  hiddenInputExists: "no",
  hiddenInputName: "none",
  hiddenInputValue: "none",
  hiddenInputForm: "none",
  hiddenInputDisabled: "no",
};

function getSelectLabel(value: string) {
  return selectValueLabels[value] ?? value;
}

const selectValueLabels: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  team: "Team",
  enterprise: "Enterprise",
  scale: "Scale",
  global: "Global",
  agency: "Agency",
  internal: "Internal",
  sandbox: "Sandbox",
  archive: "Archive",
  custom: "Custom",
  priority: "Priority",
  labeled: "Label Alias",
  solo: "Solo Raw",
};
