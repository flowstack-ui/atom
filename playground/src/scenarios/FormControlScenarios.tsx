import { Button } from "@flowstack-ui/atom/button";
import { Checkbox, type CheckboxCheckedState } from "@flowstack-ui/atom/checkbox";
import { Menubar } from "@flowstack-ui/atom/menubar";
import { RadioGroup } from "@flowstack-ui/atom/radio-group";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import { Switch } from "@flowstack-ui/atom/switch";
import { Toggle } from "@flowstack-ui/atom/toggle";
import { ToggleGroup } from "@flowstack-ui/atom/toggle-group";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";

type LogEntry = {
  id: number;
  time: string;
  text: string;
};

type CompositionMode = "default" | "asChild" | "render";
type Orientation = "horizontal" | "vertical";
type ToggleGroupType = "single" | "multiple";

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

  return {
    log,
    addLog,
    clearLog: () => setLog([]),
  };
}

export function useButtonScenario() {
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [pressCount, setPressCount] = useState(0);
  const { log, addLog, clearLog } = useScenarioLog();

  const handlePress = () => {
    setPressCount((count) => count + 1);
    addLog("pressed");
  };

  return {
    state: { disabled, loading, linkMode, composition, pressCount, log },
    actions: {
      setDisabled,
      setLoading,
      setLinkMode,
      setComposition,
      handlePress,
      clearLog,
    },
  };
}

