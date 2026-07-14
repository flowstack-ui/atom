import { Button } from "@flowstack-ui/atom/button";
import { Checkbox, type CheckboxCheckedState } from "@flowstack-ui/atom/checkbox";
import { Direction, type DirectionValue } from "@flowstack-ui/atom/direction";
import { RadioGroup } from "@flowstack-ui/atom/radio-group";
import { Switch } from "@flowstack-ui/atom/switch";
import { Toggle } from "@flowstack-ui/atom/toggle";
import { ToggleGroup } from "@flowstack-ui/atom/toggle-group";
import { useCallback, useState, type Dispatch, type KeyboardEvent, type MouseEvent, type ReactNode, type SetStateAction } from "react";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import {
  ControlToolbar,
  MenuCheckboxControl,
  MenuRadioControl,
  MenuSection,
  partProps,
  PropsToolbarGroup,
  ScenarioEventLog as ScenarioEventLogBase,
  ToolbarGroup,
} from "../WorkbenchPrimitives";

type LogEntry = {
  id: number;
  time: string;
  text: string;
};

type CompositionMode = "default" | "asChild" | "render";
type Orientation = "horizontal" | "vertical";
type ToggleGroupType = "single" | "multiple";
type ButtonType = "button" | "submit" | "reset";

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
  const [newTab, setNewTab] = useState(false);
  const [customRel, setCustomRel] = useState(false);
  const [blockClick, setBlockClick] = useState(false);
  const [type, setType] = useState<ButtonType>("button");
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [pressCount, setPressCount] = useState(0);
  const [rootRef, setRootRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();

  const markRootRef = useCallback((node: HTMLElement | null) => {
    if (node) setRootRef(node.tagName.toLowerCase());
  }, []);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    addLog("user onClick");
    if (blockClick) {
      event.preventDefault();
      addLog("user onClick blocked press");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      addLog(`user onKeyDown ${event.key === " " ? "Space" : event.key}`);
    }
  };

  const handlePress = () => {
    setPressCount((count) => count + 1);
    addLog("onPress");
  };

  return {
    state: { disabled, loading, linkMode, newTab, customRel, blockClick, type, composition, propCheck, customRootSlot, pressCount, rootRef, log },
    actions: {
      setDisabled,
      setLoading,
      setLinkMode,
      setNewTab,
      setCustomRel,
      setBlockClick,
      setType,
      setComposition,
      setPropCheck,
      setCustomRootSlot,
      markRootRef,
      handleClick,
      handleKeyDown,
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
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customIndicatorSlot, setCustomIndicatorSlot] = useState(false);
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
      propCheck,
      customRootSlot,
      customIndicatorSlot,
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
      setPropCheck,
      setCustomRootSlot,
      setCustomIndicatorSlot,
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
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customThumbSlot, setCustomThumbSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleCheckedChange = (next: boolean) => {
    setChecked(next);
    addLog(`checked changed to ${String(next)}`);
  };

  return {
    state: { controlled, checked, disabled, readOnly, invalid, required, composition, propCheck, customRootSlot, customThumbSlot, log },
    actions: {
      setControlled,
      setChecked,
      setDisabled,
      setReadOnly,
      setInvalid,
      setRequired,
      setComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomThumbSlot,
      handleCheckedChange,
      clearLog,
    },
  };
}

