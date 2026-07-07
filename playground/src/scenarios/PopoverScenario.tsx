import { Button } from "@flowstack-ui/atom/button";
import { Popover } from "@flowstack-ui/atom/popover";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps } from "../WorkbenchPrimitives";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type {
  PopoverAlign,
  PopoverCompositionMode,
  PopoverScenarioActions,
  PopoverScenarioState,
  PopoverSide,
  PopoverTriggerMode,
} from "./usePopoverScenario";

export function PopoverScenarioCanvas({
  state,
  actions,
}: {
  state: PopoverScenarioState;
  actions: PopoverScenarioActions;
}) {
  const rootProps = state.controlled
    ? { open: state.open, onOpenChange: actions.handleOpenChange }
    : { defaultOpen: false, onOpenChange: actions.handleOpenChange };

  return (
    <div className="popover-stage">
      <Popover.Root
        {...rootProps}
        modal={state.modal}
        triggerMode={state.triggerMode}
        closeOnInteractOutside={state.closeOnInteractOutside}
        disabled={state.disabled}
      >
        {state.useAnchor ? (
          <PopoverAnchorExample
            customSlot={state.customAnchorSlot}
            mode={state.anchorComposition}
            propCheck={state.propCheck}
          />
        ) : null}
        <PopoverTriggerExample
          customSlot={state.customTriggerSlot}
          mode={state.triggerComposition}
          onClick={actions.handleTriggerClick}
          onKeyDown={actions.handleTriggerKeyDown}
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
        <Popover.Portal disabled={false}>
          <Popover.Content
            ariaLabel={state.useAriaLabel ? "Project quick actions" : undefined}
            className="atom-popover-content"
            data-popover-content=""
            data-playground-inspect=""
            {...partProps("content", { customSlot: state.customContentSlot, propCheck: state.propCheck }, "popover-content-custom")}
            side={state.side}
            align={state.align}
            sideOffset={state.sideOffset}
          >
            <p className="popover-kicker">Project</p>
            <h2 className="popover-title">Quick actions</h2>
            <p className="popover-copy">
              Change placement, anchor behavior, modal focus, and dismiss rules.
            </p>
            <div className="dialog-actions">
              <Button.Root className="atom-button secondary">
                Secondary action
              </Button.Root>
              <PopoverCloseExample
                mode={state.closeComposition}
                customSlot={state.customCloseSlot}
                onClick={actions.handleCloseClick}
                propCheck={state.propCheck}
              >
                Close
              </PopoverCloseExample>
            </div>
            <Popover.Arrow
              className="atom-popover-arrow"
              data-popover-arrow=""
              {...partProps("arrow", { customSlot: state.customArrowSlot, propCheck: state.propCheck }, "popover-arrow-custom")}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <Button.Root className="behind-dialog-button" tabIndex={-1}>
        Outside focus target
      </Button.Root>
    </div>
  );
}