export function useCheckboxScenario() {
  const [controlled, setControlled] = useState(false);
  const [checked, setChecked] = useState<CheckboxCheckedState>(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [forceMount, setForceMount] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleCheckedChange = (next: CheckboxCheckedState) => {
    setChecked(next);
    addLog(`checked changed to ${String(next)}`);
  };

  return {
    state: {
      controlled,
      checked,
      disabled,
      readOnly,
      invalid,
      required,
      forceMount,
      composition,
      log,
    },
    actions: {
      setControlled,
      setChecked,
      setDisabled,
      setReadOnly,
      setInvalid,
      setRequired,
      setForceMount,
      setComposition,
      handleCheckedChange,
      clearLog,
    },
  };
}

export function useSwitchScenario() {
  const [controlled, setControlled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleCheckedChange = (next: boolean) => {
    setChecked(next);
    addLog(`checked changed to ${String(next)}`);
  };

  return {
    state: { controlled, checked, disabled, readOnly, invalid, required, composition, log },
    actions: {
      setControlled,
      setChecked,
      setDisabled,
      setReadOnly,
      setInvalid,
      setRequired,
      setComposition,
      handleCheckedChange,
      clearLog,
    },
  };
}

export function useToggleScenario() {
  const [controlled, setControlled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  const handlePressedChange = (next: boolean) => {
    setPressed(next);
    addLog(`pressed changed to ${String(next)}`);
  };

  return {
    state: { controlled, pressed, disabled, composition, log },
    actions: {
      setControlled,
      setPressed,
      setDisabled,
      setComposition,
      handlePressedChange,
      clearLog,
    },
  };
}

export function useRadioGroupScenario() {
  const [controlled, setControlled] = useState(false);
  const [value, setValue] = useState("email");
  const [disabled, setDisabled] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [loop, setLoop] = useState(true);
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [disabledItem, setDisabledItem] = useState(true);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (next: string) => {
    setValue(next);
    addLog(`value changed to ${next}`);
  };

  return {
    state: {
      controlled,
      value,
      disabled,
      required,
      invalid,
      loop,
      orientation,
      disabledItem,
      composition,
      log,
    },
    actions: {
      setControlled,
      setValue,
      setDisabled,
      setRequired,
      setInvalid,
      setLoop,
      setOrientation,
      setDisabledItem,
      setComposition,
      handleValueChange,
      clearLog,
    },
  };
}

export function useToggleGroupScenario() {
  const [controlled, setControlled] = useState(false);
  const [type, setType] = useState<ToggleGroupType>("multiple");
  const [value, setValue] = useState<string | string[]>(["bold"]);
  const [disabled, setDisabled] = useState(false);
  const [loop, setLoop] = useState(true);
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [disabledItem, setDisabledItem] = useState(true);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleTypeChange = (next: ToggleGroupType) => {
    setType(next);
    setValue(next === "single" ? "bold" : ["bold"]);
  };

  const handleValueChange = (next: string | string[]) => {
    setValue(next);
    addLog(`value changed to ${Array.isArray(next) ? next.join(", ") || "none" : next || "none"}`);
  };

  return {
    state: { controlled, type, value, disabled, loop, orientation, disabledItem, composition, log },
    actions: {
      setControlled,
      setType: handleTypeChange,
      setValue,
      setDisabled,
      setLoop,
      setOrientation,
      setDisabledItem,
      setComposition,
      handleValueChange,
      clearLog,
    },
  };
}

type ButtonScenario = ReturnType<typeof useButtonScenario>;
type CheckboxScenario = ReturnType<typeof useCheckboxScenario>;
type SwitchScenario = ReturnType<typeof useSwitchScenario>;
type ToggleScenario = ReturnType<typeof useToggleScenario>;
type RadioGroupScenario = ReturnType<typeof useRadioGroupScenario>;
type ToggleGroupScenario = ReturnType<typeof useToggleGroupScenario>;

export function ButtonScenarioCanvas({ scenario }: { scenario: ButtonScenario }) {
  const { state, actions } = scenario;
  const commonProps = {
    className: "control-button",
    disabled: state.disabled,
    loading: state.loading,
    href: state.linkMode ? "#button-link" : undefined,
    "data-button-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    onPress: actions.handlePress,
  };

  return (
    <div className="form-control-stage">
      {state.composition === "asChild" ? (
        <Button.Root {...commonProps} asChild>
          <span>Run action</span>
        </Button.Root>
      ) : state.composition === "render" ? (
        <Button.Root
          {...commonProps}
          render={(props) => <span {...props}>Run action</span>}
        />
      ) : (
        <Button.Root {...commonProps}>Run action</Button.Root>
      )}
    </div>
  );
}

export function CheckboxScenarioCanvas({ scenario }: { scenario: CheckboxScenario }) {
  const { state, actions } = scenario;
  const rootProps = state.controlled
    ? { checked: state.checked, onCheckedChange: actions.handleCheckedChange }
    : { defaultChecked: false, onCheckedChange: actions.handleCheckedChange };

  return (
    <div className="form-control-stage">
      <label className="control-row">
        <CheckboxRootExample
          mode={state.composition}
          rootProps={rootProps}
          disabled={state.disabled}
          readOnly={state.readOnly}
          invalid={state.invalid}
          required={state.required}
        >
          <Checkbox.Indicator
            className="control-checkbox-indicator"
            data-checkbox-indicator=""
            data-playground-inspect=""
            data-prop-check="indicator"
            forceMount={state.forceMount}
          />
        </CheckboxRootExample>
        <span>Email updates</span>
      </label>
    </div>
  );
}

export function SwitchScenarioCanvas({ scenario }: { scenario: SwitchScenario }) {
  const { state, actions } = scenario;
  const rootProps = state.controlled
    ? { checked: state.checked, onCheckedChange: actions.handleCheckedChange }
    : { defaultChecked: false, onCheckedChange: actions.handleCheckedChange };

  return (
    <div className="form-control-stage">
      <label className="control-row">
        <SwitchRootExample
          mode={state.composition}
          rootProps={rootProps}
          disabled={state.disabled}
          readOnly={state.readOnly}
          invalid={state.invalid}
          required={state.required}
        >
          <Switch.Thumb
            className="control-switch-thumb"
            data-playground-inspect=""
            data-prop-check="thumb"
            data-switch-thumb=""
          />
        </SwitchRootExample>
        <span>Notifications</span>
      </label>
    </div>
  );
}

export function ToggleScenarioCanvas({ scenario }: { scenario: ToggleScenario }) {
  const { state, actions } = scenario;
  const rootProps = state.controlled
    ? { pressed: state.pressed, onPressedChange: actions.handlePressedChange }
    : { defaultPressed: false, onPressedChange: actions.handlePressedChange };

  return (
    <div className="form-control-stage">
      <ToggleRootExample
        mode={state.composition}
        rootProps={rootProps}
        disabled={state.disabled}
      />
    </div>
  );
}

export function RadioGroupScenarioCanvas({ scenario }: { scenario: RadioGroupScenario }) {
  const { state, actions } = scenario;
  const rootProps = state.controlled
    ? { value: state.value, onValueChange: actions.handleValueChange }
    : { defaultValue: "email", onValueChange: actions.handleValueChange };

  return (
    <div className="form-control-stage">
      <RadioGroup.Root
        {...rootProps}
        className="control-choice-group"
        ariaLabel="Notification channel"
        data-playground-inspect=""
        data-prop-check="root"
        data-radio-group-root=""
        disabled={state.disabled}
        invalid={state.invalid}
        loop={state.loop}
        name="notification-channel"
        orientation={state.orientation}
        required={state.required}
      >
        <RadioItem value="email" label="Email" mode={state.composition} />
        <RadioItem value="sms" label="SMS" mode={state.composition} disabled={state.disabledItem} />
        <RadioItem value="push" label="Push" mode={state.composition} />
      </RadioGroup.Root>
    </div>
  );
}

export function ToggleGroupScenarioCanvas({ scenario }: { scenario: ToggleGroupScenario }) {
  const { state, actions } = scenario;
  const rootProps = state.controlled
    ? { value: state.value, onValueChange: actions.handleValueChange }
    : { defaultValue: state.type === "single" ? "bold" : ["bold"], onValueChange: actions.handleValueChange };

  return (
    <div className="form-control-stage">
      <ToggleGroup.Root
        {...rootProps}
        className="control-toggle-group"
        ariaLabel="Text formatting"
        data-playground-inspect=""
        data-prop-check="root"
        data-toggle-group-root=""
        disabled={state.disabled}
        loop={state.loop}
        orientation={state.orientation}
        type={state.type}
      >
        <ToggleGroupItem value="bold" label="B" mode={state.composition} />
        <ToggleGroupItem value="italic" label="I" mode={state.composition} disabled={state.disabledItem} />
        <ToggleGroupItem value="underline" label="U" mode={state.composition} />
      </ToggleGroup.Root>
    </div>
  );
}

export function ButtonScenarioAnatomy({
  openGroups,
  scenario,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  scenario: ButtonScenario;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const root = document.querySelector<HTMLElement>("[data-button-root]");
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-button-root]",
      summary: stateSummary(root, "button"),
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Loading", value: bool(scenario.state.loading), category: "state" },
        { label: "Link mode", value: bool(scenario.state.linkMode), category: "behavior" },
        { label: "Composition", value: scenario.state.composition, category: "composition" },
        { label: "Press count", value: String(scenario.state.pressCount), category: "behavior" },
      ],
    },
  ];

  return <AnatomyPanel footer="1 part" openGroups={openGroups} sections={sections} onOpenGroupsChange={onOpenGroupsChange} />;
}