export function useToggleScenario() {
  const [controlled, setControlled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [blockToggle, setBlockToggle] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [rootRef, setRootRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();

  const markRootRef = useCallback((node: HTMLElement | null) => {
    if (node) setRootRef(node.tagName.toLowerCase());
  }, []);

  const handlePressedChange = (next: boolean) => {
    setPressed(next);
    addLog(`pressed changed to ${String(next)}`);
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    addLog("user onClick");
    if (blockToggle) {
      event.preventDefault();
      addLog("user onClick blocked toggle");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    addLog(`user onKeyDown ${event.key === " " ? "Space" : event.key}`);
    if (blockToggle) {
      event.preventDefault();
      addLog(`user onKeyDown ${event.key === " " ? "Space" : event.key} blocked toggle`);
    }
  };

  return {
    state: { controlled, pressed, disabled, blockToggle, composition, propCheck, customRootSlot, rootRef, log },
    actions: {
      setControlled,
      setPressed,
      setDisabled,
      setBlockToggle,
      setComposition,
      setPropCheck,
      setCustomRootSlot,
      markRootRef,
      handlePressedChange,
      handleClick,
      handleKeyDown,
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
  const [direction, setDirection] = useState<DirectionValue>("ltr");
  const [disabledItem, setDisabledItem] = useState(false);
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [radioComposition, setRadioComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customRadioSlot, setCustomRadioSlot] = useState(false);
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
      direction,
      disabledItem,
      rootComposition,
      radioComposition,
      propCheck,
      customRootSlot,
      customRadioSlot,
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
      setDirection,
      setDisabledItem,
      setRootComposition,
      setRadioComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomRadioSlot,
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
  const [direction, setDirection] = useState<DirectionValue>("ltr");
  const [disabledItem, setDisabledItem] = useState(true);
  const [blockItemPress, setBlockItemPress] = useState(false);
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customItemSlot, setCustomItemSlot] = useState(false);
  const [rootRef, setRootRef] = useState("none");
  const [itemRefs, setItemRefs] = useState<Record<string, string>>({});
  const { log, addLog, clearLog } = useScenarioLog();

  const markRootRef = useCallback((node: HTMLElement | null) => {
    if (node) setRootRef(node.tagName.toLowerCase());
  }, []);

  const markItemRef = useCallback((value: string, node: HTMLElement | null) => {
    if (!node) return;
    const tag = node.tagName.toLowerCase();
    setItemRefs((refs) => (refs[value] === tag ? refs : { ...refs, [value]: tag }));
  }, []);

  const handleTypeChange = (next: ToggleGroupType) => {
    setType(next);
    setValue(next === "single" ? "bold" : ["bold"]);
  };

  const handleValueChange = (next: string | string[]) => {
    setValue(next);
    addLog(`value changed to ${Array.isArray(next) ? next.join(", ") || "none" : next || "none"}`);
  };

  const handleRootKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      addLog(`root user onKeyDown ${event.key}`);
    }
  };

  const handleItemClick = (itemValue: string, event: MouseEvent<HTMLElement>) => {
    addLog(`item user onClick ${itemValue}`);
    if (blockItemPress) {
      event.preventDefault();
      addLog(`item user onClick blocked ${itemValue}`);
    }
  };

  const handleItemKeyDown = (itemValue: string, event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      addLog(`item user onKeyDown ${event.key === " " ? "Space" : event.key} ${itemValue}`);
      if (blockItemPress) {
        event.preventDefault();
        addLog(`item user onKeyDown blocked ${itemValue}`);
      }
    }
  };

  return {
    state: {
      controlled,
      type,
      value,
      disabled,
      loop,
      orientation,
      direction,
      disabledItem,
      blockItemPress,
      rootComposition,
      itemComposition,
      propCheck,
      customRootSlot,
      customItemSlot,
      rootRef,
      itemRefs,
      log,
    },
    actions: {
      setControlled,
      setType: handleTypeChange,
      setValue,
      setDisabled,
      setLoop,
      setOrientation,
      setDirection,
      setDisabledItem,
      setBlockItemPress,
      setRootComposition,
      setItemComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomItemSlot,
      markRootRef,
      markItemRef,
      handleRootKeyDown,
      handleItemClick,
      handleItemKeyDown,
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
    target: state.linkMode && state.newTab ? "_blank" : undefined,
    rel: state.linkMode && state.customRel ? "author" : undefined,
    type: state.type,
    "data-playground-button-root": "",
    "data-playground-inspect": "",
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customRootSlot }, "button-root-custom"),
    ref: actions.markRootRef,
    onClick: actions.handleClick,
    onKeyDown: actions.handleKeyDown,
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
          propCheck={state.propCheck}
          customRootSlot={state.customRootSlot}
        >
          <Checkbox.Indicator
            className="control-checkbox-indicator"
            data-playground-checkbox-indicator=""
            data-playground-inspect=""
            {...partProps("indicator", { propCheck: state.propCheck, customSlot: state.customIndicatorSlot }, "checkbox-indicator-custom")}
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
      <div className="control-row">
        <SwitchRootExample
          mode={state.composition}
          rootProps={rootProps}
          disabled={state.disabled}
          readOnly={state.readOnly}
          invalid={state.invalid}
          required={state.required}
          propCheck={state.propCheck}
          customRootSlot={state.customRootSlot}
        >
          <Switch.Thumb
            className="control-switch-thumb"
            data-playground-inspect=""
            data-playground-switch-thumb=""
            {...partProps("thumb", { propCheck: state.propCheck, customSlot: state.customThumbSlot }, "switch-thumb-custom")}
          />
        </SwitchRootExample>
        <span>Notifications</span>
      </div>
    </div>
  );
}

export function ToggleScenarioCanvas({ scenario }: { scenario: ToggleScenario }) {
  const { state, actions } = scenario;
  const rootProps = state.controlled
    ? { pressed: state.pressed, onPressedChange: actions.handlePressedChange }
    : { defaultPressed: state.pressed, onPressedChange: actions.handlePressedChange };

  return (
    <div className="form-control-stage">
      <ToggleRootExample
        mode={state.composition}
        rootProps={rootProps}
        disabled={state.disabled}
        propCheck={state.propCheck}
        customRootSlot={state.customRootSlot}
        refCallback={actions.markRootRef}
        onClick={actions.handleClick}
        onKeyDown={actions.handleKeyDown}
      />
    </div>
  );
}

export function RadioGroupScenarioCanvas({ scenario }: { scenario: RadioGroupScenario }) {
  const { state, actions } = scenario;
  const rootProps = state.controlled
    ? { value: state.value, onValueChange: actions.handleValueChange }
    : { defaultValue: "email", onValueChange: actions.handleValueChange };
  const radioItems = (
    <>
      <RadioItem value="email" label="Email" mode={state.radioComposition} propCheck={state.propCheck} customSlot={state.customRadioSlot} />
      <RadioItem value="sms" label="SMS" mode={state.radioComposition} disabled={state.disabledItem} propCheck={state.propCheck} customSlot={state.customRadioSlot} />
      <RadioItem value="push" label="Push" mode={state.radioComposition} propCheck={state.propCheck} customSlot={state.customRadioSlot} />
    </>
  );
  const groupProps = {
    ...rootProps,
    className: "control-choice-group",
    ariaLabel: "Notification channel",
    "data-playground-inspect": "",
    "data-playground-radio-group-root": "",
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customRootSlot }, "radio-group-root-custom"),
    disabled: state.disabled,
    invalid: state.invalid,
    loop: state.loop,
    name: "notification-channel",
    orientation: state.orientation,
    required: state.required,
  };
  const group = state.rootComposition === "asChild" ? (
    <RadioGroup.Root {...groupProps} asChild>
      <section>{radioItems}</section>
    </RadioGroup.Root>
  ) : state.rootComposition === "render" ? (
    <RadioGroup.Root {...groupProps} render={(renderProps) => <section {...renderProps} />}>
      {radioItems}
    </RadioGroup.Root>
  ) : (
    <RadioGroup.Root {...groupProps}>{radioItems}</RadioGroup.Root>
  );

  return (
    <div className="form-control-stage">
      <Direction.Provider dir={state.direction}>
        {group}
      </Direction.Provider>
    </div>
  );
}

