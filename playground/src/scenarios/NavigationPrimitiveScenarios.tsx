import { Accordion } from "@flowstack-ui/atom/accordion";
import { AppBar } from "@flowstack-ui/atom/app-bar";
import { BottomNavigation } from "@flowstack-ui/atom/bottom-navigation";
import { Breadcrumb } from "@flowstack-ui/atom/breadcrumb";
import { Button } from "@flowstack-ui/atom/button";
import { Direction } from "@flowstack-ui/atom/direction";
import { NavList } from "@flowstack-ui/atom/nav-list";
import { Pagination, usePaginationContext } from "@flowstack-ui/atom/pagination";
import { Tabs } from "@flowstack-ui/atom/tabs";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { AnatomyPanel, type AnatomySection } from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, partProps, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type Orientation = "horizontal" | "vertical";
type DirectionMode = "ltr" | "rtl";
type ActivationMode = "automatic" | "manual";
type AppBarPosition = "static" | "absolute" | "sticky" | "fixed";
type AppBarDensity = "compact" | "comfortable";
type AccordionSlotPart = "root" | "item" | "header" | "trigger" | "content";
type LogEntry = {
  id: number;
  time: string;
  text: string;
};

export const navigationPrimitiveScenarioIds = new Set([
  "app-bar",
  "tabs",
  "accordion",
  "breadcrumb",
  "pagination",
  "bottom-navigation",
  "nav-list",
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

  return {
    log,
    addLog,
    clearLog: () => setLog([]),
  };
}

export function useNavigationPrimitiveScenarios() {
  return {
    appBar: useAppBarScenario(),
    tabs: useTabsScenario(),
    accordion: useAccordionScenario(),
    breadcrumb: useBreadcrumbScenario(),
    pagination: usePaginationScenario(),
    bottomNavigation: useBottomNavigationScenario(),
    navList: useNavListScenario(),
  };
}

function useAppBarScenario() {
  const [position, setPosition] = useState<AppBarPosition>("static");
  const [density, setDensity] = useState<AppBarDensity>("comfortable");
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { position, density, composition, log },
    actions: {
      setPosition,
      setDensity,
      setComposition,
      clearLog,
      noteAction: (label: string) => addLog(`action ${label}`),
    },
  };
}

function useTabsScenario() {
  const [controlled, setControlled] = useState(true);
  const [value, setValue] = useState("overview");
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [activationMode, setActivationMode] = useState<ActivationMode>("automatic");
  const [loop, setLoop] = useState(true);
  const [disabledTab, setDisabledTab] = useState(true);
  const [keepMounted, setKeepMounted] = useState(false);
  const [focusablePanel, setFocusablePanel] = useState(false);
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: {
      controlled,
      value,
      orientation,
      activationMode,
      loop,
      disabledTab,
      keepMounted,
      focusablePanel,
      triggerComposition,
      log,
    },
    actions: {
      setControlled,
      setOrientation,
      setActivationMode,
      setLoop,
      setDisabledTab,
      setKeepMounted,
      setFocusablePanel,
      setTriggerComposition,
      clearLog,
      setValue: (next: string) => {
        setValue(next);
        addLog(`tab changed to ${next}`);
      },
    },
  };
}

function useAccordionScenario() {
  const [controlled, setControlled] = useState(false);
  const [multiple, setMultiple] = useState(false);
  const [value, setValue] = useState<string | string[]>("general");
  const [collapsible, setCollapsible] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [disabledItem, setDisabledItem] = useState(true);
  const [keepMounted, setKeepMounted] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [dir, setDir] = useState<DirectionMode>("ltr");
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [headerComposition, setHeaderComposition] = useState<CompositionMode>("default");
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const [contentComposition, setContentComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<AccordionSlotPart, boolean>>({
    root: false,
    item: false,
    header: false,
    trigger: false,
    content: false,
  });
  const { log, addLog, clearLog } = useScenarioLog();

  const setTypeMultiple = (next: boolean) => {
    setMultiple(next);
    setValue(next ? ["general"] : "general");
  };

  const setControlledValue = (next: string) => {
    const nextValue = multiple
      ? next === "none"
        ? []
        : next.split(", ")
      : next === "none"
        ? ""
        : next;
    setValue(nextValue);
    addLog(`external value set to ${formatAccordionValueLabel(nextValue)}`);
  };

  const handleValueChange = (next: string | string[]) => {
    setValue(next);
    addLog(`value changed to ${formatAccordionValueLabel(next)}`);
  };

  return {
    state: {
      controlled,
      multiple,
      value,
      collapsible,
      disabled,
      disabledItem,
      keepMounted,
      orientation,
      dir,
      rootComposition,
      itemComposition,
      headerComposition,
      triggerComposition,
      contentComposition,
      propCheck,
      customSlots,
      log,
    },
    actions: {
      setControlled,
      setMultiple: setTypeMultiple,
      setControlledValue,
      setCollapsible,
      setDisabled,
      setDisabledItem,
      setKeepMounted,
      setOrientation,
      setDir,
      setRootComposition,
      setItemComposition,
      setHeaderComposition,
      setTriggerComposition,
      setContentComposition,
      setPropCheck,
      setCustomSlot: (part: AccordionSlotPart, checked: boolean) => setCustomSlots((slots) => ({ ...slots, [part]: checked })),
      handleValueChange,
      clearLog,
    },
  };
}

function useBreadcrumbScenario() {
  const [showEllipsis, setShowEllipsis] = useState(true);
  const [customSeparator, setCustomSeparator] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { showEllipsis, customSeparator, composition, log },
    actions: {
      setShowEllipsis,
      setCustomSeparator,
      setComposition,
      clearLog,
      noteLink: (label: string) => addLog(`link clicked ${label}`),
    },
  };
}

function usePaginationScenario() {
  const [controlled, setControlled] = useState(true);
  const [page, setPage] = useState(4);
  const [totalPages, setTotalPages] = useState("10");
  const [siblingCount, setSiblingCount] = useState("1");
  const [boundaryCount, setBoundaryCount] = useState("1");
  const [disabled, setDisabled] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: {
      controlled,
      page,
      totalPages,
      siblingCount,
      boundaryCount,
      disabled,
      composition,
      log,
    },
    actions: {
      setControlled,
      setTotalPages,
      setSiblingCount,
      setBoundaryCount,
      setDisabled,
      setComposition,
      clearLog,
      setPage: (next: number) => {
        setPage(next);
        addLog(`page changed to ${next}`);
      },
    },
  };
}

function useBottomNavigationScenario() {
  const [controlled, setControlled] = useState(true);
  const [value, setValue] = useState("home");
  const [showLabels, setShowLabels] = useState(true);
  const [disabledItem, setDisabledItem] = useState(true);
  const [linkItem, setLinkItem] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { controlled, value, showLabels, disabledItem, linkItem, composition, log },
    actions: {
      setControlled,
      setShowLabels,
      setDisabledItem,
      setLinkItem,
      setComposition,
      clearLog,
      setValue: (next: string) => {
        setValue(next);
        addLog(`destination changed to ${next}`);
      },
    },
  };
}

