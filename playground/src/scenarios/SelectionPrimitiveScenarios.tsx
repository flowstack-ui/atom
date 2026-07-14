import { CheckboxGroup } from "@flowstack-ui/atom/checkbox-group";
import { Combobox } from "@flowstack-ui/atom/combobox";
import { Direction, type DirectionValue } from "@flowstack-ui/atom/direction";
import { Listbox } from "@flowstack-ui/atom/listbox";
import { Rating } from "@flowstack-ui/atom/rating";
import { Slider } from "@flowstack-ui/atom/slider";
import { useCallback, useRef, useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { AnatomyPanel, type AnatomyRowCategory, type AnatomySection } from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type Orientation = "horizontal" | "vertical";
type LogEntry = { id: number; time: string; text: string };
type PlanOption = { value: string; label: string; disabled?: boolean };
type ComboboxOption = { value: string; label: string; disabled?: boolean };

const planOptions: PlanOption[] = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
  { value: "enterprise", label: "Enterprise" },
];

const comboboxOptions: ComboboxOption[] = [
  { value: "alpha", label: "Alpha" },
  { value: "bravo", label: "Bravo" },
  { value: "charlie", label: "Charlie" },
  { value: "delta", label: "Delta" },
];

export const selectionPrimitiveScenarioIds = new Set([
  "checkbox-group",
  "slider",
  "rating",
  "listbox",
  "combobox",
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
      ...entries.slice(0, 12),
    ]);
  };

  return {
    log,
    addLog,
    clearLog: () => setLog([]),
  };
}

function usePartRefs<TPart extends string>(_parts: readonly TPart[]) {
  const refs = useRef<Record<TPart, HTMLElement | null>>({} as Record<TPart, HTMLElement | null>);

  const setPartRef = useCallback(
    (part: TPart) => (node: HTMLElement | null) => {
      refs.current[part] = node;
    },
    [],
  );

  return { refs, setPartRef };
}

export function useSelectionPrimitiveScenarios() {
  return {
    checkboxGroup: useCheckboxGroupScenario(),
    slider: useSliderScenario(),
    rating: useRatingScenario(),
    listbox: useListboxScenario(),
    combobox: useComboboxScenario(),
  };
}

function useCheckboxGroupScenario() {
  const [value, setValue] = useState<string[]>(["email"]);
  const [controlled, setControlled] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [pushDisabled, setPushDisabled] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customItemSlot, setCustomItemSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (nextValue: string[]) => {
    setValue(nextValue);
    addLog(`value ${nextValue.join(", ") || "none"}`);
  };

  return {
    state: { value, controlled, disabled, readOnly, required, invalid, pushDisabled, orientation, composition, propCheck, customRootSlot, customItemSlot, log },
    actions: { setValue, setControlled, setDisabled, setReadOnly, setRequired, setInvalid, setPushDisabled, setOrientation, setComposition, setPropCheck, setCustomRootSlot, setCustomItemSlot, handleValueChange, clearLog },
  };
}

function useSliderScenario() {
  const [value, setValue] = useState<number | number[]>(40);
  const [controlled, setControlled] = useState(true);
  const [range, setRange] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [direction, setDirection] = useState<DirectionValue>("ltr");
  const [step, setStep] = useState(5);
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customTrackSlot, setCustomTrackSlot] = useState(false);
  const [customRangeSlot, setCustomRangeSlot] = useState(false);
  const [customThumbSlot, setCustomThumbSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const resolvedValue = range ? (Array.isArray(value) ? value : [20, 70]) : (Array.isArray(value) ? value[0] ?? 40 : value);
  const setRangeMode = (nextRange: boolean) => {
    setRange(nextRange);
    setValue(nextRange ? [20, 70] : 40);
  };
  const handleValueChange = (nextValue: number | number[]) => {
    setValue(nextValue);
    addLog(`value ${Array.isArray(nextValue) ? nextValue.join(", ") : nextValue}`);
  };

  return {
    state: { value: resolvedValue, controlled, range, disabled, orientation, direction, step, propCheck, customRootSlot, customTrackSlot, customRangeSlot, customThumbSlot, log },
    actions: { setControlled, setRange: setRangeMode, setDisabled, setOrientation, setDirection, setStep, setPropCheck, setCustomRootSlot, setCustomTrackSlot, setCustomRangeSlot, setCustomThumbSlot, handleValueChange, clearLog },
  };
}

function useRatingScenario() {
  const [value, setValue] = useState(3);
  const [controlled, setControlled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<DirectionValue>("ltr");
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customItemSlot, setCustomItemSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (nextValue: number) => {
    setValue(nextValue);
    addLog(`value ${nextValue}`);
  };

  return {
    state: { value, controlled, disabled, readOnly, required, invalid, step, direction, rootComposition, itemComposition, propCheck, customRootSlot, customItemSlot, log },
    actions: { setValue, setControlled, setDisabled, setReadOnly, setRequired, setInvalid, setStep, setDirection, setRootComposition, setItemComposition, setPropCheck, setCustomRootSlot, setCustomItemSlot, handleValueChange, clearLog },
  };
}

function useListboxScenario() {
  const [value, setValue] = useState<string | string[] | null>("pro");
  const [controlled, setControlled] = useState(true);
  const [multiple, setMultiple] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [teamDisabled, setTeamDisabled] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [loop, setLoop] = useState(true);
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [groupComposition, setGroupComposition] = useState<CompositionMode>("default");
  const [labelComposition, setLabelComposition] = useState<CompositionMode>("default");
  const [optionComposition, setOptionComposition] = useState<CompositionMode>("default");
  const [optionTextComposition, setOptionTextComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customGroupSlot, setCustomGroupSlot] = useState(false);
  const [customLabelSlot, setCustomLabelSlot] = useState(false);
  const [customOptionSlot, setCustomOptionSlot] = useState(false);
  const [customOptionTextSlot, setCustomOptionTextSlot] = useState(false);
  const refs = usePartRefs([
    "root",
    "group",
    "label",
    "option-selected",
    "option-highlighted",
    "option-disabled",
    "option-team",
    "option-text",
  ] as const);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleMultiple = (nextMultiple: boolean) => {
    setMultiple(nextMultiple);
    setValue(nextMultiple ? ["pro"] : "pro");
  };
  const handleValueChange = (nextValue: string | string[] | null) => {
    setValue(nextValue);
    addLog(`value ${Array.isArray(nextValue) ? nextValue.join(", ") : nextValue ?? "none"}`);
  };

  return {
    state: {
      value,
      controlled,
      multiple,
      disabled,
      readOnly,
      required,
      invalid,
      teamDisabled,
      orientation,
      loop,
      rootComposition,
      groupComposition,
      labelComposition,
      optionComposition,
      optionTextComposition,
      propCheck,
      customRootSlot,
      customGroupSlot,
      customLabelSlot,
      customOptionSlot,
      customOptionTextSlot,
      refs,
      log,
    },
    actions: {
      setControlled,
      setMultiple: handleMultiple,
      setDisabled,
      setReadOnly,
      setRequired,
      setInvalid,
      setTeamDisabled,
      setOrientation,
      setLoop,
      setRootComposition,
      setGroupComposition,
      setLabelComposition,
      setOptionComposition,
      setOptionTextComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomGroupSlot,
      setCustomLabelSlot,
      setCustomOptionSlot,
      setCustomOptionTextSlot,
      handleValueChange,
      clearLog,
    },
  };
}

function useComboboxScenario() {
  const [value, setValue] = useState<string | null>("bravo");
  const [inputValue, setInputValue] = useState("Bravo");
  const [open, setOpen] = useState(false);
  const [controlledValue, setControlledValue] = useState(true);
  const [controlledInput, setControlledInput] = useState(true);
  const [controlledOpen, setControlledOpen] = useState(false);
  const [freeSolo, setFreeSolo] = useState(false);
  const [clearOnSelect, setClearOnSelect] = useState(false);
  const [openOnFocus, setOpenOnFocus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emptyOptions, setEmptyOptions] = useState(false);
  const [grouped, setGrouped] = useState(true);
  const [disablePortal, setDisablePortal] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [charlieDisabled, setCharlieDisabled] = useState(false);
  const [labelComposition, setLabelComposition] = useState<CompositionMode>("default");
  const [inputComposition, setInputComposition] = useState<CompositionMode>("default");
  const [clearComposition, setClearComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customLabelSlot, setCustomLabelSlot] = useState(false);
  const [customInputSlot, setCustomInputSlot] = useState(false);
  const [customClearSlot, setCustomClearSlot] = useState(false);
  const [customContentSlot, setCustomContentSlot] = useState(false);
  const [customListboxSlot, setCustomListboxSlot] = useState(false);
  const [customGroupSlot, setCustomGroupSlot] = useState(false);
  const [customItemSlot, setCustomItemSlot] = useState(false);
  const [customEmptySlot, setCustomEmptySlot] = useState(false);
  const [customLoadingSlot, setCustomLoadingSlot] = useState(false);
  const refs = usePartRefs([
    "label-assignee",
    "label-recent",
    "label-teams",
    "input",
    "clear",
    "content",
    "listbox",
    "group",
    "item-alpha",
    "item-bravo",
    "item-charlie",
    "item-delta",
    "empty",
    "loading",
  ] as const);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (nextValue: string | null) => {
    setValue(nextValue);
    addLog(`value ${nextValue ?? "none"}`);
  };
  const handleInputValueChange = (nextValue: string) => {
    setInputValue(nextValue);
    addLog(`input ${nextValue || "empty"}`);
  };
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    addLog(nextOpen ? "opened" : "closed");
  };
  const handleControlledInput = (nextControlled: boolean) => {
    setControlledInput(nextControlled);
    if (nextControlled) {
      const option = comboboxOptions.find((item) => item.value === value);
      setInputValue(option?.label ?? value ?? "");
    }
  };
  const handleEmptyOptions = (nextEmptyOptions: boolean) => {
    setEmptyOptions(nextEmptyOptions);
    if (nextEmptyOptions) {
      setInputValue("");
      setControlledOpen(true);
      setOpen(true);
    } else {
      setControlledOpen(false);
      setOpen(false);
    }
  };

  return {
    state: {
      value,
      inputValue,
      open,
      controlledValue,
      controlledInput,
      controlledOpen,
      freeSolo,
      clearOnSelect,
      openOnFocus,
      loading,
      emptyOptions,
      grouped,
      disablePortal,
      disabled,
      readOnly,
      required,
      invalid,
      charlieDisabled,
      labelComposition,
      inputComposition,
      clearComposition,
      propCheck,
      customLabelSlot,
      customInputSlot,
      customClearSlot,
      customContentSlot,
      customListboxSlot,
      customGroupSlot,
      customItemSlot,
      customEmptySlot,
      customLoadingSlot,
      refs,
      log,
    },
    actions: {
      setControlledValue,
      setControlledInput: handleControlledInput,
      setControlledOpen,
      setFreeSolo,
      setClearOnSelect,
      setOpenOnFocus,
      setLoading,
      setEmptyOptions: handleEmptyOptions,
      setGrouped,
      setDisablePortal,
      setDisabled,
      setReadOnly,
      setRequired,
      setInvalid,
      setCharlieDisabled,
      setLabelComposition,
      setInputComposition,
      setClearComposition,
      setPropCheck,
      setCustomLabelSlot,
      setCustomInputSlot,
      setCustomClearSlot,
      setCustomContentSlot,
      setCustomListboxSlot,
      setCustomGroupSlot,
      setCustomItemSlot,
      setCustomEmptySlot,
      setCustomLoadingSlot,
      handleValueChange,
      handleInputValueChange,
      handleOpenChange,
      clearLog,
    },
  };
}

