import { Direction } from "@flowstack-ui/atom/direction";
import { NavigationMenu } from "@flowstack-ui/atom/navigation-menu";
import { useCallback, useState, type MouseEvent, type ReactNode } from "react";
import type { AnatomySection } from "../AnatomyPanel";
import {
  ControlToolbar,
  MenuCheckboxControl,
  MenuRadioControl,
  MenuRadioSubmenuControl,
  MenuSection,
  PropsToolbarGroup,
  ToolbarGroup,
  partProps,
} from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type DirectionMode = "default" | "provider-rtl" | "local-ltr" | "local-rtl";
type MenuValue = "learn" | "overview" | null;
type NestedValue = "foundations" | "patterns" | null;
type RefPart = "root" | "list" | "item" | "trigger" | "link" | "indicator" | "viewport" | "sub";
type SlotPart = "root" | "list" | "item" | "trigger" | "content" | "link" | "indicator" | "viewport" | "sub";

type LogEntry = {
  id: number;
  time: string;
  text: string;
};

const compositionOptions = ["default", "asChild", "render"] as const;
const directionOptions = [
  { label: "Default", value: "default" },
  { label: "Provider RTL", value: "provider-rtl" },
  { label: "Local LTR", value: "local-ltr" },
  { label: "Local RTL", value: "local-rtl" },
] as const;
const menuValueOptions = [
  { label: "Closed", value: "none" },
  { label: "Learn", value: "learn" },
  { label: "Overview", value: "overview" },
] as const;
const nestedValueOptions = [
  { label: "Closed", value: "none" },
  { label: "Foundations", value: "foundations" },
  { label: "Patterns", value: "patterns" },
] as const;
const initialCustomSlots: Record<SlotPart, boolean> = {
  root: false,
  list: false,
  item: false,
  trigger: false,
  content: false,
  link: false,
  indicator: false,
  viewport: false,
  sub: false,
};

function nowTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function toMenuValue(value: string): MenuValue {
  return value === "learn" || value === "overview" ? value : null;
}

function toNestedValue(value: string): NestedValue {
  return value === "foundations" || value === "patterns" ? value : null;
}