function useNavListScenario() {
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [ordered, setOrdered] = useState(false);
  const [active, setActive] = useState("overview");
  const [collapsible, setCollapsible] = useState(true);
  const [sectionOpen, setSectionOpen] = useState(true);
  const [forceMount, setForceMount] = useState(false);
  const [disabledLink, setDisabledLink] = useState(true);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: {
      orientation,
      ordered,
      active,
      collapsible,
      sectionOpen,
      forceMount,
      disabledLink,
      composition,
      log,
    },
    actions: {
      setOrientation,
      setOrdered,
      setCollapsible,
      setSectionOpen,
      setForceMount,
      setDisabledLink,
      setComposition,
      clearLog,
      setActive: (next: string) => {
        setActive(next);
        addLog(`active link ${next}`);
      },
    },
  };
}

export type NavigationPrimitiveScenarios = ReturnType<typeof useNavigationPrimitiveScenarios>;

export function NavigationPrimitiveScenarioToolbar({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: NavigationPrimitiveScenarios;
}) {
  if (scenarioId === "app-bar") {
    const scenario = scenarios.appBar;
    return (
      <ControlToolbar label="App Bar controls">
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Position" options={appBarPositionOptions} value={scenario.state.position} onChange={scenario.actions.setPosition} />
          <MenuRadioControl label="Density" options={appBarDensityOptions} value={scenario.state.density} onChange={scenario.actions.setDensity} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "tabs") {
    const scenario = scenarios.tabs;
    return (
      <ControlToolbar label="Tabs controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.disabledTab} label="Disabled Tab" value="disabled-tab" onChange={scenario.actions.setDisabledTab} />
          <MenuCheckboxControl checked={scenario.state.keepMounted} label="Keep Mounted" value="keep-mounted" onChange={scenario.actions.setKeepMounted} />
          <MenuCheckboxControl checked={scenario.state.focusablePanel} label="Focusable Panel" value="focusable-panel" onChange={scenario.actions.setFocusablePanel} />
        </ToolbarGroup>
        <ToolbarGroup title="Keyboard" value="keyboard">
          <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
          <MenuRadioControl label="Activation" options={activationModeOptions} value={scenario.state.activationMode} onChange={scenario.actions.setActivationMode} />
        </ToolbarGroup>
        <CompositionToolbarGroup label="Trigger" value={scenario.state.triggerComposition} onChange={scenario.actions.setTriggerComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "accordion") {
    const scenario = scenarios.accordion;
    return (
      <ControlToolbar label="Accordion controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.multiple} label="Multiple" value="multiple" onChange={scenario.actions.setMultiple} />
          {scenario.state.controlled ? (
            <MenuRadioControl label="Value" options={scenario.state.multiple ? accordionMultipleValueOptions : accordionSingleValueOptions} value={getAccordionControlledValueOption(scenario.state.value)} onChange={scenario.actions.setControlledValue} />
          ) : null}
          {!scenario.state.multiple ? (
            <MenuCheckboxControl checked={scenario.state.collapsible} label="Collapsible" value="collapsible" onChange={scenario.actions.setCollapsible} />
          ) : null}
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.disabledItem} label="Disabled Item" value="disabled-item" onChange={scenario.actions.setDisabledItem} />
          <MenuCheckboxControl checked={scenario.state.keepMounted} label="Keep Mounted" value="keep-mounted" onChange={scenario.actions.setKeepMounted} />
        </ToolbarGroup>
        <ToolbarGroup title="Keyboard" value="keyboard">
          <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
          <MenuRadioControl label="Direction" options={directionOptions} value={scenario.state.dir} onChange={scenario.actions.setDir} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Item" options={compositionOptions} value={scenario.state.itemComposition} onChange={scenario.actions.setItemComposition} />
          <MenuRadioControl label="Header" options={compositionOptions} value={scenario.state.headerComposition} onChange={scenario.actions.setHeaderComposition} />
          <MenuRadioControl label="Trigger" options={compositionOptions} value={scenario.state.triggerComposition} onChange={scenario.actions.setTriggerComposition} />
          <MenuRadioControl label="Content" options={compositionOptions} value={scenario.state.contentComposition} onChange={scenario.actions.setContentComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={accordionSlotParts.map((part) => ({
            checked: scenario.state.customSlots[part],
            label: `${formatAccordionSlotLabel(part)} Slot`,
            value: `${part}-slot`,
            onChange: (checked) => scenario.actions.setCustomSlot(part, checked),
          }))}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "breadcrumb") {
    const scenario = scenarios.breadcrumb;
    return (
      <ControlToolbar label="Breadcrumb controls">
        <ToolbarGroup title="Content" value="content">
          <MenuCheckboxControl checked={scenario.state.showEllipsis} label="Ellipsis" value="ellipsis" onChange={scenario.actions.setShowEllipsis} />
          <MenuCheckboxControl checked={scenario.state.customSeparator} label="Custom Separator" value="custom-separator" onChange={scenario.actions.setCustomSeparator} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "pagination") {
    const scenario = scenarios.pagination;
    return (
      <ControlToolbar label="Pagination controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuRadioControl label="Total Pages" options={pageTotalOptions} value={scenario.state.totalPages} onChange={scenario.actions.setTotalPages} />
          <MenuRadioControl label="Sibling Count" options={countOptions} value={scenario.state.siblingCount} onChange={scenario.actions.setSiblingCount} />
          <MenuRadioControl label="Boundary Count" options={countOptions} value={scenario.state.boundaryCount} onChange={scenario.actions.setBoundaryCount} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "bottom-navigation") {
    const scenario = scenarios.bottomNavigation;
    return (
      <ControlToolbar label="Bottom Navigation controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.showLabels} label="Show Labels" value="show-labels" onChange={scenario.actions.setShowLabels} />
          <MenuCheckboxControl checked={scenario.state.disabledItem} label="Disabled Item" value="disabled-item" onChange={scenario.actions.setDisabledItem} />
          <MenuCheckboxControl checked={scenario.state.linkItem} label="Link Item" value="link-item" onChange={scenario.actions.setLinkItem} />
        </ToolbarGroup>
        <CompositionToolbarGroup label="Item" value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "nav-list") {
    const scenario = scenarios.navList;
    return (
      <ControlToolbar label="Nav List controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.ordered} label="Ordered List" value="ordered" onChange={scenario.actions.setOrdered} />
          <MenuCheckboxControl checked={scenario.state.collapsible} label="Collapsible Section" value="collapsible" onChange={scenario.actions.setCollapsible} />
          <MenuCheckboxControl checked={scenario.state.sectionOpen} label="Section Open" value="section-open" onChange={scenario.actions.setSectionOpen} />
          <MenuCheckboxControl checked={scenario.state.forceMount} label="Force Mount" value="force-mount" onChange={scenario.actions.setForceMount} />
          <MenuCheckboxControl checked={scenario.state.disabledLink} label="Disabled Link" value="disabled-link" onChange={scenario.actions.setDisabledLink} />
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
        </ToolbarGroup>
        <CompositionToolbarGroup label="Root" value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  return null;
}

export function NavigationPrimitiveScenarioCanvas({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: NavigationPrimitiveScenarios;
}) {
  if (scenarioId === "app-bar") return <AppBarCanvas scenario={scenarios.appBar} />;
  if (scenarioId === "tabs") return <TabsCanvas scenario={scenarios.tabs} />;
  if (scenarioId === "accordion") return <AccordionCanvas scenario={scenarios.accordion} />;
  if (scenarioId === "breadcrumb") return <BreadcrumbCanvas scenario={scenarios.breadcrumb} />;
  if (scenarioId === "pagination") return <PaginationCanvas scenario={scenarios.pagination} />;
  if (scenarioId === "bottom-navigation") return <BottomNavigationCanvas scenario={scenarios.bottomNavigation} />;
  if (scenarioId === "nav-list") return <NavListCanvas scenario={scenarios.navList} />;
  return null;
}

function AppBarCanvas({ scenario }: { scenario: ReturnType<typeof useAppBarScenario> }) {
  const state = scenario.state;
  const content = (
    <AppBar.Toolbar className="playground-appbar-toolbar" density={state.density} data-prop-check="toolbar">
      <AppBar.Start className="playground-appbar-section" data-prop-check="start">Flowstack</AppBar.Start>
      <AppBar.Center className="playground-appbar-section" data-prop-check="center">Dashboard</AppBar.Center>
      <AppBar.End className="playground-appbar-section" data-prop-check="end">
        <Button.Root className="atom-button secondary" onPress={() => scenario.actions.noteAction("settings")}>Settings</Button.Root>
      </AppBar.End>
    </AppBar.Toolbar>
  );
  const props = {
    "aria-label": "Demo app bar",
    className: "playground-appbar",
    "data-prop-check": "root",
    position: state.position,
  };

  if (state.composition === "asChild") {
    return (
      <AppBar.Root {...props} asChild>
        <section>{content}</section>
      </AppBar.Root>
    );
  }

  if (state.composition === "render") {
    return (
      <AppBar.Root {...props} render={(renderProps) => <section {...renderProps} />}>
        {content}
      </AppBar.Root>
    );
  }

  return <AppBar.Root {...props}>{content}</AppBar.Root>;
}

function TabsCanvas({ scenario }: { scenario: ReturnType<typeof useTabsScenario> }) {
  const state = scenario.state;

  return (
    <Tabs.Root
      activationMode={state.activationMode}
      className="playground-tabs"
      data-prop-check="root"
      defaultValue={state.controlled ? undefined : "overview"}
      loop={state.loop}
      onValueChange={scenario.actions.setValue}
      orientation={state.orientation}
      value={state.controlled ? state.value : undefined}
    >
      <Tabs.List ariaLabel="Project sections" className="playground-tabs-list" data-prop-check="list">
        <TabsTrigger mode={state.triggerComposition} value="overview">Overview</TabsTrigger>
        <TabsTrigger mode={state.triggerComposition} value="settings">Settings</TabsTrigger>
        <TabsTrigger mode={state.triggerComposition} disabled={state.disabledTab} value="billing">Billing</TabsTrigger>
        <Tabs.Indicator className="playground-tabs-indicator" data-prop-check="indicator" />
      </Tabs.List>
      <Tabs.Content className="playground-tabs-content" data-prop-check="content-overview" focusable={state.focusablePanel} keepMounted={state.keepMounted} value="overview">Overview panel</Tabs.Content>
      <Tabs.Content className="playground-tabs-content" data-prop-check="content-settings" focusable={state.focusablePanel} keepMounted={state.keepMounted} value="settings">Settings panel</Tabs.Content>
      <Tabs.Content className="playground-tabs-content" data-prop-check="content-billing" focusable={state.focusablePanel} keepMounted={state.keepMounted} value="billing">Billing panel</Tabs.Content>
    </Tabs.Root>
  );
}

function TabsTrigger({ children, disabled, mode, value }: { children: ReactNode; disabled?: boolean; mode: CompositionMode; value: string }) {
  if (mode === "asChild") {
    return (
      <Tabs.Trigger asChild disabled={disabled} value={value} data-prop-check={`trigger-${value}`}>
        <button type="button">{children}</button>
      </Tabs.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <Tabs.Trigger disabled={disabled} render={(props) => <button {...props} />} value={value} data-prop-check={`trigger-${value}`}>
        {children}
      </Tabs.Trigger>
    );
  }

  return <Tabs.Trigger className="playground-tabs-trigger" disabled={disabled} value={value} data-prop-check={`trigger-${value}`}>{children}</Tabs.Trigger>;
}

function AccordionCanvas({ scenario }: { scenario: ReturnType<typeof useAccordionScenario> }) {
  const state = scenario.state;
  const commonProps = {
    className: "playground-accordion",
    collapsible: state.collapsible,
    disabled: state.disabled,
    dir: state.dir,
    orientation: state.orientation,
    onValueChange: scenario.actions.handleValueChange as never,
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customSlots.root }, "accordion-root-custom"),
  };

  const items = (
    <>
      {accordionItems.map((item) => (
        <AccordionItem
          description={item.description}
          disabled={item.disabled && state.disabledItem}
          key={item.value}
          label={item.label}
          state={state}
          value={item.value}
        >
          <AccordionPanelContent item={item} />
        </AccordionItem>
      ))}
    </>
  );

  const uncontrolledValue = Array.isArray(state.value) ? state.value[0] ?? "" : state.value;
  const uncontrolledValues = Array.isArray(state.value) ? state.value : state.value ? [state.value] : [];
  const preserveStateForComposition = [
    state.rootComposition,
    state.itemComposition,
    state.headerComposition,
    state.triggerComposition,
    state.contentComposition,
  ].some((mode) => mode !== "default");
  const controlledForRuntime = state.controlled || preserveStateForComposition;
  const rootChildren = state.rootComposition === "asChild" ? <section className="playground-accordion" dir={state.dir}>{items}</section> : items;
  const accordion =
    state.multiple ? (
      <Accordion.Root
        {...commonProps}
        asChild={state.rootComposition === "asChild" ? true : undefined}
        defaultValue={controlledForRuntime ? undefined : uncontrolledValues}
        render={state.rootComposition === "render" ? (props) => <section {...props} dir={state.dir} /> : undefined}
        type="multiple"
        value={controlledForRuntime ? (Array.isArray(state.value) ? state.value : [state.value]) : undefined}
      >
        {rootChildren}
      </Accordion.Root>
    ) : (
      <Accordion.Root
        {...commonProps}
        asChild={state.rootComposition === "asChild" ? true : undefined}
        defaultValue={controlledForRuntime ? undefined : uncontrolledValue}
        render={state.rootComposition === "render" ? (props) => <section {...props} dir={state.dir} /> : undefined}
        type="single"
        value={controlledForRuntime ? (Array.isArray(state.value) ? state.value[0] ?? "" : state.value) : undefined}
      >
        {rootChildren}
      </Accordion.Root>
    );

  return (
    <Direction.Provider dir={state.dir}>
      <section className="playground-accordion-shell" dir={state.dir}>
        <div>{accordion}</div>
      </section>
    </Direction.Provider>
  );
}

function AccordionItem({ children, description, disabled, label, state, value }: { children: ReactNode; description: string; disabled?: boolean; label: string; state: ReturnType<typeof useAccordionScenario>["state"]; value: string }) {
  const itemProps = {
    className: "playground-accordion-item",
    disabled,
    value,
    ...partProps(`item-${value}`, { propCheck: state.propCheck, customSlot: state.customSlots.item }, "accordion-item-custom"),
  };
  const header = <AccordionHeader description={description} disabled={disabled} label={label} state={state} value={value} />;
  const content = <AccordionContent state={state}>{children}</AccordionContent>;

  if (state.itemComposition === "asChild") {
    return (
      <Accordion.Item {...itemProps} asChild>
        <section>
          {header}
          {content}
        </section>
      </Accordion.Item>
    );
  }

  if (state.itemComposition === "render") {
    return (
      <Accordion.Item {...itemProps} render={(props) => <section {...props} />}>
        {header}
        {content}
      </Accordion.Item>
    );
  }

  return <Accordion.Item {...itemProps}>{header}{content}</Accordion.Item>;
}

function AccordionHeader({ description, disabled, label, state, value }: { description: string; disabled?: boolean; label: string; state: ReturnType<typeof useAccordionScenario>["state"]; value: string }) {
  const props = {
    as: "h3" as const,
    className: "playground-accordion-header",
    ...partProps(`header-${value}`, { propCheck: state.propCheck, customSlot: state.customSlots.header }, "accordion-header-custom"),
  };
  const trigger = <AccordionTrigger description={description} disabled={disabled} state={state} value={value}>{label}</AccordionTrigger>;

  if (state.headerComposition === "asChild") {
    return (
      <Accordion.Header {...props} asChild>
        <h4>{trigger}</h4>
      </Accordion.Header>
    );
  }

  if (state.headerComposition === "render") {
    return (
      <Accordion.Header {...props} render={(renderProps) => <h4 {...renderProps} />}>
        {trigger}
      </Accordion.Header>
    );
  }

  return <Accordion.Header {...props}>{trigger}</Accordion.Header>;
}

function AccordionTrigger({ children, description, disabled, state, value }: { children: ReactNode; description: string; disabled?: boolean; state: ReturnType<typeof useAccordionScenario>["state"]; value: string }) {
  const props = {
    className: "playground-accordion-trigger",
    ...partProps(`trigger-${value}`, { propCheck: state.propCheck, customSlot: state.customSlots.trigger }, "accordion-trigger-custom"),
  };
  const content = (
    <>
      <span className="playground-accordion-trigger-copy">
        <span>{children}</span>
        <span>{description}</span>
      </span>
      <span className="playground-accordion-trigger-icon" aria-hidden="true">+</span>
    </>
  );

  if (state.triggerComposition === "asChild") {
    return (
      <Accordion.Trigger {...props} asChild>
        <button type="button">{content}</button>
      </Accordion.Trigger>
    );
  }

  if (state.triggerComposition === "render") {
    return (
      <Accordion.Trigger {...props} render={(renderProps) => <button {...renderProps} />}>
        {content}
      </Accordion.Trigger>
    );
  }

  return <Accordion.Trigger {...props}>{content}</Accordion.Trigger>;
}

function AccordionContent({ children, state }: { children: ReactNode; state: ReturnType<typeof useAccordionScenario>["state"] }) {
  const props = {
    className: "playground-accordion-content",
    keepMounted: state.keepMounted,
    ...partProps("content", { propCheck: state.propCheck, customSlot: state.customSlots.content }, "accordion-content-custom"),
  };

  if (state.contentComposition === "asChild") {
    return (
      <Accordion.Content {...props} asChild>
        <div>{children}</div>
      </Accordion.Content>
    );
  }

  if (state.contentComposition === "render") {
    return (
      <Accordion.Content {...props} render={(renderProps) => <section {...renderProps} />}>
        {children}
      </Accordion.Content>
    );
  }

  return <Accordion.Content {...props}>{children}</Accordion.Content>;
}

function AccordionPanelContent({ item }: { item: (typeof accordionItems)[number] }) {
  return (
    <div className="playground-accordion-panel">
      <p>{item.content}</p>
    </div>
  );
}

function BreadcrumbCanvas({ scenario }: { scenario: ReturnType<typeof useBreadcrumbScenario> }) {
  const state = scenario.state;
  const separator = <Breadcrumb.Separator data-prop-check="separator">{state.customSeparator ? "›" : "/"}</Breadcrumb.Separator>;
  const content = (
    <Breadcrumb.List className="playground-breadcrumb-list" data-prop-check="list">
      <Breadcrumb.Item data-prop-check="item-home"><Breadcrumb.Link href="#home" onClick={() => scenario.actions.noteLink("home")}>Home</Breadcrumb.Link></Breadcrumb.Item>
      {separator}
      {state.showEllipsis ? (
        <>
          <Breadcrumb.Item data-prop-check="item-ellipsis"><Breadcrumb.Ellipsis data-prop-check="ellipsis" /></Breadcrumb.Item>
          {separator}
        </>
      ) : null}
      <Breadcrumb.Item data-prop-check="item-projects"><Breadcrumb.Link href="#projects" onClick={() => scenario.actions.noteLink("projects")}>Projects</Breadcrumb.Link></Breadcrumb.Item>
      {separator}
      <Breadcrumb.Item data-prop-check="item-page"><Breadcrumb.Page data-prop-check="page">Atom playground</Breadcrumb.Page></Breadcrumb.Item>
    </Breadcrumb.List>
  );
  const props = { className: "playground-breadcrumb", "data-prop-check": "root" };

  if (state.composition === "asChild") {
    return (
      <Breadcrumb.Root {...props} asChild>
        <section>{content}</section>
      </Breadcrumb.Root>
    );
  }

  if (state.composition === "render") {
    return (
      <Breadcrumb.Root {...props} render={(renderProps) => <section {...renderProps} />}>
        {content}
      </Breadcrumb.Root>
    );
  }

  return <Breadcrumb.Root {...props}>{content}</Breadcrumb.Root>;
}

function PaginationCanvas({ scenario }: { scenario: ReturnType<typeof usePaginationScenario> }) {
  const state = scenario.state;
  const props = {
    "aria-label": "Demo pagination",
    className: "playground-pagination",
    "data-prop-check": "root",
    disabled: state.disabled,
    totalPages: Number(state.totalPages),
    siblingCount: Number(state.siblingCount),
    boundaryCount: Number(state.boundaryCount),
    defaultPage: state.controlled ? undefined : 4,
    page: state.controlled ? state.page : undefined,
    onPageChange: scenario.actions.setPage,
  };
  const content = (
    <Pagination.List className="playground-pagination-list" data-prop-check="list">
      <Pagination.Previous className="playground-pagination-button" data-prop-check="previous">Prev</Pagination.Previous>
      <PaginationRangeItems />
      <Pagination.Next className="playground-pagination-button" data-prop-check="next">Next</Pagination.Next>
    </Pagination.List>
  );

  if (state.composition === "asChild") {
    return (
      <Pagination.Root {...props} asChild>
        <section>{content}</section>
      </Pagination.Root>
    );
  }

  if (state.composition === "render") {
    return (
      <Pagination.Root {...props} render={(renderProps) => <section {...renderProps} />}>
        {content}
      </Pagination.Root>
    );
  }

  return <Pagination.Root {...props}>{content}</Pagination.Root>;
}

function PaginationRangeItems() {
  const ctx = usePaginationContext();

  return (
    <>
      {ctx.items.map((item, index) => typeof item === "number"
        ? (
          <Pagination.Item className="playground-pagination-button" data-prop-check={`page-${item}`} key={`page-${item}`} page={item} />
        )
        : (
          <Pagination.Ellipsis className="playground-pagination-ellipsis" data-prop-check={`ellipsis-${index}`} key={`${item}-${index}`} />
        ))}
    </>
  );
}

function BottomNavigationCanvas({ scenario }: { scenario: ReturnType<typeof useBottomNavigationScenario> }) {
  const state = scenario.state;
  const items = (
    <>
      <BottomNavigationItem mode={state.composition} value="home">Home</BottomNavigationItem>
      <BottomNavigationItem mode={state.composition} value="search" href={state.linkItem ? "#search" : undefined}>Search</BottomNavigationItem>
      <BottomNavigationItem disabled={state.disabledItem} mode={state.composition} value="settings">Settings</BottomNavigationItem>
    </>
  );

  return (
    <BottomNavigation.Root
      className="playground-bottom-nav"
      data-prop-check="root"
      defaultValue={state.controlled ? undefined : "home"}
      onChange={scenario.actions.setValue}
      showLabels={state.showLabels}
      value={state.controlled ? state.value : undefined}
    >
      {items}
    </BottomNavigation.Root>
  );
}

function BottomNavigationItem({ children, disabled, href, mode, value }: { children: ReactNode; disabled?: boolean; href?: string; mode: CompositionMode; value: string }) {
  const props = { className: "playground-bottom-nav-item", disabled, href, value, "data-prop-check": `item-${value}` };
  if (mode === "asChild") {
    return (
      <BottomNavigation.Item {...props} asChild>
        {href ? <a>{children}</a> : <button type="button">{children}</button>}
      </BottomNavigation.Item>
    );
  }

  if (mode === "render") {
    return (
      <BottomNavigation.Item {...props} render={(renderProps) => href ? <a {...renderProps} /> : <button {...renderProps} />}>
        {children}
      </BottomNavigation.Item>
    );
  }

  return <BottomNavigation.Item {...props}>{children}</BottomNavigation.Item>;
}

function NavListCanvas({ scenario }: { scenario: ReturnType<typeof useNavListScenario> }) {
  const state = scenario.state;
  const content = (
    <>
      <NavList.Section className="playground-nav-list-section" collapsible={state.collapsible} data-prop-check="section" defaultOpen={true} onOpenChange={scenario.actions.setSectionOpen} open={state.sectionOpen}>
        <NavList.SectionTrigger className="playground-nav-list-section-trigger" data-prop-check="section-trigger">Project</NavList.SectionTrigger>
        <NavList.SectionLabel as="h3" className="playground-nav-list-section-label" data-prop-check="section-label">Project links</NavList.SectionLabel>
        <NavList.SectionContent className="playground-nav-list-section-content" data-prop-check="section-content" forceMount={state.forceMount}>
          <NavList.List className="playground-nav-list-list" data-prop-check="list" ordered={state.ordered}>
            <NavList.Item data-prop-check="item-overview"><NavList.Link active={state.active === "overview"} href="#overview" onClick={() => scenario.actions.setActive("overview")}>Overview</NavList.Link></NavList.Item>
            <NavList.Item data-prop-check="item-settings"><NavList.Link active={state.active === "settings"} href="#settings" onClick={() => scenario.actions.setActive("settings")}>Settings</NavList.Link></NavList.Item>
            <NavList.Item data-prop-check="item-disabled" disabled={state.disabledLink}><NavList.Link disabled={state.disabledLink} href="#disabled">Disabled</NavList.Link></NavList.Item>
          </NavList.List>
        </NavList.SectionContent>
      </NavList.Section>
    </>
  );
  const props = { className: "playground-nav-list", "data-prop-check": "root", orientation: state.orientation };

  if (state.composition === "asChild") {
    return (
      <NavList.Root {...props} asChild>
        <section>{content}</section>
      </NavList.Root>
    );
  }

  if (state.composition === "render") {
    return (
      <NavList.Root {...props} render={(renderProps) => <section {...renderProps} />}>
        {content}
      </NavList.Root>
    );
  }

  return <NavList.Root {...props}>{content}</NavList.Root>;
}

export function NavigationPrimitiveScenarioAnatomy({
  openGroups,
  scenarioId,
  scenarios,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  scenarioId: string;
  scenarios: NavigationPrimitiveScenarios;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const sections = getNavigationSections(scenarioId, scenarios);
  return (
    <AnatomyPanel
      footer={`${sections.length} parts`}
      onOpenGroupsChange={onOpenGroupsChange}
      openGroups={openGroups}
      sections={sections}
    />
  );
}

function getNavigationSections(scenarioId: string, scenarios: NavigationPrimitiveScenarios): AnatomySection[] {
  if (scenarioId === "app-bar") return appBarSections(scenarios.appBar.state);
  if (scenarioId === "tabs") return tabsSections(scenarios.tabs.state);
  if (scenarioId === "accordion") return accordionSections(scenarios.accordion.state);
  if (scenarioId === "breadcrumb") return breadcrumbSections(scenarios.breadcrumb.state);
  if (scenarioId === "pagination") return paginationSections(scenarios.pagination.state);
  if (scenarioId === "bottom-navigation") return bottomNavigationSections(scenarios.bottomNavigation.state);
  if (scenarioId === "nav-list") return navListSections(scenarios.navList.state);
  return [];
}

function appBarSections(state: ReturnType<typeof useAppBarScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.position, "[data-slot='appbar'][data-prop-check='root']", [
      row("Position", state.position, "state"),
      row("Composition", state.composition, "composition"),
    ]),
    baseSection("Toolbar", state.density, "[data-slot='appbar-toolbar']"),
    baseSection("Start", "start", "[data-slot='appbar-start']"),
    baseSection("Center", "center", "[data-slot='appbar-center']"),
    baseSection("End", "end", "[data-slot='appbar-end']"),
  ];
}

function tabsSections(state: ReturnType<typeof useTabsScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.value, "[data-slot='tabs-root']", [
      row("Controlled", bool(state.controlled), "state"),
      row("Orientation", state.orientation, "state"),
      row("Activation mode", state.activationMode, "behavior"),
      row("Loop", bool(state.loop), "behavior"),
    ]),
    baseSection("List", state.orientation, "[data-slot='tabs-list']"),
    baseSection("Trigger: Overview", "overview", "[data-prop-check='trigger-overview']"),
    baseSection("Trigger: Settings", "settings", "[data-prop-check='trigger-settings']"),
    baseSection("Trigger: Billing", state.disabledTab ? "disabled" : "enabled", "[data-prop-check='trigger-billing']"),
    baseSection("Indicator", "positioned", "[data-slot='tabs-indicator']"),
    baseSection("Content", state.keepMounted ? "keep mounted" : state.value, "[data-slot='tabs-content'][data-state='active']"),
  ];
}

function accordionSections(state: ReturnType<typeof useAccordionScenario>["state"]): AnatomySection[] {
  const active = formatAccordionValueLabel(state.value);
  const activeValues = Array.isArray(state.value) ? state.value : state.value ? [state.value] : [];
  const [defaultItem, stateItem, disabledItem] = accordionItems;
  return [
    baseSection("Root", state.multiple ? "multiple" : "single", ".playground-accordion", [
      row("Controlled", bool(state.controlled), "state"),
      row("Collapsible", bool(state.collapsible), "behavior"),
      row("Disabled", bool(state.disabled), "state"),
      row("Orientation", state.orientation, "state"),
      row("Direction", state.dir, "state"),
      row("Value", active, "state"),
      row("Composition", state.rootComposition, "composition"),
    ]),
    baseSection("Item: 1", defaultItem.value, ".playground-accordion-item:nth-of-type(1)", [row("Composition", state.itemComposition, "composition")]),
    baseSection("Header: 1", state.headerComposition === "default" ? "h3" : "h4", ".playground-accordion-item:nth-of-type(1) .playground-accordion-header", [row("Composition", state.headerComposition, "composition")]),
    baseSection("Trigger: 1", defaultItem.value, ".playground-accordion-item:nth-of-type(1) .playground-accordion-trigger", [row("Composition", state.triggerComposition, "composition")]),
    baseSection("Content: 1", state.keepMounted ? "keep mounted" : "mounted when open", ".playground-accordion-item:nth-of-type(1) .playground-accordion-content", [row("Composition", state.contentComposition, "composition")]),
    baseSection("Item: 2", stateItem.value, ".playground-accordion-item:nth-of-type(2)"),
    baseSection("Header: 2", state.headerComposition === "default" ? "h3" : "h4", ".playground-accordion-item:nth-of-type(2) .playground-accordion-header"),
    baseSection("Trigger: 2", stateItem.value, ".playground-accordion-item:nth-of-type(2) .playground-accordion-trigger"),
    baseSection("Content: 2", state.keepMounted ? "keep mounted" : "mounted when open", ".playground-accordion-item:nth-of-type(2) .playground-accordion-content", undefined, !state.keepMounted && !activeValues.includes(stateItem.value)),
    baseSection("Item: 3", state.disabledItem ? "disabled" : "enabled", ".playground-accordion-item:nth-of-type(3)"),
    baseSection("Header: 3", state.headerComposition === "default" ? "h3" : "h4", ".playground-accordion-item:nth-of-type(3) .playground-accordion-header"),
    baseSection("Trigger: 3", state.disabledItem ? "disabled" : "enabled", ".playground-accordion-item:nth-of-type(3) .playground-accordion-trigger"),
    baseSection("Content: 3", state.keepMounted ? "keep mounted" : "mounted when open", ".playground-accordion-item:nth-of-type(3) .playground-accordion-content", undefined, !state.keepMounted && !activeValues.includes(disabledItem.value)),
  ];
}

function breadcrumbSections(state: ReturnType<typeof useBreadcrumbScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.composition, "[data-slot='breadcrumb']", [row("Composition", state.composition, "composition")]),
    baseSection("List", "ol", "[data-slot='breadcrumb-list']"),
    baseSection("Item", "li", "[data-prop-check='item-home']"),
    baseSection("Link", "anchor", "[data-slot='breadcrumb-link']"),
    baseSection("Separator", state.customSeparator ? "custom" : "default", "[data-slot='breadcrumb-separator']"),
    baseSection("Ellipsis", state.showEllipsis ? "rendered" : "not rendered", "[data-slot='breadcrumb-ellipsis']", undefined, !state.showEllipsis),
    baseSection("Page", "current", "[data-slot='breadcrumb-page']"),
  ];
}

function paginationSections(state: ReturnType<typeof usePaginationScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", `page ${state.page}`, "[data-slot='pagination-root']", [
      row("Controlled", bool(state.controlled), "state"),
      row("Disabled", bool(state.disabled), "state"),
      row("Total pages", state.totalPages, "state"),
      row("Sibling count", state.siblingCount, "behavior"),
      row("Boundary count", state.boundaryCount, "behavior"),
    ]),
    baseSection("List", "ol", "[data-slot='pagination-list']"),
    baseSection("Previous", "previous", "[data-slot='pagination-previous']"),
    baseSection("Item: Current", `page ${state.page}`, "[data-slot='pagination-item'][data-state='active']"),
    baseSection("Ellipsis", "range gap", "[data-slot='pagination-ellipsis']"),
    baseSection("Next", "next", "[data-slot='pagination-next']"),
  ];
}

