import { Button } from "@flowstack-ui/atom/button";
import { HoverCard } from "@flowstack-ui/atom/hover-card";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, ScenarioEventLog, ToolbarGroup } from "../WorkbenchPrimitives";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type {
  HoverCardAlign,
  HoverCardCompositionMode,
  HoverCardScenarioActions,
  HoverCardScenarioState,
  HoverCardSide,
} from "./useHoverCardScenario";

export function HoverCardScenarioCanvas({
  state,
  actions,
}: {
  state: HoverCardScenarioState;
  actions: HoverCardScenarioActions;
}) {
  const rootProps = state.controlled
    ? { open: state.open, onOpenChange: actions.handleOpenChange }
    : { defaultOpen: false, onOpenChange: actions.handleOpenChange };

  return (
    <div className="popover-stage">
      <HoverCard.Root
        {...rootProps}
        openDelay={state.openDelay}
        closeDelay={state.closeDelay}
        disabled={state.disabled}
      >
        <HoverCardTriggerExample
          mode={state.triggerComposition}
          onBlur={actions.handleTriggerBlur}
          onFocus={actions.handleTriggerFocus}
          onKeyDown={actions.handleTriggerKeyDown}
          onMouseEnter={actions.handleTriggerMouseEnter}
          onMouseLeave={actions.handleTriggerMouseLeave}
        />
        {state.controlled ? (
          <div className="controlled-actions">
            <Button.Root
              className="atom-button secondary"
              disabled={state.open}
              onPress={() => actions.setControlledOpen(true)}
            >
              Open controlled
            </Button.Root>
            <Button.Root
              className="atom-button secondary"
              disabled={!state.open}
              onPress={() => actions.setControlledOpen(false)}
            >
              Close controlled
            </Button.Root>
          </div>
        ) : null}
        <HoverCard.Portal>
          <HoverCard.Content
            ariaLabel={state.useAriaLabel ? "Contributor preview" : undefined}
            className="atom-popover-content"
            data-hover-card-content=""
            data-playground-inspect=""
            data-prop-check="content"
            side={state.side}
            align={state.align}
            sideOffset={state.sideOffset}
          >
            <p className="popover-kicker">Contributor</p>
            <h2 className="popover-title">Ada Lovelace</h2>
            <p className="popover-copy">
              Mathematician, writer, and early computing collaborator.
            </p>
            <HoverCard.Arrow
              className="atom-popover-arrow"
              data-hover-card-arrow=""
              data-prop-check="arrow"
            />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
      <Button.Root className="behind-dialog-button" tabIndex={-1}>
        Outside focus target
      </Button.Root>
    </div>
  );
}

export function HoverCardScenarioAnatomy({
  openGroups,
  state,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  state: HoverCardScenarioState;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const trigger = document.querySelector<HTMLElement>("[data-hover-card-trigger]");
  const content = document.querySelector<HTMLElement>("[data-hover-card-content]");
  const arrow = document.querySelector<HTMLElement>("[data-hover-card-arrow]");

  const sections: AnatomySection[] = [
    {
      title: "Root",
      summary: state.controlled ? "controlled" : "uncontrolled",
      rows: [
        { label: "Mode", value: state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Open", value: state.open ? "yes" : "no", category: "state" },
        { label: "Disabled", value: state.disabled ? "yes" : "no", category: "state" },
        { label: "Open delay", value: String(state.openDelay), category: "behavior" },
        { label: "Close delay", value: String(state.closeDelay), category: "behavior" },
      ],
    },
    {
      title: "Trigger",
      selector: "[data-hover-card-trigger]",
      summary: trigger?.dataset.state ?? "closed",
      rows: [
        { label: "Exists", value: trigger ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.triggerComposition, category: "composition" },
      ],
    },
    {
      title: "Portal",
      inactive: !content,
      summary: content?.parentElement?.tagName.toLowerCase() ?? "not rendered",
      rows: [
        { label: "Content exists", value: content ? "yes" : "no", category: "presence" },
        { label: "Parent", value: content?.parentElement?.tagName.toLowerCase() ?? "none", category: "behavior" },
        { label: "Inside canvas", value: content?.closest(".canvas") ? "yes" : "no", category: "behavior" },
      ],
    },
    {
      title: "Content",
      selector: "[data-hover-card-content]",
      inactive: !content,
      summary: content?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: content ? "yes" : "no", category: "presence" },
        { label: "Side", value: state.side, category: "behavior" },
        { label: "Align", value: state.align, category: "behavior" },
        { label: "Offset", value: String(state.sideOffset), category: "behavior" },
      ],
    },
    {
      title: "Arrow",
      selector: "[data-hover-card-arrow]",
      inactive: !arrow,
      summary: arrow?.dataset.side ?? "not rendered",
      rows: [
        { label: "Exists", value: arrow ? "yes" : "no", category: "presence" },
      ],
    },
  ];

  return (
    <AnatomyPanel
      footer={`${sections.length} parts`}
      openGroups={openGroups}
      sections={sections}
      onOpenGroupsChange={onOpenGroupsChange}
    />
  );
}