export function ToggleGroupScenarioCanvas({ scenario }: { scenario: ToggleGroupScenario }) {
  const { state, actions } = scenario;
  const rootProps = {
    ...(state.controlled
      ? { value: state.value, onValueChange: actions.handleValueChange }
      : { defaultValue: state.type === "single" ? "bold" : ["bold"], onValueChange: actions.handleValueChange }),
    ref: actions.markRootRef,
    className: "control-toggle-group",
    ariaLabel: "Text formatting",
    "data-playground-inspect": "",
    "data-playground-toggle-group-root": "",
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customRootSlot }, "toggle-group-root-custom"),
    disabled: state.disabled,
    loop: state.loop,
    onKeyDown: actions.handleRootKeyDown,
    orientation: state.orientation,
    type: state.type,
  };

  const items = (
    <>
      <ToggleGroupItem
        value="bold"
        label="B"
        ariaLabel="Bold"
        mode={state.itemComposition}
        onClick={actions.handleItemClick}
        onKeyDown={actions.handleItemKeyDown}
        onRef={actions.markItemRef}
        propCheck={state.propCheck}
        customSlot={state.customItemSlot}
      />
      <ToggleGroupItem
        value="italic"
        label="I"
        ariaLabel="Italic"
        mode={state.itemComposition}
        disabled={state.disabledItem}
        onClick={actions.handleItemClick}
        onKeyDown={actions.handleItemKeyDown}
        onRef={actions.markItemRef}
        propCheck={state.propCheck}
        customSlot={state.customItemSlot}
      />
      <ToggleGroupItem
        value="underline"
        label="U"
        ariaLabel="Underline"
        mode={state.itemComposition}
        onClick={actions.handleItemClick}
        onKeyDown={actions.handleItemKeyDown}
        onRef={actions.markItemRef}
        propCheck={state.propCheck}
        customSlot={state.customItemSlot}
      />
    </>
  );

  const group = state.rootComposition === "asChild" ? (
    <ToggleGroup.Root {...rootProps} asChild>
      <section>{items}</section>
    </ToggleGroup.Root>
  ) : state.rootComposition === "render" ? (
    <ToggleGroup.Root {...rootProps} render={(renderProps) => <section {...renderProps} />}>
      {items}
    </ToggleGroup.Root>
  ) : (
    <ToggleGroup.Root {...rootProps}>{items}</ToggleGroup.Root>
  );

  return (
    <div className="form-control-stage">
      <Direction.Provider dir={state.direction}>{group}</Direction.Provider>
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
  const root = document.querySelector<HTMLElement>("[data-playground-button-root]");
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-playground-button-root]",
      summary: stateSummary(root, "button"),
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Ref target", value: scenario.state.rootRef, category: "identity" },
        { label: "Text", value: root?.textContent?.trim() || "none", category: "state" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Loading", value: bool(scenario.state.loading), category: "state" },
        { label: "Link mode", value: bool(scenario.state.linkMode), category: "behavior" },
        { label: "New tab", value: bool(scenario.state.newTab), category: "behavior" },
        { label: "Custom rel", value: bool(scenario.state.customRel), category: "behavior" },
        { label: "Block click", value: bool(scenario.state.blockClick), category: "behavior" },
        { label: "Type", value: scenario.state.type, category: "state" },
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
  const root = document.querySelector<HTMLElement>("[data-playground-checkbox-root]");
  const indicator = document.querySelector<HTMLElement>("[data-playground-checkbox-indicator]");
  const input = document.querySelector<HTMLInputElement>("input[name='email-updates']");
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-playground-checkbox-root]",
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
      selector: "[data-playground-checkbox-indicator]",
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
  const root = document.querySelector<HTMLElement>("[data-playground-switch-root]");
  const thumb = document.querySelector<HTMLElement>("[data-playground-switch-thumb]");
  const input = document.querySelector<HTMLInputElement>("input[name='notifications']");
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-playground-switch-root]",
      summary: root?.dataset.state ?? "unchecked",
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Mode", value: scenario.state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Checked", value: String(root?.getAttribute("aria-checked") === "true"), category: "state" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Invalid", value: bool(scenario.state.invalid), category: "state" },
        { label: "Read only", value: bool(scenario.state.readOnly), category: "state" },
        { label: "Required", value: bool(scenario.state.required), category: "state" },
        { label: "Composition", value: scenario.state.composition, category: "composition" },
      ],
    },
    {
      title: "Thumb",
      selector: "[data-playground-switch-thumb]",
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
  const root = document.querySelector<HTMLElement>("[data-playground-toggle-root]");
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-playground-toggle-root]",
      summary: root?.dataset.state ?? "off",
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Ref target", value: scenario.state.rootRef, category: "identity" },
        { label: "Text", value: root?.textContent?.trim() || "none", category: "state" },
        { label: "Mode", value: scenario.state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Pressed", value: bool(root?.dataset.state === "on"), category: "state" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Block toggle", value: bool(scenario.state.blockToggle), category: "behavior" },
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
  const root = document.querySelector<HTMLElement>("[data-playground-radio-group-root]");
  const selected = document.querySelector<HTMLElement>("[data-playground-radio-root][data-state='checked']");
  const selectedValue = selected?.dataset.value ?? scenario.state.value;
  const input = document.querySelector<HTMLInputElement>(`input[name='notification-channel'][value='${selectedValue}']`);
  const itemSections: AnatomySection[] = [
    { title: "Item: Email", value: "email", label: "Email" },
    { title: "Item: SMS", value: "sms", label: "SMS" },
    { title: "Item: Push", value: "push", label: "Push" },
  ].map(({ title, value: itemValue, label }): AnatomySection => {
    const item = document.querySelector<HTMLElement>(`[data-playground-radio-root][data-value='${itemValue}']`);
    const isDisabled = item?.matches(":disabled,[aria-disabled='true'],[data-disabled]") ?? false;

    return {
      title,
      selector: `[data-playground-radio-root][data-value='${itemValue}']`,
      summary: item?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: yesNo(item), category: "presence" },
        { label: "Text", value: item?.textContent?.trim() || label, category: "identity" },
        { label: "Value", value: itemValue, category: "state" },
        { label: "Checked", value: bool(item?.dataset.state === "checked"), category: "state" },
        { label: "Disabled", value: bool(isDisabled), category: "state" },
        { label: "Composition", value: scenario.state.radioComposition, category: "composition" },
      ],
    };
  });
  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-playground-radio-group-root]",
      summary: selectedValue,
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Mode", value: scenario.state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Value", value: selectedValue, category: "state" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Invalid", value: bool(scenario.state.invalid), category: "state" },
        { label: "Required", value: bool(scenario.state.required), category: "state" },
        { label: "Loop", value: bool(scenario.state.loop), category: "behavior" },
        { label: "Orientation", value: scenario.state.orientation, category: "behavior" },
        { label: "Direction", value: scenario.state.direction, category: "behavior" },
        { label: "Composition", value: scenario.state.rootComposition, category: "composition" },
      ],
    },
    ...itemSections,
    hiddenInputSection("Generated hidden input", `input[name='notification-channel'][value='${selectedValue}']`, input),
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
  const root = document.querySelector<HTMLElement>("[data-playground-toggle-group-root]");
  const value = Array.isArray(scenario.state.value) ? scenario.state.value.join(", ") : scenario.state.value;
  const itemSections: AnatomySection[] = [
    { title: "Item: Bold", value: "bold", label: "B" },
    { title: "Item: Italic", value: "italic", label: "I" },
    { title: "Item: Underline", value: "underline", label: "U" },
  ].map(({ title, value: itemValue, label }): AnatomySection => {
    const item = document.querySelector<HTMLElement>(`[data-playground-toggle-group-item][data-value='${itemValue}']`);
    const isDisabled = item?.matches(":disabled,[aria-disabled='true'],[data-disabled]") ?? false;

    return {
      title,
      selector: `[data-playground-toggle-group-item][data-value='${itemValue}']`,
      summary: item?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: yesNo(item), category: "presence" },
        { label: "Ref target", value: scenario.state.itemRefs[itemValue] ?? "none", category: "identity" },
        { label: "Text", value: item?.textContent?.trim() || label, category: "identity" },
        { label: "Value", value: itemValue, category: "state" },
        { label: "Pressed", value: bool(item?.dataset.state === "on"), category: "state" },
        { label: "Disabled", value: bool(isDisabled), category: "state" },
        { label: "Composition", value: scenario.state.itemComposition, category: "composition" },
        { label: "Block press", value: bool(scenario.state.blockItemPress), category: "behavior" },
      ],
    };
  });

  const sections: AnatomySection[] = [
    {
      title: "Root",
      selector: "[data-playground-toggle-group-root]",
      summary: scenario.state.type,
      rows: [
        { label: "Exists", value: yesNo(root), category: "presence" },
        { label: "Ref target", value: scenario.state.rootRef, category: "identity" },
        { label: "Mode", value: scenario.state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Type", value: scenario.state.type, category: "state" },
        { label: "Value", value: value || "none", category: "state" },
        { label: "Disabled", value: bool(scenario.state.disabled), category: "state" },
        { label: "Loop", value: bool(scenario.state.loop), category: "behavior" },
        { label: "Orientation", value: scenario.state.orientation, category: "behavior" },
        { label: "Direction", value: scenario.state.direction, category: "behavior" },
        { label: "Composition", value: scenario.state.rootComposition, category: "composition" },
      ],
    },
    ...itemSections,
  ];

  return <AnatomyPanel footer={`${sections.length} parts`} openGroups={openGroups} sections={sections} onOpenGroupsChange={onOpenGroupsChange} />;
}