function bottomNavigationSections(state: ReturnType<typeof useBottomNavigationScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.value, "[data-slot='bottom-nav-root']", [
      row("Controlled", bool(state.controlled), "state"),
      row("Show labels", bool(state.showLabels), "state"),
    ]),
    baseSection("Item: Home", "home", "[data-prop-check='item-home']"),
    baseSection("Item: Search", state.linkItem ? "anchor" : "button", "[data-prop-check='item-search']"),
    baseSection("Item: Settings", state.disabledItem ? "disabled" : "enabled", "[data-prop-check='item-settings']"),
  ];
}

function navListSections(state: ReturnType<typeof useNavListScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.orientation, "[data-slot='nav-list']", [
      row("Orientation", state.orientation, "state"),
      row("Composition", state.composition, "composition"),
    ]),
    baseSection("Section", state.sectionOpen ? "open" : "closed", "[data-slot='nav-list-section']"),
    baseSection("Section Trigger", state.collapsible ? "collapsible" : "static", "[data-slot='nav-list-section-trigger']"),
    baseSection("Section Label", "label", "[data-slot='nav-list-section-label']"),
    baseSection("Section Content", state.forceMount ? "force mounted" : "mounted when open", "[data-slot='nav-list-section-content']", undefined, !state.sectionOpen && !state.forceMount),
    baseSection("List", state.ordered ? "ordered" : "unordered", "[data-slot='nav-list-list']"),
    baseSection("Item", "li", "[data-slot='nav-list-item']"),
    baseSection("Link", state.active, "[data-slot='nav-list-link'][data-current]"),
  ];
}