export function useNavigationMenuScenario() {
  const [controlled, setControlled] = useState(false);
  const [value, setValue] = useState<MenuValue>(null);
  const [defaultValue, setDefaultValueState] = useState<MenuValue>(null);
  const [instanceKey, setInstanceKey] = useState(0);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [directionMode, setDirectionMode] = useState<DirectionMode>("default");
  const [disableTrigger, setDisableTrigger] = useState(false);
  const [activeLink, setActiveLink] = useState(false);
  const [instantHover, setInstantHover] = useState(false);
  const [customLabel, setCustomLabel] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [indicatorForceMount, setIndicatorForceMount] = useState(false);
  const [viewportForceMount, setViewportForceMount] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [subControlled, setSubControlled] = useState(false);
  const [subValue, setSubValue] = useState<NestedValue>("foundations");
  const [subDefaultValue, setSubDefaultValueState] = useState<NestedValue>("foundations");
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [listComposition, setListComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [contentComposition, setContentComposition] = useState<CompositionMode>("default");
  const [subComposition, setSubComposition] = useState<CompositionMode>("default");
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const [linkComposition, setLinkComposition] = useState<CompositionMode>("default");
  const [indicatorComposition, setIndicatorComposition] = useState<CompositionMode>("default");
  const [viewportComposition, setViewportComposition] = useState<CompositionMode>("default");
  const [blockTriggerEvent, setBlockTriggerEvent] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState(initialCustomSlots);
  const [refs, setRefs] = useState<Record<RefPart, string>>({
    root: "none",
    list: "none",
    item: "none",
    trigger: "none",
    link: "none",
    indicator: "none",
    viewport: "none",
    sub: "none",
  });
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = useCallback((text: string) => {
    setLog((entries) => [
      { id: Date.now() + Math.random(), time: nowTime(), text },
      ...entries.slice(0, 10),
    ]);
  }, []);

  const markRef = useCallback((part: RefPart, element: HTMLElement | null) => {
    if (!element) return;
    const next = element.tagName.toLowerCase();
    setRefs((current) => current[part] === next ? current : { ...current, [part]: next });
  }, []);

  const setDefaultValue = (next: MenuValue) => {
    setDefaultValueState(next);
    setValue(next);
    setInstanceKey((key) => key + 1);
  };

  const setSubDefaultValue = (next: NestedValue) => {
    setSubDefaultValueState(next);
    setSubValue(next);
    setInstanceKey((key) => key + 1);
  };

  const handleValueChange = (next: string | null) => {
    const normalized = toMenuValue(next ?? "none");
    setValue(normalized);
    addLog(normalized ? `opened ${normalized}` : "closed navigation menu");
  };

  const handleSubValueChange = (next: string | null) => {
    const normalized = toNestedValue(next ?? "none");
    setSubValue(normalized);
    addLog(normalized ? `opened nested ${normalized}` : "closed nested navigation menu");
  };

  return {
    state: {
      controlled,
      value,
      defaultValue,
      instanceKey,
      orientation,
      directionMode,
      disableTrigger,
      activeLink,
      instantHover,
      customLabel,
      showIndicator,
      indicatorForceMount,
      viewportForceMount,
      showSub,
      subControlled,
      subValue,
      subDefaultValue,
      rootComposition,
      listComposition,
      itemComposition,
      contentComposition,
      subComposition,
      triggerComposition,
      linkComposition,
      indicatorComposition,
      viewportComposition,
      blockTriggerEvent,
      propCheck,
      customSlots,
      refs,
      log,
    },
    actions: {
      setControlled: (next: boolean) => {
        setControlled(next);
        setValue(defaultValue);
      },
      setValue,
      setDefaultValue,
      setOrientation,
      setDirectionMode,
      setDisableTrigger,
      setActiveLink,
      setInstantHover,
      setCustomLabel,
      setShowIndicator,
      setIndicatorForceMount,
      setViewportForceMount,
      setShowSub,
      setSubControlled,
      setSubValue,
      setSubDefaultValue,
      setRootComposition,
      setListComposition,
      setItemComposition,
      setContentComposition,
      setSubComposition,
      setTriggerComposition,
      setLinkComposition,
      setIndicatorComposition,
      setViewportComposition,
      setBlockTriggerEvent,
      setPropCheck,
      setCustomSlot: (part: SlotPart, checked: boolean) => {
        setCustomSlots((current) => ({ ...current, [part]: checked }));
      },
      handleValueChange,
      handleSubValueChange,
      noteLink: (label: string) => addLog(`selected link ${label}`),
      markRootRef: (element: HTMLElement | null) => markRef("root", element),
      markListRef: (element: HTMLElement | null) => markRef("list", element),
      markItemRef: (element: HTMLElement | null) => markRef("item", element),
      markTriggerRef: (element: HTMLElement | null) => markRef("trigger", element),
      markLinkRef: (element: HTMLElement | null) => markRef("link", element),
      markIndicatorRef: (element: HTMLElement | null) => markRef("indicator", element),
      markViewportRef: (element: HTMLElement | null) => markRef("viewport", element),
      markSubRef: (element: HTMLElement | null) => markRef("sub", element),
      clearLog: () => setLog([]),
    },
  };
}

export type NavigationMenuScenario = ReturnType<typeof useNavigationMenuScenario>;

export function NavigationMenuScenarioToolbar({ scenario }: { scenario: NavigationMenuScenario }) {
  const { state, actions } = scenario;
  return (
    <ControlToolbar label="Navigation Menu controls">
      <ToolbarGroup title="State" value="state">
        <MenuSection label="Root Value">
          <MenuCheckboxControl checked={state.controlled} label="Controlled" value="controlled" onChange={actions.setControlled} />
          {state.controlled ? (
            <MenuRadioControl label="Controlled value" options={menuValueOptions} value={state.value ?? "none"} onChange={(next) => actions.setValue(toMenuValue(next))} />
          ) : (
            <MenuRadioControl label="Default value" options={menuValueOptions} value={state.defaultValue ?? "none"} onChange={(next) => actions.setDefaultValue(toMenuValue(next))} />
          )}
        </MenuSection>
        <MenuSection label="Item State">
          <MenuCheckboxControl checked={state.disableTrigger} label="Disable Trigger" value="disable-trigger" onChange={actions.setDisableTrigger} />
          <MenuCheckboxControl checked={state.activeLink} label="Active Link" value="active-link" onChange={actions.setActiveLink} />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Behavior" value="behavior">
        <MenuRadioControl label="Orientation" options={["horizontal", "vertical"]} value={state.orientation} onChange={actions.setOrientation} />
        <MenuCheckboxControl checked={state.instantHover} label="Instant Hover" value="instant-hover" onChange={actions.setInstantHover} />
        <MenuCheckboxControl checked={state.customLabel} label="Custom Label" value="custom-label" onChange={actions.setCustomLabel} />
        <MenuCheckboxControl checked={state.viewportForceMount} label="Force Viewport" value="force-viewport" onChange={actions.setViewportForceMount} />
        <MenuCheckboxControl checked={state.showIndicator} label="Show Indicator" value="show-indicator" onChange={actions.setShowIndicator} />
        {state.showIndicator ? (
          <MenuCheckboxControl checked={state.indicatorForceMount} label="Force Indicator" value="force-indicator" onChange={actions.setIndicatorForceMount} />
        ) : null}
      </ToolbarGroup>
      <ToolbarGroup title="Direction" value="direction">
        <MenuRadioControl label="Mode" options={directionOptions} value={state.directionMode} onChange={(next) => actions.setDirectionMode(next as DirectionMode)} />
      </ToolbarGroup>
      <ToolbarGroup title="Nesting" value="nesting">
        <MenuCheckboxControl checked={state.showSub} label="Show Sub" value="show-sub" onChange={actions.setShowSub} />
        {state.showSub ? (
          <>
            <MenuCheckboxControl checked={state.subControlled} label="Controlled Sub" value="controlled-sub" onChange={actions.setSubControlled} />
            {state.subControlled ? (
              <MenuRadioControl label="Sub value" options={nestedValueOptions} value={state.subValue ?? "none"} onChange={(next) => actions.setSubValue(toNestedValue(next))} />
            ) : (
              <MenuRadioControl label="Sub default" options={nestedValueOptions} value={state.subDefaultValue ?? "none"} onChange={(next) => actions.setSubDefaultValue(toNestedValue(next))} />
            )}
          </>
        ) : null}
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioSubmenuControl label="Root" options={compositionOptions} value={state.rootComposition} onChange={actions.setRootComposition} />
        <MenuRadioSubmenuControl label="List" options={compositionOptions} value={state.listComposition} onChange={actions.setListComposition} />
        <MenuRadioSubmenuControl label="Item" options={compositionOptions} value={state.itemComposition} onChange={actions.setItemComposition} />
        <MenuRadioSubmenuControl label="Trigger" options={compositionOptions} value={state.triggerComposition} onChange={actions.setTriggerComposition} />
        <MenuRadioSubmenuControl label="Content" options={compositionOptions} value={state.contentComposition} onChange={actions.setContentComposition} />
        <MenuRadioSubmenuControl label="Link" options={compositionOptions} value={state.linkComposition} onChange={actions.setLinkComposition} />
        <MenuRadioSubmenuControl label="Indicator" options={compositionOptions} value={state.indicatorComposition} onChange={actions.setIndicatorComposition} />
        <MenuRadioSubmenuControl label="Viewport" options={compositionOptions} value={state.viewportComposition} onChange={actions.setViewportComposition} />
        <MenuRadioSubmenuControl label="Sub" options={compositionOptions} value={state.subComposition} onChange={actions.setSubComposition} />
        <MenuCheckboxControl checked={state.blockTriggerEvent} label="Block Trigger Event" value="block-trigger-event" onChange={actions.setBlockTriggerEvent} />
      </ToolbarGroup>
      <PropsToolbarGroup
        propCheck={state.propCheck}
        customSlots={([
          ["root", "Root Slot"],
          ["list", "List Slot"],
          ["item", "Item Slot"],
          ["trigger", "Trigger Slot"],
          ["content", "Content Slot"],
          ["link", "Link Slot"],
          ["indicator", "Indicator Slot"],
          ["viewport", "Viewport Slot"],
          ["sub", "Sub Slot"],
        ] as const).map(([part, label]) => ({
          checked: state.customSlots[part],
          label,
          value: `${part}-slot`,
          onChange: (checked) => actions.setCustomSlot(part, checked),
        }))}
        onPropCheckChange={actions.setPropCheck}
      />
    </ControlToolbar>
  );
}

function Caret() {
  return <span className="utility-navigation-caret" aria-hidden="true">⌄</span>;
}

function TriggerPart({
  scenario,
  value,
  children,
  disabled = false,
  primary = false,
  nested = false,
}: {
  scenario: NavigationMenuScenario;
  value: string;
  children: ReactNode;
  disabled?: boolean;
  primary?: boolean;
  nested?: boolean;
}) {
  const props = {
    className: nested ? "utility-navigation-sub-trigger" : "utility-navigation-trigger",
    disabled,
    "data-navigation-trigger": value,
    "data-playground-inspect": "",
    ...(primary ? partProps("trigger", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customSlots.trigger }, "navigation-menu-trigger-custom") : {}),
    ...(primary ? { ref: scenario.actions.markTriggerRef } : {}),
    ...(primary ? {
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        if (scenario.state.blockTriggerEvent) event.preventDefault();
      },
    } : {}),
  };
  const content = <>{children}<Caret /></>;

  if (scenario.state.triggerComposition === "asChild") {
    return <NavigationMenu.Trigger {...props} asChild><button>{content}</button></NavigationMenu.Trigger>;
  }
  if (scenario.state.triggerComposition === "render") {
    return <NavigationMenu.Trigger {...props} render={(renderProps) => <button {...renderProps} />}>{content}</NavigationMenu.Trigger>;
  }
  return <NavigationMenu.Trigger {...props}>{content}</NavigationMenu.Trigger>;
}