export function ButtonScenarioToolbar({ scenario }: { scenario: ButtonScenario }) {
  return (
    <ControlToolbar label="Button controls">
      <ToolbarGroup title="State" value="state">
        <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
        <MenuCheckboxControl checked={scenario.state.loading} label="Loading" value="loading" onChange={scenario.actions.setLoading} />
        <MenuRadioControl label="Type" options={buttonTypeOptions} value={scenario.state.type} onChange={scenario.actions.setType} />
      </ToolbarGroup>
      <ToolbarGroup title="Link" value="link">
        <MenuCheckboxControl checked={scenario.state.linkMode} label="Use href" value="link" onChange={scenario.actions.setLinkMode} />
        <MenuCheckboxControl checked={scenario.state.newTab} label="New tab" value="new-tab" onChange={scenario.actions.setNewTab} />
        <MenuCheckboxControl checked={scenario.state.customRel} label="Custom rel" value="custom-rel" onChange={scenario.actions.setCustomRel} />
      </ToolbarGroup>
      <ToolbarGroup title="Events" value="events">
        <MenuCheckboxControl checked={scenario.state.blockClick} label="Block click" value="block-click" onChange={scenario.actions.setBlockClick} />
      </ToolbarGroup>
      <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      <PropsToolbarGroup
        propCheck={scenario.state.propCheck}
        onPropCheckChange={scenario.actions.setPropCheck}
        customSlots={[
          {
            checked: scenario.state.customRootSlot,
            label: "Root slot",
            value: "root-slot",
            onChange: scenario.actions.setCustomRootSlot,
          },
        ]}
      />
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
        {scenario.state.controlled ? (
          <MenuRadioControl label="Checked" options={checkboxStateOptions} value={String(scenario.state.checked)} onChange={(value) => scenario.actions.setChecked(parseCheckboxState(value))} />
        ) : null}
      </ToolbarGroup>
      <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      <PropsToolbarGroup
        propCheck={scenario.state.propCheck}
        onPropCheckChange={scenario.actions.setPropCheck}
        customSlots={[
          { checked: scenario.state.customRootSlot, label: "Root", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
          { checked: scenario.state.customIndicatorSlot, label: "Indicator", value: "indicator-slot", onChange: scenario.actions.setCustomIndicatorSlot },
        ]}
      />
    </ControlToolbar>
  );
}

export function SwitchScenarioToolbar({ scenario }: { scenario: SwitchScenario }) {
  return (
    <ControlToolbar label="Switch controls">
      <ToolbarGroup title="State" value="state">
        <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
        {scenario.state.controlled ? (
          <MenuCheckboxControl checked={scenario.state.checked} label="Checked" value="checked" onChange={scenario.actions.setChecked} />
        ) : null}
        <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
        <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
        <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
        <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
      </ToolbarGroup>
      <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      <PropsToolbarGroup
        propCheck={scenario.state.propCheck}
        onPropCheckChange={scenario.actions.setPropCheck}
        customSlots={[
          { checked: scenario.state.customRootSlot, label: "Root", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
          { checked: scenario.state.customThumbSlot, label: "Thumb", value: "thumb-slot", onChange: scenario.actions.setCustomThumbSlot },
        ]}
      />
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
      <ToolbarGroup title="Events" value="events">
        <MenuCheckboxControl checked={scenario.state.blockToggle} label="Block toggle" value="block-toggle" onChange={scenario.actions.setBlockToggle} />
      </ToolbarGroup>
      <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      <PropsToolbarGroup
        propCheck={scenario.state.propCheck}
        onPropCheckChange={scenario.actions.setPropCheck}
        customSlots={[
          {
            checked: scenario.state.customRootSlot,
            label: "Root slot",
            value: "root-slot",
            onChange: scenario.actions.setCustomRootSlot,
          },
        ]}
      />
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
        {scenario.state.controlled ? (
          <MenuRadioControl label="Controlled value" options={choiceOptions} value={scenario.state.value} onChange={scenario.actions.setValue} />
        ) : null}
      </ToolbarGroup>
      <ToolbarGroup title="Content" value="content">
        <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
        <MenuRadioControl label="Direction" options={directionOptions} value={scenario.state.direction} onChange={scenario.actions.setDirection} />
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
        <MenuRadioControl label="Radio" options={compositionOptions} value={scenario.state.radioComposition} onChange={scenario.actions.setRadioComposition} />
      </ToolbarGroup>
      <PropsToolbarGroup
        propCheck={scenario.state.propCheck}
        onPropCheckChange={scenario.actions.setPropCheck}
        customSlots={[
          { checked: scenario.state.customRootSlot, label: "Root", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
          { checked: scenario.state.customRadioSlot, label: "Radio", value: "radio-slot", onChange: scenario.actions.setCustomRadioSlot },
        ]}
      />
    </ControlToolbar>
  );
}

export function ToggleGroupScenarioToolbar({ scenario }: { scenario: ToggleGroupScenario }) {
  const valueString = Array.isArray(scenario.state.value) ? scenario.state.value[0] ?? "none" : scenario.state.value || "none";
  const valueArray = Array.isArray(scenario.state.value)
    ? scenario.state.value
    : scenario.state.value
      ? [scenario.state.value]
      : [];
  const setMultipleValue = (itemValue: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...valueArray, itemValue]))
      : valueArray.filter((value) => value !== itemValue);
    scenario.actions.setValue(next);
  };

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
        {scenario.state.controlled ? (
          scenario.state.type === "single" ? (
            <MenuRadioControl label="Controlled value" options={toggleChoiceOptions} value={valueString} onChange={scenario.actions.setValue} />
          ) : (
            <MenuSection label="Controlled Values">
              <MenuCheckboxControl checked={valueArray.includes("bold")} label="Bold value" value="bold-value" onChange={(checked) => setMultipleValue("bold", checked)} />
              <MenuCheckboxControl checked={valueArray.includes("italic")} label="Italic value" value="italic-value" onChange={(checked) => setMultipleValue("italic", checked)} />
              <MenuCheckboxControl checked={valueArray.includes("underline")} label="Underline value" value="underline-value" onChange={(checked) => setMultipleValue("underline", checked)} />
            </MenuSection>
          )
        ) : null}
      </ToolbarGroup>
      <ToolbarGroup title="Content" value="content">
        <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
        <MenuRadioControl label="Direction" options={directionOptions} value={scenario.state.direction} onChange={scenario.actions.setDirection} />
      </ToolbarGroup>
      <ToolbarGroup title="Events" value="events">
        <MenuCheckboxControl checked={scenario.state.blockItemPress} label="Block item press" value="block-item-press" onChange={scenario.actions.setBlockItemPress} />
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
        <MenuRadioControl label="Item" options={compositionOptions} value={scenario.state.itemComposition} onChange={scenario.actions.setItemComposition} />
      </ToolbarGroup>
      <PropsToolbarGroup
        propCheck={scenario.state.propCheck}
        onPropCheckChange={scenario.actions.setPropCheck}
        customSlots={[
          {
            checked: scenario.state.customRootSlot,
            label: "Root slot",
            value: "root-slot",
            onChange: scenario.actions.setCustomRootSlot,
          },
          {
            checked: scenario.state.customItemSlot,
            label: "Item slot",
            value: "item-slot",
            onChange: scenario.actions.setCustomItemSlot,
          },
        ]}
      />
    </ControlToolbar>
  );
}