export function CheckboxScenarioAnatomy({
  openGroups,
  scenario,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  scenario: CheckboxScenario;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const root = document.querySelector<HTMLElement>("[data-checkbox-root]");
  const indicator = document.querySelector<HTMLElement>("[data-checkbox-indicator]");
  const input = document.querySelector<HTMLInputElement>("[data-checkbox-hidden-input]");
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-checkbox-root]",
      summary: root?.dataset.state ?? "unchecked",
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Mode", value: scenario.state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Checked", value: String(scenario.state.checked), category: "state" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Invalid", value: bool(scenario.state.invalid), category: "state" },
        { label: "Read only", value: bool(scenario.state.readOnly), category: "state" },
        { label: "Required", value: bool(scenario.state.required), category: "state" },
        { label: "Composition", value: scenario.state.composition, category: "composition" },
      ],
    },
    {
      title: "Indicator",
      selector: "[data-checkbox-indicator]",
      inactive: !indicator,
      summary: indicator?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: yesNo(indicator), category: "presence" },
        { label: "Force mounted", value: bool(scenario.state.forceMount), category: "behavior" },
      ],
    },
    hiddenInputSection("Generated hidden input", "input[name='email-updates']", input),
  ];

  return <AnatomyPanel footer={`${sections.length} parts`} openGroups={openGroups} sections={sections} onOpenGroupsChange={onOpenGroupsChange} />;
}