function baseSection(title: string, summary: string, selector: string, rows = [row("Exists", "true", "presence")], inactive = false): AnatomySection {
  return { title, summary, selector, inactive, rows };
}

function row(label: string, value: string, category: "presence" | "identity" | "composition" | "state" | "data" | "aria" | "behavior") {
  return { label, value, category };
}

export function NavigationPrimitiveScenarioLog({ scenarioId, scenarios }: { scenarioId: string; scenarios: NavigationPrimitiveScenarios }) {
  return <ScenarioEventLog log={getNavigationLog(scenarioId, scenarios)} />;
}

function getNavigationLog(scenarioId: string, scenarios: NavigationPrimitiveScenarios) {
  if (scenarioId === "app-bar") return scenarios.appBar.state.log;
  if (scenarioId === "tabs") return scenarios.tabs.state.log;
  if (scenarioId === "accordion") return scenarios.accordion.state.log;
  if (scenarioId === "breadcrumb") return scenarios.breadcrumb.state.log;
  if (scenarioId === "pagination") return scenarios.pagination.state.log;
  if (scenarioId === "bottom-navigation") return scenarios.bottomNavigation.state.log;
  if (scenarioId === "nav-list") return scenarios.navList.state.log;
  return [];
}

export function getNavigationPrimitiveEventCount(scenarioId: string, scenarios: NavigationPrimitiveScenarios) {
  return getNavigationLog(scenarioId, scenarios).length;
}

