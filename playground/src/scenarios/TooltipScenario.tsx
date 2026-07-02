import { Button } from "@flowstack-ui/atom/button";
import { Tooltip } from "@flowstack-ui/atom/tooltip";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, ScenarioEventLog, ToolbarGroup } from "../WorkbenchPrimitives";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type {
  TooltipAlign,
  TooltipCompositionMode,
  TooltipScenarioActions,
  TooltipScenarioState,
  TooltipSide,
  TooltipVariant,
} from "./useTooltipScenario";

export function TooltipScenarioCanvas({
  state,
  actions,
}: {
  state: TooltipScenarioState;
  actions: TooltipScenarioActions;
}) {
  const rootProps = state.controlled
    ? { open: state.open, onOpenChange: actions.handleOpenChange }
    : { defaultOpen: false, onOpenChange: actions.handleOpenChange };

  return (
    <div className="popover-stage">
      <Tooltip.Provider
        openDelay={state.providerOpenDelay}
        closeDelay={state.providerCloseDelay}
        skipDelay={state.providerSkipDelay}
      >
        <Tooltip.Root
          {...rootProps}
          disabled={state.disabled}
          variant={state.variant}
        >
          <TooltipTriggerExample
            mode={state.triggerComposition}
            onBlur={actions.handleTriggerBlur}
            onFocus={actions.handleTriggerFocus}
            onKeyDown={actions.handleTriggerKeyDown}
            onMouseEnter={actions.handleTriggerMouseEnter}
            onMouseLeave={actions.handleTriggerMouseLeave}
            onTouchEnd={actions.handleTriggerTouchEnd}
            onTouchStart={actions.handleTriggerTouchStart}
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
          <Tooltip.Portal>
            <Tooltip.Content
              ariaLabel={state.useAriaLabel ? "Save changes tooltip" : undefined}
              className="atom-tooltip-content"
              data-playground-inspect=""
              data-prop-check="content"
              data-tooltip-content=""
              side={state.side}
              align={state.align}
              sideOffset={state.sideOffset}
            >
              Save changes
              <Tooltip.Arrow
                className="atom-popover-arrow"
                data-prop-check="arrow"
                data-tooltip-arrow=""
              />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
      <Button.Root className="behind-dialog-button" tabIndex={-1}>
        Outside focus target
      </Button.Root>
    </div>
  );
}