export function SwitchScenarioAnatomy({
  openGroups,
  scenario,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  scenario: SwitchScenario;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const root = document.querySelector<HTMLElement>("[data-switch-root]");
  const thumb = document.querySelector<HTMLElement>("[data-switch-thumb]");
  const input = document.querySelector<HTMLInputElement>("[data-switch-hidden-input]");
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-switch-root]",
      summary: root?.dataset.state ?? "unchecked",
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Mode", value: scenario.state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Checked", value: bool(scenario.state.checked), category: "state" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Invalid", value: bool(scenario.state.invalid), category: "state" },
        { label: "Read only", value: bool(scenario.state.readOnly), category: "state" },
        { label: "Required", value: bool(scenario.state.required), category: "state" },
        { label: "Composition", value: scenario.state.composition, category: "composition" },
      ],
    },
    {
      title: "Thumb",
      selector: "[data-switch-thumb]",
      inactive: !thumb,
      summary: thumb?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: yesNo(thumb), category: "presence" },
      ],
    },
    hiddenInputSection("Generated hidden input", "input[name='notifications']", input),
  ];

  return <AnatomyPanel footer={`${sections.length} parts`} openGroups={openGroups} sections={sections} onOpenGroupsChange={onOpenGroupsChange} />;
}

export function ToggleScenarioAnatomy({
  openGroups,
  scenario,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  scenario: ToggleScenario;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const root = document.querySelector<HTMLElement>("[data-toggle-root]");
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-toggle-root]",
      summary: root?.dataset.state ?? "off",
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Mode", value: scenario.state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Pressed", value: bool(scenario.state.pressed), category: "state" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Composition", value: scenario.state.composition, category: "composition" },
      ],
    },
  ];

  return <AnatomyPanel footer="1 part" openGroups={openGroups} sections={sections} onOpenGroupsChange={onOpenGroupsChange} />;
}

export function RadioGroupScenarioAnatomy({
  openGroups,
  scenario,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  scenario: RadioGroupScenario;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const root = document.querySelector<HTMLElement>("[data-radio-group-root]");
  const selected = document.querySelector<HTMLElement>("[data-radio-root][data-state='checked']");
  const disabled = document.querySelector<HTMLElement>("[data-radio-root][data-value='sms']");
  const input = document.querySelector<HTMLInputElement>("[data-radio-hidden-input][value='email']");
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-radio-group-root]",
      summary: scenario.state.value,
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Mode", value: scenario.state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Value", value: scenario.state.value, category: "state" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Invalid", value: bool(scenario.state.invalid), category: "state" },
        { label: "Required", value: bool(scenario.state.required), category: "state" },
        { label: "Loop", value: bool(scenario.state.loop), category: "behavior" },
        { label: "Orientation", value: scenario.state.orientation, category: "behavior" },
      ],
    },
    {
      title: "Item",
      selector: "[data-radio-root][data-state='checked']",
      summary: selected?.dataset.value ?? "none",
      groups: [
        {
          title: "Selected item",
          selector: "[data-radio-root][data-state='checked']",
          rows: [
            { label: "Exists", value: yesNo(selected), category: "presence" },
            { label: "Value", value: selected?.dataset.value ?? "none", category: "state" },
            { label: "Composition", value: scenario.state.composition, category: "composition" },
          ],
        },
        {
          title: "Disabled item",
          selector: "[data-radio-root][data-value='sms']",
          rows: [
            { label: "Exists", value: yesNo(disabled), category: "presence" },
            { label: "Disabled option", value: bool(scenario.state.disabledItem), category: "state" },
          ],
        },
      ],
    },
    hiddenInputSection("Generated hidden input", "input[name='notification-channel'][value='email']", input),
  ];

  return <AnatomyPanel footer={`${sections.length} parts`} openGroups={openGroups} sections={sections} onOpenGroupsChange={onOpenGroupsChange} />;
}

