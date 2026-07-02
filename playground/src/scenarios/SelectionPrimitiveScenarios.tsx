import { CheckboxGroup } from "@flowstack-ui/atom/checkbox-group";
import { Combobox } from "@flowstack-ui/atom/combobox";
import { FileUpload } from "@flowstack-ui/atom/file-upload";
import { Listbox } from "@flowstack-ui/atom/listbox";
import { OTPField } from "@flowstack-ui/atom/otp-field";
import { Rating } from "@flowstack-ui/atom/rating";
import { Slider } from "@flowstack-ui/atom/slider";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { AnatomyPanel, type AnatomyRowCategory, type AnatomySection } from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, ScenarioEventLog, ToolbarGroup } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type Orientation = "horizontal" | "vertical";
type LogEntry = { id: number; time: string; text: string };

const planOptions = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team", disabled: true },
  { value: "enterprise", label: "Enterprise" },
];

const comboboxOptions = [
  { value: "alpha", label: "Alpha" },
  { value: "bravo", label: "Bravo" },
  { value: "charlie", label: "Charlie", disabled: true },
  { value: "delta", label: "Delta" },
];

export const selectionPrimitiveScenarioIds = new Set([
  "checkbox-group",
  "slider",
  "rating",
  "otp-field",
  "file-upload",
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

export function useSelectionPrimitiveScenarios() {
  return {
    checkboxGroup: useCheckboxGroupScenario(),
    slider: useSliderScenario(),
    rating: useRatingScenario(),
    otpField: useOTPFieldScenario(),
    fileUpload: useFileUploadScenario(),
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
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (nextValue: string[]) => {
    setValue(nextValue);
    addLog(`value ${nextValue.join(", ") || "none"}`);
  };

  return {
    state: { value, controlled, disabled, readOnly, required, invalid, orientation, composition, log },
    actions: { setControlled, setDisabled, setReadOnly, setRequired, setInvalid, setOrientation, setComposition, handleValueChange, clearLog },
  };
}

function useSliderScenario() {
  const [value, setValue] = useState<number | number[]>(40);
  const [controlled, setControlled] = useState(true);
  const [range, setRange] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [step, setStep] = useState(5);
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
    state: { value: resolvedValue, controlled, range, disabled, orientation, step, log },
    actions: { setControlled, setRange: setRangeMode, setDisabled, setOrientation, setStep, handleValueChange, clearLog },
  };
}

function useRatingScenario() {
  const [value, setValue] = useState(3);
  const [controlled, setControlled] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [step, setStep] = useState(1);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (nextValue: number) => {
    setValue(nextValue);
    addLog(`value ${nextValue}`);
  };

  return {
    state: { value, controlled, disabled, readOnly, required, invalid, step, log },
    actions: { setControlled, setDisabled, setReadOnly, setRequired, setInvalid, setStep, handleValueChange, clearLog },
  };
}

function useOTPFieldScenario() {
  const [value, setValue] = useState("");
  const [controlled, setControlled] = useState(true);
  const [length, setLength] = useState(6);
  const [type, setType] = useState<"numeric" | "alphanumeric">("numeric");
  const [mask, setMask] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
    addLog(`value ${nextValue || "empty"}`);
  };

  return {
    state: { value, controlled, length, type, mask, disabled, readOnly, required, invalid, log },
    actions: { setControlled, setLength, setType, setMask, setDisabled, setReadOnly, setRequired, setInvalid, handleValueChange, clearLog, noteComplete: (nextValue: string) => addLog(`complete ${nextValue}`) },
  };
}

function useFileUploadScenario() {
  const [files, setFiles] = useState<File[]>([]);
  const [multiple, setMultiple] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleFilesChange = (nextFiles: File[]) => {
    setFiles(nextFiles);
    addLog(`files ${nextFiles.length}`);
  };
  const addSample = () => {
    const file = new File(["Atom playground sample"], `sample-${files.length + 1}.txt`, { type: "text/plain" });
    handleFilesChange(multiple ? [...files, file] : [file]);
  };

  return {
    state: { files, multiple, disabled, readOnly, required, invalid, log },
    actions: { setMultiple, setDisabled, setReadOnly, setRequired, setInvalid, handleFilesChange, addSample, clearLog },
  };
}

function useListboxScenario() {
  const [value, setValue] = useState<string | string[] | null>("pro");
  const [multiple, setMultiple] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("vertical");
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
    state: { value, multiple, disabled, readOnly, required, invalid, orientation, log },
    actions: { setMultiple: handleMultiple, setDisabled, setReadOnly, setRequired, setInvalid, setOrientation, handleValueChange, clearLog },
  };
}