export function TooltipScenarioAnatomy({
  openGroups,
  state,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  state: TooltipScenarioState;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const trigger = document.querySelector<HTMLElement>("[data-tooltip-trigger]");
  const content = document.querySelector<HTMLElement>("[data-tooltip-content]");
  const arrow = document.querySelector<HTMLElement>("[data-tooltip-arrow]");

  const sections: AnatomySection[] = [
    {
      title: "Provider",
      summary: `${state.providerOpenDelay}/${state.providerCloseDelay}`,
      rows: [
        { label: "Open delay", value: String(state.providerOpenDelay), category: "behavior" },
        { label: "Close delay", value: String(state.providerCloseDelay), category: "behavior" },
        { label: "Skip delay", value: String(state.providerSkipDelay), category: "behavior" },
      ],
    },
    {
      title: "Root",
      summary: state.controlled ? "controlled" : "uncontrolled",
      rows: [
        { label: "Mode", value: state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Open", value: state.open ? "yes" : "no", category: "state" },
        { label: "Disabled", value: state.disabled ? "yes" : "no", category: "state" },
        { label: "Variant", value: state.variant, category: "behavior" },
      ],
    },
    {
      title: "Trigger",
      selector: "[data-tooltip-trigger]",
      summary: trigger?.getAttribute("aria-describedby") ? "described" : "closed",
      rows: [
        { label: "Exists", value: trigger ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.triggerComposition, category: "composition" },
        { label: "Described by content", value: trigger?.getAttribute("aria-describedby") === content?.id ? "yes" : "no", category: "behavior" },
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
      selector: "[data-tooltip-content]",
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
      selector: "[data-tooltip-arrow]",
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

export function TooltipScenarioToolbar({
  state,
  actions,
}: {
  state: TooltipScenarioState;
  actions: TooltipScenarioActions;
}) {
  return (
    <ControlToolbar label="Tooltip controls">
      <ToolbarGroup title="State" value="state">
        <MenuSection label="Root">
          <MenuCheckboxControl checked={state.controlled} label="Controlled" value="controlled" onChange={actions.setControlled} />
          <MenuCheckboxControl checked={state.disabled} label="Disabled" value="disabled" onChange={actions.setDisabled} />
          <MenuCheckboxControl checked={state.useAriaLabel} label="Use ariaLabel" value="use-aria-label" onChange={actions.setUseAriaLabel} />
        </MenuSection>
        <MenuRadioControl label="Variant" options={variantOptions} value={state.variant} onChange={actions.setVariant} />
      </ToolbarGroup>
      <ToolbarGroup title="Timing" value="timing">
        <MenuRadioControl label="Open delay" options={delayOptions} value={String(state.providerOpenDelay)} onChange={(value) => actions.setProviderOpenDelay(Number(value))} />
        <MenuRadioControl label="Close delay" options={delayOptions} value={String(state.providerCloseDelay)} onChange={(value) => actions.setProviderCloseDelay(Number(value))} />
        <MenuRadioControl label="Skip delay" options={skipDelayOptions} value={String(state.providerSkipDelay)} onChange={(value) => actions.setProviderSkipDelay(Number(value))} />
      </ToolbarGroup>
      <ToolbarGroup title="Popup" value="popup">
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

export function TooltipScenarioLog({ state }: { state: TooltipScenarioState }) {
  return <ScenarioEventLog log={state.log} />;
}

export function getTooltipSource(state: TooltipScenarioState) {
  const rootMode = state.controlled ? "open={open}" : "defaultOpen={false}";

  return `<Tooltip.Provider
  openDelay={${state.providerOpenDelay}}
  closeDelay={${state.providerCloseDelay}}
  skipDelay={${state.providerSkipDelay}}
>
  <Tooltip.Root
    ${rootMode}
    disabled={${state.disabled}}
    variant="${state.variant}"
    onOpenChange={setOpen}
  >
    ${getTooltipTriggerSource(state)}
    <Tooltip.Portal>
      <Tooltip.Content
        ${state.useAriaLabel ? `ariaLabel="Save changes tooltip"` : ""}
        side="${state.side}"
        align="${state.align}"
        sideOffset={${state.sideOffset}}
      >
        Save changes
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>`;
}

function TooltipTriggerExample({
  mode,
  onBlur,
  onFocus,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onTouchEnd,
  onTouchStart,
}: {
  mode: TooltipCompositionMode;
  onBlur: TooltipScenarioActions["handleTriggerBlur"];
  onFocus: TooltipScenarioActions["handleTriggerFocus"];
  onKeyDown: TooltipScenarioActions["handleTriggerKeyDown"];
  onMouseEnter: TooltipScenarioActions["handleTriggerMouseEnter"];
  onMouseLeave: TooltipScenarioActions["handleTriggerMouseLeave"];
  onTouchEnd: TooltipScenarioActions["handleTriggerTouchEnd"];
  onTouchStart: TooltipScenarioActions["handleTriggerTouchStart"];
}) {
  const props = {
    className: "atom-button",
    "data-playground-inspect": "",
    "data-prop-check": "trigger",
    "data-tooltip-trigger": "",
    tabIndex: 0,
    onBlur,
    onFocus,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    onTouchEnd,
    onTouchStart,
  };

  if (mode === "asChild") {
    return (
      <Tooltip.Trigger asChild {...props}>
        <span>Save</span>
      </Tooltip.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <Tooltip.Trigger render="section" {...props}>
        Save
      </Tooltip.Trigger>
    );
  }

  return <Tooltip.Trigger {...props}>Save</Tooltip.Trigger>;
}

function getTooltipTriggerSource(state: TooltipScenarioState) {
  if (state.triggerComposition === "asChild") {
    return `<Tooltip.Trigger asChild>
      <span>Save</span>
    </Tooltip.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<Tooltip.Trigger render="section">
      Save
    </Tooltip.Trigger>`;
  }

  return `<Tooltip.Trigger>Save</Tooltip.Trigger>`;
}

const compositionOptions = [
  { label: "Default", value: "default" },
  { label: "As Child", value: "asChild" },
  { label: "Render", value: "render" },
] as const satisfies readonly { label: string; value: TooltipCompositionMode }[];

const variantOptions = [
  { label: "Plain", value: "plain" },
  { label: "Rich", value: "rich" },
] as const satisfies readonly { label: string; value: TooltipVariant }[];

const delayOptions = [
  { label: "None", value: "0" },
  { label: "Short", value: "150" },
  { label: "Default", value: "700" },
] as const;

const skipDelayOptions = [
  { label: "None", value: "0" },
  { label: "Default", value: "300" },
  { label: "Long", value: "700" },
] as const;

const sideOptions = [
  { label: "Top", value: "top" },
  { label: "Right", value: "right" },
  { label: "Bottom", value: "bottom" },
  { label: "Left", value: "left" },
] as const satisfies readonly { label: string; value: TooltipSide }[];

const alignOptions = [
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
] as const satisfies readonly { label: string; value: TooltipAlign }[];

const offsetOptions = [
  { label: "0", value: "0" },
  { label: "4", value: "4" },
  { label: "8", value: "8" },
  { label: "16", value: "16" },
] as const;
