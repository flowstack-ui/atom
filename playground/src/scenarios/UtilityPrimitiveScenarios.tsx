import { Collapsible } from "@flowstack-ui/atom/collapsible";
import { Menubar } from "@flowstack-ui/atom/menubar";
import { Pressable } from "@flowstack-ui/atom/pressable";
import { Progress } from "@flowstack-ui/atom/progress";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import { SkipLink } from "@flowstack-ui/atom/skip-link";
import { Toolbar } from "@flowstack-ui/atom/toolbar";
import { VisuallyHidden } from "@flowstack-ui/atom/visually-hidden";
import { useState, type Dispatch, type KeyboardEvent, type ReactNode, type SetStateAction } from "react";
import { AnatomyPanel, type AnatomySection } from "../AnatomyPanel";

type CompositionMode = "default" | "asChild" | "render";
type ProgressMode = "determinate" | "complete" | "indeterminate" | "invalid";
type Orientation = "horizontal" | "vertical";
type Direction = "ltr" | "rtl";
type ToggleType = "single" | "multiple";

type LogEntry = {
  id: number;
  time: string;
  text: string;
};

export const utilityPrimitiveScenarioIds = new Set([
  "progress",
  "pressable",
  "visually-hidden",
  "skip-link",
  "collapsible",
  "toolbar",
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
    progress: useProgressScenario(),
    pressable: usePressableScenario(),
    visuallyHidden: useVisuallyHiddenScenario(),
    skipLink: useSkipLinkScenario(),
    collapsible: useCollapsibleScenario(),
    toolbar: useToolbarScenario(),
  };
}

function useProgressScenario() {
  const [mode, setMode] = useState<ProgressMode>("determinate");
  const [value, setValue] = useState(42);
  const [customLabel, setCustomLabel] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [indicatorComposition, setIndicatorComposition] = useState<CompositionMode>("default");
  const { log, clearLog } = useScenarioLog();

  return {
    state: { mode, value, customLabel, composition, indicatorComposition, log },
    actions: { setMode, setValue, setCustomLabel, setComposition, setIndicatorComposition, clearLog },
  };
}

function usePressableScenario() {
  const [disabled, setDisabled] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [pressCount, setPressCount] = useState(0);
  const { log, addLog, clearLog } = useScenarioLog();

  const note = (text: string) => addLog(text);
  const handlePress = () => {
    setPressCount((count) => count + 1);
    addLog("pressed");
  };

  return {
    state: { disabled, composition, pressCount, log },
    actions: { setDisabled, setComposition, handlePress, note, clearLog },
  };
}

function useVisuallyHiddenScenario() {
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [customStyle, setCustomStyle] = useState(false);
  const { log, clearLog } = useScenarioLog();

  return {
    state: { composition, customStyle, log },
    actions: { setComposition, setCustomStyle, clearLog },
  };
}