function useComboboxScenario() {
  const [value, setValue] = useState<string | null>("bravo");
  const [inputValue, setInputValue] = useState("Bravo");
  const [open, setOpen] = useState(false);
  const [controlledOpen, setControlledOpen] = useState(false);
  const [freeSolo, setFreeSolo] = useState(false);
  const [clearOnSelect, setClearOnSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
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

  return {
    state: { value, inputValue, open, controlledOpen, freeSolo, clearOnSelect, loading, disabled, readOnly, required, invalid, log },
    actions: { setControlledOpen, setFreeSolo, setClearOnSelect, setLoading, setDisabled, setReadOnly, setRequired, setInvalid, handleValueChange, handleInputValueChange, handleOpenChange, clearLog },
  };
}

export type SelectionPrimitiveScenarios = ReturnType<typeof useSelectionPrimitiveScenarios>;

export function SelectionPrimitiveScenarioToolbar({ scenarioId, scenarios }: { scenarioId: string; scenarios: SelectionPrimitiveScenarios }) {
  if (scenarioId === "checkbox-group") {
    const s = scenarios.checkboxGroup;
    return <ControlToolbar label="Checkbox Group controls"><StateGroup controlled={s.state.controlled} disabled={s.state.disabled} invalid={s.state.invalid} readOnly={s.state.readOnly} required={s.state.required} setControlled={s.actions.setControlled} setDisabled={s.actions.setDisabled} setInvalid={s.actions.setInvalid} setReadOnly={s.actions.setReadOnly} setRequired={s.actions.setRequired} /><ToolbarGroup title="Layout" value="layout"><MenuRadioControl label="Orientation" options={orientationOptions} value={s.state.orientation} onChange={(value) => s.actions.setOrientation(value as Orientation)} /></ToolbarGroup><CompositionToolbarGroup value={s.state.composition} onChange={s.actions.setComposition} /></ControlToolbar>;
  }
  if (scenarioId === "slider") {
    const s = scenarios.slider;
    return <ControlToolbar label="Slider controls"><ToolbarGroup title="State" value="state"><MenuCheckboxControl checked={s.state.controlled} label="Controlled" value="controlled" onChange={s.actions.setControlled} /><MenuCheckboxControl checked={s.state.range} label="Range" value="range" onChange={s.actions.setRange} /><MenuCheckboxControl checked={s.state.disabled} label="Disabled" value="disabled" onChange={s.actions.setDisabled} /></ToolbarGroup><ToolbarGroup title="Layout" value="layout"><MenuRadioControl label="Orientation" options={orientationOptions} value={s.state.orientation} onChange={(value) => s.actions.setOrientation(value as Orientation)} /><MenuRadioControl label="Step" options={stepOptions} value={String(s.state.step)} onChange={(value) => s.actions.setStep(Number(value))} /></ToolbarGroup></ControlToolbar>;
  }
  if (scenarioId === "rating") {
    const s = scenarios.rating;
    return <ControlToolbar label="Rating controls"><StateGroup controlled={s.state.controlled} disabled={s.state.disabled} invalid={s.state.invalid} readOnly={s.state.readOnly} required={s.state.required} setControlled={s.actions.setControlled} setDisabled={s.actions.setDisabled} setInvalid={s.actions.setInvalid} setReadOnly={s.actions.setReadOnly} setRequired={s.actions.setRequired} /><ToolbarGroup title="Value" value="value"><MenuRadioControl label="Step" options={ratingStepOptions} value={String(s.state.step)} onChange={(value) => s.actions.setStep(Number(value))} /></ToolbarGroup></ControlToolbar>;
  }
  if (scenarioId === "otp-field") {
    const s = scenarios.otpField;
    return <ControlToolbar label="OTP Field controls"><StateGroup controlled={s.state.controlled} disabled={s.state.disabled} invalid={s.state.invalid} readOnly={s.state.readOnly} required={s.state.required} setControlled={s.actions.setControlled} setDisabled={s.actions.setDisabled} setInvalid={s.actions.setInvalid} setReadOnly={s.actions.setReadOnly} setRequired={s.actions.setRequired} /><ToolbarGroup title="Input" value="input"><MenuCheckboxControl checked={s.state.mask} label="Mask" value="mask" onChange={s.actions.setMask} /><MenuRadioControl label="Length" options={lengthOptions} value={String(s.state.length)} onChange={(value) => s.actions.setLength(Number(value))} /><MenuRadioControl label="Type" options={otpTypeOptions} value={s.state.type} onChange={(value) => s.actions.setType(value as "numeric" | "alphanumeric")} /></ToolbarGroup></ControlToolbar>;
  }
  if (scenarioId === "file-upload") {
    const s = scenarios.fileUpload;
    return <ControlToolbar label="File Upload controls"><ToolbarGroup title="State" value="state"><MenuCheckboxControl checked={s.state.multiple} label="Multiple" value="multiple" onChange={s.actions.setMultiple} /><MenuCheckboxControl checked={s.state.disabled} label="Disabled" value="disabled" onChange={s.actions.setDisabled} /><MenuCheckboxControl checked={s.state.readOnly} label="Read only" value="read-only" onChange={s.actions.setReadOnly} /><MenuCheckboxControl checked={s.state.required} label="Required" value="required" onChange={s.actions.setRequired} /><MenuCheckboxControl checked={s.state.invalid} label="Invalid" value="invalid" onChange={s.actions.setInvalid} /></ToolbarGroup></ControlToolbar>;
  }
  if (scenarioId === "listbox") {
    const s = scenarios.listbox;
    return <ControlToolbar label="Listbox controls"><ToolbarGroup title="State" value="state"><MenuCheckboxControl checked={s.state.multiple} label="Multiple" value="multiple" onChange={s.actions.setMultiple} /><MenuCheckboxControl checked={s.state.disabled} label="Disabled" value="disabled" onChange={s.actions.setDisabled} /><MenuCheckboxControl checked={s.state.readOnly} label="Read only" value="read-only" onChange={s.actions.setReadOnly} /><MenuCheckboxControl checked={s.state.required} label="Required" value="required" onChange={s.actions.setRequired} /><MenuCheckboxControl checked={s.state.invalid} label="Invalid" value="invalid" onChange={s.actions.setInvalid} /></ToolbarGroup><ToolbarGroup title="Layout" value="layout"><MenuRadioControl label="Orientation" options={orientationOptions} value={s.state.orientation} onChange={(value) => s.actions.setOrientation(value as Orientation)} /></ToolbarGroup></ControlToolbar>;
  }
  if (scenarioId === "combobox") {
    const s = scenarios.combobox;
    return <ControlToolbar label="Combobox controls"><ToolbarGroup title="State" value="state"><MenuCheckboxControl checked={s.state.controlledOpen} label="Controlled open" value="controlled-open" onChange={s.actions.setControlledOpen} /><MenuCheckboxControl checked={s.state.freeSolo} label="Free solo" value="free-solo" onChange={s.actions.setFreeSolo} /><MenuCheckboxControl checked={s.state.clearOnSelect} label="Clear on select" value="clear-on-select" onChange={s.actions.setClearOnSelect} /><MenuCheckboxControl checked={s.state.loading} label="Loading" value="loading" onChange={s.actions.setLoading} /></ToolbarGroup><ToolbarGroup title="Field" value="field"><MenuCheckboxControl checked={s.state.disabled} label="Disabled" value="disabled" onChange={s.actions.setDisabled} /><MenuCheckboxControl checked={s.state.readOnly} label="Read only" value="read-only" onChange={s.actions.setReadOnly} /><MenuCheckboxControl checked={s.state.required} label="Required" value="required" onChange={s.actions.setRequired} /><MenuCheckboxControl checked={s.state.invalid} label="Invalid" value="invalid" onChange={s.actions.setInvalid} /></ToolbarGroup></ControlToolbar>;
  }
  return null;
}

export function SelectionPrimitiveScenarioCanvas({ scenarioId, scenarios }: { scenarioId: string; scenarios: SelectionPrimitiveScenarios }) {
  if (scenarioId === "checkbox-group") return <CheckboxGroupCanvas scenario={scenarios.checkboxGroup} />;
  if (scenarioId === "slider") return <SliderCanvas scenario={scenarios.slider} />;
  if (scenarioId === "rating") return <RatingCanvas scenario={scenarios.rating} />;
  if (scenarioId === "otp-field") return <OTPFieldCanvas scenario={scenarios.otpField} />;
  if (scenarioId === "file-upload") return <FileUploadCanvas scenario={scenarios.fileUpload} />;
  if (scenarioId === "listbox") return <ListboxCanvas scenario={scenarios.listbox} />;
  if (scenarioId === "combobox") return <ComboboxCanvas scenario={scenarios.combobox} />;
  return null;
}

function CheckboxGroupCanvas({ scenario }: { scenario: ReturnType<typeof useCheckboxGroupScenario> }) {
  const s = scenario.state;
  const props = { className: "playground-checkbox-group", "data-prop-check": "root", disabled: s.disabled, invalid: s.invalid, orientation: s.orientation, readOnly: s.readOnly, required: s.required, name: "updates", ariaLabel: "Notification options", onValueChange: scenario.actions.handleValueChange, ...(s.controlled ? { value: s.value } : { defaultValue: s.value }) };
  const content = <><CheckboxGroupItem mode={s.composition} value="email">Email updates</CheckboxGroupItem><CheckboxGroupItem mode={s.composition} value="sms">SMS alerts</CheckboxGroupItem><CheckboxGroupItem disabled mode={s.composition} value="push">Push digest</CheckboxGroupItem></>;
  return <CheckboxGroup.Root {...props}>{content}</CheckboxGroup.Root>;
}

function CheckboxGroupItem({ children, disabled, mode, value }: { children: ReactNode; disabled?: boolean; mode: CompositionMode; value: string }) {
  const className = "playground-checkbox-group-item";
  if (mode === "asChild") return <CheckboxGroup.Item asChild disabled={disabled} value={value} data-prop-check={`item-${value}`}><button className={className} type="button"><span aria-hidden="true" className="playground-checkbox-box" />{children}</button></CheckboxGroup.Item>;
  if (mode === "render") return <CheckboxGroup.Item disabled={disabled} value={value} data-prop-check={`item-${value}`} render={(props) => <button {...props} className={className} />}><span aria-hidden="true" className="playground-checkbox-box" />{children}</CheckboxGroup.Item>;
  return <CheckboxGroup.Item className={className} disabled={disabled} value={value} data-prop-check={`item-${value}`}><span aria-hidden="true" className="playground-checkbox-box" />{children}</CheckboxGroup.Item>;
}

function SliderCanvas({ scenario }: { scenario: ReturnType<typeof useSliderScenario> }) {
  const s = scenario.state;
  const values = Array.isArray(s.value) ? s.value : [s.value];
  return <div className="playground-slider-stage"><Slider.Root className={`playground-slider ${s.orientation === "vertical" ? "is-vertical" : ""}`} data-prop-check="root" disabled={s.disabled} min={0} max={100} step={s.step} largeStep={20} minStepsBetweenThumbs={2} name="volume" orientation={s.orientation} onValueChange={scenario.actions.handleValueChange} {...(s.controlled ? { value: s.value } : { defaultValue: s.value })}><Slider.Track className="playground-slider-track" data-prop-check="track"><Slider.Range className="playground-slider-range" data-prop-check="range" />{values.map((_, index) => <Slider.Thumb className="playground-slider-thumb" data-prop-check={`thumb-${index}`} index={index} key={index} />)}</Slider.Track></Slider.Root></div>;
}

function RatingCanvas({ scenario }: { scenario: ReturnType<typeof useRatingScenario> }) {
  const s = scenario.state;
  return <Rating.Root className="playground-rating" data-prop-check="root" disabled={s.disabled} invalid={s.invalid} name="rating" readOnly={s.readOnly} required={s.required} step={s.step} onValueChange={scenario.actions.handleValueChange} {...(s.controlled ? { value: s.value } : { defaultValue: s.value })}>{[1, 2, 3, 4, 5].map((value) => <Rating.Item className="playground-rating-item" data-prop-check={`item-${value}`} key={value} value={value}>★</Rating.Item>)}</Rating.Root>;
}

function OTPFieldCanvas({ scenario }: { scenario: ReturnType<typeof useOTPFieldScenario> }) {
  const s = scenario.state;
  const splitIndex = Math.ceil(s.length / 2);
  const inputs = Array.from({ length: s.length }, (_, index) => index);
  const cells = inputs.flatMap((index) => {
    const input = <OTPField.Input className="playground-otp-input" data-prop-check={`input-${index}`} index={index} key={`input-${index}`} />;
    if (s.length <= 4 || index !== splitIndex - 1) return [input];
    return [input, <OTPField.Separator className="playground-otp-separator" data-prop-check="separator" key="separator">-</OTPField.Separator>];
  });
  return <OTPField.Root className="playground-otp" data-prop-check="root" disabled={s.disabled} invalid={s.invalid} length={s.length} mask={s.mask} name="code" readOnly={s.readOnly} required={s.required} type={s.type} onComplete={scenario.actions.noteComplete} onValueChange={scenario.actions.handleValueChange} {...(s.controlled ? { value: s.value } : { defaultValue: s.value })}>{cells}</OTPField.Root>;
}

function FileUploadCanvas({ scenario }: { scenario: ReturnType<typeof useFileUploadScenario> }) {
  const s = scenario.state;
  return <FileUpload.Root className="playground-file-upload" data-prop-check="root" files={s.files} invalid={s.invalid} multiple={s.multiple} name="attachments" readOnly={s.readOnly} required={s.required} disabled={s.disabled} onFilesChange={scenario.actions.handleFilesChange}><FileUpload.HiddenInput data-prop-check="hidden-input" /><FileUpload.Dropzone className="playground-file-dropzone" data-prop-check="dropzone"><FileUpload.Trigger className="atom-button secondary" data-prop-check="trigger">Choose files</FileUpload.Trigger><button className="atom-button secondary" type="button" onClick={scenario.actions.addSample}>Add sample</button></FileUpload.Dropzone><FileUpload.ItemGroup className="playground-file-list" data-prop-check="item-group">{(file) => <FileUpload.Item className="playground-file-item" data-prop-check="item" file={file} key={`${file.name}-${file.size}`}><FileUpload.ItemName data-prop-check="item-name" /><FileUpload.ItemSize data-prop-check="item-size" /><FileUpload.ItemDeleteTrigger className="atom-button secondary" data-prop-check="item-delete">Remove</FileUpload.ItemDeleteTrigger></FileUpload.Item>}</FileUpload.ItemGroup></FileUpload.Root>;
}

function ListboxCanvas({ scenario }: { scenario: ReturnType<typeof useListboxScenario> }) {
  const s = scenario.state;
  return <Listbox.Root className={`playground-listbox ${s.orientation === "horizontal" ? "is-horizontal" : ""}`} data-prop-check="root" disabled={s.disabled} invalid={s.invalid} multiple={s.multiple} name="plan" orientation={s.orientation} readOnly={s.readOnly} required={s.required} value={s.value} onValueChange={scenario.actions.handleValueChange}><Listbox.Group data-prop-check="group"><Listbox.Label className="playground-listbox-label" data-prop-check="label">Plans</Listbox.Label>{planOptions.map((option) => <Listbox.Option className="playground-listbox-option" data-prop-check={`option-${option.value}`} disabled={option.disabled} key={option.value} label={option.label} value={option.value}><Listbox.OptionText data-prop-check={`option-text-${option.value}`}>{option.label}</Listbox.OptionText></Listbox.Option>)}</Listbox.Group></Listbox.Root>;
}

function ComboboxCanvas({ scenario }: { scenario: ReturnType<typeof useComboboxScenario> }) {
  const s = scenario.state;
  return <Combobox.Root options={comboboxOptions} value={s.value} inputValue={s.inputValue} open={s.controlledOpen ? s.open : undefined} loading={s.loading} disabled={s.disabled} readOnly={s.readOnly} required={s.required} invalid={s.invalid} freeSolo={s.freeSolo} clearOnSelect={s.clearOnSelect} name="assignee" onValueChange={scenario.actions.handleValueChange} onInputValueChange={scenario.actions.handleInputValueChange} onOpenChange={scenario.actions.handleOpenChange}><div className="playground-combobox" data-prop-check="root-shell"><Combobox.Label className="playground-combobox-label" data-prop-check="label">Assignee</Combobox.Label><div className="playground-combobox-row"><Combobox.Input className="playground-combobox-input" data-prop-check="input" /><Combobox.Clear className="atom-button secondary" data-prop-check="clear">Clear</Combobox.Clear></div><Combobox.Portal><Combobox.Content className="playground-combobox-content" data-prop-check="content"><Combobox.Listbox className="playground-combobox-listbox" data-prop-check="listbox">{s.loading ? <Combobox.Loading className="playground-combobox-message" data-prop-check="loading" /> : null}<Combobox.Group data-prop-check="group"><Combobox.Label className="playground-combobox-group-label" data-prop-check="group-label">People</Combobox.Label>{comboboxOptions.map((option) => <Combobox.Item className="playground-combobox-item" data-prop-check={`item-${option.value}`} disabled={option.disabled} key={option.value} label={option.label} value={option.value} />)}</Combobox.Group><Combobox.Empty className="playground-combobox-message" data-prop-check="empty" /></Combobox.Listbox></Combobox.Content></Combobox.Portal></div></Combobox.Root>;
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
  if (scenarioId === "otp-field") return `Value ${scenarios.otpField.state.value || "empty"}`;
  if (scenarioId === "file-upload") return `${scenarios.fileUpload.state.files.length} files`;
  if (scenarioId === "listbox") return `Value ${Array.isArray(scenarios.listbox.state.value) ? scenarios.listbox.state.value.join(", ") : scenarios.listbox.state.value ?? "none"}`;
  if (scenarioId === "combobox") return `Value ${scenarios.combobox.state.value ?? "none"} | Input ${scenarios.combobox.state.inputValue || "empty"}`;
  return "";
}

export function getSelectionPrimitiveSource(scenarioId: string) {
  const name = scenarioLabel(scenarioId);
  return `// ${name} playground scenario
// The live source panel is intentionally compact for this batch.
// Use Anatomy and Inspector to verify the generated ARIA, data, and native attributes.`;
}

function getSections(scenarioId: string, scenarios: SelectionPrimitiveScenarios): AnatomySection[] {
  if (scenarioId === "checkbox-group") return checkboxGroupSections(scenarios.checkboxGroup.state);
  if (scenarioId === "slider") return sliderSections(scenarios.slider.state);
  if (scenarioId === "rating") return ratingSections(scenarios.rating.state);
  if (scenarioId === "otp-field") return otpSections(scenarios.otpField.state);
  if (scenarioId === "file-upload") return fileUploadSections(scenarios.fileUpload.state);
  if (scenarioId === "listbox") return listboxSections(scenarios.listbox.state);
  if (scenarioId === "combobox") return comboboxSections(scenarios.combobox.state);
  return [];
}

function checkboxGroupSections(state: ReturnType<typeof useCheckboxGroupScenario>["state"]): AnatomySection[] {
  return [baseSection("Root", state.value.join(", ") || "none", "[data-slot='checkbox-group']", [row("Controlled", bool(state.controlled), "state"), row("Orientation", state.orientation, "state")]), baseSection("Item", "email", "[data-prop-check='item-email']"), baseSection("Hidden Input", "generated", "input[name='updates']")];
}

function sliderSections(state: ReturnType<typeof useSliderScenario>["state"]): AnatomySection[] {
  return [baseSection("Root", Array.isArray(state.value) ? "range" : "single", "[data-slot='slider']", [row("Controlled", bool(state.controlled), "state"), row("Orientation", state.orientation, "state"), row("Step", String(state.step), "state")]), baseSection("Track", "track", "[data-slot='slider-track']"), baseSection("Range", "range", "[data-slot='slider-range']"), baseSection("Thumb", "thumb", "[data-slot='slider-thumb']"), baseSection("Hidden Input", "generated", "input[name='volume']")];
}

function ratingSections(state: ReturnType<typeof useRatingScenario>["state"]): AnatomySection[] {
  return [baseSection("Root", String(state.value), "[data-slot='rating']", [row("Controlled", bool(state.controlled), "state"), row("Step", String(state.step), "state")]), baseSection("Item", "star", "[data-slot='rating-item']"), baseSection("Hidden Input", "generated", "input[name='rating']")];
}

function otpSections(state: ReturnType<typeof useOTPFieldScenario>["state"]): AnatomySection[] {
  return [baseSection("Root", state.value || "empty", "[data-slot='otp-field']", [row("Controlled", bool(state.controlled), "state"), row("Length", String(state.length), "state"), row("Type", state.type, "state"), row("Mask", bool(state.mask), "state")]), baseSection("Input", "cell", "[data-slot='otp-field-input']"), baseSection("Separator", state.length > 4 ? "rendered" : "not rendered", "[data-slot='otp-field-separator']", undefined, state.length <= 4)];
}

function fileUploadSections(state: ReturnType<typeof useFileUploadScenario>["state"]): AnatomySection[] {
  return [baseSection("Root", `${state.files.length} files`, "[data-slot='file-upload']", [row("Multiple", bool(state.multiple), "state")]), baseSection("Hidden Input", "native input", "[data-slot='file-upload-hidden-input']"), baseSection("Trigger", "button", "[data-slot='file-upload-trigger']"), baseSection("Dropzone", "dropzone", "[data-slot='file-upload-dropzone']"), baseSection("Item Group", `${state.files.length} files`, "[data-slot='file-upload-item-group']"), baseSection("Item", "file", "[data-slot='file-upload-item']", undefined, state.files.length === 0)];
}

function listboxSections(state: ReturnType<typeof useListboxScenario>["state"]): AnatomySection[] {
  return [baseSection("Root", state.multiple ? "multiple" : "single", "[data-slot='listbox']", [row("Value", Array.isArray(state.value) ? state.value.join(", ") : state.value ?? "none", "state"), row("Orientation", state.orientation, "state")]), baseSection("Group", "group", "[data-slot='listbox-group']"), baseSection("Label", "Plans", "[data-slot='listbox-label']"), baseSection("Option", "option", "[data-slot='listbox-option']"), baseSection("Option Text", "text", "[data-slot='listbox-option-text']"), baseSection("Hidden Input", "generated", "input[name='plan']")];
}

function comboboxSections(state: ReturnType<typeof useComboboxScenario>["state"]): AnatomySection[] {
  return [baseSection("Root", state.value ?? "none", "[data-prop-check='root-shell']", [row("Open", bool(state.open), "state"), row("Input", state.inputValue || "empty", "state")]), baseSection("Label", "Assignee", "[data-slot='combobox-label']"), baseSection("Input", "input", "[data-slot='combobox-input']"), baseSection("Clear", "button", "[data-slot='combobox-clear']"), baseSection("Portal Content", state.open ? "open" : "closed", "[data-slot='combobox-content']", undefined, !state.open), baseSection("Listbox", state.open ? "open" : "closed", "[data-slot='combobox-listbox']", undefined, !state.open), baseSection("Item", "option", "[data-slot='combobox-item']", undefined, !state.open), baseSection("Hidden Input", "generated", "input[name='assignee']")];
}

function baseSection(title: string, summary: string, selector: string, rows = [row("Exists", "true", "presence")], inactive = false): AnatomySection {
  return { title, summary, selector, rows, inactive };
}

function row(label: string, value: string, category: AnatomyRowCategory) {
  return { label, value, category };
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

function getScenario(scenarioId: string, scenarios: SelectionPrimitiveScenarios) {
  if (scenarioId === "checkbox-group") return scenarios.checkboxGroup;
  if (scenarioId === "slider") return scenarios.slider;
  if (scenarioId === "rating") return scenarios.rating;
  if (scenarioId === "otp-field") return scenarios.otpField;
  if (scenarioId === "file-upload") return scenarios.fileUpload;
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
const orientationOptions = [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }];
const stepOptions = [{ label: "1", value: "1" }, { label: "5", value: "5" }, { label: "10", value: "10" }];
const ratingStepOptions = [{ label: "1", value: "1" }, { label: "0.5", value: "0.5" }];
const lengthOptions = [{ label: "4", value: "4" }, { label: "6", value: "6" }];
const otpTypeOptions = [{ label: "Numeric", value: "numeric" }, { label: "Alphanumeric", value: "alphanumeric" }];