export function ScenarioEventLog({ log }: { log: LogEntry[] }) {
  return <ScenarioEventLogBase log={log} />;
}

export function getButtonSource(state: ButtonScenario["state"]) {
  const props = [
    state.disabled ? "disabled" : "",
    state.loading ? "loading" : "",
    state.type !== "button" ? `type="${state.type}"` : "",
    state.linkMode ? `href="#button-link"` : "",
    state.linkMode && state.newTab ? `target="_blank"` : "",
    state.linkMode && state.customRel ? `rel="author"` : "",
    state.customRootSlot ? `data-slot="button-root-custom"` : "",
    state.propCheck ? `data-prop-check="root"` : "",
    "onClick={handleClick}",
    "onPress={handlePress}",
  ].filter(Boolean);

  if (state.composition === "asChild") {
    return `<Button.Root ${props.join(" ")} asChild>
  <span>Run action</span>
</Button.Root>`;
  }

  if (state.composition === "render") {
    return `<Button.Root
  ${props.join("\n  ")}
  render={(props) => <span {...props}>Run action</span>}
/>`;
  }

  return `<Button.Root ${props.join(" ")}>Run action</Button.Root>`;
}

export function getCheckboxSource(state: CheckboxScenario["state"]) {
  const rootExtras = [
    state.composition === "asChild" ? "asChild" : "",
    state.composition === "render" ? `render={(props) => <span {...props} />}` : "",
    state.disabled ? "disabled" : "",
    state.readOnly ? "readOnly" : "",
    state.invalid ? "invalid" : "",
    state.required ? "required" : "",
    state.customRootSlot ? `data-slot="checkbox-root-custom"` : "",
    state.propCheck ? `data-prop-check="root"` : "",
  ].filter(Boolean).join("\n  ");
  const indicatorExtras = [
    state.forceMount ? "forceMount" : "",
    state.customIndicatorSlot ? `data-slot="checkbox-indicator-custom"` : "",
    state.propCheck ? `data-prop-check="indicator"` : "",
  ].filter(Boolean).join(" ");
  const rootChildren = state.composition === "asChild"
    ? `\n  <span>\n    <Checkbox.Indicator${indicatorExtras ? ` ${indicatorExtras}` : ""}>✓</Checkbox.Indicator>\n  </span>`
    : `\n  <Checkbox.Indicator${indicatorExtras ? ` ${indicatorExtras}` : ""}>✓</Checkbox.Indicator>`;
  const closing = state.composition === "asChild" ? "\n</Checkbox.Root>" : "\n</Checkbox.Root>";
  const controlledLine = state.controlled ? `checked={checked}` : "";
  const defaultLine = !state.controlled && state.checked !== false ? `defaultChecked={${JSON.stringify(state.checked)}}` : "";
  const stateLine = [controlledLine, defaultLine].filter(Boolean).join("\n  ");

  return `<Checkbox.Root
  ${stateLine}
  name="email-updates"
  value="yes"
  ariaLabel="Email updates"
  ${rootExtras}
  onCheckedChange={setChecked}
>${rootChildren}${closing}`;
}