export type SelectionPrimitiveScenarios = ReturnType<typeof useSelectionPrimitiveScenarios>;

export function SelectionPrimitiveScenarioToolbar({ scenarioId, scenarios }: { scenarioId: string; scenarios: SelectionPrimitiveScenarios }) {
  if (scenarioId === "checkbox-group") {
    const s = scenarios.checkboxGroup;
    return (
      <ControlToolbar label="Checkbox Group controls">
        <StateGroup controlled={s.state.controlled} disabled={s.state.disabled} invalid={s.state.invalid} readOnly={s.state.readOnly} required={s.state.required} setControlled={s.actions.setControlled} setDisabled={s.actions.setDisabled} setInvalid={s.actions.setInvalid} setReadOnly={s.actions.setReadOnly} setRequired={s.actions.setRequired} />
        <ToolbarGroup title="Items" value="items">
          <MenuCheckboxControl checked={s.state.pushDisabled} label="Push disabled" value="push-disabled" onChange={s.actions.setPushDisabled} />
          {s.state.controlled ? (
            <>
              <MenuCheckboxControl checked={s.state.value.includes("email")} label="Email value" value="email-value" onChange={(checked) => s.actions.setValue((value) => checked ? Array.from(new Set([...value, "email"])) : value.filter((item) => item !== "email"))} />
              <MenuCheckboxControl checked={s.state.value.includes("sms")} label="SMS value" value="sms-value" onChange={(checked) => s.actions.setValue((value) => checked ? Array.from(new Set([...value, "sms"])) : value.filter((item) => item !== "sms"))} />
              <MenuCheckboxControl checked={s.state.value.includes("push")} label="Push value" value="push-value" onChange={(checked) => s.actions.setValue((value) => checked ? Array.from(new Set([...value, "push"])) : value.filter((item) => item !== "push"))} />
            </>
          ) : null}
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout"><MenuRadioControl label="Orientation" options={orientationOptions} value={s.state.orientation} onChange={(value) => s.actions.setOrientation(value as Orientation)} /></ToolbarGroup>
        <CompositionToolbarGroup value={s.state.composition} onChange={s.actions.setComposition} />
        <PropsToolbarGroup
          propCheck={s.state.propCheck}
          onPropCheckChange={s.actions.setPropCheck}
          customSlots={[
            { checked: s.state.customRootSlot, label: "Root", value: "root-slot", onChange: s.actions.setCustomRootSlot },
            { checked: s.state.customItemSlot, label: "Item", value: "item-slot", onChange: s.actions.setCustomItemSlot },
          ]}
        />
      </ControlToolbar>
    );
  }
  if (scenarioId === "slider") {
    const s = scenarios.slider;
    return (
      <ControlToolbar label="Slider controls">
        <ToolbarGroup title="State" value="state"><MenuCheckboxControl checked={s.state.controlled} label="Controlled" value="controlled" onChange={s.actions.setControlled} /><MenuCheckboxControl checked={s.state.range} label="Range" value="range" onChange={s.actions.setRange} /><MenuCheckboxControl checked={s.state.disabled} label="Disabled" value="disabled" onChange={s.actions.setDisabled} /></ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout"><MenuRadioControl label="Orientation" options={orientationOptions} value={s.state.orientation} onChange={(value) => s.actions.setOrientation(value as Orientation)} /><MenuRadioControl label="Direction" options={directionOptions} value={s.state.direction} onChange={s.actions.setDirection} /><MenuRadioControl label="Step" options={stepOptions} value={String(s.state.step)} onChange={(value) => s.actions.setStep(Number(value))} /></ToolbarGroup>
        <PropsToolbarGroup
          propCheck={s.state.propCheck}
          onPropCheckChange={s.actions.setPropCheck}
          customSlots={[
            { checked: s.state.customRootSlot, label: "Root", value: "root-slot", onChange: s.actions.setCustomRootSlot },
            { checked: s.state.customTrackSlot, label: "Track", value: "track-slot", onChange: s.actions.setCustomTrackSlot },
            { checked: s.state.customRangeSlot, label: "Range", value: "range-slot", onChange: s.actions.setCustomRangeSlot },
            { checked: s.state.customThumbSlot, label: "Thumb", value: "thumb-slot", onChange: s.actions.setCustomThumbSlot },
          ]}
        />
      </ControlToolbar>
    );
  }
  if (scenarioId === "rating") {
    const s = scenarios.rating;
    return (
      <ControlToolbar label="Rating controls">
        <StateGroup controlled={s.state.controlled} disabled={s.state.disabled} invalid={s.state.invalid} readOnly={s.state.readOnly} required={s.state.required} setControlled={s.actions.setControlled} setDisabled={s.actions.setDisabled} setInvalid={s.actions.setInvalid} setReadOnly={s.actions.setReadOnly} setRequired={s.actions.setRequired} />
        <ToolbarGroup title="Value" value="value">
          <MenuRadioControl label="Step" options={ratingStepOptions} value={String(s.state.step)} onChange={(value) => s.actions.setStep(Number(value))} />
          {s.state.controlled ? <MenuRadioControl label="Controlled value" options={ratingValueOptions} value={String(s.state.value)} onChange={(value) => s.actions.setValue(Number(value))} /> : null}
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout"><MenuRadioControl label="Direction" options={directionOptions} value={s.state.direction} onChange={s.actions.setDirection} /></ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={s.state.rootComposition} onChange={(value) => s.actions.setRootComposition(value as CompositionMode)} />
          <MenuRadioControl label="Item" options={compositionOptions} value={s.state.itemComposition} onChange={(value) => s.actions.setItemComposition(value as CompositionMode)} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={s.state.propCheck}
          onPropCheckChange={s.actions.setPropCheck}
          customSlots={[
            { checked: s.state.customRootSlot, label: "Root", value: "root-slot", onChange: s.actions.setCustomRootSlot },
            { checked: s.state.customItemSlot, label: "Item", value: "item-slot", onChange: s.actions.setCustomItemSlot },
          ]}
        />
      </ControlToolbar>
    );
  }
  if (scenarioId === "listbox") {
    const s = scenarios.listbox;
    return (
      <ControlToolbar label="Listbox controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={s.state.controlled} label="Controlled" value="controlled" onChange={s.actions.setControlled} />
          <MenuCheckboxControl checked={s.state.multiple} label="Multiple" value="multiple" onChange={s.actions.setMultiple} />
          <MenuCheckboxControl checked={s.state.disabled} label="Disabled" value="disabled" onChange={s.actions.setDisabled} />
          <MenuCheckboxControl checked={s.state.readOnly} label="Read only" value="read-only" onChange={s.actions.setReadOnly} />
          <MenuCheckboxControl checked={s.state.required} label="Required" value="required" onChange={s.actions.setRequired} />
          <MenuCheckboxControl checked={s.state.invalid} label="Invalid" value="invalid" onChange={s.actions.setInvalid} />
          <MenuCheckboxControl checked={s.state.teamDisabled} label="Disable Team" value="disable-team" onChange={s.actions.setTeamDisabled} />
          <MenuCheckboxControl checked={s.state.loop} label="Loop" value="loop" onChange={s.actions.setLoop} />
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Orientation" options={orientationOptions} value={s.state.orientation} onChange={(value) => s.actions.setOrientation(value as Orientation)} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={s.state.rootComposition} onChange={(value) => s.actions.setRootComposition(value as CompositionMode)} />
          <MenuRadioControl label="Group" options={compositionOptions} value={s.state.groupComposition} onChange={(value) => s.actions.setGroupComposition(value as CompositionMode)} />
          <MenuRadioControl label="Label" options={compositionOptions} value={s.state.labelComposition} onChange={(value) => s.actions.setLabelComposition(value as CompositionMode)} />
          <MenuRadioControl label="Option" options={compositionOptions} value={s.state.optionComposition} onChange={(value) => s.actions.setOptionComposition(value as CompositionMode)} />
          <MenuRadioControl label="Option Text" options={compositionOptions} value={s.state.optionTextComposition} onChange={(value) => s.actions.setOptionTextComposition(value as CompositionMode)} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={s.state.propCheck}
          onPropCheckChange={s.actions.setPropCheck}
          customSlots={[
            { checked: s.state.customRootSlot, label: "Root", value: "root-slot", onChange: s.actions.setCustomRootSlot },
            { checked: s.state.customGroupSlot, label: "Group", value: "group-slot", onChange: s.actions.setCustomGroupSlot },
            { checked: s.state.customLabelSlot, label: "Label", value: "label-slot", onChange: s.actions.setCustomLabelSlot },
            { checked: s.state.customOptionSlot, label: "Option", value: "option-slot", onChange: s.actions.setCustomOptionSlot },
            { checked: s.state.customOptionTextSlot, label: "Option Text", value: "option-text-slot", onChange: s.actions.setCustomOptionTextSlot },
          ]}
        />
      </ControlToolbar>
    );
  }
  if (scenarioId === "combobox") {
    const s = scenarios.combobox;
    return (
      <ControlToolbar label="Combobox controls">
        <ToolbarGroup title="State" value="state">
          <MenuSection label="Controlled">
            <MenuCheckboxControl checked={s.state.controlledValue} label="Value" value="controlled-value" onChange={s.actions.setControlledValue} />
            <MenuCheckboxControl checked={s.state.controlledInput} label="Input" value="controlled-input" onChange={s.actions.setControlledInput} />
            <MenuCheckboxControl checked={s.state.controlledOpen} label="Open" value="controlled-open" onChange={s.actions.setControlledOpen} />
          </MenuSection>
          <MenuSection label="Behavior">
            <MenuCheckboxControl checked={s.state.openOnFocus} label="Open on focus" value="open-on-focus" onChange={s.actions.setOpenOnFocus} />
            <MenuCheckboxControl checked={s.state.freeSolo} label="Free solo" value="free-solo" onChange={s.actions.setFreeSolo} />
            <MenuCheckboxControl checked={s.state.clearOnSelect} label="Clear on select" value="clear-on-select" onChange={s.actions.setClearOnSelect} />
          </MenuSection>
        </ToolbarGroup>
        <ToolbarGroup title="Field" value="field">
          <MenuCheckboxControl checked={s.state.disabled} label="Disabled" value="disabled" onChange={s.actions.setDisabled} />
          <MenuCheckboxControl checked={s.state.readOnly} label="Read only" value="read-only" onChange={s.actions.setReadOnly} />
          <MenuCheckboxControl checked={s.state.required} label="Required" value="required" onChange={s.actions.setRequired} />
          <MenuCheckboxControl checked={s.state.invalid} label="Invalid" value="invalid" onChange={s.actions.setInvalid} />
        </ToolbarGroup>
        <ToolbarGroup title="Content" value="content">
          <MenuCheckboxControl checked={s.state.grouped} label="Grouped" value="grouped" onChange={s.actions.setGrouped} />
          <MenuCheckboxControl checked={s.state.charlieDisabled} label="Disable Charlie" value="disable-charlie" onChange={s.actions.setCharlieDisabled} />
          <MenuCheckboxControl checked={s.state.emptyOptions} label="Empty options" value="empty-options" onChange={s.actions.setEmptyOptions} />
          <MenuCheckboxControl checked={s.state.loading} label="Loading" value="loading" onChange={s.actions.setLoading} />
          <MenuCheckboxControl checked={s.state.disablePortal} label="Disable portal" value="disable-portal" onChange={s.actions.setDisablePortal} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Label" options={compositionOptions} value={s.state.labelComposition} onChange={(value) => s.actions.setLabelComposition(value as CompositionMode)} />
          <MenuRadioControl label="Input" options={compositionOptions} value={s.state.inputComposition} onChange={(value) => s.actions.setInputComposition(value as CompositionMode)} />
          <MenuRadioControl label="Clear" options={compositionOptions} value={s.state.clearComposition} onChange={(value) => s.actions.setClearComposition(value as CompositionMode)} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={s.state.propCheck}
          onPropCheckChange={s.actions.setPropCheck}
          customSlots={[
            { checked: s.state.customLabelSlot, label: "Label", value: "label-slot", onChange: s.actions.setCustomLabelSlot },
            { checked: s.state.customInputSlot, label: "Input", value: "input-slot", onChange: s.actions.setCustomInputSlot },
            { checked: s.state.customClearSlot, label: "Clear", value: "clear-slot", onChange: s.actions.setCustomClearSlot },
            { checked: s.state.customContentSlot, label: "Content", value: "content-slot", onChange: s.actions.setCustomContentSlot },
            { checked: s.state.customListboxSlot, label: "Listbox", value: "listbox-slot", onChange: s.actions.setCustomListboxSlot },
            { checked: s.state.customGroupSlot, label: "Group", value: "group-slot", onChange: s.actions.setCustomGroupSlot },
            { checked: s.state.customItemSlot, label: "Item", value: "item-slot", onChange: s.actions.setCustomItemSlot },
            { checked: s.state.customEmptySlot, label: "Empty", value: "empty-slot", onChange: s.actions.setCustomEmptySlot },
            { checked: s.state.customLoadingSlot, label: "Loading", value: "loading-slot", onChange: s.actions.setCustomLoadingSlot },
          ]}
        />
      </ControlToolbar>
    );
  }
  return null;
}

