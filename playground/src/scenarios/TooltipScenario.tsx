import { Button } from "@flowstack-ui/atom/button";
import { Tooltip } from "@flowstack-ui/atom/tooltip";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps } from "../WorkbenchPrimitives";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type {
  TooltipArrowSize,
  TooltipAlign,
  TooltipCompositionMode,
  TooltipPortalMode,
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
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const rootProps = state.controlled
    ? { open: state.open, onOpenChange: actions.handleOpenChange }
    : { defaultOpen: state.defaultOpen, onOpenChange: actions.handleOpenChange };
  const portalContainerProp = state.portalMode === "container"
    ? portalContainer
    : undefined;
  const portalDisabled = state.portalMode === "disabled";

  return (
    <div className="popover-stage">
      <Tooltip.Provider
        openDelay={state.providerOpenDelay}
        closeDelay={state.providerCloseDelay}
        skipDelay={state.providerSkipDelay}
      >
        <Tooltip.Root
          key={`${state.controlled ? "controlled" : "uncontrolled"}-${state.defaultOpen}`}
          {...rootProps}
          disabled={state.disabled}
          variant={state.variant}
        >
          <TooltipTriggerExample
            customSlot={state.customTriggerSlot}
            mode={state.triggerComposition}
            onBlur={actions.handleTriggerBlur}
            onFocus={actions.handleTriggerFocus}
            onKeyDown={actions.handleTriggerKeyDown}
            onMouseEnter={actions.handleTriggerMouseEnter}
            onMouseLeave={actions.handleTriggerMouseLeave}
            propCheck={state.propCheck}
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
          <Tooltip.Portal container={portalContainerProp} disabled={portalDisabled}>
            <Tooltip.Content
              ariaLabel={state.useAriaLabel ? "Save changes tooltip" : undefined}
              className="atom-tooltip-content"
              data-playground-inspect=""
              data-tooltip-content=""
              {...partProps("content", { customSlot: state.customContentSlot, propCheck: state.propCheck }, "tooltip-content-custom")}
              side={state.side}
              align={state.align}
              sideOffset={state.sideOffset}
            >
              {state.variant === "rich" ? (
                <div className="tooltip-rich-content">
                  <p className="tooltip-rich-title">Save changes</p>
                  <p className="tooltip-rich-copy">
                    Writes the current form state and keeps the tooltip open
                    while the pointer is over this panel.
                  </p>
                </div>
              ) : (
                "Save changes"
              )}
              <TooltipArrowExample
                customSlot={state.customArrowSlot}
                mode={state.arrowComposition}
                propCheck={state.propCheck}
                size={state.arrowSize}
              />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
      <div
        className="popover-portal-target"
        data-playground-inspect=""
        data-tooltip-portal-target=""
        ref={setPortalContainer}
      />
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
  const portalTarget = document.querySelector<HTMLElement>("[data-tooltip-portal-target]");

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
        { label: "Default open", value: state.defaultOpen ? "yes" : "no", category: "state" },
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
      selector: "[data-tooltip-content]",
      inactive: !content,
      summary: content?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: content ? "yes" : "no", category: "presence" },
        { label: "aria-label", value: content?.getAttribute("aria-label") ?? "none", category: "aria" },
        { label: "data-side", value: content?.dataset.side ?? "none", category: "data" },
        { label: "data-state", value: content?.dataset.state ?? "none", category: "data" },
        { label: "data-variant", value: content?.dataset.variant ?? "none", category: "data" },
        { label: "data-positioned", value: content?.hasAttribute("data-positioned") ? "yes" : "no", category: "data" },
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
        { label: "Composition", value: state.arrowComposition, category: "composition" },
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
          {!state.controlled ? (
            <MenuCheckboxControl checked={state.defaultOpen} label="Default Open" value="default-open" onChange={actions.setDefaultOpen} />
          ) : null}
          <MenuCheckboxControl checked={state.disabled} label="Disabled" value="disabled" onChange={actions.setDisabled} />
        </MenuSection>
        <MenuRadioControl label="Variant" options={variantOptions} value={state.variant} onChange={actions.setVariant} />
      </ToolbarGroup>
      <ToolbarGroup title="Timing" value="timing">
        <MenuRadioControl label="Open delay" options={delayOptions} value={String(state.providerOpenDelay)} onChange={(value) => actions.setProviderOpenDelay(Number(value))} />
        <MenuRadioControl label="Close delay" options={closeDelayOptions} value={String(state.providerCloseDelay)} onChange={(value) => actions.setProviderCloseDelay(Number(value))} />
        <MenuRadioControl label="Skip delay" options={skipDelayOptions} value={String(state.providerSkipDelay)} onChange={(value) => actions.setProviderSkipDelay(Number(value))} />
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
        <MenuRadioControl label="Arrow" options={compositionOptions} value={state.arrowComposition} onChange={actions.setArrowComposition} />
      </ToolbarGroup>
      <PropsToolbarGroup
        propCheck={state.propCheck}
        onPropCheckChange={actions.setPropCheck}
        customSlots={[
          { checked: state.customTriggerSlot, label: "Trigger Slot", value: "trigger-slot", onChange: actions.setCustomTriggerSlot },
          { checked: state.customContentSlot, label: "Content Slot", value: "content-slot", onChange: actions.setCustomContentSlot },
          { checked: state.customArrowSlot, label: "Arrow Slot", value: "arrow-slot", onChange: actions.setCustomArrowSlot },
        ]}
      />
    </ControlToolbar>
  );
}