export function ToggleGroupScenarioAnatomy({
  openGroups,
  scenario,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  scenario: ToggleGroupScenario;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const root = document.querySelector<HTMLElement>("[data-toggle-group-root]");
  const selected = document.querySelector<HTMLElement>("[data-toggle-group-item][data-state='on']");
  const disabled = document.querySelector<HTMLElement>("[data-toggle-group-item][data-value='italic']");
  const value = Array.isArray(scenario.state.value) ? scenario.state.value.join(", ") : scenario.state.value;
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-toggle-group-root]",
      summary: scenario.state.type,
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Mode", value: scenario.state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Type", value: scenario.state.type, category: "state" },
        { label: "Value", value: value || "none", category: "state" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Loop", value: bool(scenario.state.loop), category: "behavior" },
        { label: "Orientation", value: scenario.state.orientation, category: "behavior" },
      ],
    },
    {
      title: "Item",
      selector: "[data-toggle-group-item][data-state='on']",
      summary: selected?.dataset.value ?? "none",
      groups: [
        {
          title: "Selected item",
          selector: "[data-toggle-group-item][data-state='on']",
          rows: [
            { label: "Exists", value: yesNo(selected), category: "presence" },
            { label: "Value", value: selected?.dataset.value ?? "none", category: "state" },
            { label: "Composition", value: scenario.state.composition, category: "composition" },
          ],
        },
        {
          title: "Disabled item",
          selector: "[data-toggle-group-item][data-value='italic']",
          rows: [
            { label: "Exists", value: yesNo(disabled), category: "presence" },
            { label: "Disabled option", value: bool(scenario.state.disabledItem), category: "state" },
          ],
        },
      ],
    },
  ];

  return <AnatomyPanel footer={`${sections.length} parts`} openGroups={openGroups} sections={sections} onOpenGroupsChange={onOpenGroupsChange} />;
}

export function ButtonScenarioToolbar({ scenario }: { scenario: ButtonScenario }) {
  return (
    <ControlToolbar label="Button controls">
      <ToolbarGroup title="State" value="state">
        <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
        <MenuCheckboxControl checked={scenario.state.loading} label="Loading" value="loading" onChange={scenario.actions.setLoading} />
        <MenuCheckboxControl checked={scenario.state.linkMode} label="Link mode" value="link" onChange={scenario.actions.setLinkMode} />
      </ToolbarGroup>
      <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
    </ControlToolbar>
  );
}

export function CheckboxScenarioToolbar({ scenario }: { scenario: CheckboxScenario }) {
  return (
    <ControlToolbar label="Checkbox controls">
      <ToolbarGroup title="State" value="state">
        <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
        <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
        <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
        <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
        <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
      </ToolbarGroup>
      <ToolbarGroup title="Content" value="content">
        <MenuCheckboxControl checked={scenario.state.forceMount} label="Force indicator" value="force-indicator" onChange={scenario.actions.setForceMount} />
        <MenuRadioControl label="Checked" options={checkboxStateOptions} value={String(scenario.state.checked)} onChange={(value) => scenario.actions.setChecked(parseCheckboxState(value))} />
      </ToolbarGroup>
      <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
    </ControlToolbar>
  );
}

export function SwitchScenarioToolbar({ scenario }: { scenario: SwitchScenario }) {
  return (
    <ControlToolbar label="Switch controls">
      <ToolbarGroup title="State" value="state">
        <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
        <MenuCheckboxControl checked={scenario.state.checked} label="Checked" value="checked" onChange={scenario.actions.setChecked} />
        <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
        <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
        <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
        <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
      </ToolbarGroup>
      <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
    </ControlToolbar>
  );
}

export function ToggleScenarioToolbar({ scenario }: { scenario: ToggleScenario }) {
  return (
    <ControlToolbar label="Toggle controls">
      <ToolbarGroup title="State" value="state">
        <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
        <MenuCheckboxControl checked={scenario.state.pressed} label="Pressed" value="pressed" onChange={scenario.actions.setPressed} />
        <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
      </ToolbarGroup>
      <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
    </ControlToolbar>
  );
}

export function RadioGroupScenarioToolbar({ scenario }: { scenario: RadioGroupScenario }) {
  return (
    <ControlToolbar label="Radio Group controls">
      <ToolbarGroup title="State" value="state">
        <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
        <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
        <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
        <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
        <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
      </ToolbarGroup>
      <ToolbarGroup title="Items" value="items">
        <MenuCheckboxControl checked={scenario.state.disabledItem} label="SMS disabled" value="sms-disabled" onChange={scenario.actions.setDisabledItem} />
        <MenuRadioControl label="Value" options={choiceOptions} value={scenario.state.value} onChange={scenario.actions.setValue} />
      </ToolbarGroup>
      <ToolbarGroup title="Content" value="content">
        <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
      </ToolbarGroup>
      <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
    </ControlToolbar>
  );
}