export function SelectionPrimitiveScenarioCanvas({ scenarioId, scenarios }: { scenarioId: string; scenarios: SelectionPrimitiveScenarios }) {
  if (scenarioId === "checkbox-group") return <CheckboxGroupCanvas scenario={scenarios.checkboxGroup} />;
  if (scenarioId === "slider") return <SliderCanvas scenario={scenarios.slider} />;
  if (scenarioId === "rating") return <RatingCanvas scenario={scenarios.rating} />;
  if (scenarioId === "listbox") return <ListboxCanvas scenario={scenarios.listbox} />;
  if (scenarioId === "combobox") return <ComboboxCanvas scenario={scenarios.combobox} />;
  return null;
}

function CheckboxGroupCanvas({ scenario }: { scenario: ReturnType<typeof useCheckboxGroupScenario> }) {
  const s = scenario.state;
  const props = { className: "playground-checkbox-group", disabled: s.disabled, invalid: s.invalid, orientation: s.orientation, readOnly: s.readOnly, required: s.required, name: "updates", ariaLabel: "Notification options", onValueChange: scenario.actions.handleValueChange, ...partProps("root", { propCheck: s.propCheck, customSlot: s.customRootSlot }, "checkbox-group-root-custom"), ...(s.controlled ? { value: s.value } : { defaultValue: s.value }) };
  const content = <><CheckboxGroupItem mode={s.composition} value="email" propCheck={s.propCheck} customSlot={s.customItemSlot}>Email updates</CheckboxGroupItem><CheckboxGroupItem mode={s.composition} value="sms" propCheck={s.propCheck} customSlot={s.customItemSlot}>SMS alerts</CheckboxGroupItem><CheckboxGroupItem disabled={s.pushDisabled} mode={s.composition} value="push" propCheck={s.propCheck} customSlot={s.customItemSlot}>Push digest</CheckboxGroupItem></>;
  return <CheckboxGroup.Root {...props}>{content}</CheckboxGroup.Root>;
}

function CheckboxGroupItem({ children, disabled, mode, value, propCheck, customSlot }: { children: ReactNode; disabled?: boolean; mode: CompositionMode; value: string; propCheck: boolean; customSlot: boolean }) {
  const className = "playground-checkbox-group-item";
  const props = { disabled, value, ...partProps(`item-${value}`, { propCheck, customSlot }, "checkbox-group-item-custom") };
  if (mode === "asChild") return <CheckboxGroup.Item asChild {...props}><button className={className} type="button"><span aria-hidden="true" className="playground-checkbox-box" />{children}</button></CheckboxGroup.Item>;
  if (mode === "render") return <CheckboxGroup.Item {...props} render={(renderProps) => <button {...renderProps} className={className} />}><span aria-hidden="true" className="playground-checkbox-box" />{children}</CheckboxGroup.Item>;
  return <CheckboxGroup.Item className={className} {...props}><span aria-hidden="true" className="playground-checkbox-box" />{children}</CheckboxGroup.Item>;
}

function SliderCanvas({ scenario }: { scenario: ReturnType<typeof useSliderScenario> }) {
  const s = scenario.state;
  const values = Array.isArray(s.value) ? s.value : [s.value];
  const sliderKey = `${s.controlled ? "controlled" : "uncontrolled"}-${s.range ? "range" : "single"}`;
  return <div className="playground-slider-stage"><Direction.Provider dir={s.direction}><Slider.Root key={sliderKey} className={`playground-slider ${s.orientation === "vertical" ? "is-vertical" : ""}`} disabled={s.disabled} min={0} max={100} step={s.step} largeStep={20} minStepsBetweenThumbs={2} name="volume" orientation={s.orientation} onValueChange={scenario.actions.handleValueChange} {...partProps("root", { propCheck: s.propCheck, customSlot: s.customRootSlot }, "slider-root-custom")} {...(s.controlled ? { value: s.value } : { defaultValue: s.value })}><Slider.Track className="playground-slider-track" {...partProps("track", { propCheck: s.propCheck, customSlot: s.customTrackSlot }, "slider-track-custom")}><Slider.Range className="playground-slider-range" {...partProps("range", { propCheck: s.propCheck, customSlot: s.customRangeSlot }, "slider-range-custom")} />{values.map((_, index) => <Slider.Thumb className="playground-slider-thumb" {...partProps(`thumb-${index}`, { propCheck: s.propCheck, customSlot: s.customThumbSlot }, "slider-thumb-custom")} index={index} key={index} />)}</Slider.Track></Slider.Root></Direction.Provider></div>;
}