export function clearNavigationPrimitiveLog(scenarioId: string, scenarios: NavigationPrimitiveScenarios) {
  if (scenarioId === "app-bar") scenarios.appBar.actions.clearLog();
  if (scenarioId === "tabs") scenarios.tabs.actions.clearLog();
  if (scenarioId === "accordion") scenarios.accordion.actions.clearLog();
  if (scenarioId === "breadcrumb") scenarios.breadcrumb.actions.clearLog();
  if (scenarioId === "pagination") scenarios.pagination.actions.clearLog();
  if (scenarioId === "bottom-navigation") scenarios.bottomNavigation.actions.clearLog();
  if (scenarioId === "nav-list") scenarios.navList.actions.clearLog();
}

export function getNavigationPrimitiveCanvasFooter(scenarioId: string, scenarios: NavigationPrimitiveScenarios) {
  if (scenarioId === "app-bar") return `${scenarios.appBar.state.position} | ${scenarios.appBar.state.density}`;
  if (scenarioId === "tabs") return `Value ${scenarios.tabs.state.value} | ${scenarios.tabs.state.activationMode} | ${scenarios.tabs.state.orientation}`;
  if (scenarioId === "accordion") return `${scenarios.accordion.state.multiple ? "multiple" : "single"} | ${formatAccordionValueLabel(scenarios.accordion.state.value)}`;
  if (scenarioId === "breadcrumb") return `Ellipsis ${scenarios.breadcrumb.state.showEllipsis} | Separator ${scenarios.breadcrumb.state.customSeparator ? "custom" : "default"}`;
  if (scenarioId === "pagination") return `Page ${scenarios.pagination.state.page} | Total ${scenarios.pagination.state.totalPages}`;
  if (scenarioId === "bottom-navigation") return `Value ${scenarios.bottomNavigation.state.value} | Labels ${scenarios.bottomNavigation.state.showLabels}`;
  if (scenarioId === "nav-list") return `${scenarios.navList.state.orientation} | Active ${scenarios.navList.state.active} | Open ${scenarios.navList.state.sectionOpen}`;
  return "";
}