export function ToggleGroupScenarioToolbar({ scenario }: { scenario: ToggleGroupScenario }) {
  const valueString = Array.isArray(scenario.state.value) ? scenario.state.value[0] ?? "none" : scenario.state.value || "none";

  return (
    <ControlToolbar label="Toggle Group controls">
      <ToolbarGroup title="State" value="state">
        <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
        <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
        <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
        <MenuRadioControl label="Type" options={toggleGroupTypeOptions} value={scenario.state.type} onChange={scenario.actions.setType} />
      </ToolbarGroup>
      <ToolbarGroup title="Items" value="items">
        <MenuCheckboxControl checked={scenario.state.disabledItem} label="Italic disabled" value="italic-disabled" onChange={scenario.actions.setDisabledItem} />
        <MenuRadioControl label="Value" options={toggleChoiceOptions} value={valueString} onChange={(value) => scenario.actions.setValue(scenario.state.type === "single" ? value : [value])} />
      </ToolbarGroup>
      <ToolbarGroup title="Content" value="content">
        <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
      </ToolbarGroup>
      <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
    </ControlToolbar>
  );
}

export function ScenarioEventLog({ log }: { log: LogEntry[] }) {
  return (
    <div className="scenario-log">
      <ScrollArea.Root className="event-log" orientation="vertical">
        <ScrollArea.Viewport className="event-log-viewport" focusable aria-label="Event log">
          <ol>
            {log.map((entry) => (
              <li key={entry.id}>
                <time>{entry.time}</time>
                <span>{entry.text}</span>
              </li>
            ))}
          </ol>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    </div>
  );
}

export function getButtonSource(state: ButtonScenario["state"]) {
  return `<Button.Root
  disabled={${state.disabled}}
  loading={${state.loading}}
  ${state.linkMode ? `href="#button-link"` : ""}
  onPress={handlePress}
>
  Run action
</Button.Root>`;
}

export function getCheckboxSource(state: CheckboxScenario["state"]) {
  return `<Checkbox.Root
  ${state.controlled ? `checked={checked}` : `defaultChecked={false}`}
  disabled={${state.disabled}}
  readOnly={${state.readOnly}}
  invalid={${state.invalid}}
  required={${state.required}}
  name="email-updates"
  value="yes"
  ariaLabel="Email updates"
  onCheckedChange={setChecked}
>
  <Checkbox.Indicator forceMount={${state.forceMount}}>✓</Checkbox.Indicator>
</Checkbox.Root>`;
}

export function getSwitchSource(state: SwitchScenario["state"]) {
  return `<Switch.Root
  ${state.controlled ? `checked={checked}` : `defaultChecked={false}`}
  disabled={${state.disabled}}
  readOnly={${state.readOnly}}
  invalid={${state.invalid}}
  required={${state.required}}
  name="notifications"
  value="enabled"
  ariaLabel="Notifications"
  onCheckedChange={setChecked}
>
  <Switch.Thumb />
</Switch.Root>`;
}

export function getToggleSource(state: ToggleScenario["state"]) {
  return `<Toggle.Root
  ${state.controlled ? `pressed={pressed}` : `defaultPressed={false}`}
  disabled={${state.disabled}}
  ariaLabel="Bold"
  onPressedChange={setPressed}
>
  Bold
</Toggle.Root>`;
}

export function getRadioGroupSource(state: RadioGroupScenario["state"]) {
  return `<RadioGroup.Root
  ${state.controlled ? `value="${state.value}"` : `defaultValue="email"`}
  disabled={${state.disabled}}
  required={${state.required}}
  invalid={${state.invalid}}
  orientation="${state.orientation}"
  loop={${state.loop}}
  name="notification-channel"
  ariaLabel="Notification channel"
  onValueChange={setValue}
>
  <RadioGroup.Radio value="email">Email</RadioGroup.Radio>
  <RadioGroup.Radio value="sms" disabled={${state.disabledItem}}>SMS</RadioGroup.Radio>
  <RadioGroup.Radio value="push">Push</RadioGroup.Radio>
</RadioGroup.Root>`;
}