function RatingCanvas({ scenario }: { scenario: ReturnType<typeof useRatingScenario> }) {
  const s = scenario.state;
  const rootProps = {
    "aria-label": "Rating",
    className: "playground-rating",
    disabled: s.disabled,
    invalid: s.invalid,
    name: "rating",
    readOnly: s.readOnly,
    required: s.required,
    step: s.step,
    onValueChange: scenario.actions.handleValueChange,
    ...partProps("root", { propCheck: s.propCheck, customSlot: s.customRootSlot }, "rating-root-custom"),
    ...(s.controlled ? { value: s.value } : { defaultValue: s.value }),
  };
  const items = [1, 2, 3, 4, 5].map((value) => (
    <RatingItemPart key={value} mode={s.itemComposition} propCheck={s.propCheck} customSlot={s.customItemSlot} currentValue={s.value} value={value} />
  ));

  return (
    <Direction.Provider dir={s.direction}>
      {s.rootComposition === "asChild" ? (
        <Rating.Root asChild {...rootProps}>
          <div>{items}</div>
        </Rating.Root>
      ) : s.rootComposition === "render" ? (
        <Rating.Root {...rootProps} render={(props) => <section {...props} />}>
          {items}
        </Rating.Root>
      ) : (
        <Rating.Root {...rootProps}>{items}</Rating.Root>
      )}
    </Direction.Provider>
  );
}

function RatingItemPart({
  currentValue,
  customSlot,
  mode,
  propCheck,
  value,
}: {
  currentValue: number;
  customSlot: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  value: number;
}) {
  const fill = getRatingItemFill(currentValue, value);
  const style = { "--rating-fill": `${fill}%` } as CSSProperties;
  const props = {
    className: "playground-rating-item",
    style,
    value,
    ...partProps(`item-${value}`, { propCheck, customSlot }, "rating-item-custom"),
  };

  if (mode === "asChild") {
    return (
      <Rating.Item asChild {...props}>
        <span>★</span>
      </Rating.Item>
    );
  }

  if (mode === "render") {
    return <Rating.Item {...props} render={(renderProps) => <i {...renderProps} />}>★</Rating.Item>;
  }

  return <Rating.Item {...props}>★</Rating.Item>;
}

function ListboxCanvas({ scenario }: { scenario: ReturnType<typeof useListboxScenario> }) {
  const s = scenario.state;
  const rootProps = {
    className: `playground-listbox ${s.orientation === "horizontal" ? "is-horizontal" : ""}`,
    disabled: s.disabled,
    invalid: s.invalid,
    loop: s.loop,
    multiple: s.multiple,
    name: "plan",
    orientation: s.orientation,
    readOnly: s.readOnly,
    required: s.required,
    onValueChange: scenario.actions.handleValueChange,
    ref: s.refs.setPartRef("root"),
    ...partProps("root", { propCheck: s.propCheck, customSlot: s.customRootSlot }, "listbox-root-custom"),
    ...(s.controlled ? { value: s.value } : { defaultValue: s.value }),
  };
  const content = (
    <ListboxGroupPart scenario={scenario}>
      <ListboxLabelPart scenario={scenario}>Plans</ListboxLabelPart>
      {planOptions.map((option) => (
        <ListboxOptionPart key={option.value} option={{ ...option, disabled: option.value === "team" ? s.teamDisabled : false }} scenario={scenario} />
      ))}
    </ListboxGroupPart>
  );

  if (s.rootComposition === "asChild") {
    return (
      <Listbox.Root asChild {...rootProps}>
        <section>{content}</section>
      </Listbox.Root>
    );
  }

  if (s.rootComposition === "render") {
    return <Listbox.Root {...rootProps} render={(props) => <section {...props} />}>{content}</Listbox.Root>;
  }

  return <Listbox.Root {...rootProps}>{content}</Listbox.Root>;
}

function ListboxGroupPart({ children, scenario }: { children: ReactNode; scenario: ReturnType<typeof useListboxScenario> }) {
  const s = scenario.state;
  const props = {
    className: "playground-listbox-group",
    ref: s.refs.setPartRef("group"),
    ...partProps("group", { propCheck: s.propCheck, customSlot: s.customGroupSlot }, "listbox-group-custom"),
  };

  if (s.groupComposition === "asChild") {
    return (
      <Listbox.Group asChild {...props}>
        <div>{children}</div>
      </Listbox.Group>
    );
  }

  if (s.groupComposition === "render") {
    return <Listbox.Group {...props} render={(renderProps) => <div {...renderProps} />}>{children}</Listbox.Group>;
  }

  return <Listbox.Group {...props}>{children}</Listbox.Group>;
}

function ListboxLabelPart({ children, scenario }: { children: ReactNode; scenario: ReturnType<typeof useListboxScenario> }) {
  const s = scenario.state;
  const props = {
    className: "playground-listbox-label",
    ref: s.refs.setPartRef("label"),
    ...partProps("label", { propCheck: s.propCheck, customSlot: s.customLabelSlot }, "listbox-label-custom"),
  };

  if (s.labelComposition === "asChild") {
    return (
      <Listbox.Label asChild {...props}>
        <div>{children}</div>
      </Listbox.Label>
    );
  }

  if (s.labelComposition === "render") {
    return <Listbox.Label {...props} render={(renderProps) => <div {...renderProps} />}>{children}</Listbox.Label>;
  }

  return <Listbox.Label {...props}>{children}</Listbox.Label>;
}

function ListboxOptionPart({ option, scenario }: { option: PlanOption; scenario: ReturnType<typeof useListboxScenario> }) {
  const s = scenario.state;
  const refKey =
    option.value === "team"
      ? "option-team"
      : option.disabled
        ? "option-disabled"
        : getSelectedValues(s.value).includes(option.value)
          ? "option-selected"
          : "option-highlighted";
  const props = {
    className: "playground-listbox-option",
    disabled: option.disabled,
    label: option.label,
    ref: s.refs.setPartRef(refKey),
    value: option.value,
    ...partProps(`option-${option.value}`, { propCheck: s.propCheck, customSlot: s.customOptionSlot }, "listbox-option-custom"),
  };
  const content = <ListboxOptionTextPart option={option} scenario={scenario} />;

  if (s.optionComposition === "asChild") {
    return (
      <Listbox.Option asChild {...props}>
        <div>{content}</div>
      </Listbox.Option>
    );
  }

  if (s.optionComposition === "render") {
    return <Listbox.Option {...props} render={(renderProps) => <div {...renderProps} />}>{content}</Listbox.Option>;
  }

  return <Listbox.Option {...props}>{content}</Listbox.Option>;
}

function ListboxOptionTextPart({ option, scenario }: { option: PlanOption; scenario: ReturnType<typeof useListboxScenario> }) {
  const s = scenario.state;
  const props = {
    ref: option.value === "pro" ? s.refs.setPartRef("option-text") : undefined,
    ...partProps(`option-text-${option.value}`, { propCheck: s.propCheck, customSlot: s.customOptionTextSlot }, "listbox-option-text-custom"),
  };

  if (s.optionTextComposition === "asChild") {
    return (
      <Listbox.OptionText asChild {...props}>
        <span>{option.label}</span>
      </Listbox.OptionText>
    );
  }

  if (s.optionTextComposition === "render") {
    return <Listbox.OptionText {...props} render={(renderProps) => <span {...renderProps} />}>{option.label}</Listbox.OptionText>;
  }

  return <Listbox.OptionText {...props}>{option.label}</Listbox.OptionText>;
}

function ComboboxCanvas({ scenario }: { scenario: ReturnType<typeof useComboboxScenario> }) {
  const s = scenario.state;
  const options = s.emptyOptions ? [] : comboboxOptions.map((option) => ({ ...option, disabled: option.value === "charlie" ? s.charlieDisabled : false }));
  const visibleOptions = getVisibleComboboxOptions(options, s.inputValue);
  const groupedOptions = s.grouped ? groupVisibleComboboxOptions(visibleOptions) : [{ label: "People", options: visibleOptions }];

  return (
    <Combobox.Root
      options={options}
      defaultValue="bravo"
      defaultInputValue="Bravo"
      value={s.controlledValue ? s.value : undefined}
      inputValue={s.controlledInput ? s.inputValue : undefined}
      open={s.controlledOpen ? s.open : undefined}
      loading={s.loading}
      disabled={s.disabled}
      readOnly={s.readOnly}
      required={s.required}
      invalid={s.invalid}
      freeSolo={s.freeSolo}
      clearOnSelect={s.clearOnSelect}
      openOnFocus={s.openOnFocus}
      name="assignee"
      onValueChange={scenario.actions.handleValueChange}
      onInputValueChange={scenario.actions.handleInputValueChange}
      onOpenChange={scenario.actions.handleOpenChange}
    >
      <div className="playground-combobox">
        <ComboboxLabelPart labelKey="assignee" scenario={scenario}>Assignee</ComboboxLabelPart>
        <div className="playground-combobox-row">
          <ComboboxInputPart scenario={scenario} />
          <ComboboxClearPart scenario={scenario}>Clear</ComboboxClearPart>
        </div>
        <Combobox.Portal disabled={s.disablePortal}>
          <Combobox.Content
            className="playground-combobox-content"
            ref={s.refs.setPartRef("content")}
            {...partProps("content", { propCheck: s.propCheck, customSlot: s.customContentSlot }, "combobox-content-custom")}
          >
            <Combobox.Listbox
              className="playground-combobox-listbox"
              ref={s.refs.setPartRef("listbox")}
              {...partProps("listbox", { propCheck: s.propCheck, customSlot: s.customListboxSlot }, "combobox-listbox-custom")}
            >
              {s.loading ? (
                <Combobox.Loading
                  className="playground-combobox-message"
                  ref={s.refs.setPartRef("loading")}
                  {...partProps("loading", { propCheck: s.propCheck, customSlot: s.customLoadingSlot }, "combobox-loading-custom")}
                />
              ) : null}
              {groupedOptions.map((group) => (
                <Combobox.Group
                  aria-label={s.grouped ? undefined : "People"}
                  className="playground-combobox-group"
                  key={group.label}
                  ref={s.refs.setPartRef("group")}
                  {...partProps("group", { propCheck: s.propCheck, customSlot: s.customGroupSlot }, "combobox-group-custom")}
                >
                  {s.grouped ? <ComboboxLabelPart group labelKey={comboboxLabelKey(group.label)} scenario={scenario}>{group.label}</ComboboxLabelPart> : null}
                  {group.options.map((option) => (
                    <Combobox.Item
                      className="playground-combobox-item"
                      disabled={option.disabled}
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      ref={s.refs.setPartRef(comboboxItemPart(option.value))}
                      {...partProps("item", { propCheck: s.propCheck, customSlot: s.customItemSlot }, "combobox-item-custom")}
                    >
                      {option.label}
                    </Combobox.Item>
                  ))}
                </Combobox.Group>
              ))}
              <Combobox.Empty
                className="playground-combobox-message"
                ref={s.refs.setPartRef("empty")}
                {...partProps("empty", { propCheck: s.propCheck, customSlot: s.customEmptySlot }, "combobox-empty-custom")}
              />
            </Combobox.Listbox>
          </Combobox.Content>
        </Combobox.Portal>
      </div>
    </Combobox.Root>
  );
}