export function getSwitchSource(state: SwitchScenario["state"]) {
  const rootExtras = [
    state.disabled ? "disabled" : "",
    state.readOnly ? "readOnly" : "",
    state.invalid ? "invalid" : "",
    state.required ? "required" : "",
    state.customRootSlot ? `data-slot="switch-root-custom"` : "",
    state.propCheck ? `data-prop-check="root"` : "",
  ].filter(Boolean);
  const thumbExtras = [
    state.customThumbSlot ? `data-slot="switch-thumb-custom"` : "",
    state.propCheck ? `data-prop-check="thumb"` : "",
  ].filter(Boolean).join(" ");
  const rootProps = [
    state.controlled ? `checked={checked}` : `defaultChecked={false}`,
    `name="notifications"`,
    `value="enabled"`,
    `ariaLabel="Notifications"`,
    ...rootExtras,
    `onCheckedChange={setChecked}`,
  ];
  const rootPropSource = rootProps.map((prop) => `  ${prop}`).join("\n");
  const thumbSource = `  <Switch.Thumb${thumbExtras ? ` ${thumbExtras}` : ""} />`;
  const rootOpen = state.composition === "asChild"
    ? `<Switch.Root\n${rootPropSource}\n  asChild\n>\n  <span>`
    : state.composition === "render"
      ? `<Switch.Root\n${rootPropSource}\n  render={(props) => <span {...props} />}\n>`
      : `<Switch.Root\n${rootPropSource}\n>`;
  const rootClose = state.composition === "asChild" ? `  </span>\n</Switch.Root>` : `</Switch.Root>`;

  return `<div>
${rootOpen}
${thumbSource}
${rootClose}
  <span>Notifications</span>
</div>`;
}