function LinkPart({
  scenario,
  href,
  label,
  description,
  marker,
  active = false,
  primary = false,
  callout = false,
}: {
  scenario: NavigationMenuScenario;
  href: string;
  label: string;
  description?: string;
  marker: string;
  active?: boolean;
  primary?: boolean;
  callout?: boolean;
}) {
  const className = callout
    ? "utility-navigation-callout"
    : description
      ? "utility-navigation-card-link"
      : "utility-navigation-link";
  const commonProps = {
    active,
    className,
    "data-navigation-link": marker,
    "data-playground-inspect": "",
    ...(primary ? partProps("link", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customSlots.link }, "navigation-menu-link-custom") : {}),
    ...(primary ? { ref: scenario.actions.markLinkRef } : {}),
    onSelect: () => scenario.actions.noteLink(marker),
  };
  const content = (
    <>
      {callout ? <span className="utility-navigation-mark" aria-hidden="true">A</span> : null}
      <span className="utility-navigation-link-title">{label}</span>
      {description ? <span className="utility-navigation-link-description">{description}</span> : null}
    </>
  );

  if (scenario.state.linkComposition === "asChild") {
    return <NavigationMenu.Link {...commonProps} asChild><a href={href}>{content}</a></NavigationMenu.Link>;
  }
  if (scenario.state.linkComposition === "render") {
    return <NavigationMenu.Link {...commonProps} href={href} render={(renderProps) => <a {...renderProps} />}>{content}</NavigationMenu.Link>;
  }
  return <NavigationMenu.Link {...commonProps} href={href}>{content}</NavigationMenu.Link>;
}