function comboboxLabelKey(label: string) {
  return label === "Recent" ? "recent" : "teams";
}

function comboboxItemPart(value: string) {
  return `item-${value}` as "item-alpha" | "item-bravo" | "item-charlie" | "item-delta";
}

function ComboboxLabelPart({ children, group = false, labelKey, scenario }: { children: ReactNode; group?: boolean; labelKey: "assignee" | "recent" | "teams"; scenario: ReturnType<typeof useComboboxScenario> }) {
  const s = scenario.state;
  const ref = s.refs.setPartRef(`label-${labelKey}` as "label-assignee" | "label-recent" | "label-teams");
  const props = {
    className: group ? "playground-combobox-group-label" : "playground-combobox-label",
    "data-playground-combobox-label": labelKey,
    ref,
    ...partProps("label", { propCheck: s.propCheck, customSlot: s.customLabelSlot }, "combobox-label-custom"),
  };
  const mode = s.labelComposition;

  if (mode === "asChild") {
    const Tag = group ? "div" : "label";
    return (
      <Combobox.Label asChild {...props}>
        <Tag>{children}</Tag>
      </Combobox.Label>
    );
  }

  if (mode === "render") {
    return <Combobox.Label {...props} render={(renderProps) => group ? <div {...renderProps} /> : <label {...renderProps} />}>{children}</Combobox.Label>;
  }

  return <Combobox.Label {...props}>{children}</Combobox.Label>;
}

function ComboboxInputPart({ scenario }: { scenario: ReturnType<typeof useComboboxScenario> }) {
  const s = scenario.state;
  const props = {
    className: "playground-combobox-input",
    ref: s.refs.setPartRef("input"),
    ...partProps("input", { propCheck: s.propCheck, customSlot: s.customInputSlot }, "combobox-input-custom"),
  };

  if (s.inputComposition === "asChild") {
    return (
      <Combobox.Input asChild {...props}>
        <input />
      </Combobox.Input>
    );
  }

  if (s.inputComposition === "render") {
    return <Combobox.Input {...props} render={(renderProps) => <input {...renderProps} />} />;
  }

  return <Combobox.Input {...props} />;
}

function ComboboxClearPart({ children, scenario }: { children: ReactNode; scenario: ReturnType<typeof useComboboxScenario> }) {
  const s = scenario.state;
  const props = {
    className: "atom-button secondary",
    ref: s.refs.setPartRef("clear"),
    ...partProps("clear", { propCheck: s.propCheck, customSlot: s.customClearSlot }, "combobox-clear-custom"),
  };

  if (s.clearComposition === "asChild") {
    return (
      <Combobox.Clear asChild {...props}>
        <button type="button">{children}</button>
      </Combobox.Clear>
    );
  }

  if (s.clearComposition === "render") {
    return <Combobox.Clear {...props} render={(renderProps) => <button {...renderProps} />}>{children}</Combobox.Clear>;
  }

  return <Combobox.Clear {...props}>{children}</Combobox.Clear>;
}

function getVisibleComboboxOptions(options: typeof comboboxOptions, inputValue: string) {
  const normalized = inputValue.trim().toLowerCase();
  if (!normalized) return options;
  return options.filter((option) => option.label.toLowerCase().includes(normalized));
}

function groupVisibleComboboxOptions(options: typeof comboboxOptions) {
  return [
    { label: "Recent", options: options.filter((option) => option.value === "alpha" || option.value === "bravo") },
    { label: "Teams", options: options.filter((option) => option.value === "charlie" || option.value === "delta") },
  ].filter((group) => group.options.length > 0);
}

export function SelectionPrimitiveScenarioAnatomy({ scenarioId, scenarios, openGroups, onOpenGroupsChange }: { scenarioId: string; scenarios: SelectionPrimitiveScenarios; openGroups: Record<string, boolean>; onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>> }) {
  const sections = getSections(scenarioId, scenarios);
  return <AnatomyPanel footer={`${sections.length} parts`} openGroups={openGroups} sections={sections} onOpenGroupsChange={onOpenGroupsChange} />;
}

export function SelectionPrimitiveScenarioLog({ scenarioId, scenarios }: { scenarioId: string; scenarios: SelectionPrimitiveScenarios }) {
  return <ScenarioEventLog log={getLog(scenarioId, scenarios)} />;
}

export function getSelectionPrimitiveEventCount(scenarioId: string, scenarios: SelectionPrimitiveScenarios) {
  return getLog(scenarioId, scenarios).length;
}

export function clearSelectionPrimitiveLog(scenarioId: string, scenarios: SelectionPrimitiveScenarios) {
  const scenario = getScenario(scenarioId, scenarios);
  scenario?.actions.clearLog();
}

export function getSelectionPrimitiveCanvasFooter(scenarioId: string, scenarios: SelectionPrimitiveScenarios) {
  if (scenarioId === "checkbox-group") return `Value ${scenarios.checkboxGroup.state.value.join(", ") || "none"}`;
  if (scenarioId === "slider") return `Value ${Array.isArray(scenarios.slider.state.value) ? scenarios.slider.state.value.join(", ") : scenarios.slider.state.value}`;
  if (scenarioId === "rating") return `Value ${scenarios.rating.state.value}`;
  if (scenarioId === "listbox") return `Value ${Array.isArray(scenarios.listbox.state.value) ? scenarios.listbox.state.value.join(", ") : scenarios.listbox.state.value ?? "none"}`;
  if (scenarioId === "combobox") return `Value ${scenarios.combobox.state.value ?? "none"} | Input ${scenarios.combobox.state.inputValue || "empty"}`;
  return "";
}

export function getSelectionPrimitiveSource(scenarioId: string, scenarios?: SelectionPrimitiveScenarios) {
  if (scenarioId === "checkbox-group" && scenarios) return getCheckboxGroupSource(scenarios.checkboxGroup.state);
  if (scenarioId === "slider" && scenarios) return getSliderSource(scenarios.slider.state);
  if (scenarioId === "rating" && scenarios) return getRatingSource(scenarios.rating.state);
  if (scenarioId === "listbox" && scenarios) return getListboxSource(scenarios.listbox.state);
  if (scenarioId === "combobox" && scenarios) return getComboboxSource(scenarios.combobox.state);
  const name = scenarioLabel(scenarioId);
  return `// ${name} playground scenario
// The live source panel is intentionally compact for this batch.
// Use Anatomy and Inspector to verify the generated ARIA, data, and native attributes.`;
}

function getCheckboxGroupSource(state: ReturnType<typeof useCheckboxGroupScenario>["state"]) {
  const rootProps = [
    state.controlled ? `value={${JSON.stringify(state.value)}}` : `defaultValue={${JSON.stringify(state.value)}}`,
    state.disabled ? "disabled" : null,
    state.readOnly ? "readOnly" : null,
    state.required ? "required" : null,
    state.invalid ? "invalid" : null,
    state.orientation !== "vertical" ? `orientation="${state.orientation}"` : null,
    `name="updates"`,
    `ariaLabel="Notification options"`,
    sourcePartProps("root", state.propCheck, state.customRootSlot, "checkbox-group-root-custom").trim(),
    "onValueChange={setValue}",
  ].filter(Boolean).join("\n  ");
  const itemProps = (value: string) => sourcePartProps(`item-${value}`, state.propCheck, state.customItemSlot, "checkbox-group-item-custom");
  const itemOpen = (value: string) => state.composition === "asChild"
    ? `<CheckboxGroup.Item value="${value}" asChild${value === "push" && state.pushDisabled ? " disabled" : ""}${itemProps(value)}><button type="button">`
    : state.composition === "render"
      ? `<CheckboxGroup.Item value="${value}"${value === "push" && state.pushDisabled ? " disabled" : ""}${itemProps(value)} render={(props) => <button {...props} type="button" />}>`
      : `<CheckboxGroup.Item value="${value}"${value === "push" && state.pushDisabled ? " disabled" : ""}${itemProps(value)}>`;
  const itemClose = state.composition === "asChild" ? "</button></CheckboxGroup.Item>" : "</CheckboxGroup.Item>";

  return `<CheckboxGroup.Root
  ${rootProps}
>
  ${itemOpen("email")}Email updates${itemClose}
  ${itemOpen("sms")}SMS alerts${itemClose}
  ${itemOpen("push")}Push digest${itemClose}
</CheckboxGroup.Root>`;
}