export function PopoverScenarioAnatomy({
  openGroups,
  state,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  state: PopoverScenarioState;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const trigger = document.querySelector<HTMLElement>("[data-popover-trigger]");
  const content = document.querySelector<HTMLElement>("[data-popover-content]");
  const anchor = document.querySelector<HTMLElement>("[data-popover-anchor]");
  const arrow = document.querySelector<HTMLElement>("[data-popover-arrow]");

  const sections: AnatomySection[] = [
    {
      title: "Root",
      summary: state.controlled ? "controlled" : "uncontrolled",
      rows: [
        { label: "Mode", value: state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Open", value: state.open ? "yes" : "no", category: "state" },
        { label: "Disabled", value: state.disabled ? "yes" : "no", category: "state" },
        { label: "Modal", value: state.modal ? "yes" : "no", category: "state" },
        { label: "Trigger mode", value: state.triggerMode, category: "state" },
        { label: "Close outside", value: state.closeOnInteractOutside ? "yes" : "no", category: "state" },
        { label: "Block trigger event", value: state.blockTriggerEvent ? "yes" : "no", category: "state" },
        { label: "Block close event", value: state.blockCloseEvent ? "yes" : "no", category: "state" },
      ],
    },
    {
      title: "Anchor",
      selector: "[data-popover-anchor]",
      inactive: !state.useAnchor,
      summary: state.useAnchor ? state.anchorComposition : "not rendered",
      rows: [
        { label: "Exists", value: anchor ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.anchorComposition, category: "composition" },
        { label: "data-slot", value: anchor?.dataset.slot ?? "none", category: "data" },
      ],
    },
    {
      title: "Trigger",
      selector: "[data-popover-trigger]",
      summary: trigger?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: trigger ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.triggerComposition, category: "composition" },
        { label: "aria-controls", value: trigger?.getAttribute("aria-controls") ?? "none", category: "aria" },
        { label: "aria-expanded", value: trigger?.getAttribute("aria-expanded") ?? "none", category: "aria" },
        { label: "aria-haspopup", value: trigger?.getAttribute("aria-haspopup") ?? "none", category: "aria" },
        { label: "data-state", value: trigger?.dataset.state ?? "none", category: "data" },
        { label: "data-trigger-mode", value: trigger?.dataset.triggerMode ?? "none", category: "data" },
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
      selector: "[data-popover-content]",
      inactive: !content,
      summary: content?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: content ? "yes" : "no", category: "presence" },
        { label: "role", value: content?.getAttribute("role") ?? "none", category: "aria" },
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
      selector: "[data-popover-arrow]",
      inactive: !arrow,
      summary: arrow?.dataset.side ?? "not rendered",
      rows: [
        { label: "Exists", value: arrow ? "yes" : "no", category: "presence" },
        { label: "data-side", value: arrow?.dataset.side ?? "none", category: "data" },
      ],
    },
    {
      title: "Close",
      selector: "[data-popover-close]",
      inactive: !content,
      summary: state.closeComposition,
      rows: [
        { label: "Exists", value: document.querySelector("[data-popover-close]") ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.closeComposition, category: "composition" },
        { label: "data-slot", value: document.querySelector<HTMLElement>("[data-popover-close]")?.dataset.slot ?? "none", category: "data" },
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

export function PopoverScenarioToolbar({
  state,
  actions,
}: {
  state: PopoverScenarioState;
  actions: PopoverScenarioActions;
}) {
  return (
    <ControlToolbar label="Popover controls">
      <ToolbarGroup title="State" value="state">
        <MenuSection label="Root">
          <MenuCheckboxControl checked={state.controlled} label="Controlled" value="controlled" onChange={actions.setControlled} />
          <MenuCheckboxControl checked={state.disabled} label="Disabled" value="disabled" onChange={actions.setDisabled} />
          <MenuCheckboxControl checked={state.modal} label="Modal" value="modal" onChange={actions.setModal} />
          <MenuCheckboxControl checked={state.closeOnInteractOutside} label="Outside closes" value="outside-closes" onChange={actions.setCloseOnInteractOutside} />
        </MenuSection>
        <MenuRadioControl label="Trigger mode" options={triggerModeOptions} value={state.triggerMode} onChange={actions.setTriggerMode} />
      </ToolbarGroup>
      <ToolbarGroup title="Popup" value="popup">
        <MenuSection label="Anchor">
          <MenuCheckboxControl checked={state.useAnchor} label="Use anchor" value="use-anchor" onChange={actions.setUseAnchor} />
          <MenuCheckboxControl checked={state.useAriaLabel} label="Use ariaLabel" value="use-aria-label" onChange={actions.setUseAriaLabel} />
        </MenuSection>
        <MenuRadioControl label="Side" options={sideOptions} value={state.side} onChange={actions.setSide} />
        <MenuRadioControl label="Align" options={alignOptions} value={state.align} onChange={actions.setAlign} />
        <MenuRadioControl label="Offset" options={offsetOptions} value={String(state.sideOffset)} onChange={(value) => actions.setSideOffset(Number(value))} />
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl label="Trigger" options={compositionOptions} value={state.triggerComposition} onChange={actions.setTriggerComposition} />
        <MenuRadioControl label="Anchor" options={compositionOptions} value={state.anchorComposition} onChange={actions.setAnchorComposition} />
        <MenuRadioControl label="Close button" options={compositionOptions} value={state.closeComposition} onChange={actions.setCloseComposition} />
        <MenuSection label="Blocked events">
          <MenuCheckboxControl checked={state.blockTriggerEvent} label="Block trigger event" value="block-trigger-event" onChange={actions.setBlockTriggerEvent} />
          <MenuCheckboxControl checked={state.blockCloseEvent} label="Block close event" value="block-close-event" onChange={actions.setBlockCloseEvent} />
        </MenuSection>
      </ToolbarGroup>
      <PropsToolbarGroup
        propCheck={state.propCheck}
        customSlots={[
          { checked: state.customAnchorSlot, label: "Anchor Slot", value: "anchor-slot", onChange: actions.setCustomAnchorSlot },
          { checked: state.customTriggerSlot, label: "Trigger Slot", value: "trigger-slot", onChange: actions.setCustomTriggerSlot },
          { checked: state.customContentSlot, label: "Content Slot", value: "content-slot", onChange: actions.setCustomContentSlot },
          { checked: state.customArrowSlot, label: "Arrow Slot", value: "arrow-slot", onChange: actions.setCustomArrowSlot },
          { checked: state.customCloseSlot, label: "Close Slot", value: "close-slot", onChange: actions.setCustomCloseSlot },
        ]}
        onPropCheckChange={actions.setPropCheck}
      />
    </ControlToolbar>
  );
}

export function PopoverScenarioLog({
  state,
}: {
  state: PopoverScenarioState;
}) {
  return <ScenarioEventLog log={state.log} />;
}

export function getPopoverSource(state: PopoverScenarioState) {
  const rootMode = state.controlled ? "open={open}" : "defaultOpen={false}";

  return `<Popover.Root
  ${rootMode}
  modal={${state.modal}}
  triggerMode="${state.triggerMode}"
  closeOnInteractOutside={${state.closeOnInteractOutside}}
  disabled={${state.disabled}}
  onOpenChange={setOpen}
>
  ${state.useAnchor ? getPopoverAnchorSource(state) : ""}
  ${getPopoverTriggerSource(state)}
  <Popover.Portal>
    <Popover.Content
      ${state.useAriaLabel ? `ariaLabel="Project quick actions"` : ""}
      ${sourceProps("content", state.customContentSlot, state.propCheck, "popover-content-custom")}
      side="${state.side}"
      align="${state.align}"
      sideOffset={${state.sideOffset}}
    >
      <h2>Quick actions</h2>
      <p>Change placement, anchor behavior, modal focus, and dismiss rules.</p>
      ${getPopoverCloseSource(state)}
      <Popover.Arrow${sourceInlineProps("arrow", state.customArrowSlot, state.propCheck, "popover-arrow-custom")} />
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>`;
}

function PopoverTriggerExample({
  customSlot,
  mode,
  onClick,
  onKeyDown,
  propCheck,
}: {
  customSlot: boolean;
  mode: PopoverCompositionMode;
  onClick: PopoverScenarioActions["handleTriggerClick"];
  onKeyDown: PopoverScenarioActions["handleTriggerKeyDown"];
  propCheck: boolean;
}) {
  const props = {
    className: "atom-button",
    "data-popover-trigger": "",
    "data-playground-inspect": "",
    ...partProps("trigger", { customSlot, propCheck }, "popover-trigger-custom"),
    onClick,
    onKeyDown,
  };

  if (mode === "asChild") {
    return (
      <Popover.Trigger asChild {...props}>
        <span>Open popover</span>
      </Popover.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <Popover.Trigger render={<section />} {...props}>
        Open popover
      </Popover.Trigger>
    );
  }

  return <Popover.Trigger {...props}>Open popover</Popover.Trigger>;
}

function PopoverAnchorExample({
  customSlot,
  mode,
  propCheck,
}: {
  customSlot: boolean;
  mode: PopoverCompositionMode;
  propCheck: boolean;
}) {
  const props = {
    className: "popover-anchor-box",
    "data-popover-anchor": "",
    "data-playground-inspect": "",
    ...partProps("anchor", { customSlot, propCheck }, "popover-anchor-custom"),
  };

  if (mode === "asChild") {
    return (
      <Popover.Anchor asChild {...props}>
        <span>Anchor point</span>
      </Popover.Anchor>
    );
  }

  if (mode === "render") {
    return (
      <Popover.Anchor render={<section />} {...props}>
        Anchor point
      </Popover.Anchor>
    );
  }

  return <Popover.Anchor {...props}>Anchor point</Popover.Anchor>;
}

function PopoverCloseExample({
  children,
  customSlot,
  mode,
  onClick,
  propCheck,
}: {
  children: ReactNode;
  customSlot: boolean;
  mode: PopoverCompositionMode;
  onClick: PopoverScenarioActions["handleCloseClick"];
  propCheck: boolean;
}) {
  const props = {
    className: "atom-button",
    "data-popover-close": "",
    "data-playground-inspect": "",
    ...partProps("close", { customSlot, propCheck }, "popover-close-custom"),
    onClick,
  };

  if (mode === "asChild") {
    return (
      <Popover.Close asChild {...props}>
        <span>{children}</span>
      </Popover.Close>
    );
  }

  if (mode === "render") {
    return (
      <Popover.Close render={<section />} {...props}>
        {children}
      </Popover.Close>
    );
  }

  return <Popover.Close {...props}>{children}</Popover.Close>;
}

function getPopoverTriggerSource(state: PopoverScenarioState) {
  const props = sourceInlineProps("trigger", state.customTriggerSlot, state.propCheck, "popover-trigger-custom");

  if (state.triggerComposition === "asChild") {
    return `<Popover.Trigger asChild${props}>
    <span>Open popover</span>
  </Popover.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<Popover.Trigger render={<section />}${props}>
    Open popover
  </Popover.Trigger>`;
  }

  return `<Popover.Trigger${props}>Open popover</Popover.Trigger>`;
}

function getPopoverAnchorSource(state: PopoverScenarioState) {
  const props = sourceInlineProps("anchor", state.customAnchorSlot, state.propCheck, "popover-anchor-custom");

  if (state.anchorComposition === "asChild") {
    return `<Popover.Anchor asChild${props}>
    <span>Anchor point</span>
  </Popover.Anchor>`;
  }

  if (state.anchorComposition === "render") {
    return `<Popover.Anchor render={<section />}${props}>
    Anchor point
  </Popover.Anchor>`;
  }

  return `<Popover.Anchor${props}>Anchor point</Popover.Anchor>`;
}

function getPopoverCloseSource(state: PopoverScenarioState) {
  const props = sourceInlineProps("close", state.customCloseSlot, state.propCheck, "popover-close-custom");

  if (state.closeComposition === "asChild") {
    return `<Popover.Close asChild${props}>
        <span>Close</span>
      </Popover.Close>`;
  }

  if (state.closeComposition === "render") {
    return `<Popover.Close render={<section />}${props}>
        Close
      </Popover.Close>`;
  }

  return `<Popover.Close${props}>Close</Popover.Close>`;
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

const compositionOptions = [
  { label: "Default", value: "default" },
  { label: "As Child", value: "asChild" },
  { label: "Render", value: "render" },
] as const;

const triggerModeOptions = [
  { label: "Click", value: "click" },
  { label: "Hover", value: "hover" },
] as const satisfies readonly { label: string; value: PopoverTriggerMode }[];

const sideOptions = [
  { label: "Bottom", value: "bottom" },
  { label: "Top", value: "top" },
  { label: "Right", value: "right" },
  { label: "Left", value: "left" },
] as const satisfies readonly { label: string; value: PopoverSide }[];

const alignOptions = [
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
] as const satisfies readonly { label: string; value: PopoverAlign }[];

const offsetOptions = [
  { label: "0", value: "0" },
  { label: "8", value: "8" },
  { label: "16", value: "16" },
] as const;