function ContentPart({
  scenario,
  children,
}: {
  scenario: NavigationMenuScenario;
  children: ReactNode;
}) {
  const props = {
    className: "utility-navigation-content",
    "data-navigation-content": "learn",
    "data-playground-inspect": "",
    ...partProps("content", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customSlots.content }, "navigation-menu-content-custom"),
  };

  if (scenario.state.contentComposition === "asChild") {
    return <NavigationMenu.Content {...props} asChild><section>{children}</section></NavigationMenu.Content>;
  }
  if (scenario.state.contentComposition === "render") {
    return <NavigationMenu.Content {...props} render={(renderProps) => <section {...renderProps} />}>{children}</NavigationMenu.Content>;
  }
  return <NavigationMenu.Content {...props}>{children}</NavigationMenu.Content>;
}

function NestedMenu({ scenario }: { scenario: NavigationMenuScenario }) {
  const { state, actions } = scenario;
  const subProps = {
    className: "utility-navigation-sub",
    "data-navigation-sub": "",
    "data-playground-inspect": "",
    ...partProps("sub", { propCheck: state.propCheck, customSlot: state.customSlots.sub }, "navigation-menu-sub-custom"),
    ref: actions.markSubRef,
    onValueChange: actions.handleSubValueChange,
    ...(state.subControlled ? { value: state.subValue } : state.subDefaultValue ? { defaultValue: state.subDefaultValue } : {}),
  };
  const children = (
    <>
      <NavigationMenu.List className="utility-navigation-sub-list" data-navigation-list="nested" data-playground-inspect="">
        <NavigationMenu.Item value="foundations" data-navigation-item="foundations" data-playground-inspect="">
          <TriggerPart scenario={scenario} value="foundations" nested>Foundations</TriggerPart>
          <NavigationMenu.Content className="utility-navigation-sub-content" data-navigation-content="foundations" data-playground-inspect="">
            <p>Start with semantic structure, focus order, and accessible names.</p>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="patterns" data-navigation-item="patterns" data-playground-inspect="">
          <TriggerPart scenario={scenario} value="patterns" nested>Patterns</TriggerPart>
          <NavigationMenu.Content className="utility-navigation-sub-content" data-navigation-content="patterns" data-playground-inspect="">
            <p>Compose disclosure panels, links, and nested navigation scopes.</p>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport className="utility-navigation-sub-viewport" data-navigation-viewport="nested" data-playground-inspect="" />
    </>
  );

  if (state.subComposition === "asChild") {
    return <NavigationMenu.Sub {...subProps} asChild><section>{children}</section></NavigationMenu.Sub>;
  }
  if (state.subComposition === "render") {
    return <NavigationMenu.Sub {...subProps} render={(renderProps) => <section {...renderProps} />}>{children}</NavigationMenu.Sub>;
  }
  return <NavigationMenu.Sub {...subProps}>{children}</NavigationMenu.Sub>;
}

function IndicatorPart({ scenario }: { scenario: NavigationMenuScenario }) {
  const props = {
    className: "utility-navigation-indicator",
    forceMount: scenario.state.indicatorForceMount,
    "data-navigation-indicator": "",
    "data-playground-inspect": "",
    ...partProps("indicator", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customSlots.indicator }, "navigation-menu-indicator-custom"),
    ref: scenario.actions.markIndicatorRef,
  };
  const arrow = <span className="utility-navigation-indicator-arrow" />;
  if (scenario.state.indicatorComposition === "asChild") {
    return <NavigationMenu.Indicator {...props} asChild><span>{arrow}</span></NavigationMenu.Indicator>;
  }
  if (scenario.state.indicatorComposition === "render") {
    return <NavigationMenu.Indicator {...props} render={(renderProps) => <span {...renderProps} />}>{arrow}</NavigationMenu.Indicator>;
  }
  return <NavigationMenu.Indicator {...props}>{arrow}</NavigationMenu.Indicator>;
}