export function getNavigationPrimitiveSource(scenarioId: string, scenarios?: NavigationPrimitiveScenarios) {
  if (scenarioId === "app-bar") {
    return `<AppBar.Root aria-label="Demo app bar">
  <AppBar.Toolbar>
    <AppBar.Start>Flowstack</AppBar.Start>
    <AppBar.Center>Dashboard</AppBar.Center>
    <AppBar.End><Button.Root>Settings</Button.Root></AppBar.End>
  </AppBar.Toolbar>
</AppBar.Root>`;
  }

  if (scenarioId === "tabs") {
    return `<Tabs.Root value={value} onValueChange={setValue}>
  <Tabs.List ariaLabel="Project sections">
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
    <Tabs.Trigger value="billing" disabled>Billing</Tabs.Trigger>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Content value="overview">Overview panel</Tabs.Content>
  <Tabs.Content value="settings">Settings panel</Tabs.Content>
</Tabs.Root>`;
  }

  if (scenarioId === "accordion" && scenarios) {
    return getAccordionSource(scenarios.accordion.state);
  }

  if (scenarioId === "breadcrumb") {
    return `<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item><Breadcrumb.Link href="/">Home</Breadcrumb.Link></Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item><Breadcrumb.Page>Atom playground</Breadcrumb.Page></Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>`;
  }

  if (scenarioId === "pagination") {
    return `<Pagination.Root page={page} totalPages={10} onPageChange={setPage}>
  <Pagination.List>
    <Pagination.Previous>Prev</Pagination.Previous>
    <Pagination.Item page={1} />
    <Pagination.Ellipsis />
    <Pagination.Next>Next</Pagination.Next>
  </Pagination.List>
</Pagination.Root>`;
  }

  if (scenarioId === "bottom-navigation") {
    return `<BottomNavigation.Root value={value} onChange={setValue}>
  <BottomNavigation.Item value="home">Home</BottomNavigation.Item>
  <BottomNavigation.Item value="search">Search</BottomNavigation.Item>
  <BottomNavigation.Item value="settings" disabled>Settings</BottomNavigation.Item>
</BottomNavigation.Root>`;
  }

  return `<NavList.Root>
  <NavList.Section collapsible>
    <NavList.SectionTrigger>Project</NavList.SectionTrigger>
    <NavList.SectionLabel>Project links</NavList.SectionLabel>
    <NavList.SectionContent>
      <NavList.List>
        <NavList.Item><NavList.Link active href="#overview">Overview</NavList.Link></NavList.Item>
      </NavList.List>
    </NavList.SectionContent>
  </NavList.Section>
</NavList.Root>`;
}