function getSliderSource(state: ReturnType<typeof useSliderScenario>["state"]) {
  const rootProps = [
    state.controlled ? `value={${JSON.stringify(state.value)}}` : `defaultValue={${JSON.stringify(state.value)}}`,
    state.disabled ? "disabled" : null,
    state.orientation !== "horizontal" ? `orientation="${state.orientation}"` : null,
    `min={0}`,
    `max={100}`,
    `step={${state.step}}`,
    `largeStep={20}`,
    `minStepsBetweenThumbs={2}`,
    `name="volume"`,
    sourcePartProps("root", state.propCheck, state.customRootSlot, "slider-root-custom").trim(),
    "onValueChange={setValue}",
  ].filter(Boolean).join("\n  ");
  const trackProps = sourcePartProps("track", state.propCheck, state.customTrackSlot, "slider-track-custom");
  const rangeProps = sourcePartProps("range", state.propCheck, state.customRangeSlot, "slider-range-custom");
  const thumbProps = sourcePartProps("thumb", state.propCheck, state.customThumbSlot, "slider-thumb-custom");
  const thumbs = Array.isArray(state.value)
    ? `<Slider.Thumb index={0}${thumbProps} />
    <Slider.Thumb index={1}${thumbProps} />`
    : `<Slider.Thumb index={0}${thumbProps} />`;
  const source = `<Slider.Root
  ${rootProps}
>
  <Slider.Track${trackProps}>
    <Slider.Range${rangeProps} />
    ${thumbs}
  </Slider.Track>
</Slider.Root>`;

  return state.direction === "rtl" ? `<Direction.Provider dir="rtl">\n${source}\n</Direction.Provider>` : source;
}

function getRatingSource(state: ReturnType<typeof useRatingScenario>["state"]) {
  const rootProps = [
    `aria-label="Rating"`,
    state.controlled ? `value={${state.value}}` : `defaultValue={${state.value}}`,
    state.disabled ? "disabled" : null,
    state.readOnly ? "readOnly" : null,
    state.required ? "required" : null,
    state.invalid ? "invalid" : null,
    `step={${state.step}}`,
    `name="rating"`,
    sourcePartProps("root", state.propCheck, state.customRootSlot, "rating-root-custom").trim(),
    "onValueChange={setValue}",
  ].filter(Boolean).join("\n  ");
  const itemProps = sourcePartProps("item", state.propCheck, state.customItemSlot, "rating-item-custom");
  const items = `  {[1, 2, 3, 4, 5].map((value) => (
    ${renderRatingSourcePart(state.itemComposition, itemProps)}
  ))}`;
  const source = renderRatingRootSource(state.rootComposition, rootProps, items);

  return state.direction === "rtl" ? `<Direction.Provider dir="rtl">\n${source}\n</Direction.Provider>` : source;
}

function renderRatingRootSource(mode: CompositionMode, props: string, children: string) {
  if (mode === "asChild") {
    return `<Rating.Root
  asChild
  ${props}
>
  <div>
${children}
  </div>
</Rating.Root>`;
  }

  if (mode === "render") {
    return `<Rating.Root
  ${props}
  render={(props) => <section {...props} />}
>
${children}
</Rating.Root>`;
  }

  return `<Rating.Root
  ${props}
>
${children}
</Rating.Root>`;
}

function renderRatingSourcePart(mode: CompositionMode, props: string) {
  if (mode === "asChild") {
    return `<Rating.Item asChild key={value} value={value}${props}>
      <span>★</span>
    </Rating.Item>`;
  }

  if (mode === "render") {
    return `<Rating.Item key={value} value={value}${props} render={(props) => <em {...props} />}>
      ★
    </Rating.Item>`;
  }

  return `<Rating.Item key={value} value={value}${props}>★</Rating.Item>`;
}

function getListboxSource(state: ReturnType<typeof useListboxScenario>["state"]) {
  const rootProps = [
    state.controlled ? `value={${JSON.stringify(state.value)}}` : `defaultValue={${JSON.stringify(state.value)}}`,
    state.multiple ? "multiple" : null,
    state.disabled ? "disabled" : null,
    state.readOnly ? "readOnly" : null,
    state.required ? "required" : null,
    state.invalid ? "invalid" : null,
    state.orientation !== "vertical" ? `orientation="${state.orientation}"` : null,
    !state.loop ? "loop={false}" : null,
    `name="plan"`,
    sourcePartProps("root", state.propCheck, state.customRootSlot, "listbox-root-custom").trim(),
  ].filter(Boolean).join("\n  ");
  const groupProps = sourcePartProps("group", state.propCheck, state.customGroupSlot, "listbox-group-custom");
  const labelProps = sourcePartProps("label", state.propCheck, state.customLabelSlot, "listbox-label-custom");
  const optionProps = sourcePartProps("option-pro", state.propCheck, state.customOptionSlot, "listbox-option-custom");
  const optionTextProps = sourcePartProps("option-text-pro", state.propCheck, state.customOptionTextSlot, "listbox-option-text-custom");
  const label = renderListboxSourcePart("Label", state.labelComposition, labelProps, "div", "Plans");
  const optionText = renderListboxSourcePart("OptionText", state.optionTextComposition, optionTextProps, "span", "Pro");
  const option = renderListboxSourcePart("Option", state.optionComposition, ` value="pro" label="Pro"${optionProps}`, "div", `\n      ${optionText}\n    `);
  const disabledOption = state.teamDisabled ? `<Listbox.Option value="team" label="Team" disabled>
      <Listbox.OptionText>Team</Listbox.OptionText>
    </Listbox.Option>` : `<Listbox.Option value="team" label="Team">
      <Listbox.OptionText>Team</Listbox.OptionText>
    </Listbox.Option>`;
  const group = renderListboxSourcePart("Group", state.groupComposition, groupProps, "div", `\n    ${label}\n    ${option}\n    ${disabledOption}\n  `);
  const rootContent = `\n  ${group}\n`;

  if (state.rootComposition === "asChild") {
    return `<Listbox.Root
  asChild
  ${rootProps}
>
  <section>${rootContent}  </section>
</Listbox.Root>`;
  }

  if (state.rootComposition === "render") {
    return `<Listbox.Root
  ${rootProps}
  render={(props) => <section {...props} />}
>${rootContent}</Listbox.Root>`;
  }

  return `<Listbox.Root
  ${rootProps}
>${rootContent}</Listbox.Root>`;
}

function renderListboxSourcePart(part: "Group" | "Label" | "Option" | "OptionText", mode: CompositionMode, props: string, tag: "div" | "span", children: string) {
  if (mode === "asChild") {
    return `<Listbox.${part} asChild${props}>
      <${tag}>${children}</${tag}>
    </Listbox.${part}>`;
  }

  if (mode === "render") {
    return `<Listbox.${part}${props} render={(props) => <${tag} {...props} />}>${children}</Listbox.${part}>`;
  }

  return `<Listbox.${part}${props}>${children}</Listbox.${part}>`;
}

function getComboboxSource(state: ReturnType<typeof useComboboxScenario>["state"]) {
  const rootProps = [
    "options={options}",
    state.controlledValue ? `value="${state.value ?? ""}"` : `defaultValue="bravo"`,
    state.controlledInput ? `inputValue="${state.inputValue}"` : `defaultInputValue="Bravo"`,
    state.controlledOpen ? `open={${state.open}}` : null,
    state.loading ? "loading" : null,
    state.disabled ? "disabled" : null,
    state.readOnly ? "readOnly" : null,
    state.required ? "required" : null,
    state.invalid ? "invalid" : null,
    state.freeSolo ? "freeSolo" : null,
    state.clearOnSelect ? "clearOnSelect" : null,
    !state.openOnFocus ? "openOnFocus={false}" : null,
    `name="assignee"`,
  ].filter(Boolean).join("\n  ");
  const labelProps = sourcePartProps("label", state.propCheck, state.customLabelSlot, "combobox-label-custom");
  const inputProps = sourcePartProps("input", state.propCheck, state.customInputSlot, "combobox-input-custom");
  const clearProps = sourcePartProps("clear", state.propCheck, state.customClearSlot, "combobox-clear-custom");
  const contentProps = sourcePartProps("content", state.propCheck, state.customContentSlot, "combobox-content-custom");
  const listboxProps = sourcePartProps("listbox", state.propCheck, state.customListboxSlot, "combobox-listbox-custom");
  const groupProps = sourcePartProps("group", state.propCheck, state.customGroupSlot, "combobox-group-custom");
  const itemProps = sourcePartProps("item", state.propCheck, state.customItemSlot, "combobox-item-custom");
  const emptyProps = sourcePartProps("empty", state.propCheck, state.customEmptySlot, "combobox-empty-custom");
  const loadingProps = sourcePartProps("loading", state.propCheck, state.customLoadingSlot, "combobox-loading-custom");
  const label = renderComboboxSourcePart("Label", state.labelComposition, labelProps, "label", "Assignee");
  const input = renderComboboxSourcePart("Input", state.inputComposition, inputProps, "input");
  const clear = renderComboboxSourcePart("Clear", state.clearComposition, clearProps, "button", "Clear");
  const groupLabel = renderComboboxSourcePart("Label", state.labelComposition, labelProps, "div", "Recent");

  return `<Combobox.Root
  ${rootProps}
>
  ${label}
  ${input}
  ${clear}
  <Combobox.Portal${state.disablePortal ? " disabled" : ""}>
    <Combobox.Content${contentProps}>
      <Combobox.Listbox${listboxProps}>
        ${state.loading ? `<Combobox.Loading${loadingProps} />` : ""}
        <Combobox.Group${state.grouped ? groupProps : `${groupProps} aria-label="People"`}>
          ${state.grouped ? groupLabel : ""}
          {options.map((option) => (
            <Combobox.Item
              key={option.value}
              value={option.value}
              label={option.label}
              disabled={option.disabled}
              ${itemProps.trim()}
            >
              {option.label}
            </Combobox.Item>
          ))}
        </Combobox.Group>
        <Combobox.Empty${emptyProps} />
      </Combobox.Listbox>
    </Combobox.Content>
  </Combobox.Portal>
	</Combobox.Root>`;
}

