import { Button } from "@flowstack-ui/atom/button";
import { HoverCard } from "@flowstack-ui/atom/hover-card";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps } from "../WorkbenchPrimitives";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type {
  HoverCardArrowSize,
  HoverCardAlign,
  HoverCardCompositionMode,
  HoverCardPortalMode,
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
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const rootProps = state.controlled
    ? { open: state.open, onOpenChange: actions.handleOpenChange }
    : { defaultOpen: state.defaultOpen, onOpenChange: actions.handleOpenChange };
  const portalContainerProp = state.portalMode === "container"
    ? portalContainer
    : undefined;
  const portalDisabled = state.portalMode === "disabled";
  const arrowDimensions = getHoverCardArrowDimensions(state.arrowSize);

  return (
    <div className="popover-stage">
      <HoverCard.Root
        key={`${state.controlled ? "controlled" : "uncontrolled"}-${state.defaultOpen}`}
        {...rootProps}
        openDelay={state.openDelay}
        closeDelay={state.closeDelay}
        disabled={state.disabled}
      >
        <HoverCardTriggerExample
          customSlot={state.customTriggerSlot}
          mode={state.triggerComposition}
          onBlur={actions.handleTriggerBlur}
          onFocus={actions.handleTriggerFocus}
          onKeyDown={actions.handleTriggerKeyDown}
          onMouseEnter={actions.handleTriggerMouseEnter}
          onMouseLeave={actions.handleTriggerMouseLeave}
          propCheck={state.propCheck}
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
        <HoverCard.Portal container={portalContainerProp} disabled={portalDisabled}>
          <HoverCard.Content
            ariaLabel={state.useAriaLabel ? "Contributor preview" : undefined}
            className="atom-popover-content"
            data-hover-card-content=""
            data-playground-inspect=""
            {...partProps("content", { customSlot: state.customContentSlot, propCheck: state.propCheck }, "hover-card-content-custom")}
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
              {...partProps("arrow", { customSlot: state.customArrowSlot, propCheck: state.propCheck }, "hover-card-arrow-custom")}
              {...arrowDimensions}
            />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
      <div
        className="popover-portal-target"
        data-hover-card-portal-target=""
        data-playground-inspect=""
        ref={setPortalContainer}
      />
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
  const portalTarget = document.querySelector<HTMLElement>("[data-hover-card-portal-target]");

  const sections: AnatomySection[] = [
    {
      title: "Root",
      summary: state.controlled ? "controlled" : "uncontrolled",
      rows: [
        { label: "Mode", value: state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Open", value: state.open ? "yes" : "no", category: "state" },
        { label: "Default open", value: state.defaultOpen ? "yes" : "no", category: "state" },
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
      summary: state.portalMode,
      rows: [
        { label: "Content exists", value: content ? "yes" : "no", category: "presence" },
        { label: "Mode", value: state.portalMode, category: "state" },
        { label: "Target exists", value: portalTarget ? "yes" : "no", category: "presence" },
        { label: "Parent", value: content?.parentElement?.tagName.toLowerCase() ?? "none", category: "behavior" },
        { label: "Inside canvas", value: content?.closest(".canvas") ? "yes" : "no", category: "behavior" },
        { label: "In custom target", value: content?.parentElement === portalTarget ? "yes" : "no", category: "behavior" },
      ],
    },
    {
      title: "Content",
      selector: "[data-hover-card-content]",
      inactive: !content,
      summary: content?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: content ? "yes" : "no", category: "presence" },
        { label: "aria-label", value: content?.getAttribute("aria-label") ?? "none", category: "aria" },
        { label: "data-side", value: content?.dataset.side ?? "none", category: "data" },
        { label: "data-state", value: content?.dataset.state ?? "none", category: "data" },
        { label: "data-positioned", value: content?.hasAttribute("data-positioned") ? "yes" : "no", category: "data" },
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
        { label: "Size", value: state.arrowSize, category: "behavior" },
        { label: "width", value: arrow?.getAttribute("width") ?? "none", category: "identity" },
        { label: "height", value: arrow?.getAttribute("height") ?? "none", category: "identity" },
        { label: "data-side", value: arrow?.dataset.side ?? "none", category: "data" },
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
          {!state.controlled ? (
            <MenuCheckboxControl checked={state.defaultOpen} label="Default Open" value="default-open" onChange={actions.setDefaultOpen} />
          ) : null}
          <MenuCheckboxControl checked={state.disabled} label="Disabled" value="disabled" onChange={actions.setDisabled} />
        </MenuSection>
        <MenuRadioControl label="Open delay" options={openDelayOptions} value={String(state.openDelay)} onChange={(value) => actions.setOpenDelay(Number(value))} />
        <MenuRadioControl label="Close delay" options={closeDelayOptions} value={String(state.closeDelay)} onChange={(value) => actions.setCloseDelay(Number(value))} />
      </ToolbarGroup>
      <ToolbarGroup title="Popup" value="popup">
        <MenuSection label="Naming">
          <MenuCheckboxControl checked={state.useAriaLabel} label="Use ariaLabel" value="use-aria-label" onChange={actions.setUseAriaLabel} />
        </MenuSection>
        <MenuRadioControl label="Portal" options={portalModeOptions} value={state.portalMode} onChange={actions.setPortalMode} />
        <MenuRadioControl label="Side" options={sideOptions} value={state.side} onChange={actions.setSide} />
        <MenuRadioControl label="Align" options={alignOptions} value={state.align} onChange={actions.setAlign} />
        <MenuRadioControl label="Offset" options={offsetOptions} value={String(state.sideOffset)} onChange={(value) => actions.setSideOffset(Number(value))} />
        <MenuRadioControl label="Arrow Size" options={arrowSizeOptions} value={state.arrowSize} onChange={actions.setArrowSize} />
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl label="Trigger" options={compositionOptions} value={state.triggerComposition} onChange={actions.setTriggerComposition} />
      </ToolbarGroup>
      <PropsToolbarGroup
        propCheck={state.propCheck}
        customSlots={[
          { checked: state.customTriggerSlot, label: "Trigger Slot", value: "trigger-slot", onChange: actions.setCustomTriggerSlot },
          { checked: state.customContentSlot, label: "Content Slot", value: "content-slot", onChange: actions.setCustomContentSlot },
          { checked: state.customArrowSlot, label: "Arrow Slot", value: "arrow-slot", onChange: actions.setCustomArrowSlot },
        ]}
        onPropCheckChange={actions.setPropCheck}
      />
    </ControlToolbar>
  );
}

export function HoverCardScenarioLog({ state }: { state: HoverCardScenarioState }) {
  return <ScenarioEventLog log={state.log} />;
}

export function getHoverCardSource(state: HoverCardScenarioState) {
  const rootProps = [
    state.controlled ? "open={open}" : state.defaultOpen ? "defaultOpen" : null,
    state.openDelay !== 700 ? `openDelay={${state.openDelay}}` : null,
    state.closeDelay !== 300 ? `closeDelay={${state.closeDelay}}` : null,
    state.disabled ? "disabled" : null,
    "onOpenChange={setOpen}",
  ].filter(Boolean).join("\n  ");
  const portalProps = [
    state.portalMode === "container" ? "container={portalContainer}" : null,
    state.portalMode === "disabled" ? "disabled" : null,
  ].filter(Boolean).join(" ");
  const contentProps = [
    state.useAriaLabel ? `ariaLabel="Contributor preview"` : null,
    sourceProps("content", state.customContentSlot, state.propCheck, "hover-card-content-custom"),
    state.side !== "bottom" ? `side="${state.side}"` : null,
    state.align !== "center" ? `align="${state.align}"` : null,
    state.sideOffset !== 8 ? `sideOffset={${state.sideOffset}}` : null,
  ].filter(Boolean).join("\n      ");

  return `<HoverCard.Root
  ${rootProps}
>
  ${getHoverCardTriggerSource(state)}
  <HoverCard.Portal${portalProps ? ` ${portalProps}` : ""}>
    <HoverCard.Content${contentProps ? `\n      ${contentProps}\n    ` : ""}>
      <h2>Ada Lovelace</h2>
      <p>Mathematician, writer, and early computing collaborator.</p>
      <HoverCard.Arrow${getHoverCardArrowSourceProps(state)} />
    </HoverCard.Content>
  </HoverCard.Portal>
</HoverCard.Root>`;
}

function HoverCardTriggerExample({
  customSlot,
  mode,
  onBlur,
  onFocus,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  propCheck,
}: {
  customSlot: boolean;
  mode: HoverCardCompositionMode;
  onBlur: HoverCardScenarioActions["handleTriggerBlur"];
  onFocus: HoverCardScenarioActions["handleTriggerFocus"];
  onKeyDown: HoverCardScenarioActions["handleTriggerKeyDown"];
  onMouseEnter: HoverCardScenarioActions["handleTriggerMouseEnter"];
  onMouseLeave: HoverCardScenarioActions["handleTriggerMouseLeave"];
  propCheck: boolean;
}) {
  const props = {
    className: "atom-button",
    "data-hover-card-trigger": "",
    "data-playground-inspect": "",
    ...partProps("trigger", { customSlot, propCheck }, "hover-card-trigger-custom"),
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
      <HoverCard.Trigger render={(renderProps) => <section {...renderProps} />} {...props}>
        Preview contributor
      </HoverCard.Trigger>
    );
  }

  return <HoverCard.Trigger {...props}>Preview contributor</HoverCard.Trigger>;
}

function getHoverCardTriggerSource(state: HoverCardScenarioState) {
  const props = sourceInlineProps("trigger", state.customTriggerSlot, state.propCheck, "hover-card-trigger-custom");
  const multilineProps = props.trim() ? `\n    ${props.trim()}` : "";

  if (state.triggerComposition === "asChild") {
    return `<HoverCard.Trigger asChild${props}>
    <span>Preview contributor</span>
  </HoverCard.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<HoverCard.Trigger
    render={(props) => <section {...props} />}${multilineProps}
  >
    Preview contributor
  </HoverCard.Trigger>`;
  }

  return `<HoverCard.Trigger${props}>Preview contributor</HoverCard.Trigger>`;
}

function sourceProps(part: string, customSlot: boolean, propCheck: boolean, slot: string) {
  return [
    customSlot ? `data-slot="${slot}"` : null,
    propCheck ? `data-prop-check="${part}"` : null,
  ].filter(Boolean).join("\n      ");
}

function sourceInlineProps(part: string, customSlot: boolean, propCheck: boolean, slot: string) {
  const props = sourceProps(part, customSlot, propCheck, slot).split("\n      ").join(" ");
  return props ? ` ${props}` : "";
}

function getHoverCardArrowDimensions(size: HoverCardArrowSize) {
  if (size === "wide") return { width: 18, height: 9 };
  return {};
}

function getHoverCardArrowSourceProps(state: HoverCardScenarioState) {
  const props = [
    sourceInlineProps("arrow", state.customArrowSlot, state.propCheck, "hover-card-arrow-custom").trim(),
    state.arrowSize === "wide" ? "width={18}" : null,
    state.arrowSize === "wide" ? "height={9}" : null,
  ].filter(Boolean).join(" ");

  return props ? ` ${props}` : "";
}

const compositionOptions = [
  { label: "Default", value: "default" },
  { label: "As Child", value: "asChild" },
  { label: "Render", value: "render" },
] as const satisfies readonly { label: string; value: HoverCardCompositionMode }[];

const arrowSizeOptions = [
  { label: "Default", value: "default" },
  { label: "Wide", value: "wide" },
] as const satisfies readonly { label: string; value: HoverCardArrowSize }[];

const openDelayOptions = [
  { label: "None", value: "0" },
  { label: "Short", value: "150" },
  { label: "Default", value: "700" },
] as const;

const closeDelayOptions = [
  { label: "None", value: "0" },
  { label: "Short", value: "150" },
  { label: "Default", value: "300" },
] as const;

const portalModeOptions = [
  { label: "Body", value: "body" },
  { label: "Container", value: "container" },
  { label: "Disabled", value: "disabled" },
] as const satisfies readonly { label: string; value: HoverCardPortalMode }[];

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