function ViewportPart({ scenario }: { scenario: NavigationMenuScenario }) {
  const props = {
    className: "utility-navigation-viewport",
    forceMount: scenario.state.viewportForceMount,
    "data-navigation-viewport": "primary",
    "data-playground-inspect": "",
    ...partProps("viewport", { propCheck: scenario.state.propCheck, customSlot: scenario.state.customSlots.viewport }, "navigation-menu-viewport-custom"),
    ref: scenario.actions.markViewportRef,
  };
  if (scenario.state.viewportComposition === "asChild") {
    return <NavigationMenu.Viewport {...props} asChild><section /></NavigationMenu.Viewport>;
  }
  if (scenario.state.viewportComposition === "render") {
    return <NavigationMenu.Viewport {...props} render={(renderProps) => <section {...renderProps} />} />;
  }
  return <NavigationMenu.Viewport {...props} />;
}

export function NavigationMenuScenarioCanvas({ scenario }: { scenario: NavigationMenuScenario }) {
  const { state, actions } = scenario;
  const localDir: "ltr" | "rtl" | undefined = state.directionMode === "local-rtl"
    ? "rtl"
    : state.directionMode === "local-ltr"
      ? "ltr"
      : undefined;
  const rootProps = {
    key: state.instanceKey,
    className: `utility-navigation-menu ${state.orientation}`,
    "data-navigation-root": "",
    "data-playground-inspect": "",
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customSlots.root }, "navigation-menu-root-custom"),
    ref: actions.markRootRef,
    ...(state.controlled ? { value: state.value } : state.defaultValue ? { defaultValue: state.defaultValue } : {}),
    onValueChange: actions.handleValueChange,
    ...(state.instantHover ? { delayDuration: 0, skipDelayDuration: 0 } : {}),
    ...(state.orientation === "vertical" ? { orientation: state.orientation } : {}),
    ...(localDir ? { dir: localDir } : {}),
    ...(state.customLabel ? { "aria-label": "Atom resources" } : {}),
  };
  const learnItemProps = {
    value: "learn",
    "data-navigation-item": "learn",
    "data-playground-inspect": "",
    ...partProps("item", { propCheck: state.propCheck, customSlot: state.customSlots.item }, "navigation-menu-item-custom"),
    ref: actions.markItemRef,
  };
  const learnItemChildren = (
    <>
      <TriggerPart scenario={scenario} value="learn" primary>Learn</TriggerPart>
      <ContentPart scenario={scenario}>
        <ul className="utility-navigation-grid utility-navigation-grid-learn">
          <li className="utility-navigation-callout-cell">
            <LinkPart scenario={scenario} href="#atom-primitives" label="Atom UI" description="Headless, accessible primitives for React." marker="atom" callout primary />
          </li>
          <li><LinkPart scenario={scenario} href="#composition" label="Composition" description="Build interfaces from predictable public parts." marker="composition" /></li>
          <li><LinkPart scenario={scenario} href="#accessibility" label="Accessibility" description="Inspect focus, keyboard, and ARIA behavior." marker="accessibility" /></li>
          <li><LinkPart scenario={scenario} href="#testing" label="Testing" description="Exercise real browser interactions and state." marker="testing" /></li>
        </ul>
      </ContentPart>
    </>
  );
  const learnItem = state.itemComposition === "asChild"
    ? <NavigationMenu.Item {...learnItemProps} asChild><li>{learnItemChildren}</li></NavigationMenu.Item>
    : state.itemComposition === "render"
      ? <NavigationMenu.Item {...learnItemProps} render={(renderProps) => <li {...renderProps} />}>{learnItemChildren}</NavigationMenu.Item>
      : <NavigationMenu.Item {...learnItemProps}>{learnItemChildren}</NavigationMenu.Item>;
  const primaryItems = (
    <>
      {learnItem}
        <NavigationMenu.Item value="overview" data-navigation-item="overview" data-playground-inspect="">
          <TriggerPart scenario={scenario} value="overview" disabled={state.disableTrigger}>Overview</TriggerPart>
          <NavigationMenu.Content className="utility-navigation-content" data-navigation-content="overview" data-playground-inspect="">
            {state.showSub ? <NestedMenu scenario={scenario} /> : (
              <ul className="utility-navigation-grid utility-navigation-grid-overview">
                <li><LinkPart scenario={scenario} href="#introduction" label="Introduction" description="Understand Atom's behavior-first boundary." marker="introduction" /></li>
                <li><LinkPart scenario={scenario} href="#styling" label="Styling" description="Use data attributes and your own CSS." marker="styling" /></li>
                <li><LinkPart scenario={scenario} href="#getting-started" label="Getting started" description="Create a small accessible interface." marker="getting-started" /></li>
                <li><LinkPart scenario={scenario} href="#releases" label="Releases" description="Track public API and behavior changes." marker="releases" /></li>
              </ul>
            )}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="github" data-navigation-item="github" data-playground-inspect="">
          <LinkPart scenario={scenario} href="#github" label="GitHub" marker="github" active={state.activeLink} />
        </NavigationMenu.Item>
        {state.showIndicator ? <IndicatorPart scenario={scenario} /> : null}
    </>
  );
  const listProps = {
    className: "utility-navigation-list",
    "data-navigation-list": "primary",
    "data-playground-inspect": "",
    ...partProps("list", { propCheck: state.propCheck, customSlot: state.customSlots.list }, "navigation-menu-list-custom"),
    ref: actions.markListRef,
  };
  const primaryList = state.listComposition === "asChild"
    ? <NavigationMenu.List {...listProps} asChild><ol>{primaryItems}</ol></NavigationMenu.List>
    : state.listComposition === "render"
      ? <NavigationMenu.List {...listProps} render={(renderProps) => <ol {...renderProps} />}>{primaryItems}</NavigationMenu.List>
      : <NavigationMenu.List {...listProps}>{primaryItems}</NavigationMenu.List>;
  const rootChildren = (
    <>
      {primaryList}
      <div className="utility-navigation-viewport-position"><ViewportPart scenario={scenario} /></div>
    </>
  );
  const menu = state.rootComposition === "asChild"
    ? <NavigationMenu.Root {...rootProps} asChild><section>{rootChildren}</section></NavigationMenu.Root>
    : state.rootComposition === "render"
      ? <NavigationMenu.Root {...rootProps} render={(renderProps) => <section {...renderProps} />}>{rootChildren}</NavigationMenu.Root>
      : <NavigationMenu.Root {...rootProps}>{rootChildren}</NavigationMenu.Root>;

  return (
    <div className="utility-primitive-stage utility-navigation-stage">
      {state.directionMode === "provider-rtl" || state.directionMode === "local-ltr"
        ? <Direction.Provider dir="rtl">{menu}</Direction.Provider>
        : menu}
    </div>
  );
}