function renderComboboxSourcePart(part: "Label" | "Input" | "Clear", mode: CompositionMode, props: string, tag: "label" | "div" | "input" | "button", children = "") {
  const child = tag === "input" ? `<input />` : `<${tag}${tag === "button" ? ' type="button"' : ""}>${children}</${tag}>`;

  if (mode === "asChild") {
    return `<Combobox.${part} asChild${props}>
    ${child}
  </Combobox.${part}>`;
  }

  if (mode === "render") {
    return `<Combobox.${part}${props} render={(props) => ${tag === "input" ? "<input {...props} />" : `<${tag} {...props} />`}}>${children}</Combobox.${part}>`;
  }

  return tag === "input"
    ? `<Combobox.${part}${props} />`
    : `<Combobox.${part}${props}>${children}</Combobox.${part}>`;
}

function getSections(scenarioId: string, scenarios: SelectionPrimitiveScenarios): AnatomySection[] {
  if (scenarioId === "checkbox-group") return checkboxGroupSections(scenarios.checkboxGroup.state);
  if (scenarioId === "slider") return sliderSections(scenarios.slider.state);
  if (scenarioId === "rating") return ratingSections(scenarios.rating.state);
  if (scenarioId === "listbox") return listboxSections(scenarios.listbox.state);
  if (scenarioId === "combobox") return comboboxSections(scenarios.combobox.state);
  return [];
}

function checkboxGroupSections(state: ReturnType<typeof useCheckboxGroupScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.value.join(", ") || "none", slotSelector("checkbox-group", "checkbox-group-root-custom"), [
      row("Controlled", bool(state.controlled), "state"),
      row("Disabled", bool(state.disabled), "state"),
      row("Invalid", bool(state.invalid), "state"),
      row("Read only", bool(state.readOnly), "state"),
      row("Required", bool(state.required), "state"),
      row("Orientation", state.orientation, "state"),
      row("Composition", state.composition, "composition"),
    ]),
    checkboxGroupItemSection("Item: Email", "email", state),
    checkboxGroupItemSection("Item: SMS", "sms", state),
    checkboxGroupItemSection("Item: Push", "push", state, state.pushDisabled),
    baseSection("Hidden Input", "generated", "input[name='updates']"),
  ];
}

function checkboxGroupItemSection(title: string, value: string, state: ReturnType<typeof useCheckboxGroupScenario>["state"], disabled = false) {
  return baseSection(title, state.value.includes(value) ? "checked" : "unchecked", slotSelector("checkbox-group-item", "checkbox-group-item-custom", undefined, `[data-value='${value}']`), [
    row("Value", value, "state"),
    row("Checked", bool(state.value.includes(value)), "state"),
    row("Disabled", bool(disabled), "state"),
    row("Composition", state.composition, "composition"),
  ]);
}

function sliderSections(state: ReturnType<typeof useSliderScenario>["state"]): AnatomySection[] {
  const hiddenInputs = Array.isArray(state.value)
    ? [
        baseSection("Hidden Input: Min", String(state.value[0]), "input[name='volume[0]']", [row("Value", String(state.value[0]), "state")]),
        baseSection("Hidden Input: Max", String(state.value[1]), "input[name='volume[1]']", [row("Value", String(state.value[1]), "state")]),
      ]
    : [baseSection("Hidden Input", String(state.value), "input[name='volume']", [row("Value", String(state.value), "state")])];
  return [baseSection("Root", Array.isArray(state.value) ? "range" : "single", slotSelector("slider", "slider-root-custom"), [row("Controlled", bool(state.controlled), "state"), row("Orientation", state.orientation, "state"), row("Direction", state.direction, "state"), row("Step", String(state.step), "state")]), baseSection("Track", "track", slotSelector("slider-track", "slider-track-custom")), baseSection("Range", "range", slotSelector("slider-range", "slider-range-custom")), baseSection("Thumb", "thumb", slotSelector("slider-thumb", "slider-thumb-custom")), ...hiddenInputs];
}

function ratingSections(state: ReturnType<typeof useRatingScenario>["state"]): AnatomySection[] {
  const itemSections = [1, 2, 3, 4, 5].map((value) => {
    const fill = getRatingItemFill(state.value, value);
    const dataState = fill >= 100 ? "full" : fill <= 0 ? "empty" : "partial";
    return baseSection(`Item: ${value}`, dataState, slotSelector("rating-item", "rating-item-custom", undefined, `[data-value='${value}']`), [
      row("Value", String(value), "state"),
      row("Fill", `${Number.parseFloat(fill.toFixed(3))}%`, "state"),
      row("State", dataState, "state"),
      row("Mode", state.itemComposition, "composition"),
    ]);
  });

  return [
    baseSection("Root", String(state.value), slotSelector("rating", "rating-root-custom"), [
      row("Value", String(state.value), "state"),
      row("Controlled", bool(state.controlled), "state"),
      row("Direction", state.direction, "state"),
      row("Step", String(state.step), "state"),
      row("Mode", state.rootComposition, "composition"),
    ]),
    ...itemSections,
    baseSection("Hidden Input", String(state.value), "input[name='rating']", [
      row("Value", String(state.value), "state"),
    ]),
  ];
}

function listboxSections(state: ReturnType<typeof useListboxScenario>["state"]): AnatomySection[] {
  const selectedValues = getSelectedValues(state.value);
  return [
    baseSection("Root", state.multiple ? "multiple" : "single", slotSelector("listbox", "listbox-root-custom"), [
      row("Value", selectedValues.join(", ") || "none", "state"),
      row("Controlled", bool(state.controlled), "state"),
      row("Multiple", bool(state.multiple), "state"),
      row("Disabled", bool(state.disabled), "state"),
      row("Read only", bool(state.readOnly), "state"),
      row("Required", bool(state.required), "state"),
      row("Invalid", bool(state.invalid), "state"),
      row("Team disabled", bool(state.teamDisabled), "state"),
      row("Orientation", state.orientation, "state"),
      row("Loop", bool(state.loop), "behavior"),
      row("Mode", state.rootComposition, "composition"),
      refRow(state.refs.refs.current.root),
    ]),
    baseSection("Group", "group", slotSelector("listbox-group", "listbox-group-custom"), [
      row("Mode", state.groupComposition, "composition"),
      refRow(state.refs.refs.current.group),
    ]),
    baseSection("Label", "Plans", slotSelector("listbox-label", "listbox-label-custom"), [
      row("Text", "Plans", "identity"),
      row("Mode", state.labelComposition, "composition"),
      refRow(state.refs.refs.current.label),
    ]),
    baseSection("Option: Selected", selectedValues.join(", ") || "none", slotSelector("listbox-option", "listbox-option-custom", undefined, "[data-state='checked']"), [
      row("Value", selectedValues.join(", ") || "none", "state"),
      row("Mode", state.optionComposition, "composition"),
      refRow(state.refs.refs.current["option-selected"]),
    ]),
    baseSection("Option: Highlighted", "live", slotSelector("listbox-option", "listbox-option-custom", undefined, "[data-highlighted]"), [
      row("Mode", state.optionComposition, "composition"),
      refRow(state.refs.refs.current["option-highlighted"]),
    ]),
    baseSection("Option: Team", state.teamDisabled ? "disabled" : "enabled", slotSelector("listbox-option", "listbox-option-custom", undefined, "[data-value='team']"), [
      row("Value", "team", "state"),
      row("Disabled", bool(state.teamDisabled), "state"),
      row("Mode", state.optionComposition, "composition"),
      refRow(state.refs.refs.current["option-team"]),
    ]),
    baseSection("Option Text", "Pro", slotSelector("listbox-option-text", "listbox-option-text-custom"), [
      row("Text", "Pro", "identity"),
      row("Mode", state.optionTextComposition, "composition"),
      refRow(state.refs.refs.current["option-text"]),
    ]),
    baseSection("Hidden Input", selectedValues.join(", ") || "empty", "input[type='hidden'][name='plan']", [
      row("Value", selectedValues.join(", ") || "empty", "state"),
    ]),
  ];
}