function getAccordionSource(state: ReturnType<typeof useAccordionScenario>["state"]) {
  const active = Array.isArray(state.value) ? state.value : state.value ? [state.value] : [];
  const rootProps = [
    state.multiple ? `type="multiple"` : `type="single"`,
    state.controlled
      ? `value={${state.multiple ? "value" : `"${active[0] ?? ""}"`}}`
      : `defaultValue={${state.multiple ? `["${active.join('", "')}"]` : `"${active[0] ?? "general"}"`}}`,
    state.controlled ? "onValueChange={setValue}" : "",
    !state.collapsible ? "collapsible={false}" : "",
    state.disabled ? "disabled" : "",
    state.orientation !== "vertical" ? `orientation="${state.orientation}"` : "",
    sourcePartProps("root", state.propCheck, state.customSlots.root, "accordion-root-custom"),
  ].filter(Boolean).join(" ");
  const rootOpen = renderAccordionSourcePart("Root", state.rootComposition, rootProps, "section");
  const rootClose = state.rootComposition === "asChild" ? "  </section>\n</Accordion.Root>" : "</Accordion.Root>";
  const items = accordionItems.map((item) => indent(getAccordionItemSource(item, state), 2)).join("\n");
  const source = `<Accordion.${rootOpen}
${items}
${rootClose}`;

  return state.dir === "rtl"
    ? `<Direction.Provider dir="rtl">
  ${source.split("\n").join("\n  ")}
</Direction.Provider>`
    : source;
}