function useSkipLinkScenario() {
  const [focusTarget, setFocusTarget] = useState(true);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [targetComposition, setTargetComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { focusTarget, composition, targetComposition, log },
    actions: {
      setFocusTarget,
      setComposition,
      setTargetComposition,
      clearLog,
      noteClick: () => addLog("skip link clicked"),
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
  const [dir, setDir] = useState<Direction>("ltr");
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

export type UtilityPrimitiveScenarios = ReturnType<typeof useUtilityPrimitiveScenarios>;

export function UtilityPrimitiveScenarioToolbar({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: UtilityPrimitiveScenarios;
}) {
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
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
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
      </ControlToolbar>
    );
  }

  if (scenarioId === "skip-link") {
    const scenario = scenarios.skipLink;
    return (
      <ControlToolbar label="Skip Link controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.focusTarget} label="Focus target" value="focus-target" onChange={scenario.actions.setFocusTarget} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.composition} onChange={scenario.actions.setComposition} />
          <MenuRadioControl label="Target" options={compositionOptions} value={scenario.state.targetComposition} onChange={scenario.actions.setTargetComposition} />
        </ToolbarGroup>
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

  return null;
}

export function UtilityPrimitiveScenarioCanvas({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: UtilityPrimitiveScenarios;
}) {
  if (scenarioId === "progress") return <ProgressScenarioCanvas scenario={scenarios.progress} />;
  if (scenarioId === "pressable") return <PressableScenarioCanvas scenario={scenarios.pressable} />;
  if (scenarioId === "visually-hidden") return <VisuallyHiddenScenarioCanvas scenario={scenarios.visuallyHidden} />;
  if (scenarioId === "skip-link") return <SkipLinkScenarioCanvas scenario={scenarios.skipLink} />;
  if (scenarioId === "collapsible") return <CollapsibleScenarioCanvas scenario={scenarios.collapsible} />;
  if (scenarioId === "toolbar") return <ToolbarScenarioCanvas scenario={scenarios.toolbar} />;
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
    return `Focus target ${state.focusTarget} | Root ${state.composition} | Target ${state.targetComposition}`;
  }

  if (scenarioId === "collapsible") {
    const state = scenarios.collapsible.state;
    return `${state.open ? "Open" : "Closed"} | ${state.controlled ? "Controlled" : "Uncontrolled"} | Keep mounted ${state.keepMounted}`;
  }

  if (scenarioId === "toolbar") {
    const state = scenarios.toolbar.state;
    return `${state.orientation} | ${state.dir} | Loop ${state.loop} | Value ${getToolbarValue(state.toggleValue)}`;
  }

  return "";
}

export function getUtilityPrimitiveSource(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
) {
  if (scenarioId === "progress") {
    const state = scenarios.progress.state;
    return `<Progress.Root value={${String(getProgressValue(state.mode, state.value))}}>
  <Progress.Indicator />
</Progress.Root>`;
  }

  if (scenarioId === "pressable") {
    const state = scenarios.pressable.state;
    return `<Pressable.Root
  disabled={${state.disabled}}
  onPress={handlePress}
>
  Press action
</Pressable.Root>`;
  }

  if (scenarioId === "visually-hidden") {
    return `<button type="button">
  Search
  <VisuallyHidden.Root>Search the workspace</VisuallyHidden.Root>
</button>`;
  }

  if (scenarioId === "skip-link") {
    const state = scenarios.skipLink.state;
    return `<SkipLink.Root href="#playground-main" focusTarget={${state.focusTarget}}>
  Skip to content
</SkipLink.Root>
<SkipLink.Target id="playground-main">
  Main content
</SkipLink.Target>`;
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

  return "// No source example for this scenario yet.";
}

function ProgressScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useProgressScenario> }) {
  const value = getProgressValue(scenario.state.mode, scenario.state.value);
  const min = scenario.state.mode === "invalid" ? 10 : 0;
  const max = scenario.state.mode === "invalid" ? 0 : 100;
  const props = {
    className: "utility-progress",
    "data-progress-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    value,
    min,
    max,
    getValueLabel: scenario.state.customLabel
      ? (nextValue: number, nextMin: number, nextMax: number) => `${nextValue - nextMin} of ${nextMax - nextMin} steps`
      : undefined,
  };
  const indicator = (
    <ProgressIndicatorExample
      mode={scenario.state.indicatorComposition}
      percent={value === null ? null : Math.max(0, Math.min(100, value))}
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

function ProgressIndicatorExample({ mode, percent }: { mode: CompositionMode; percent: number | null }) {
  const props = {
    className: "utility-progress-indicator",
    "data-progress-indicator": "",
    "data-playground-inspect": "",
    "data-prop-check": "indicator",
    style: percent === null ? undefined : { width: `${percent}%` },
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
  const props = {
    className: "utility-pressable",
    "data-pressable-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    disabled: scenario.state.disabled,
    onClick: () => scenario.actions.note("user onClick"),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => scenario.actions.note(`user onKeyDown ${event.key}`),
    onPointerDown: () => scenario.actions.note("user pointerdown"),
    onPointerUp: () => scenario.actions.note("user pointerup"),
    onPress: scenario.actions.handlePress,
  };

  return (
    <div className="utility-primitive-stage">
      {scenario.state.composition === "asChild" ? (
        <Pressable.Root {...props} asChild>
          <span>Press action</span>
        </Pressable.Root>
      ) : scenario.state.composition === "render" ? (
        <Pressable.Root {...props} render={(renderProps) => <div {...renderProps}>Press action</div>} />
      ) : (
        <Pressable.Root {...props}>Press action</Pressable.Root>
      )}
    </div>
  );
}

function VisuallyHiddenScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useVisuallyHiddenScenario> }) {
  const hiddenProps = {
    "data-playground-inspect": "",
    "data-prop-check": "root",
    "data-visually-hidden-root": "",
    style: scenario.state.customStyle ? { color: "red", width: 12 } : undefined,
  };

  return (
    <div className="utility-primitive-stage">
      <button className="utility-visible-button" type="button" data-playground-inspect="" data-visible-button="">
        Search
        {scenario.state.composition === "asChild" ? (
          <VisuallyHidden.Root {...hiddenProps} asChild>
            <span>Search the workspace</span>
          </VisuallyHidden.Root>
        ) : scenario.state.composition === "render" ? (
          <VisuallyHidden.Root {...hiddenProps} render={(renderProps) => <span {...renderProps}>Search the workspace</span>} />
        ) : (
          <VisuallyHidden.Root {...hiddenProps}>Search the workspace</VisuallyHidden.Root>
        )}
      </button>
    </div>
  );
}

function SkipLinkScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useSkipLinkScenario> }) {
  const rootProps = {
    className: "utility-skip-link",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    "data-skip-link-root": "",
    focusTarget: scenario.state.focusTarget,
    href: "#playground-skip-target" as const,
    onClick: scenario.actions.noteClick,
  };
  const targetProps = {
    className: "utility-skip-target",
    "data-playground-inspect": "",
    "data-prop-check": "target",
    "data-skip-link-target": "",
    id: "playground-skip-target",
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

function getUtilityPrimitiveSections(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
): AnatomySection[] {
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
        { label: "Disabled", value: bool(scenarios.pressable.state.disabled), category: "state" },
        { label: "Press count", value: String(scenarios.pressable.state.pressCount), category: "behavior" },
        { label: "Composition", value: scenarios.pressable.state.composition, category: "composition" },
      ],
    }];
  }

  if (scenarioId === "visually-hidden") {
    const root = document.querySelector<HTMLElement>("[data-visually-hidden-root]");
    const button = document.querySelector<HTMLElement>("[data-visible-button]");
    return [
      {
        title: "Root",
        selector: "[data-visually-hidden-root]",
        summary: root?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Custom style", value: bool(scenarios.visuallyHidden.state.customStyle), category: "state" },
          { label: "Composition", value: scenarios.visuallyHidden.state.composition, category: "composition" },
        ],
      },
      {
        title: "Visible Button",
        selector: "[data-visible-button]",
        summary: button?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!button), category: "presence" },
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
          { label: "Focus target", value: bool(scenarios.skipLink.state.focusTarget), category: "behavior" },
          { label: "Composition", value: scenarios.skipLink.state.composition, category: "composition" },
        ],
      },
      {
        title: "Target",
        selector: "[data-skip-link-target]",
        summary: target?.id ?? "not rendered",
        rows: [
          { label: "Exists", value: bool(!!target), category: "presence" },
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

  return [];
}

function getUtilityPrimitiveLog(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
) {
  if (scenarioId === "progress") return scenarios.progress.state.log;
  if (scenarioId === "pressable") return scenarios.pressable.state.log;
  if (scenarioId === "visually-hidden") return scenarios.visuallyHidden.state.log;
  if (scenarioId === "skip-link") return scenarios.skipLink.state.log;
  if (scenarioId === "collapsible") return scenarios.collapsible.state.log;
  if (scenarioId === "toolbar") return scenarios.toolbar.state.log;
  return [];
}

function getUtilityPrimitiveActions(
  scenarioId: string,
  scenarios: UtilityPrimitiveScenarios,
) {
  if (scenarioId === "progress") return scenarios.progress.actions;
  if (scenarioId === "pressable") return scenarios.pressable.actions;
  if (scenarioId === "visually-hidden") return scenarios.visuallyHidden.actions;
  if (scenarioId === "skip-link") return scenarios.skipLink.actions;
  if (scenarioId === "collapsible") return scenarios.collapsible.actions;
  if (scenarioId === "toolbar") return scenarios.toolbar.actions;
  return null;
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

function getProgressValue(mode: ProgressMode, value: number) {
  if (mode === "indeterminate") return null;
  if (mode === "complete") return 100;
  if (mode === "invalid") return value;
  return value;
}

function getToolbarValue(value: string | string[]) {
  return Array.isArray(value) ? value.join(", ") || "none" : value || "none";
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
const toggleTypeOptions = ["single", "multiple"] as const;
const toolbarValueOptions = ["bold", "italic"] as const;