function exists(value: Element | null) {
  return value ? "true" : "false";
}

export function getNavigationMenuSections(scenario: NavigationMenuScenario): AnatomySection[] {
  const { state } = scenario;
  const query = (selector: string) => document.querySelector<HTMLElement>(selector);
  const section = (
    title: string,
    selector: string,
    refPart?: RefPart,
    extraRows: AnatomySection["rows"] = [],
  ): AnatomySection => {
    const element = query(selector);
    return {
      title,
      selector,
      inactive: !element,
      summary: element?.dataset.state ?? (element ? "rendered" : "not rendered"),
      rows: [
        { label: "Exists", value: exists(element), category: "presence" },
        ...(refPart ? [{ label: "Ref", value: state.refs[refPart], category: "identity" as const }] : []),
        ...extraRows,
      ],
    };
  };

  const sections: AnatomySection[] = [
    section("Root", "[data-navigation-root]", "root", [
      { label: "Mode", value: state.controlled ? "controlled" : "uncontrolled", category: "state" },
      { label: "Value", value: state.value ?? "none", category: "state" },
      { label: "Direction mode", value: state.directionMode, category: "state" },
      { label: "Composition", value: state.rootComposition, category: "composition" },
    ]),
    section("List: Primary", "[data-navigation-list='primary']", "list", [
      { label: "Composition", value: state.listComposition, category: "composition" },
    ]),
    section("Item: Learn", "[data-navigation-item='learn']", "item", [
      { label: "Composition", value: state.itemComposition, category: "composition" },
    ]),
    section("Trigger: Learn", "[data-navigation-trigger='learn']", "trigger", [
      { label: "Composition", value: state.triggerComposition, category: "composition" },
    ]),
    section("Content: Learn", "[data-navigation-content='learn']", undefined, [
      { label: "Composition", value: state.contentComposition, category: "composition" },
    ]),
    section("Link: Atom UI", "[data-navigation-link='atom']", "link", [
      { label: "Composition", value: state.linkComposition, category: "composition" },
    ]),
    section("Item: Overview", "[data-navigation-item='overview']"),
    section("Trigger: Overview", "[data-navigation-trigger='overview']", undefined, [
      { label: "Disabled", value: String(state.disableTrigger), category: "state" },
    ]),
    section("Content: Overview", "[data-navigation-content='overview']"),
    section("Sub", "[data-navigation-sub]", "sub", [
      { label: "Mode", value: state.subControlled ? "controlled" : "uncontrolled", category: "state" },
      { label: "Value", value: state.subValue ?? "none", category: "state" },
      { label: "Composition", value: state.subComposition, category: "composition" },
    ]),
  ];

  if (state.showSub) {
    sections.push(
      section("List: Nested", "[data-navigation-list='nested']"),
      section("Item: Foundations", "[data-navigation-item='foundations']"),
      section("Trigger: Foundations", "[data-navigation-trigger='foundations']"),
      section("Content: Foundations", "[data-navigation-content='foundations']"),
      section("Item: Patterns", "[data-navigation-item='patterns']"),
      section("Trigger: Patterns", "[data-navigation-trigger='patterns']"),
      section("Content: Patterns", "[data-navigation-content='patterns']"),
      section("Viewport: Nested", "[data-navigation-viewport='nested']"),
    );
  }

  sections.push(
    section("Item: GitHub", "[data-navigation-item='github']"),
    section("Link: GitHub", "[data-navigation-link='github']", undefined, [
      { label: "Active", value: String(state.activeLink), category: "state" },
    ]),
    section("Indicator", "[data-navigation-indicator]", "indicator", [
      { label: "Composition", value: state.indicatorComposition, category: "composition" },
    ]),
    section("Viewport", "[data-navigation-viewport='primary']", "viewport", [
      { label: "Composition", value: state.viewportComposition, category: "composition" },
    ]),
  );

  return sections;
}