export function getToggleGroupSource(state: ToggleGroupScenario["state"]) {
  return `<ToggleGroup.Root
  type="${state.type}"
  ${state.controlled ? `value={value}` : `defaultValue={${state.type === "single" ? `"bold"` : `["bold"]`}}`}
  disabled={${state.disabled}}
  orientation="${state.orientation}"
  loop={${state.loop}}
  ariaLabel="Text formatting"
  onValueChange={setValue}
>
  <ToggleGroup.Item value="bold">B</ToggleGroup.Item>
  <ToggleGroup.Item value="italic" disabled={${state.disabledItem}}>I</ToggleGroup.Item>
  <ToggleGroup.Item value="underline">U</ToggleGroup.Item>
</ToggleGroup.Root>`;
}

function CheckboxRootExample({
  mode,
  rootProps,
  disabled,
  readOnly,
  invalid,
  required,
  children,
}: {
  mode: CompositionMode;
  rootProps: Record<string, unknown>;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  children: ReactNode;
}) {
  const props = {
    ...rootProps,
    className: "control-checkbox",
    "aria-label": "Email updates",
    "data-checkbox-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    disabled,
    readOnly,
    invalid,
    required,
    name: "email-updates",
    value: "yes",
  };

  return mode === "asChild" ? (
    <Checkbox.Root {...props} asChild>
      <span>{children}</span>
    </Checkbox.Root>
  ) : mode === "render" ? (
    <Checkbox.Root {...props} render={(renderProps) => <span {...renderProps}>{children}</span>} />
  ) : (
    <Checkbox.Root {...props}>{children}</Checkbox.Root>
  );
}

function SwitchRootExample({
  mode,
  rootProps,
  disabled,
  readOnly,
  invalid,
  required,
  children,
}: {
  mode: CompositionMode;
  rootProps: Record<string, unknown>;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  children: ReactNode;
}) {
  const props = {
    ...rootProps,
    className: "control-switch",
    ariaLabel: "Notifications",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    "data-switch-root": "",
    disabled,
    readOnly,
    invalid,
    required,
    name: "notifications",
    value: "enabled",
  };

  return mode === "asChild" ? (
    <Switch.Root {...props} asChild>
      <span>{children}</span>
    </Switch.Root>
  ) : mode === "render" ? (
    <Switch.Root {...props} render={(renderProps) => <span {...renderProps}>{children}</span>} />
  ) : (
    <Switch.Root {...props}>{children}</Switch.Root>
  );
}

function ToggleRootExample({
  mode,
  rootProps,
  disabled,
}: {
  mode: CompositionMode;
  rootProps: Record<string, unknown>;
  disabled: boolean;
}) {
  const props = {
    ...rootProps,
    className: "control-toggle",
    ariaLabel: "Bold",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    "data-toggle-root": "",
    disabled,
    value: "bold",
  };

  return mode === "asChild" ? (
    <Toggle.Root {...props} asChild>
      <span>Bold</span>
    </Toggle.Root>
  ) : mode === "render" ? (
    <Toggle.Root {...props} render={(renderProps) => <span {...renderProps}>Bold</span>} />
  ) : (
    <Toggle.Root {...props}>Bold</Toggle.Root>
  );
}

function RadioItem({
  value,
  label,
  disabled = false,
  mode,
}: {
  value: string;
  label: string;
  disabled?: boolean;
  mode: CompositionMode;
}) {
  const props = {
    className: "control-radio",
    "data-playground-inspect": "",
    "data-prop-check": value === "email" ? "radio" : undefined,
    "data-radio-root": "",
    "data-value": value,
    disabled,
    value,
  };

  const inner = (
    <>
      <span className="control-radio-dot" aria-hidden="true" />
      <span>{label}</span>
    </>
  );

  return mode === "asChild" ? (
    <RadioGroup.Radio {...props} asChild>
      <span>{inner}</span>
    </RadioGroup.Radio>
  ) : mode === "render" ? (
    <RadioGroup.Radio {...props} render={(renderProps) => <span {...renderProps}>{inner}</span>} />
  ) : (
    <RadioGroup.Radio {...props}>{inner}</RadioGroup.Radio>
  );
}