export function TooltipScenarioLog({ state }: { state: TooltipScenarioState }) {
  return <ScenarioEventLog log={state.log} />;
}

export function getTooltipSource(state: TooltipScenarioState) {
  const rootProps = [
    state.controlled ? "open={open}" : state.defaultOpen ? "defaultOpen" : null,
    state.disabled ? "disabled" : null,
    state.variant !== "plain" ? `variant="${state.variant}"` : null,
    "onOpenChange={setOpen}",
  ].filter(Boolean).join("\n    ");
  const providerProps = [
    state.providerOpenDelay !== 400 ? `openDelay={${state.providerOpenDelay}}` : null,
    state.providerCloseDelay !== 150 ? `closeDelay={${state.providerCloseDelay}}` : null,
    state.providerSkipDelay !== 300 ? `skipDelay={${state.providerSkipDelay}}` : null,
  ].filter(Boolean).join("\n  ");
  const contentProps = [
    state.useAriaLabel ? `ariaLabel="Save changes tooltip"` : null,
    sourceProps([
      state.customContentSlot ? `data-slot="tooltip-content-custom"` : null,
      state.propCheck ? `data-prop-check="content"` : null,
    ]).trim(),
    state.side !== "top" ? `side="${state.side}"` : null,
    state.align !== "center" ? `align="${state.align}"` : null,
    state.sideOffset !== 4 ? `sideOffset={${state.sideOffset}}` : null,
  ].filter(Boolean).join("\n        ");
  const portalProps = [
    state.portalMode === "container" ? "container={portalContainer}" : null,
    state.portalMode === "disabled" ? "disabled" : null,
  ].filter(Boolean).join(" ");
  const contentChildren = state.variant === "rich"
    ? `<div>
          <p>Save changes</p>
          <p>Writes the current form state and keeps the tooltip open while hovered.</p>
        </div>`
    : "Save changes";

  return `<Tooltip.Provider${providerProps ? `\n  ${providerProps}\n` : ""}>
  <Tooltip.Root
    ${rootProps}
  >
    ${getTooltipTriggerSource(state)}
    <Tooltip.Portal${portalProps ? ` ${portalProps}` : ""}>
      <Tooltip.Content${contentProps ? `\n        ${contentProps}\n      ` : ""}>
        ${contentChildren}
        ${getTooltipArrowSource(state)}
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>`;
}

function TooltipTriggerExample({
  customSlot,
  mode,
  onBlur,
  onFocus,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  propCheck,
  onTouchEnd,
  onTouchStart,
}: {
  customSlot: boolean;
  mode: TooltipCompositionMode;
  onBlur: TooltipScenarioActions["handleTriggerBlur"];
  onFocus: TooltipScenarioActions["handleTriggerFocus"];
  onKeyDown: TooltipScenarioActions["handleTriggerKeyDown"];
  onMouseEnter: TooltipScenarioActions["handleTriggerMouseEnter"];
  onMouseLeave: TooltipScenarioActions["handleTriggerMouseLeave"];
  propCheck: boolean;
  onTouchEnd: TooltipScenarioActions["handleTriggerTouchEnd"];
  onTouchStart: TooltipScenarioActions["handleTriggerTouchStart"];
}) {
  const props = {
    className: "atom-button",
    "data-playground-inspect": "",
    "data-tooltip-trigger": "",
    ...partProps("trigger", { customSlot, propCheck }, "tooltip-trigger-custom"),
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
      <Tooltip.Trigger render={(renderProps) => <section {...renderProps} />} {...props}>
        Save
      </Tooltip.Trigger>
    );
  }

  return <Tooltip.Trigger {...props}>Save</Tooltip.Trigger>;
}