export function getToggleSource(state: ToggleScenario["state"]) {
  const props = [
    state.controlled ? "pressed={pressed}" : `defaultPressed={${state.pressed}}`,
    state.disabled ? "disabled" : "",
    `ariaLabel="Bold"`,
    `value="bold"`,
    state.blockToggle ? "onClick={blockToggle}" : "onClick={handleClick}",
    state.blockToggle ? "onKeyDown={blockToggle}" : "onKeyDown={handleKeyDown}",
    state.customRootSlot ? `data-slot="toggle-root-custom"` : "",
    state.propCheck ? `data-prop-check="root"` : "",
    "onPressedChange={setPressed}",
    state.composition === "asChild" ? "asChild" : "",
  ].filter(Boolean).join(" ");

  if (state.composition === "asChild") {
    return `<Toggle.Root ${props}>
  <span>Bold</span>
</Toggle.Root>`;
  }

  if (state.composition === "render") {
    return `<Toggle.Root ${props}
  render={(props) => <span {...props}>Bold</span>}
/>`;
  }

  return `<Toggle.Root ${props}>
  Bold
</Toggle.Root>`;
}

export function getRadioGroupSource(state: RadioGroupScenario["state"]) {
  const rootProps = [
    state.controlled ? `value="${state.value}"` : `defaultValue="email"`,
    state.disabled ? "disabled" : "",
    state.required ? "required" : "",
    state.invalid ? "invalid" : "",
    state.orientation !== "vertical" ? `orientation="${state.orientation}"` : "",
    !state.loop ? "loop={false}" : "",
    `name="notification-channel"`,
    `ariaLabel="Notification channel"`,
    state.customRootSlot ? `data-slot="radio-group-root-custom"` : "",
    state.propCheck ? `data-prop-check="root"` : "",
    "onValueChange={setValue}",
  ].filter(Boolean);

  const radioProps = (value: string, disabled = false) => [
    `value="${value}"`,
    disabled ? "disabled" : "",
    state.customRadioSlot ? `data-slot="radio-custom"` : "",
    state.propCheck ? `data-prop-check="radio-${value}"` : "",
  ].filter(Boolean).join(" ");

  const radio = (value: string, label: string, disabled = false) => {
    const props = radioProps(value, disabled);
    if (state.radioComposition === "asChild") {
      return `  <RadioGroup.Radio ${props} asChild>\n    <span>${label}</span>\n  </RadioGroup.Radio>`;
    }
    if (state.radioComposition === "render") {
      return `  <RadioGroup.Radio ${props} render={(props) => <span {...props}>${label}</span>} />`;
    }
    return `  <RadioGroup.Radio ${props}>${label}</RadioGroup.Radio>`;
  };

  const rootOpen = state.rootComposition === "asChild"
    ? `<RadioGroup.Root
  ${rootProps.join("\n  ")}
  asChild
>
  <section>`
    : state.rootComposition === "render"
      ? `<RadioGroup.Root
  ${rootProps.join("\n  ")}
  render={(props) => <section {...props} />}
>`
      : `<RadioGroup.Root
  ${rootProps.join("\n  ")}
>`;
  const rootClose = state.rootComposition === "asChild" ? `  </section>\n</RadioGroup.Root>` : "</RadioGroup.Root>";
  const source = `${rootOpen}
${radio("email", "Email")}
${radio("sms", "SMS", state.disabledItem)}
${radio("push", "Push")}
${rootClose}`;

  return state.direction === "rtl"
    ? `<Direction.Provider dir="rtl">\n${source}\n</Direction.Provider>`
    : source;
}

export function getToggleGroupSource(state: ToggleGroupScenario["state"]) {
  const rootProps = [
    `type="${state.type}"`,
    state.controlled
      ? "value={value}"
      : `defaultValue={${state.type === "single" ? `"bold"` : `["bold"]`}}`,
    state.disabled ? "disabled" : "",
    state.orientation !== "horizontal" ? `orientation="${state.orientation}"` : "",
    !state.loop ? "loop={false}" : "",
    `ariaLabel="Text formatting"`,
    state.customRootSlot ? `data-slot="toggle-group-root-custom"` : "",
    state.propCheck ? `data-prop-check="root"` : "",
    "onValueChange={setValue}",
  ].filter(Boolean);
  const rootOpen = state.rootComposition === "asChild"
    ? `<ToggleGroup.Root ${rootProps.join(" ")} asChild>\n  <section>`
    : state.rootComposition === "render"
      ? `<ToggleGroup.Root\n  ${rootProps.join("\n  ")}\n  render={(props) => <section {...props} />}\n>`
      : `<ToggleGroup.Root\n  ${rootProps.join("\n  ")}\n>`;
  const rootClose = state.rootComposition === "asChild"
    ? `  </section>\n</ToggleGroup.Root>`
    : "</ToggleGroup.Root>";
  const itemProp = state.disabledItem ? " disabled" : "";
  const item = (value: string, label: string, ariaLabel: string, extra = "") => {
    if (state.itemComposition === "asChild") {
      return `  <ToggleGroup.Item value="${value}" ariaLabel="${ariaLabel}"${extra}${state.customItemSlot ? ` data-slot="toggle-group-item-custom"` : ""}${state.propCheck ? ` data-prop-check="item"` : ""} asChild>\n    <span>${label}</span>\n  </ToggleGroup.Item>`;
    }
    if (state.itemComposition === "render") {
      return `  <ToggleGroup.Item value="${value}" ariaLabel="${ariaLabel}"${extra}${state.customItemSlot ? ` data-slot="toggle-group-item-custom"` : ""}${state.propCheck ? ` data-prop-check="item"` : ""} render={(props) => <span {...props}>${label}</span>} />`;
    }
    return `  <ToggleGroup.Item value="${value}" ariaLabel="${ariaLabel}"${extra}${state.customItemSlot ? ` data-slot="toggle-group-item-custom"` : ""}${state.propCheck ? ` data-prop-check="item"` : ""}>${label}</ToggleGroup.Item>`;
  };
  const source = `${rootOpen}
${item("bold", "B", "Bold")}
${item("italic", "I", "Italic", itemProp)}
${item("underline", "U", "Underline")}
${rootClose}`;

  return state.direction === "rtl"
    ? `<Direction.Provider dir="rtl">\n${source}\n</Direction.Provider>`
    : source;
}