function ToggleGroupItem({
  value,
  label,
  disabled = false,
  mode,
}: {
  value: string;
  label: string;
  disabled?: boolean;
  mode: CompositionMode;
}) {
  const props = {
    className: "control-toggle-group-item",
    "data-playground-inspect": "",
    "data-prop-check": value === "bold" ? "item" : undefined,
    "data-toggle-group-item": "",
    disabled,
    value,
  };

  return mode === "asChild" ? (
    <ToggleGroup.Item {...props} asChild>
      <span>{label}</span>
    </ToggleGroup.Item>
  ) : mode === "render" ? (
    <ToggleGroup.Item {...props} render={(renderProps) => <span {...renderProps}>{label}</span>} />
  ) : (
    <ToggleGroup.Item {...props}>{label}</ToggleGroup.Item>
  );
}

function ControlToolbar({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Menubar.Root className="canvas-toolbar" aria-label={label}>
      {children}
    </Menubar.Root>
  );
}

function ToolbarGroup({ title, value, children }: { title: string; value: string; children: ReactNode }) {
  return (
    <Menubar.Menu value={value}>
      <Menubar.Trigger className="toolbar-group-trigger">{title}</Menubar.Trigger>
      <Menubar.Content className="toolbar-menu" align="start" sideOffset={6}>
        {children}
      </Menubar.Content>
    </Menubar.Menu>
  );
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

function MenuSection({ label }: { label: string }) {
  return <div className="toolbar-menu-label">{label}</div>;
}

function MenuCheckboxControl({
  checked,
  label,
  value,
  onChange,
}: {
  checked: boolean;
  label: string;
  value: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Menubar.CheckboxItem
      className="toolbar-menu-item"
      checked={checked}
      value={value}
      onCheckedChange={onChange}
    >
      <span>{label}</span>
      <span className="toolbar-menu-check" aria-hidden="true">{checked ? "✓" : ""}</span>
    </Menubar.CheckboxItem>
  );
}

function MenuRadioControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | string;
  onChange: (value: T) => void;
}) {
  return (
    <>
      <MenuSection label={label} />
      <Menubar.RadioGroup className="toolbar-radio-group" value={value} onValueChange={(nextValue) => onChange(nextValue as T)}>
        {options.map((option) => (
          <Menubar.RadioItem className="toolbar-menu-item" key={option} value={option}>
            <span>{formatOption(option)}</span>
            <span className="toolbar-menu-check" aria-hidden="true">{value === option ? "✓" : ""}</span>
          </Menubar.RadioItem>
        ))}
      </Menubar.RadioGroup>
    </>
  );
}

function hiddenInputSection(title: string, selector: string, input: HTMLInputElement | null): AnatomySection {
  return {
    title,
    selector,
    inactive: !input,
    summary: input?.value ?? "not rendered",
    rows: [
      { label: "Exists", value: yesNo(input), category: "presence" },
      { label: "Checked", value: input ? bool(input.checked) : "false", category: "state" },
      { label: "Name", value: input?.name ?? "none", category: "identity" },
      { label: "Value", value: input?.value ?? "none", category: "state" },
    ],
  };
}

function stateSummary(element: HTMLElement | null, fallback: string) {
  return element?.dataset.state ?? element?.tagName.toLowerCase() ?? fallback;
}

function yesNo(value: unknown) {
  return value ? "true" : "false";
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

function parseCheckboxState(value: string): CheckboxCheckedState {
  if (value === "true") return true;
  if (value === "indeterminate") return "indeterminate";
  return false;
}

function formatOption(value: string) {
  if (value === "asChild") return "As Child";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const compositionOptions = ["default", "asChild", "render"] as const;
const checkboxStateOptions = ["false", "true", "indeterminate"] as const;
const choiceOptions = ["email", "sms", "push"] as const;
const toggleChoiceOptions = ["bold", "italic", "underline"] as const;
const toggleGroupTypeOptions = ["single", "multiple"] as const;
const orientationOptions = ["horizontal", "vertical"] as const;