function TooltipArrowExample({
  customSlot,
  mode,
  propCheck,
  size,
}: {
  customSlot: boolean;
  mode: TooltipCompositionMode;
  propCheck: boolean;
  size: TooltipArrowSize;
}) {
  const sizeProps = getTooltipArrowSizeProps(size);
  const props = {
    className: "atom-popover-arrow",
    "data-tooltip-arrow": "",
    ...partProps("arrow", { customSlot, propCheck }, "tooltip-arrow-custom"),
    ...sizeProps,
  };

  if (mode === "asChild") {
    return (
      <Tooltip.Arrow asChild {...props}>
        <svg>
          <polygon points="0,0 5,5 10,0" />
        </svg>
      </Tooltip.Arrow>
    );
  }

  if (mode === "render") {
    return <Tooltip.Arrow render={<svg />} {...props} />;
  }

  return <Tooltip.Arrow {...props} />;
}

function getTooltipTriggerSource(state: TooltipScenarioState) {
  const props = sourceProps([
    state.customTriggerSlot ? `data-slot="tooltip-trigger-custom"` : null,
    state.propCheck ? `data-prop-check="trigger"` : null,
  ]);
  if (state.triggerComposition === "asChild") {
    return `<Tooltip.Trigger${props} asChild>
      <span>Save</span>
    </Tooltip.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<Tooltip.Trigger
      render={(props) => <section {...props} />}${props}
    >
      Save
    </Tooltip.Trigger>`;
  }

  return `<Tooltip.Trigger${props}>Save</Tooltip.Trigger>`;
}

function getTooltipArrowSource(state: TooltipScenarioState) {
  const props = [
    sourceProps([
      state.customArrowSlot ? `data-slot="tooltip-arrow-custom"` : null,
      state.propCheck ? `data-prop-check="arrow"` : null,
    ]),
    sourceArrowSizeProps(state.arrowSize),
  ].filter(Boolean).join("");

  if (state.arrowComposition === "asChild") {
    return `<Tooltip.Arrow asChild${props}>
          <svg>
            <polygon points="0,0 5,5 10,0" />
          </svg>
        </Tooltip.Arrow>`;
  }

  if (state.arrowComposition === "render") {
    return `<Tooltip.Arrow render={<svg />}${props} />`;
  }

  return `<Tooltip.Arrow${props} />`;
}

function getTooltipArrowSizeProps(size: TooltipArrowSize) {
  if (size === "wide") return { width: 18, height: 9 };
  return {};
}

function sourceArrowSizeProps(size: TooltipArrowSize) {
  if (size === "wide") return " width={18} height={9}";
  return "";
}

function sourceProps(props: Array<string | null | undefined | false>) {
  const visibleProps = props.filter(Boolean);
  return visibleProps.length > 0 ? ` ${visibleProps.join(" ")}` : "";
}

const compositionOptions = [
  { label: "Default", value: "default" },
  { label: "As Child", value: "asChild" },
  { label: "Render", value: "render" },
] as const satisfies readonly { label: string; value: TooltipCompositionMode }[];

const arrowSizeOptions = [
  { label: "Default", value: "default" },
  { label: "Wide", value: "wide" },
] as const satisfies readonly { label: string; value: TooltipArrowSize }[];

const portalModeOptions = [
  { label: "Body", value: "body" },
  { label: "Container", value: "container" },
  { label: "Disabled", value: "disabled" },
] as const satisfies readonly { label: string; value: TooltipPortalMode }[];

const variantOptions = [
  { label: "Plain", value: "plain" },
  { label: "Rich", value: "rich" },
] as const satisfies readonly { label: string; value: TooltipVariant }[];

const delayOptions = [
  { label: "None", value: "0" },
  { label: "Short", value: "150" },
  { label: "Default", value: "400" },
] as const;

const closeDelayOptions = [
  { label: "None", value: "0" },
  { label: "Default", value: "150" },
  { label: "Long", value: "700" },
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