function CheckboxRootExample({
  mode,
  rootProps,
  disabled,
  readOnly,
  invalid,
  required,
  propCheck,
  customRootSlot,
  children,
}: {
  mode: CompositionMode;
  rootProps: Record<string, unknown>;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  propCheck: boolean;
  customRootSlot: boolean;
  children: ReactNode;
}) {
  const props = {
    ...rootProps,
    className: "control-checkbox",
    "aria-label": "Email updates",
    "data-playground-checkbox-root": "",
    "data-playground-inspect": "",
    ...partProps("root", { propCheck, customSlot: customRootSlot }, "checkbox-root-custom"),
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
  propCheck,
  customRootSlot,
  children,
}: {
  mode: CompositionMode;
  rootProps: Record<string, unknown>;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  propCheck: boolean;
  customRootSlot: boolean;
  children: ReactNode;
}) {
  const props = {
    ...rootProps,
    className: "control-switch",
    ariaLabel: "Notifications",
    "data-playground-inspect": "",
    "data-playground-switch-root": "",
    ...partProps("root", { propCheck, customSlot: customRootSlot }, "switch-root-custom"),
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
  propCheck,
  customRootSlot,
  refCallback,
  onClick,
  onKeyDown,
}: {
  mode: CompositionMode;
  rootProps: Record<string, unknown>;
  disabled: boolean;
  propCheck: boolean;
  customRootSlot: boolean;
  refCallback: (node: HTMLElement | null) => void;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) {
  const props = {
    ...rootProps,
    className: "control-toggle",
    ariaLabel: "Bold",
    "data-playground-inspect": "",
    "data-playground-toggle-root": "",
    ...partProps("root", { propCheck, customSlot: customRootSlot }, "toggle-root-custom"),
    disabled,
    ref: refCallback,
    onClick,
    onKeyDown,
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
  propCheck,
  customSlot,
}: {
  value: string;
  label: string;
  disabled?: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  customSlot: boolean;
}) {
  const props = {
    className: "control-radio",
    "data-playground-inspect": "",
    "data-playground-radio-root": "",
    "data-value": value,
    ...partProps(`radio-${value}`, { propCheck, customSlot }, "radio-custom"),
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
  ariaLabel,
  disabled = false,
  mode,
  onClick,
  onKeyDown,
  onRef,
  propCheck,
  customSlot,
}: {
  value: string;
  label: string;
  ariaLabel: string;
  disabled?: boolean;
  mode: CompositionMode;
  onClick: (value: string, event: MouseEvent<HTMLElement>) => void;
  onKeyDown: (value: string, event: KeyboardEvent<HTMLElement>) => void;
  onRef: (value: string, node: HTMLElement | null) => void;
  propCheck: boolean;
  customSlot: boolean;
}) {
  const props = {
    className: "control-toggle-group-item",
    "data-playground-inspect": "",
    "data-playground-toggle-group-item": "",
    ...partProps("item", { propCheck, customSlot }, "toggle-group-item-custom"),
    ariaLabel,
    disabled,
    onClick: (event: MouseEvent<HTMLElement>) => onClick(value, event),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => onKeyDown(value, event),
    ref: (node: HTMLElement | null) => onRef(value, node),
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

function hiddenInputSection(title: string, selector: string, input: HTMLInputElement | null): AnatomySection {
  const checked = input ? bool(input.checked) : "false";
  return {
    title,
    selector,
    inactive: !input,
    summary: input ? `checked ${checked}` : "not rendered",
    rows: [
      { label: "Exists", value: yesNo(input), category: "presence" },
      { label: "Checked", value: checked, category: "state" },
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

const compositionOptions = ["default", "asChild", "render"] as const;
const buttonTypeOptions = ["button", "submit", "reset"] as const;
const checkboxStateOptions = ["false", "true", "indeterminate"] as const;
const choiceOptions = ["email", "sms", "push"] as const;
const toggleChoiceOptions = ["bold", "italic", "underline"] as const;
const toggleGroupTypeOptions = ["single", "multiple"] as const;
const orientationOptions = ["horizontal", "vertical"] as const;
const directionOptions = ["ltr", "rtl"] as const;