function sourceProps(props: Array<string | null | undefined | false>) {
  const values = props.filter(Boolean);
  return values.length ? ` ${values.join(" ")}` : "";
}

function indent(source: string, spaces: number) {
  const padding = " ".repeat(spaces);
  return source.split("\n").map((line) => `${padding}${line}`).join("\n");
}

function getTriggerSource(label: string, props: string, composition: CompositionMode) {
  const content = `${label} <span aria-hidden>⌄</span>`;
  if (composition === "asChild") return `<NavigationMenu.Trigger${props} asChild>\n  <button>${content}</button>\n</NavigationMenu.Trigger>`;
  if (composition === "render") return `<NavigationMenu.Trigger${props} render={(props) => <button {...props} />}>\n  ${content}\n</NavigationMenu.Trigger>`;
  return `<NavigationMenu.Trigger${props}>${content}</NavigationMenu.Trigger>`;
}

function getLinkSource(props: string, composition: CompositionMode) {
  if (composition === "asChild") return `<NavigationMenu.Link${props} asChild>\n  <a href="#atom-primitives">Atom UI</a>\n</NavigationMenu.Link>`;
  if (composition === "render") return `<NavigationMenu.Link href="#atom-primitives"${props} render={(props) => <a {...props} />}>Atom UI</NavigationMenu.Link>`;
  return `<NavigationMenu.Link href="#atom-primitives"${props}>Atom UI</NavigationMenu.Link>`;
}

function getContainerSource(
  part: "Root" | "List" | "Item" | "Content",
  props: string,
  children: string,
  composition: CompositionMode,
  element: "section" | "ol" | "li",
) {
  if (composition === "asChild") {
    return `<NavigationMenu.${part}${props} asChild>\n  <${element}>\n${indent(children, 4)}\n  </${element}>\n</NavigationMenu.${part}>`;
  }
  if (composition === "render") {
    return `<NavigationMenu.${part}${props} render={(props) => <${element} {...props} />}>\n${indent(children, 2)}\n</NavigationMenu.${part}>`;
  }
  return `<NavigationMenu.${part}${props}>\n${indent(children, 2)}\n</NavigationMenu.${part}>`;
}

function getSubSource(scenario: NavigationMenuScenario) {
  const { state } = scenario;
  if (!state.showSub) return "Overview links";
  const props = sourceProps([
    state.subControlled ? `value={subValue}` : state.subDefaultValue ? `defaultValue="${state.subDefaultValue}"` : null,
    state.subControlled ? "onValueChange={setSubValue}" : null,
    state.customSlots.sub ? `data-slot="navigation-menu-sub-custom"` : null,
    state.propCheck ? `data-prop-check="sub"` : null,
  ]);
  const children = `<NavigationMenu.List>\n  <NavigationMenu.Item value="foundations">\n    <NavigationMenu.Trigger>Foundations</NavigationMenu.Trigger>\n    <NavigationMenu.Content>Foundation guidance</NavigationMenu.Content>\n  </NavigationMenu.Item>\n  <NavigationMenu.Item value="patterns">\n    <NavigationMenu.Trigger>Patterns</NavigationMenu.Trigger>\n    <NavigationMenu.Content>Pattern guidance</NavigationMenu.Content>\n  </NavigationMenu.Item>\n</NavigationMenu.List>\n<NavigationMenu.Viewport />`;
  if (state.subComposition === "asChild") return `<NavigationMenu.Sub${props} asChild>\n  <section>\n${indent(children, 4)}\n  </section>\n</NavigationMenu.Sub>`;
  if (state.subComposition === "render") return `<NavigationMenu.Sub${props} render={(props) => <section {...props} />}>\n${indent(children, 2)}\n</NavigationMenu.Sub>`;
  return `<NavigationMenu.Sub${props}>\n${indent(children, 2)}\n</NavigationMenu.Sub>`;
}