export function HoverCardScenarioToolbar({
  state,
  actions,
}: {
  state: HoverCardScenarioState;
  actions: HoverCardScenarioActions;
}) {
  return (
    <ControlToolbar label="HoverCard controls">
      <ToolbarGroup title="State" value="state">
        <MenuSection label="Root">
          <MenuCheckboxControl checked={state.controlled} label="Controlled" value="controlled" onChange={actions.setControlled} />
          <MenuCheckboxControl checked={state.disabled} label="Disabled" value="disabled" onChange={actions.setDisabled} />
        </MenuSection>
        <MenuRadioControl label="Open delay" options={delayOptions} value={String(state.openDelay)} onChange={(value) => actions.setOpenDelay(Number(value))} />
        <MenuRadioControl label="Close delay" options={delayOptions} value={String(state.closeDelay)} onChange={(value) => actions.setCloseDelay(Number(value))} />
      </ToolbarGroup>
      <ToolbarGroup title="Popup" value="popup">
        <MenuSection label="Naming">
          <MenuCheckboxControl checked={state.useAriaLabel} label="Use ariaLabel" value="use-aria-label" onChange={actions.setUseAriaLabel} />
        </MenuSection>
        <MenuRadioControl label="Side" options={sideOptions} value={state.side} onChange={actions.setSide} />
        <MenuRadioControl label="Align" options={alignOptions} value={state.align} onChange={actions.setAlign} />
        <MenuRadioControl label="Offset" options={offsetOptions} value={String(state.sideOffset)} onChange={(value) => actions.setSideOffset(Number(value))} />
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl label="Trigger" options={compositionOptions} value={state.triggerComposition} onChange={actions.setTriggerComposition} />
      </ToolbarGroup>
    </ControlToolbar>
  );
}

export function HoverCardScenarioLog({ state }: { state: HoverCardScenarioState }) {
  return <ScenarioEventLog log={state.log} />;
}

export function getHoverCardSource(state: HoverCardScenarioState) {
  const rootMode = state.controlled ? "open={open}" : "defaultOpen={false}";

  return `<HoverCard.Root
  ${rootMode}
  openDelay={${state.openDelay}}
  closeDelay={${state.closeDelay}}
  disabled={${state.disabled}}
  onOpenChange={setOpen}
>
  ${getHoverCardTriggerSource(state)}
  <HoverCard.Portal>
    <HoverCard.Content
      ${state.useAriaLabel ? `ariaLabel="Contributor preview"` : ""}
      side="${state.side}"
      align="${state.align}"
      sideOffset={${state.sideOffset}}
    >
      <h2>Ada Lovelace</h2>
      <p>Mathematician, writer, and early computing collaborator.</p>
      <HoverCard.Arrow />
    </HoverCard.Content>
  </HoverCard.Portal>
</HoverCard.Root>`;
}

function HoverCardTriggerExample({
  mode,
  onBlur,
  onFocus,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
}: {
  mode: HoverCardCompositionMode;
  onBlur: HoverCardScenarioActions["handleTriggerBlur"];
  onFocus: HoverCardScenarioActions["handleTriggerFocus"];
  onKeyDown: HoverCardScenarioActions["handleTriggerKeyDown"];
  onMouseEnter: HoverCardScenarioActions["handleTriggerMouseEnter"];
  onMouseLeave: HoverCardScenarioActions["handleTriggerMouseLeave"];
}) {
  const props = {
    className: "atom-button",
    "data-hover-card-trigger": "",
    "data-playground-inspect": "",
    "data-prop-check": "trigger",
    tabIndex: 0,
    onBlur,
    onFocus,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
  };

  if (mode === "asChild") {
    return (
      <HoverCard.Trigger asChild {...props}>
        <span>Preview contributor</span>
      </HoverCard.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <HoverCard.Trigger render="section" {...props}>
        Preview contributor
      </HoverCard.Trigger>
    );
  }

  return <HoverCard.Trigger {...props}>Preview contributor</HoverCard.Trigger>;
}

function getHoverCardTriggerSource(state: HoverCardScenarioState) {
  if (state.triggerComposition === "asChild") {
    return `<HoverCard.Trigger asChild>
    <span>Preview contributor</span>
  </HoverCard.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<HoverCard.Trigger render="section">
    Preview contributor
  </HoverCard.Trigger>`;
  }

  return `<HoverCard.Trigger>Preview contributor</HoverCard.Trigger>`;
}

const compositionOptions = [
  { label: "Default", value: "default" },
  { label: "As Child", value: "asChild" },
  { label: "Render", value: "render" },
] as const satisfies readonly { label: string; value: HoverCardCompositionMode }[];

const delayOptions = [
  { label: "None", value: "0" },
  { label: "Short", value: "150" },
  { label: "Default", value: "700" },
] as const;

const sideOptions = [
  { label: "Top", value: "top" },
  { label: "Right", value: "right" },
  { label: "Bottom", value: "bottom" },
  { label: "Left", value: "left" },
] as const satisfies readonly { label: string; value: HoverCardSide }[];

const alignOptions = [
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
] as const satisfies readonly { label: string; value: HoverCardAlign }[];

const offsetOptions = [
  { label: "0", value: "0" },
  { label: "4", value: "4" },
  { label: "8", value: "8" },
  { label: "16", value: "16" },
] as const;