function getAccordionItemSource(item: { value: string; label: string; content: string; disabled?: boolean }, state: ReturnType<typeof useAccordionScenario>["state"]) {
  const itemProps = [
    `value="${item.value}"`,
    item.disabled && state.disabledItem ? "disabled" : "",
    sourcePartProps(`item-${item.value}`, state.propCheck, state.customSlots.item, "accordion-item-custom"),
  ].filter(Boolean).join(" ");
  const itemOpen = renderAccordionSourcePart("Item", state.itemComposition, itemProps, "section");
  const itemClose = state.itemComposition === "asChild" ? "  </section>\n</Accordion.Item>" : "</Accordion.Item>";
  const children = [
    indent(getAccordionHeaderSource(item.label, item.value, state), 2),
    indent(getAccordionContentSource(item.content, state), 2),
  ].join("\n");

  return `<Accordion.${itemOpen}
${children}
${itemClose}`;
}

function getAccordionHeaderSource(label: string, value: string, state: ReturnType<typeof useAccordionScenario>["state"]) {
  const props = [
    sourcePartProps(`header-${value}`, state.propCheck, state.customSlots.header, "accordion-header-custom"),
  ].filter(Boolean).join(" ");
  const headerOpen = renderAccordionSourcePart("Header", state.headerComposition, props, "h4");
  const headerClose = state.headerComposition === "asChild" ? "  </h4>\n</Accordion.Header>" : "</Accordion.Header>";

  return `<Accordion.${headerOpen}
  ${getAccordionTriggerSource(label, value, state)}
${headerClose}`;
}

function getAccordionTriggerSource(label: string, value: string, state: ReturnType<typeof useAccordionScenario>["state"]) {
  const props = sourcePartProps(`trigger-${value}`, state.propCheck, state.customSlots.trigger, "accordion-trigger-custom");
  const inlineProps = props ? ` ${props}` : "";

  if (state.triggerComposition === "asChild") {
    return `<Accordion.Trigger${inlineProps} asChild><button type="button">${label}</button></Accordion.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<Accordion.Trigger${inlineProps} render={(props) => <button {...props} />}>${label}</Accordion.Trigger>`;
  }

  return `<Accordion.Trigger${inlineProps}>${label}</Accordion.Trigger>`;
}

function getAccordionContentSource(content: string, state: ReturnType<typeof useAccordionScenario>["state"]) {
  const props = [
    state.keepMounted ? "keepMounted" : "",
    sourcePartProps("content", state.propCheck, state.customSlots.content, "accordion-content-custom"),
  ].filter(Boolean).join(" ");
  const contentOpen = renderAccordionSourcePart("Content", state.contentComposition, props, "section");
  const contentClose = state.contentComposition === "asChild" ? "  </section>\n</Accordion.Content>" : "</Accordion.Content>";

  if (state.contentComposition === "asChild") {
    return `<Accordion.${contentOpen}
  ${content}
${contentClose}`;
  }

  return `<Accordion.${contentOpen}${content}</Accordion.Content>`;
}

function renderAccordionSourcePart(part: string, mode: CompositionMode, props: string, tag: "section" | "h4") {
  const inlineProps = props ? ` ${props}` : "";

  if (mode === "asChild") {
    return `${part}${inlineProps} asChild>\n  <${tag}>`;
  }

  if (mode === "render") {
    return `${part}${inlineProps} render={(props) => <${tag} {...props} />}>`;
  }

  return `${part}${inlineProps}>`;
}

function sourcePartProps(part: string, propCheck: boolean, customSlot: boolean, customSlotValue: string) {
  return [
    propCheck ? `data-prop-check="${part}"` : "",
    customSlot ? `data-slot="${customSlotValue}"` : "",
  ].filter(Boolean).join(" ");
}

function indent(source: string, spaces: number) {
  const padding = " ".repeat(spaces);
  return source.split("\n").map((line) => `${padding}${line}`).join("\n");
}

function CompositionToolbarGroup({ label = "Root", value, onChange }: { label?: string; value: CompositionMode; onChange: (value: CompositionMode) => void }) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      <MenuRadioControl label={label} options={compositionOptions} value={value} onChange={onChange} />
    </ToolbarGroup>
  );
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

function getAccordionControlledValueOption(value: string | string[]) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "none";
  return value || "none";
}

function formatAccordionValueLabel(value: string | string[]) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  if (values.length === 0) return "none";
  return values.map((itemValue) => accordionValueLabels[itemValue] ?? itemValue).join(", ");
}

function formatAccordionSlotLabel(part: AccordionSlotPart) {
  return part.charAt(0).toUpperCase() + part.slice(1);
}

const accordionItems = [
  {
    value: "general",
    label: "What does Accordion render by default?",
    description: "Default tags, data attributes, and ARIA relationships.",
    content: "Accordion.Root renders a div, Item renders a div, Header renders a heading, Trigger renders a button, and Content renders a region linked back to its trigger.",
  },
  {
    value: "billing",
    label: "How does state behave?",
    description: "Single, multiple, controlled, uncontrolled, and collapsible modes.",
    content: "Use the toolbar to switch between single and multiple selection, controlled and uncontrolled state, disabled behavior, orientation, and mounted closed content.",
  },
  {
    value: "danger",
    label: "Can disabled items be tested?",
    description: "Disabled item evidence and keyboard navigation behavior.",
    content: "The disabled item should expose disabled data and ARIA state, block activation, and be skipped by keyboard navigation where the collection pattern applies.",
    disabled: true,
  },
];
const accordionSlotParts: AccordionSlotPart[] = ["root", "item", "header", "trigger", "content"];
const accordionValueLabels: Record<string, string> = {
  general: "Item 1",
  billing: "Item 2",
  danger: "Item 3",
};
const accordionSingleValueOptions = [
  { label: "Item 1", value: "general" },
  { label: "Item 2", value: "billing" },
  { label: "Item 3", value: "danger" },
  { label: "None", value: "none" },
] as const;
const accordionMultipleValueOptions = [
  { label: "Item 1", value: "general" },
  { label: "Item 1 + Item 2", value: "general, billing" },
  { label: "Item 2 + Item 3", value: "billing, danger" },
  { label: "None", value: "none" },
] as const;
const compositionOptions = ["default", "asChild", "render"] as const;
const orientationOptions = ["horizontal", "vertical"] as const;
const directionOptions = ["ltr", "rtl"] as const;
const activationModeOptions = ["automatic", "manual"] as const;
const appBarPositionOptions = ["static", "sticky", "fixed", "absolute"] as const;
const appBarDensityOptions = ["compact", "comfortable"] as const;
const pageTotalOptions = ["5", "10", "20"] as const;
const countOptions = ["0", "1", "2"] as const;