function comboboxSections(state: ReturnType<typeof useComboboxScenario>["state"]): AnatomySection[] {
  const allOptions = comboboxOptions.map((option) => ({ ...option, disabled: option.value === "charlie" ? state.charlieDisabled : false }));
  const options = state.emptyOptions ? [] : allOptions;
  const visibleOptions = getVisibleComboboxOptions(options, state.inputValue);
  const groupedOptions = state.grouped ? groupVisibleComboboxOptions(visibleOptions) : [{ label: "People", options: visibleOptions }];
  const visibleGroupLabels = new Set(groupedOptions.map((group) => comboboxLabelKey(group.label)));
  const itemSectionsByValue = new Map(allOptions.map((option) => {
    const ref = state.refs.refs.current[comboboxItemPart(option.value)];
    const visible = state.open && visibleOptions.some((item) => item.value === option.value);
    const selected = state.value === option.value;
    const highlighted = Boolean(ref?.hasAttribute("data-highlighted"));
    const summary = !visible ? "not rendered" : option.disabled ? "disabled" : selected ? "selected" : highlighted ? "highlighted" : "available";

    return [option.value, baseSection(`Item: ${option.label}`, summary, slotSelector("combobox-item", "combobox-item-custom", undefined, `[data-value='${option.value}']`), [
      row("Label", option.label, "identity"),
      row("Value", option.value, "state"),
      row("Selected", bool(selected), "state"),
      row("Highlighted", bool(highlighted), "state"),
      row("Disabled", bool(Boolean(option.disabled)), "state"),
      refRow(ref),
    ], !visible)] as const;
  }));
  const itemSection = (value: string) => itemSectionsByValue.get(value);
  const renderedItemSections = (values: string[]) =>
    values.map(itemSection).filter((section): section is AnatomySection => Boolean(section));

  return [
    baseSection("Root", state.value ?? "none", undefined, [
      row("Value", state.value ?? "none", "state"),
      row("Input", state.inputValue || "empty", "state"),
      row("Open", bool(state.open), "state"),
      row("Controlled value", bool(state.controlledValue), "state"),
      row("Controlled input", bool(state.controlledInput), "state"),
      row("Controlled open", bool(state.controlledOpen), "state"),
      row("Disabled", bool(state.disabled), "state"),
      row("Read only", bool(state.readOnly), "state"),
      row("Required", bool(state.required), "state"),
      row("Invalid", bool(state.invalid), "state"),
      row("Free solo", bool(state.freeSolo), "behavior"),
      row("Clear on select", bool(state.clearOnSelect), "behavior"),
      row("Open on focus", bool(state.openOnFocus), "behavior"),
      row("Loading", bool(state.loading), "state"),
      row("Charlie disabled", bool(state.charlieDisabled), "state"),
    ]),
    baseSection("Label: Assignee", "Assignee", comboboxLabelSelector("assignee", "label"), [
      row("Text", "Assignee", "identity"),
      row("Mode", state.labelComposition, "composition"),
      refRow(state.refs.refs.current["label-assignee"]),
    ]),
    baseSection("Input", state.open ? "open" : "closed", slotSelector("combobox-input", "combobox-input-custom"), [
      row("Value", state.inputValue || "empty", "state"),
      row("Mode", state.inputComposition, "composition"),
      refRow(state.refs.refs.current.input),
    ]),
    baseSection("Clear", state.value ? "visible" : "hidden", slotSelector("combobox-clear", "combobox-clear-custom"), [
      row("Mode", state.clearComposition, "composition"),
      refRow(state.refs.refs.current.clear),
    ]),
    baseSection("Portal", state.disablePortal ? "inline" : "body", undefined, [
      row("Disabled", bool(state.disablePortal), "state"),
      row("Parent", state.disablePortal ? "inline" : "body", "identity"),
      row("Content exists", bool(state.open), "presence"),
    ]),
    baseSection("Content", state.open ? "open" : "not rendered", slotSelector("combobox-content", "combobox-content-custom"), [
      refRow(state.refs.refs.current.content),
    ], !state.open),
    baseSection("Listbox", state.open ? "open" : "not rendered", slotSelector("combobox-listbox", "combobox-listbox-custom"), [
      refRow(state.refs.refs.current.listbox),
    ], !state.open),
    baseSection("Group", state.open && state.grouped ? "grouped" : state.open ? "single group" : "not rendered", slotSelector("combobox-group", "combobox-group-custom"), [
      row("Grouped", bool(state.grouped), "state"),
      refRow(state.refs.refs.current.group),
    ], !state.open),
    baseSection("Label: Recent", state.open && state.grouped && visibleGroupLabels.has("recent") ? "visible" : "not rendered", comboboxLabelSelector("recent", "div"), [
      row("Text", "Recent", "identity"),
      row("Mode", state.labelComposition, "composition"),
      refRow(state.refs.refs.current["label-recent"]),
    ], !state.open || !state.grouped || !visibleGroupLabels.has("recent")),
    ...renderedItemSections(["alpha", "bravo"]),
    baseSection("Label: Teams", state.open && state.grouped && visibleGroupLabels.has("teams") ? "visible" : "not rendered", comboboxLabelSelector("teams", "div"), [
      row("Text", "Teams", "identity"),
      row("Mode", state.labelComposition, "composition"),
      refRow(state.refs.refs.current["label-teams"]),
    ], !state.open || !state.grouped || !visibleGroupLabels.has("teams")),
    ...renderedItemSections(["charlie", "delta"]),
    baseSection("Empty", state.open && state.emptyOptions && !state.loading ? "visible" : "not rendered", slotSelector("combobox-empty", "combobox-empty-custom"), [
      row("Text", "No options", "identity"),
      refRow(state.refs.refs.current.empty),
    ], !state.open || !state.emptyOptions || state.loading),
    baseSection("Loading", state.open && state.loading ? "visible" : "not rendered", slotSelector("combobox-loading", "combobox-loading-custom"), [
      row("Text", "Loading", "identity"),
      refRow(state.refs.refs.current.loading),
    ], !state.open || !state.loading),
    baseSection("Hidden Input", state.value ?? "empty", "input[type='hidden'][name='assignee']", [
      row("Value", state.value ?? "empty", "state"),
    ]),
  ];
}

function comboboxLabelSelector(labelKey: "assignee" | "recent" | "teams", tag: "label" | "div") {
  return slotSelector("combobox-label", "combobox-label-custom", tag, `[data-playground-combobox-label='${labelKey}']`);
}

function baseSection(title: string, summary: string, selector?: string, rows = [row("Exists", "true", "presence")], inactive = false): AnatomySection {
  return { title, summary, selector, rows, inactive };
}

function row(label: string, value: string, category: AnatomyRowCategory) {
  return { label, value, category };
}

function refRow(element: HTMLElement | null | undefined) {
  return row("Ref target", element ? element.tagName.toLowerCase() : "not rendered", "identity");
}

function slotSelector(defaultSlot: string, customSlot: string, tag?: string, suffix = "") {
  const prefix = tag ? `${tag}` : "";
  return `${prefix}[data-slot='${defaultSlot}']${suffix},${prefix}[data-slot='${customSlot}']${suffix}`;
}

function sourcePartProps(part: string, propCheck: boolean, customSlot: boolean, slot: string) {
  const props = [
    propCheck ? `data-prop-check="${part}"` : null,
    customSlot ? `data-slot="${slot}"` : null,
  ].filter(Boolean);

  return props.length ? ` ${props.join(" ")}` : "";
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

function getRatingItemFill(currentValue: number, itemValue: number) {
  const lowerBound = Math.max(0, itemValue - 1);
  if (itemValue <= lowerBound) return currentValue >= itemValue ? 100 : 0;
  const rawFill = ((currentValue - lowerBound) / (itemValue - lowerBound)) * 100;
  return Math.min(Math.max(rawFill, 0), 100);
}

function getSelectedValues(value: string | string[] | null) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function getScenario(scenarioId: string, scenarios: SelectionPrimitiveScenarios) {
  if (scenarioId === "checkbox-group") return scenarios.checkboxGroup;
  if (scenarioId === "slider") return scenarios.slider;
  if (scenarioId === "rating") return scenarios.rating;
  if (scenarioId === "listbox") return scenarios.listbox;
  if (scenarioId === "combobox") return scenarios.combobox;
  return null;
}

function getLog(scenarioId: string, scenarios: SelectionPrimitiveScenarios): LogEntry[] {
  return getScenario(scenarioId, scenarios)?.state.log ?? [];
}

function scenarioLabel(scenarioId: string) {
  return scenarioId.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function StateGroup({ controlled, disabled, invalid, readOnly, required, setControlled, setDisabled, setInvalid, setReadOnly, setRequired }: { controlled: boolean; disabled: boolean; invalid: boolean; readOnly: boolean; required: boolean; setControlled: (value: boolean) => void; setDisabled: (value: boolean) => void; setInvalid: (value: boolean) => void; setReadOnly: (value: boolean) => void; setRequired: (value: boolean) => void }) {
  return <ToolbarGroup title="State" value="state"><MenuCheckboxControl checked={controlled} label="Controlled" value="controlled" onChange={setControlled} /><MenuCheckboxControl checked={disabled} label="Disabled" value="disabled" onChange={setDisabled} /><MenuCheckboxControl checked={readOnly} label="Read only" value="read-only" onChange={setReadOnly} /><MenuCheckboxControl checked={required} label="Required" value="required" onChange={setRequired} /><MenuCheckboxControl checked={invalid} label="Invalid" value="invalid" onChange={setInvalid} /></ToolbarGroup>;
}

function CompositionToolbarGroup({ onChange, value }: { onChange: (value: CompositionMode) => void; value: CompositionMode }) {
  return <ToolbarGroup title="Composition" value="composition"><MenuRadioControl label="Item" options={compositionOptions} value={value} onChange={(nextValue) => onChange(nextValue as CompositionMode)} /></ToolbarGroup>;
}

const compositionOptions = [{ label: "Default", value: "default" }, { label: "As Child", value: "asChild" }, { label: "Render", value: "render" }];
const directionOptions = ["ltr", "rtl"] as const;
const orientationOptions = [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }];
const stepOptions = [{ label: "1", value: "1" }, { label: "5", value: "5" }, { label: "10", value: "10" }];
const ratingStepOptions = [{ label: "1", value: "1" }, { label: "0.5", value: "0.5" }];
const ratingValueOptions = [
  { label: "0", value: "0" },
  { label: "1", value: "1" },
  { label: "2.5", value: "2.5" },
  { label: "3.5", value: "3.5" },
  { label: "4.5", value: "4.5" },
  { label: "5", value: "5" },
];