export function getNavigationMenuSource(scenario: NavigationMenuScenario) {
  const { state } = scenario;
  const rootProps = sourceProps([
    state.controlled ? "value={value}" : state.defaultValue ? `defaultValue="${state.defaultValue}"` : null,
    state.controlled ? "onValueChange={setValue}" : null,
    state.instantHover ? "delayDuration={0}" : null,
    state.instantHover ? "skipDelayDuration={0}" : null,
    state.orientation === "vertical" ? `orientation="vertical"` : null,
    state.directionMode === "local-ltr" ? `dir="ltr"` : null,
    state.directionMode === "local-rtl" ? `dir="rtl"` : null,
    state.customLabel ? `aria-label="Atom resources"` : null,
    state.customSlots.root ? `data-slot="navigation-menu-root-custom"` : null,
    state.propCheck ? `data-prop-check="root"` : null,
  ]);
  const triggerProps = sourceProps([
    state.customSlots.trigger ? `data-slot="navigation-menu-trigger-custom"` : null,
    state.propCheck ? `data-prop-check="trigger"` : null,
    state.blockTriggerEvent ? `onClick={(event) => event.preventDefault()}` : null,
  ]);
  const overviewTriggerProps = sourceProps([state.disableTrigger ? "disabled" : null]);
  const contentProps = sourceProps([
    state.customSlots.content ? `data-slot="navigation-menu-content-custom"` : null,
    state.propCheck ? `data-prop-check="content"` : null,
  ]);
  const linkProps = sourceProps([
    state.activeLink ? "active" : null,
    state.customSlots.link ? `data-slot="navigation-menu-link-custom"` : null,
    state.propCheck ? `data-prop-check="link"` : null,
  ]);
  const indicatorProps = sourceProps([
    state.indicatorForceMount ? "forceMount" : null,
    state.customSlots.indicator ? `data-slot="navigation-menu-indicator-custom"` : null,
    state.propCheck ? `data-prop-check="indicator"` : null,
  ]);
  const viewportProps = sourceProps([
    state.viewportForceMount ? "forceMount" : null,
    state.customSlots.viewport ? `data-slot="navigation-menu-viewport-custom"` : null,
    state.propCheck ? `data-prop-check="viewport"` : null,
  ]);
  const learnTrigger = getTriggerSource("Learn", triggerProps, state.triggerComposition);
  const overviewTrigger = getTriggerSource("Overview", overviewTriggerProps, state.triggerComposition);
  const learnLink = getLinkSource(linkProps, state.linkComposition);
  let indicator = "";
  if (state.showIndicator) {
    if (state.indicatorComposition === "asChild") indicator = `<NavigationMenu.Indicator${indicatorProps} asChild><span /></NavigationMenu.Indicator>`;
    else if (state.indicatorComposition === "render") indicator = `<NavigationMenu.Indicator${indicatorProps} render={(props) => <span {...props} />} />`;
    else indicator = `<NavigationMenu.Indicator${indicatorProps} />`;
  }
  const listProps = sourceProps([
    state.customSlots.list ? `data-slot="navigation-menu-list-custom"` : null,
    state.propCheck ? `data-prop-check="list"` : null,
  ]);
  const itemProps = sourceProps([
    state.customSlots.item ? `data-slot="navigation-menu-item-custom"` : null,
    state.propCheck ? `data-prop-check="item"` : null,
  ]);
  const learnContent = getContainerSource("Content", contentProps, learnLink, state.contentComposition, "section");
  const learnItem = getContainerSource(
    "Item",
    ` value="learn"${itemProps}`,
    `${learnTrigger}\n${learnContent}`,
    state.itemComposition,
    "li",
  );
  const overviewItem = `<NavigationMenu.Item value="overview">\n${indent(overviewTrigger, 2)}\n  <NavigationMenu.Content>\n${indent(getSubSource(scenario), 4)}\n  </NavigationMenu.Content>\n</NavigationMenu.Item>`;
  const githubItem = `<NavigationMenu.Item value="github">\n  <NavigationMenu.Link href="#github"${sourceProps([state.activeLink ? "active" : null])}>GitHub</NavigationMenu.Link>\n</NavigationMenu.Item>`;
  const listChildren = `${learnItem}\n${overviewItem}\n${githubItem}${indicator ? `\n${indicator}` : ""}`;
  const list = getContainerSource("List", listProps, listChildren, state.listComposition, "ol");
  const viewport = state.viewportComposition === "asChild"
    ? `<NavigationMenu.Viewport${viewportProps} asChild>\n  <section />\n</NavigationMenu.Viewport>`
    : state.viewportComposition === "render"
      ? `<NavigationMenu.Viewport${viewportProps} render={(props) => <section {...props} />} />`
      : `<NavigationMenu.Viewport${viewportProps} />`;
  const body = getContainerSource("Root", rootProps, `${list}\n${viewport}`, state.rootComposition, "section");
  return state.directionMode === "provider-rtl" || state.directionMode === "local-ltr"
    ? `<Direction.Provider dir="rtl">\n${indent(body, 2)}\n</Direction.Provider>`
    : body;
}

export function getNavigationMenuFooter(scenario: NavigationMenuScenario) {
  const { state } = scenario;
  const resolvedDirection = state.directionMode === "provider-rtl" || state.directionMode === "local-rtl" ? "rtl" : "ltr";
  return `Open ${state.value ?? "none"} | ${state.controlled ? "Controlled" : "Uncontrolled"} | ${state.orientation} | ${resolvedDirection}`;
}
